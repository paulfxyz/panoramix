# Main flows

## Landing and navigation
- Start: home.
- Click Ask, Browse, Recipes, The druid, the theme toggle and Ask the druid.
- Expect the section scrolls into view; theme switches and persists; no app login.

## Ask (brief matcher)
- Type "I need a Computer alternative that can browse and run code" and press Enter.
- Expect a "Start with these." results section with six ranked cards and "why" chips; Computer first.
- Click a suggestion chip; expect the field fills and results update.
- Type gibberish; expect "The druid frowns." with guidance, not fabricated results.
- Click "Compare the top 4"; expect the compare view opens with four tools.

## Browse
- Click a family tab; expect the grid filters and a family description appears.
- Search "video"; expect only matching tools. Search nonsense; expect the empty state with Reset.
- Click a card's + ; expect it turns into a check, the card gets a border, the dock rises.
- Try a fifth tool; expect the dock note "Four is the limit".

## Field notes drawer
- Click a tool title or "Field notes"; expect a right drawer with radar, facts, capabilities and source link.
- Escape or scrim closes it. Add/remove from comparison from inside the drawer.

## Compare
- Dock → Compare opens the compare view. Radar shows up to four series; legend removes tools.
- Bars, Matrix and Facts tabs switch views. Copy text writes to the clipboard. Escape closes.

## Recipes and landscape
- Open comparison on a recipe; expect the compare view with that recipe's four tools.
- Click a family row in the landscape; expect Browse filtered to that family.

## Responsive and delivery
- 1440px and 375px; no page-level horizontal overflow; nav collapses on mobile; header CTA shortens to "Ask".
- Dark theme inverts illustrations; reduced motion disables animation.
- Production static build loads from the deployed root with relative paths.
