<div align="center">

<img src="docs/logo.svg" width="104" height="104" alt="Panoramix logo: a white druid sickle with two mistletoe berries on a black tile">

# Panoramix

**Find your magic mix.**

<a href="https://askpanoramix.com"><img src="https://img.shields.io/badge/askpanoramix.com-ask_the_druid-111111?style=for-the-badge" alt="askpanoramix.com"></a>
<img src="https://img.shields.io/badge/version-1.1.1-111111?style=for-the-badge" alt="version 1.1.1">
<img src="https://img.shields.io/badge/hosting-100%25_static-444444?style=for-the-badge" alt="100 percent static hosting">
<img src="https://img.shields.io/badge/database-just_JSON-bd2636?style=for-the-badge" alt="No database server, just JSON">
<a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-111111?style=for-the-badge" alt="MIT license"></a>
<a href="https://github.com/paulfxyz/panoramix/actions/workflows/validate.yml"><img src="https://github.com/paulfxyz/panoramix/actions/workflows/validate.yml/badge.svg" alt="Validate and package Panoramix workflow"></a>

<a href="https://askpanoramix.com"><img src="docs/site.png" width="100%" alt="Panoramix landing page: monochrome, bold Space Grotesk headline, an original engraved Gaulish druid with sickle, mistletoe and cauldron, and a large Ask field"></a>

<p>The AI landscape is a wild forest. Panoramix is the druid who knows the ingredients.<br>Agents, model gateways, inference, media, coding, automation and creative studios, compared like with like.</p>
<p>No universal winner. No fake benchmark league. No app login, database server or paid AI call.<br>A static site you can read, copy, host and improve.</p>

</div>

<table>
<tr>
<th width="33%" align="left">ASK<br>The druid</th>
<th width="33%" align="left">HOST<br>Your own copy</th>
<th width="33%" align="left">CONTRIBUTE<br>A better ingredient</th>
</tr>
<tr valign="top">
<td>Describe the job in one line. Get a ranked shortlist, open field notes in a side drawer, and compare up to four tools on a radar, bars, a capability matrix or facts.</td>
<td>Download the static ZIP, extract it, and upload the contents over FTP/FTPS. SiteGround or almost any ordinary static host will do.</td>
<td>Submit a source-backed JSON report. Maintainers review and combine community findings into periodic catalogue updates.</td>
</tr>
<tr valign="top">
<td><a href="#what-you-get">What you get</a></td>
<td><a href="#upload-to-siteground">Hosting guide</a></td>
<td><a href="CONTRIBUTING.md">The report standard</a></td>
</tr>
</table>

<p align="center"><a href="#what-you-get">Features</a> · <a href="#upload-to-siteground">SiteGround</a> · <a href="#edit-the-catalogue-without-rebuilding">Edit JSON</a> · <a href="CONTRIBUTING.md">Community reports</a> · <a href="#development">Development</a> · <a href="CHANGELOG.md">Changelog</a> · <a href="SECURITY.md">Security</a> · <a href="#why-panoramix">The name</a></p>

