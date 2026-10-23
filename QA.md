# QA notes (v1.3.0)

## Automated
- `npm test`: catalogue validation, merge logic, dimension profiles, FTPS deploy script.
- `npm run check`: TypeScript.
- Playwright pass (local, 1440×900 and 390×844): no console errors, no horizontal overflow, filter returns ranked matches, "All 500" paginates, Next ten rotates, a head-to-head case opens the prepared setup (remove/add tool, view selector) and runs into the compare modal on the table, lens cases open with the preset, each lens renders, compare verdict appears at ≥2 tools, record seal reads Intact against the dev build.

## Manual, before release
- Cases: filter by tool / capability / "vs"; group tabs; rotation bar pauses on hover; Next ten and Reshuffle; All 500 shows 30 more at a time.
- Prepared comparison: remove a tool, add from suggestions or by typing, max four, Compare now opens the chosen view.
- Each lens: open, interact (hover star, tick capability, choose stack layer), close back to the cloud.
- Alternatives: every anchor chip loads; "Compare with top 3" fills the dock.
- Compare: Radar / Bars / Matrix / Facts; Matrix lists differences first; Copy text works; Escape closes.
- Record: commit link opens GitHub; SHA shown; Download catalog.json works.
- Theme toggle persists; `prefers-reduced-motion` disables motion.
- Mobile: constellation hides labels; sticky asides unstick; nav wraps.

## After deploy
- New JS bundle hash in page source; `catalog.json` hash equals the build's; seal reads Intact on the live site.
