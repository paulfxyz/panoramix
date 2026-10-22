"""Optional manual deployment helper. Credentials come only from runner env.

The public site does not run Python. This script is for GitHub Actions or a
trusted operator machine, never for upload to the public document root.
"""
import argparse
import ftplib
import hashlib
import io
import json
import os
from pathlib import Path
import ssl
import sys
import urllib.request
import uuid


def digest(value):
    return hashlib.sha256(value).hexdigest()


def get_remote(ftp, path):
    buffer = io.BytesIO()
    try:
        ftp.retrbinary("RETR " + path, buffer.write)
    except ftplib.error_perm as exc:
        if str(exc).startswith("550"):
            return None
        raise
    return buffer.getvalue()


def public_get(base, filename):
    request = urllib.request.Request(
        base.rstrip("/") + "/" + filename + "?panoramix_verify=" + uuid.uuid4().hex,
        headers={"Cache-Control": "no-cache", "User-Agent": "Panoramix-deploy-verifier/1"},
    )
    with urllib.request.urlopen(request, timeout=35) as response:
        return response.read()


def candidate_roots(ftp, domain, configured):
    start = ftp.pwd()
    candidates = [configured] if configured else [
        start, "/", "/public_html", "/" + domain + "/public_html",
        "/www/" + domain + "/public_html", "/domains/" + domain + "/public_html",
    ]
    found = []
    for candidate in candidates:
        try:
            ftp.cwd(candidate)
            actual = ftp.pwd()
            if actual not in found:
                found.append(actual)
        except ftplib.error_perm:
            pass
        finally:
            ftp.cwd(start)
    return found


def probe(ftp, roots, base):
    for root in roots:
        ftp.cwd(root)
        name = "panoramix-path-" + uuid.uuid4().hex + ".txt"
        content = ("Panoramix path verification " + uuid.uuid4().hex).encode()
        ftp.storbinary("STOR " + name, io.BytesIO(content))
        try:
            if public_get(base, name) == content:
                print("Document root verified against the public HTTPS domain:", root)
                return root
        except Exception:
            pass
        finally:
            ftp.delete(name)
    raise RuntimeError("No candidate matched the public HTTPS domain; no site files were overwritten.")


def ensure_directory(ftp, root, relative):
    ftp.cwd(root)
    for part in relative.parts:
        if part in ("", "."):
            continue
        if part == "..":
            raise ValueError("Parent traversal is forbidden.")
        try:
            ftp.cwd(part)
        except ftplib.error_perm:
            ftp.mkd(part)
            ftp.cwd(part)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["inspect", "probe", "deploy"], default="inspect")
    parser.add_argument("--expected-index-sha256", default="")
    parser.add_argument("--domain", default="askpanoramix.com")
    parser.add_argument("--dist", default="dist/public")
    args = parser.parse_args()
    if "/" in args.domain or ":" in args.domain:
        raise ValueError("Provide only the domain hostname.")
    config = json.loads(os.environ["FTP_CONNECTION"])
    for field in ("host", "username", "password"):
        if not isinstance(config.get(field), str) or not config[field]:
            raise ValueError("FTP_CONNECTION needs host, username, and password.")
    ftp = ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=45)
    ftp.connect(config["host"], int(config.get("port", 21)))
    ftp.login(config["username"], config["password"])
    ftp.prot_p()
    try:
        roots = candidate_roots(ftp, args.domain, config.get("root"))
        if not roots:
            raise RuntimeError("No allowed document-root candidate was accessible.")
        if args.mode == "inspect":
            print("Certificate-verified FTPS login succeeded.")
            print("Candidate web roots:", json.dumps(roots))
            print("No files written. Run probe to prove which root serves the domain.")
            return
        base = "https://" + args.domain
        root = probe(ftp, roots, base)
        ftp.cwd(root)
        names = {Path(name).name for name in ftp.nlst()}
        existing = get_remote(ftp, "index.html")
        if "index.html" in names and existing is None:
            raise RuntimeError("Existing index is not readable; refusing to treat it as absent.")
        existing_hash = digest(existing) if existing is not None else "absent"
        print("Current index.html SHA-256:", existing_hash)
        if {"wp-config.php", "index.php"}.intersection(names):
            raise RuntimeError("Dynamic-site files detected. Refusing to overwrite a potentially unrelated site.")
        if args.mode == "probe":
            print("Path probe complete; marker removed. No site files overwritten.")
            return
        if args.expected_index_sha256 != existing_hash:
            raise RuntimeError("Expected index hash missing or changed. Review the probe and re-run with its exact hash.")
        dist = Path(args.dist).resolve()
        if not (dist / "index.html").is_file() or not (dist / "catalog.json").is_file():
            raise RuntimeError("Static build is missing index.html or catalog.json.")
        files = sorted(p for p in dist.rglob("*") if p.is_file())
        forbidden = {".git", ".env", "node_modules"}
        if any(forbidden.intersection(p.relative_to(dist).parts) for p in files):
            raise RuntimeError("Forbidden source or credential material in the deployment bundle.")
        # Content-hashed assets first; HTML entry is replaced only after everything else verifies.
        files.sort(key=lambda p: (p.name == "index.html", p.name == "catalog.json"))
        for path in files:
            relative = path.relative_to(dist)
            ensure_directory(ftp, root, relative.parent)
            content = path.read_bytes()
            temporary = path.name + ".panoramix-" + uuid.uuid4().hex + ".tmp"
            ftp.storbinary("STOR " + temporary, io.BytesIO(content))
            if get_remote(ftp, temporary) != content:
                raise RuntimeError("Staged upload verification failed.")
            # Verify the current entry again immediately before replacement.
            if path.name == "index.html":
                current = get_remote(ftp, path.name)
                if (digest(current) if current is not None else "absent") != existing_hash:
                    raise RuntimeError("Concurrent index change detected; entry point was not replaced.")
            ftp.rename(temporary, path.name)
            if get_remote(ftp, path.name) != content:
                raise RuntimeError("Uploaded-file verification failed.")
            print("Verified static file:", relative.as_posix())
        public_catalog = json.loads(public_get(base, "catalog.json"))
        local_catalog = json.loads((dist / "catalog.json").read_text())
        if public_catalog != local_catalog:
            raise RuntimeError("Origin upload succeeded but public JSON is stale or mismatched. Purge hosting cache and verify.")
        public_html = public_get(base, "index.html")
        if digest(public_html) != digest((dist / "index.html").read_bytes()):
            raise RuntimeError("Origin upload succeeded but public HTML differs. Check hosting transformations/cache before signoff.")
        print("Public HTTPS HTML and JSON verified. Unrelated remote files were not deleted.")
    finally:
        try:
            ftp.quit()
        except Exception:
            ftp.close()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        # Never log the credential dictionary, password, FTP transcript or exception payload.
        print("FTPS operation stopped:", type(error).__name__, file=sys.stderr)
        if type(error) is RuntimeError:
            print(str(error), file=sys.stderr)
        print("Inspect the stage messages above. Check login, certificate, path, domain, or expected hash; no secrets are logged.", file=sys.stderr)
        sys.exit(1)
