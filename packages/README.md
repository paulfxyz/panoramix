# Static release packages

These are generated, ready-to-host distributions, not source dependencies. The current maintenance package is v1.2.0.

- [Panoramix v1.2.0 SiteGround ZIP](panoramix-siteground-v1.2.0.zip)
- [Panoramix v1.0.0 SiteGround ZIP](panoramix-siteground-v1.0.0.zip)
- [SHA-256 checksums](SHA256SUMS)

Extract the ZIP and upload its contents to the configured document root. Do not upload this entire source repository. No Node runtime, backend or database is required on the host.

The initial v1.0.0 archive was built from commit `5409b2f`; v1.2.0 includes the intermediate-width illustration overflow fix. Each package contains static HTML/CSS/JavaScript, the JSON catalogue, illustration, logo, social image, report schema and license notices. Packages do not contain credentials, deploy scripts, tests or private reports.

Repository-hosted ZIPs are provided because the connected GitHub integration's binary release-upload endpoint was unavailable. Normal GitHub source ZIPs are not the same as this compiled hosting package.
