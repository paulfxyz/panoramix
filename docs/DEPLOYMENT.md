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

The manual workflow has three modes:

- `inspect`: certificate-verified explicit FTPS login, read-only inspection of known candidate web roots. No full directory dump, file content or credentials are logged.
- `probe`: creates a uniquely named, harmless verification marker, checks it through the intended public HTTPS domain, then removes it. This proves the document root rather than guessing it. The current `index.html` SHA-256 is printed, or `absent`.
- `deploy`: repeats the proof, requires the exact index hash from the probe, builds and validates the static site, stages/read-verifies each file, installs assets before the HTML entry, and verifies public HTML/JSON. It refuses dynamic `index.php` / WordPress configuration files.

Run the workflow under **Actions → Manual SiteGround FTPS deployment → Run workflow**. First `inspect`, then `probe`, review the result, then `deploy` with the expected hash. Never use this workflow for an unrelated existing website without reviewing its contents and maintaining a backup.

No deploy is triggered by a push, PR or research report. The workflow does not delete unrelated remote files. It does not purchase a domain, change DNS, install TLS, or modify the host's software. DNS and valid public HTTPS need to be ready before the path proof succeeds.

The generated ZIP does not contain FTP credentials or this deployment script. Delete the temporary FTP account or remove the GitHub secret when you no longer want deployment access.