A monochrome, open-source AI comparison workbench live at [askpanoramix.com](https://askpanoramix.com), deployed as static files on SiteGround. The web root was verified against a public HTTPS marker before upload; hosting and source-code publication remain separate operations.

The initial catalogue covers 48 tools in 10 families: agent workspaces, model gateways, direct inference, media APIs, GPU deployment, cloud AI, first-party model APIs, coding/app builders, automation and creative studios. Computer-style agents are compared as workspaces, not confused with model APIs.

## What you get

The production site is HTML, CSS, browser JavaScript, five original engraved illustrations and one local `catalog.json` file. No Node process, SQL service, PHP, API key, paid AI call, analytics or external account is required by the deployed app. Space Grotesk loads from Google Fonts with a system fallback. Build tools are only needed when changing application code.

- **Ask:** one large field. Type a job, press Enter, get a ranked shortlist with "why" chips. Rule-based and local; no LLM call.
- **Browse:** family tabs, search, and large cards with a six-dimension coverage strip on each one.
- **Field notes:** a right-hand drawer per tool with its radar, access, billing, trade-offs, every documented capability and the official source.
- **Compare:** pick up to four tools into the dock, then switch between **Radar**, **Bars**, **Matrix** and **Facts** views. Copy the comparison as text.
- **Recipes:** ten ready-made four-tool comparisons that open straight into the compare view.
- **Landscape:** the ten families as standing stones, each a shortcut into the catalogue.
- **Dark theme:** black and white at rest; red appears only as interaction feedback.
- **Contribute:** submit source-backed JSON reports for periodic, reviewed catalogue updates.

The six dimensions (Language, Media, Action, Research, Control, Workflow) are derived purely from documented features: each axis is the share of that dimension's tracked features that the official source documents. They are coverage indicators, not quality scores.

<img src="docs/workbench.png" width="100%" alt="Browse by family: pill tabs for the ten families, a search field and large tool cards with coverage strips and add-to-compare buttons">

<details>
<summary>See the compare view, the field-notes drawer, the landscape and mobile</summary>

<img src="docs/comparison.png" width="100%" alt="Side-by-side radar comparing four agent workspaces across six documented dimensions, with a per-dimension legend">
<img src="docs/comparison-bars.png" width="100%" alt="Bars view of the same comparison, one group per dimension">
<img src="docs/drawer.png" width="100%" alt="Field-notes drawer for OpenRouter with its radar, facts and documented capabilities">
<img src="docs/landscape.png" width="100%" alt="One forest, different layers: an engraved row of standing stones beside a family-count list">
<img src="docs/mobile.png" width="320" alt="Panoramix mobile landing page">

</details>

## Upload to SiteGround

1. Download the [ready-to-host v1.1.1 ZIP](packages/panoramix-siteground-v1.1.1.zip) and [checksum](packages/SHA256SUMS), get the `panoramix-siteground` artifact from a successful GitHub Actions run, or build it yourself with `npm run package:site`. A GitHub source-code ZIP is not the compiled hosting package.
2. Extract `panoramix-siteground.zip`. Upload its **contents**, not the outer folder, to the configured document root for `askpanoramix.com` using your FTP/FTPS client.
3. Confirm that `index.html`, `catalog.json`, the `art/` folder and the `assets/` folder are siblings. Include `.htaccess` if your FTP client hides dotfiles.
4. Finish the domain and HTTPS setup in your hosting account. These are hosting-side operations, not requirements for a database.
5. Open the HTTPS site and test the Ask field, family tabs, the drawer, the four compare views, recipes and the source links. If host-level caching shows an older build, purge it and recheck.

The bundle uses relative asset paths, so it can also be copied into a subdirectory or another static host. No SPA rewrite is needed: navigation is in-page. The included `.htaccess` adds MIME types, cache preferences and basic headers on compatible Apache hosting; the app also works on static hosts that ignore that file.

Do not double-click `index.html` through `file://`; browsers restrict loading the local JSON that way. Serve the folder over HTTP or HTTPS. For a local smoke test:

```sh
cd dist/public
python3 -m http.server 8080
```

Then open `http://localhost:8080`. This is only a local test server, not a production requirement.

## Edit the catalogue without rebuilding

The source of truth is [`client/public/catalog.json`](client/public/catalog.json). It is copied unchanged beside `index.html` in the static build and loaded at runtime.

1. Edit a tool record or merge approved research reports.
2. Run `npm run validate` and `npm test`.
3. Change `updated` to the date of the reviewed catalogue update, not a claim that all providers were re-audited.
4. Upload that JSON as `catalog.json` next to the existing deployed `index.html`.

The browser will request a fresh catalogue on load. Any host/CDN cache may still need a purge. Tool counts, family counts and the visible snapshot date derive from the JSON. New family IDs or capability IDs require a code/schema update. Keep JSON valid and preserve stable IDs used by recipes and reports.

## Community research standard

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the complete standard, evidence rules, batch review procedure and conflict handling.

- Schema: [`reports/report.schema.json`](reports/report.schema.json)
- Copyable example: [`reports/examples/example-report.json`](reports/examples/example-report.json)
- Incoming proposals: `reports/incoming/` in contributor PRs, or the Research report issue form
- Accepted evidence/archive: `reports/merged/`

```sh
npm run report:merge -- --report reports/incoming/a.json --report reports/incoming/b.json --dry-run
# Human review of sources and the printed plan, then:
npm run report:merge -- --report reports/incoming/a.json --report reports/incoming/b.json --apply --expect-hash REVIEWED_HASH
npm test && npm run check && npm run package:site
```

Conflicting proposals or stale expected values abort. Matching proposals combine their evidence. Submissions never directly modify the live site. Maintainers merge and republish periodically according to community findings; no automatic paid polling, deployment or recurring job is installed.

## Development

Node 22 or later is recommended.

```sh
npm ci
npm run dev             # http://localhost:5000
npm test                # catalogue, report and conflict tests
npm run check           # TypeScript
npm run package:site    # dist/public + dist/panoramix-siteground.zip
```

The validation workflow runs tests, type checking and packaging for pushes, pull requests and manual runs. It does not need secrets and never deploys to your web host.

An additional, strictly manual [SiteGround FTPS workflow](docs/DEPLOYMENT.md) is available if you prefer encrypted GitHub secrets to an FTP client. It checks and proves the document root, requires a reviewed existing-index hash, and never runs on a push or community submission.

## Repository layout

```text
client/
  index.html                    HTML entry, metadata and social preview
  src/App.tsx                   Landing, Ask, Browse, drawer, compare views, dock
  src/data.ts                   Catalogue loader, six derived dimensions, local matcher
  src/index.css                 Monochrome design system, Space Grotesk, motion
  public/catalog.json           Editable public catalogue, loaded at runtime
  public/panoramix-mark.svg     Original sickle-and-mistletoe mark
  public/art/*.webp             Five original engraved illustrations
scripts/
  catalog-lib.mjs               Record validation and conflict-safe combining
  merge-reports.mjs             Dry-run / reviewed-hash apply
  validate.mjs                  Catalogue and report checks
reports/
  report.schema.json            Community interchange standard
  examples/example-report.json  Copyable, non-fresh-research example
tests/                          Catalogue and merge regression checks
docs/                           Real screenshots and logo assets
.github/workflows/validate.yml  Test, typecheck, build, package
dist/public/                    Generated static site, not source-controlled
dist/panoramix-siteground.zip   Ready-to-upload release package
```

## Research and decision limits

Initial research snapshot: 22 October 2026. The directory is curated and not exhaustive. Some official sources are historical launch posts. Product names, availability, capabilities and terms change. Provider links sit beside facts; record-level `source`, optional `extra` and community `evidence` fields preserve provenance.

Family classification, use cases and caution notes are editorial. A documented signal is not an audit, certification or exhaustive feature list. Unconfirmed means unknown, not unsupported. Self-hosting does not automatically mean private or offline inference. OpenAI-style compatibility does not guarantee endpoint parity. Vision input is not image generation.

The local brief matcher rewards family matches, confirmed capabilities, explicit names and task tags. It is a shortlist aid, not a language model, benchmark engine or strict constraint solver. Use the capability matrix in the compare view to check specific documented signals. Panoramix does not fetch prices or estimate credit use; billing context is a pointer to the official terms.

## Why Panoramix?

Panoramix (Getafix in English) is Astérix's village druid, keeper of wisdom and the magic potion recipe, as described on the [official character page](https://asterix.com/personnages/panoramix/). The analogy: AI tools are ingredients, and a thoughtful combination matters more than a mythical universal winner.

This is an independent project and an affectionate nod, not an Astérix product or endorsement. Our druid is an original character drawn in a copperplate-engraving style: white beard, hooded robe, golden sickle, mistletoe, oak, cauldron and menhirs are Gaulish and druidic motifs from history and folklore, not the comic's character design. The illustrations are AI-generated originals. Consider third-party naming and trademark rights before commercial use.

### Design

The interface is monochrome at rest, in the spirit of [Calliope](https://calliope.agency): black and white, Space Grotesk set large and bold, pill buttons, 24px cards, generous spacing and hand-drawn-looking illustrations. Red appears only as a transient response to hover, focus and touch. Motion is deliberate: buttons lift with a soft halo and a light sweep, fields grow a red underline on focus, cards rise into view, the drawer slides in, radars unfold and bars grow. Everything respects `prefers-reduced-motion`.

## Open source

Code, original editorial data, docs and original project artwork are offered under [MIT](LICENSE), to the extent the contributors hold the rights. Third-party dependencies retain their own licenses. Names, brands, characters, model weights and linked source content are not relicensed. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Created by [Paul Fleury](https://github.com/paulfxyz), with Perplexity Computer. Companion project and repository-presentation reference: [Megamesh](https://github.com/paulfxyz/megamesh).
