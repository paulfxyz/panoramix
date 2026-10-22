# Static release packages

These are generated, ready-to-host distributions, not source dependencies.

- [Panoramix v1.0.0 SiteGround ZIP](panoramix-siteground-v1.0.0.zip)
- [SHA-256 checksums](SHA256SUMS)

Extract the ZIP and upload its contents to the configured document root. Do not upload this entire source repository. No Node runtime, backend or database is required on the host.

The initial archive was built from commit `5409b2f` and contains the static HTML/CSS/JavaScript, JSON catalogue, illustration, logo, social image, report schema and license notices. It does not contain credentials, deploy scripts, tests or private reports.

Repository-hosted ZIPs are provided because the connected GitHub integration's binary release-upload endpoint was unavailable. Normal GitHub source ZIPs are not the same as this compiled hosting package.
