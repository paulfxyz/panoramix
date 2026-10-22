# Panoramix v1.0.1

The first production-hosted maintenance release, with Panoramix live at https://askpanoramix.com.

- Fixed horizontal illustration overflow at intermediate desktop/tablet widths.
- Added a browser-verified FTPS path-proof fallback for protected SiteGround hosts, with four deployment regression tests.
- Verified the initial production directory, static file readback, public HTML/JSON and interactive browser flows.

## Static hosting package

Download the [compiled v1.0.1 ZIP](https://github.com/paulfxyz/panoramix/raw/refs/heads/main/packages/panoramix-siteground-v1.0.1.zip) and [SHA-256 checksums](https://github.com/paulfxyz/panoramix/blob/main/packages/SHA256SUMS). Extract the ZIP and upload its contents to your own static web root. No Node process, database or backend is required on the host.

The ZIP is repository-hosted because the connected GitHub integration does not support binary release uploads. The automatic GitHub source archives are not the compiled hosting package.

Research remains the initial 22 October 2026 snapshot: 48 tools across 10 families, with editorial use-case guidance rather than universal benchmarks or live pricing. Original materials are MIT licensed to the extent contributors hold rights; see THIRD_PARTY_NOTICES.md for third-party exclusions.
