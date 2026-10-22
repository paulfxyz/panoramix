# Panoramix v1.2.0 — the record

Panoramix stops being a search box and becomes a record.

## What changed
- **Nothing to type.** The Ask field and browse search are gone. "ask" is only the domain.
- **45 common checks**, grouped by theme (Alternatives, Agents, Models & APIs, Images/video/audio, Control & privacy, Building, The big picture). Each opens a fixed, reproducible view: same record, same answer, for everyone.
- **Seven lenses**: Radar gallery, Capability matrix, Constellation (RadViz sky), Rivers, Alternatives to…, I need… checklist, Stack builder.
- **Compare**: a plain-English verdict and a differences-first capability matrix.
- **The record seal**: the build embeds the record's SHA-256 and rendering commit; the page re-hashes the served `catalog.json` on load and shows Intact or Altered.
- **Signed catalogue merge** workflow: reviewed community reports are committed through GitHub's Contents API, so every record change carries GitHub's verified signature. GitHub is the source of truth; askpanoramix.com is a window.

## Hosting
Static files only. `packages/panoramix-siteground-v1.2.0.zip` (checksum in `packages/SHA256SUMS`) unzips into the web root. No database, PHP, API key or account.

## Integrity
Record: 48 tools, 10 families, 15 documented capabilities, 10 recipes, every claim with an official URL. Record hash and commit are printed in the Record section of the site.
