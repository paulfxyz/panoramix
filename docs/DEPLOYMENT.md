# Optional secure SiteGround deployment

The website remains fully static. This workflow is only an operator convenience and does not run on the public host.

## Store the FTP login securely

In this repository's **Settings → Secrets and variables → Actions → New repository secret**, create an encrypted secret named `FTP_CONNECTION`.

Enter a JSON object directly into GitHub's secret field. Replace the placeholders with your own FTP account details; never paste the filled object into an issue, pull request, source file or chat.

```json
{
  "host": "your-siteground-ftp-host",
  "port": 21,
  "username": "your-scoped-ftp-account",
  "password": "your-new-password"
}
```

An optional `"root": "/your/known/document/root"` narrows discovery. Leave it out for the first inspection. Scope the FTP account to this site's directory where possible. Do not disable certificate validation.

## Check the path before deploying

The manual workflow has three primary modes:

- `inspect`: certificate-verified explicit FTPS login, read-only inspection of known candidate web roots. No full directory dump, file content or credentials are logged.
- `probe`: creates a uniquely named, harmless verification marker, checks it through the intended public HTTPS domain, then removes it. This proves the document root rather than guessing it. The current `index.html` SHA-256 is printed, or `absent`.
- `deploy`: repeats the proof, requires the exact index hash from the probe, builds and validates the static site, stages/read-verifies each file, installs assets before the HTML entry, and verifies public HTML/JSON. It refuses dynamic `index.php` / WordPress configuration files.

### When SiteGround challenges automated HTTP requests

Do not disable certificate checks, bot protection, or other host security settings. The optional `browser-probe` mode stages a uniquely named, harmless text marker in each accessible candidate and logs only its path, SHA-256, current index hash and dynamic-site flag.

Open the marker URL through the actual public HTTPS domain in a normal browser. Confirm its exact text and SHA-256 against the logged candidate. Only the candidate that serves that exact marker is proven. Then dispatch `deploy` with `verified_root`, `proof_marker`, `proof_sha256` and `expected_index_sha256`. These are public verification values, not secrets.

The deploy action verifies the same marker again over FTPS, checks the index precondition, installs and read-verifies the static files, and removes the temporary markers from that batch. If SiteGround still challenges non-browser HTTP, the action explicitly reports that public browser verification remains required; this is not an automatic public-HTTPS success claim. Check the real homepage, JSON catalogue and interactive controls in a browser before calling the site live.

### Verified production target

The initial production deployment on 22 October 2026 verified `/askpanoramix.com/public_html` as the document root for https://askpanoramix.com. The deployed HTML and JSON matched the build over public HTTPS, all 13 static files were read-verified over FTPS, and temporary verification markers were removed. The public interface was then opened in a normal browser and its primary controls were exercised.

This is a deployment record, not permission to skip proof checks on later updates. Do not copy any site's login into source files or reports; continue using the encrypted `FTP_CONNECTION` secret.

Run the workflow under **Actions → Manual SiteGround FTPS deployment → Run workflow**. First `inspect`, then `probe`, review the result, then `deploy` with the expected hash. Never use this workflow for an unrelated existing website without reviewing its contents and maintaining a backup.

No deploy is triggered by a push, PR or research report. The workflow does not delete unrelated remote files. It does not purchase a domain, change DNS, install TLS, or modify the host's software. DNS and valid public HTTPS need to be ready before the path proof succeeds.

The generated ZIP does not contain FTP credentials or this deployment script. Delete the temporary FTP account or remove the GitHub secret when you no longer want deployment access.


## Record changes vs. code changes

Two separate paths touch the repository:

- **Record** (`client/public/catalog.json`, `reports/merged/*`): only through `.github/workflows/signed-merge.yml`, which commits via the GitHub Contents API with the workflow token. These commits carry GitHub's verified signature.
- **Code and docs**: ordinary commits and pull requests.

A deploy after a record change must be a fresh build, since the record hash and rendering commit are embedded at build time and the live page compares the served `catalog.json` against them.
