# Security policy

Panoramix is a static comparison site. It does not need credentials, store user accounts, make inference API calls, or accept writes from the public website. The host and domain remain the operator's responsibility.

## Report a problem

For a non-sensitive defect, open an issue with a minimal reproduction and the affected version. For a security issue, use GitHub's private vulnerability reporting option if available, or contact the repository owner privately through their GitHub profile. Never post secrets, customer records, personal data or exploit payloads targeting other users in public issues.

## Trust boundaries

- Community reports are untrusted proposals. Validate them, inspect the diff, open their cited pages and review factual claims before merging.
- The report merge tool never fetches or executes submitted URLs, code or instructions. It uses field allowlists, expected-value checks and an explicit catalogue hash.
- Validation does not prove that evidence is true, that a link is benign, or that a provider's security claims are accurate. Only publish source links you have reviewed.
- External source links leave Panoramix. Font stylesheets are fetched from Google Fonts; no analytics is installed.
- Build-time dependencies execute on the developer or CI machine, not on SiteGround. Use lockfiles and keep dependencies current.
- Hosting ZIPs contain only static assets, data, schema and license notices, never `.env`, credentials, source-control internals or report scripts.

The project is provided without warranty under MIT. No formal security audit or certification is claimed.
