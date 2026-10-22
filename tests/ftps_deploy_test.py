import contextlib
import importlib.util
import io
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("ftps_deploy", Path(__file__).parents[1] / "scripts" / "ftps-deploy.py")
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


class FakeFTP:
    def __init__(self):
        self.root = "/"
        self.files = {"/": {}, "/site/public_html": {"index.html": b"placeholder"}}

    def pwd(self):
        return self.root

    def cwd(self, root):
        self.root = root

    def nlst(self):
        return list(self.files[self.root])

    def storbinary(self, command, stream):
        self.files[self.root][command.removeprefix("STOR ")] = stream.read()

    def retrbinary(self, command, callback):
        name = command.removeprefix("RETR ")
        if name not in self.files[self.root]:
            raise deploy.ftplib.error_perm("550 Not found")
        callback(self.files[self.root][name])

    def delete(self, name):
        del self.files[self.root][name]


class DeploymentProofTests(unittest.TestCase):
    def test_browser_probe_hashes_and_index_precondition(self):
        ftp = FakeFTP()
        with contextlib.redirect_stdout(io.StringIO()):
            records = deploy.browser_probe(ftp, list(ftp.files))
        self.assertEqual(len(records), 2)
        self.assertEqual(records[0]["existing_index_sha256"], "absent")
        self.assertEqual(records[1]["existing_index_sha256"], deploy.digest(b"placeholder"))
        for record in records:
            self.assertEqual(record["sha256"], deploy.digest(ftp.files[record["root"]][record["marker"]]))

    def test_proof_must_match_root_name_and_content(self):
        ftp = FakeFTP()
        with contextlib.redirect_stdout(io.StringIO()):
            record = deploy.browser_probe(ftp, list(ftp.files))[1]
            batch = deploy.verify_browser_proof(ftp, list(ftp.files), record["root"], record["marker"], record["sha256"])
        self.assertEqual(len(batch), 32)
        for root, marker, sha in [
            ("/unrelated", record["marker"], record["sha256"]),
            (record["root"], "../index.html", record["sha256"]),
            (record["root"], record["marker"], "0" * 64),
        ]:
            with self.assertRaises(RuntimeError):
                deploy.verify_browser_proof(ftp, list(ftp.files), root, marker, sha)

    def test_cleanup_only_removes_its_own_random_markers(self):
        ftp = FakeFTP()
        with contextlib.redirect_stdout(io.StringIO()):
            records = deploy.browser_probe(ftp, list(ftp.files))
            batch = records[0]["marker"].split("-")[2]
            ftp.files["/"]["keep.txt"] = b"do not touch"
            deploy.cleanup_browser_probe(ftp, list(ftp.files), batch)
        self.assertEqual(ftp.files["/"], {"keep.txt": b"do not touch"})
        self.assertEqual(ftp.files["/site/public_html"], {"index.html": b"placeholder"})

    def test_siteground_challenge_requires_browser_not_false_success(self):
        class Response:
            headers = {"sg-captcha": "challenge"}
            def __enter__(self):
                return self
            def __exit__(self, *args):
                return False
            def read(self):
                return b"challenge, not site content"
        with patch.object(deploy.urllib.request, "urlopen", return_value=Response()):
            with self.assertRaises(deploy.BrowserVerificationRequired):
                deploy.public_get("https://example.test", "catalog.json")


if __name__ == "__main__":
    unittest.main()
