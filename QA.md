# Panoramix acceptance checks

## v1.1.0 redesign

Chromium (Playwright) at 1440×900 and 375×812: Ask flow via Enter returns ranked results (Computer, ChatGPT agent, OpenClaw, Manus, Gamut, Claude Cowork for the browse-and-run-code brief); compare view opened from results and from a recipe with Radar, Bars, Matrix and Facts rendering; drawer opened from a card and closed with Escape; family tabs, search and empty state exercised; dark theme toggled; no console errors; no horizontal overflow at either width. Screenshots in `docs/` are from this pass.

## Static architecture

- No backend, database, service credentials, user authentication or external inference API.
- Catalogue is runtime-loaded JSON beside the HTML.
- Relative asset paths work at the document root and in a subdirectory.
- Invalid/missing JSON shows a recoverable error instead of a blank page.
- Public package contains no private account information or secrets.

## Functional inventory

- Header navigation and hero actions scroll to the intended section.
- Brief input and each sample recipe update relevant results, without making model calls.
- Family filters, search, capability filters, reset, sort and pagination work in both directions.
- Table and card views preserve filters and selections.
- Four-tool tray supports add/remove/clear and an explicit maximum; comparison and field-note dialogs close with Escape.
- Family chart drills down into the selected family.
- Recipe cards create a brief; the scale control opens the correct four-tool comparison.
- Cost modes reset incompatible rates; token, output, compute and seat formulas produce correct monthly totals.
- CSV and text exports produce usable text; manual copy fallback is visible.
- Official source links and GitHub contribution links open the expected destinations.
- Story context and independence/IP notice remain legible.
- Desktop and 375px layouts have no page-wide horizontal overflow; only the comparison tables deliberately scroll.
- Desktop → mobile → desktop retains usable controls.
- Reduced-motion preference disables decorative movement.

## Research pipeline

- Catalogue and report schemas validate.
- Factual edits require evidence; unknown fields and unsafe values are rejected.
- Stale expected values abort.
- Same-field conflicts abort; agreeing reports combine provenance.
- Dry-run never writes files.
- Apply requires the reviewed catalogue hash.
- Accepted report IDs cannot be replayed.
- GitHub CI validates/tests/typechecks and packages only; it never deploys or auto-accepts community reports.

## Verification record

Local validation completed for v1.0.0:

- Ten automated Node regression tests pass, including isolated CLI dry-run, guarded apply and replay rejection.
- TypeScript and production build pass; the npm dependency audit reports no known vulnerabilities at the check time.
- Chromium desktop and 375px mobile: main navigation, search, filters/reset, sorting/pagination, table/card mode, four-tool limit, shortlist filter, comparison, field notes, official-link popup, recipes, landscape drilldown, methodology, text/CSV export and empty state exercised.
- Cost checks: USD20 token scenario; USD50 media scenario; USD40 GPU scenario; USD30 seat scenario; USD27 when a 10% fee and USD5 fixed charge are added to the USD20 scenario.
- Initial mobile card layout and mobile quote panels inspected; no page-wide horizontal overflow, console errors or broken illustration. Comparison tables deliberately scroll.
- Reduced-motion rendering, static subdirectory serving, and invalid-catalogue recovery checked.
- Small secondary-label contrast inspected and adjusted; landscape recheck found no visible small-label contrast failures.

Production deployment on 22 October 2026 confirmed the web root `/askpanoramix.com/public_html`, certificate-checked FTPS transfer/readback of 13 files, matching public HTTPS HTML/JSON and removal of temporary proof markers. A separate public-browser pass exercised the query matcher, comparison modal, media recipe and USD20 token cost scenario. Four Python tests cover browser-proof hashing, invalid-proof rejection, scoped cleanup and SiteGround challenge detection.

The v1.0.1 layout correction was checked at widths 375, 600, 601, 800, 900, 901, 1028, 1150, 1151, 1280 and 1440px, with no document-wide overflow. Search, required-signal filtering, reset, sort, pagination, card/table modes, empty state, comparison/export, recipe comparison, landscape drilldown and the token cost calculation were replayed after the CSS change with no browser console errors.
