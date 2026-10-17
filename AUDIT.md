# Glaze Bomb website audit (2026-10-17)

Scope: home (`index.html`) and menu (`menu.html`), desktop 1440x900 and phone 390x844.
Method: scroll-through screenshots of every section, automated DOM checks (headings, links, duplicate IDs,
button names, text size, images, inputs), dead-code scan of the CSS/JS, and a 98-check click-through test.

## Removed
| What | Why |
|---|---|
| Perks row (Filled to the edge / Fresh every morning / Hand-dipped / Order ahead) | Repeated the same three claims already in the hero glass cards, the ticker and "How we make them" (each claim appeared 3-4 times). |
| Party banner ("Feeding a crowd?") | A third box pitch on the same page, and its "every box saves 10%" contradicted the fixed box prices on the menu page. The "order a day ahead" note lives on the menu page's Boxes section. |
| Leftover code | Old loader styles, the drinks/deal styles from when they were on the home page, the old "Full menu" pill, duplicate nav rules, unused button/kicker variants (about 5 KB of CSS). |

## Rearranged (home page)
Before: Hero, Ticker, Perks, Signature, Explore, Build, Process, Box, Reviews, Party, Visit, Social.
After: **Hero, Ticker, Signature, Build your own, Box of 6, Explore the full menu, How we make them, Reviews, Visit, Social.**
Products first (best sellers, then make your own, then buy a box), then the hand-off to the full menu,
then the story, trust and where to find us. Page height on desktop dropped from about 14,900 px to about 13,000 px.
Ticker text no longer repeats the hero claims (now: open daily from 6 AM, 32 donuts, 12 drinks, free drink, pick-up or delivery).

## Fixed
| Issue | Fix |
|---|---|
| Home and menu content (social buttons, menu teaser cards, tray, flavor tabs) waited for the 3D library download; on a slow connection they were missing for 10 s+ | three.js and the 3D scenes are now loaded on demand after the intro; the page's own content renders straight away |
| The intro waited for all three animation libraries before starting | It now runs as soon as GSAP core arrives, with a CSS shimmer on the progress bar before that; CDN preconnects added |
| Hero "See the menu" scrolled to Signature, although "Menu" is now its own page | Opens `menu.html` (hero layout unchanged) |
| Visit "Order for pick-up" scrolled to Signature | Opens `menu.html` |
| Box copy said "every box saves 10%" (menu boxes have fixed prices) | "Your box of 6 saves 10% and comes with a free drink" |
| Text under 12 px on phones (taste labels, tray names/prices, menu tags, category counts) | Raised to 11.5-12.5 px minimum |
| Menu category bar left a gap at the top when the header hid on scroll | It slides up with the header |
| Signature scroller was about 6 screens long on phones | About 4 screens on phones (desktop unchanged) |
| Two header pills lit at once (Home + Visit us) when scrolled to Visit | Only the section in view is highlighted |

## Typography (TechNext type system)
Fredoka, Nunito and Titan One were replaced with the fonts the TechNext website uses:
**Plus Jakarta Sans** (titles 800 with -0.025em tracking, buttons, prices, labels), **Inter** (body text) and
**Caveat** (handwritten kickers). The intro wordmark and the 3D cup/box print use the same fonts.
Price badges were resized for the bolder face, and the phone hero glass card was moved off the headline.

## Checked and fine
One H1 per page, no duplicate IDs, no broken in-page links, every button/link has a name, no images without alt,
inputs labelled, no horizontal scroll at 390 px or 1440 px, no JS errors.

## Not changed on purpose
- The home hero (approved).
- Prices stay in dollars.

## Notes
- On this machine every CDN file takes about 5.5 s to arrive, so cold-load screenshots here are slower than for real visitors.
  Self-hosting GSAP, ScrollTrigger and Lenis in `js/vendor/` would remove the CDN dependency entirely (needs a one-time download).

## v11 (2026-10-17): every donut and drink in 3D, optimized
| Change | Detail |
|---|---|
| All flat 2D donuts and cups replaced | Menu cards, tray, box slots, explore cards, social wall, hero chips, category chips, drink rows, free-drink chips, combos, box table, cart drawer, chat cards and the intro now show the real 3D model, pre-rendered to ssets/3d (34 donuts x 2 views + 12 drinks). |
| More realistic donut texture | Fried-dough colour map with blisters, pores and a pale fry ring, bump + roughness maps, softer sugar glaze (less plastic), thinner glaze at the edge, soft shadow under the glaze lip. Removed a pinch at the top centre of the glaze. |
| Toppings readable | Bigger almond slivers, cheese strips, marshmallows and coconut; the wafer flavor now has a full wafer bar; drizzle comes as stripes, cross-hatch or spiral to match each flavor's art. |
| Deal box rebuilt | Printed box (logo, "Made fresh this morning" note in the lid), paper liners, six real 3D donuts that drop in after the lid opens; changing the free drink only swaps the cup. |
| Faster | Removed the in-browser snapshot renderer (a second WebGL context); images are lazy-loaded WebP (12-40 KB each); phones get half-size texture maps. |
| Box items show the box | Box of 6, Premium, Assorted and Classic boxes in the cart, the fly-to-cart animation and the chat now show a 3D render of the donut box (lid open, six donuts) instead of a single flat donut. Older saved carts are matched by name. Module version bumped to v=29 so open browsers load the new code. |

## v13 (2026-10-17): Impeccable audit + fixes
Run with the Impeccable skill: an isolated design review (Nielsen heuristics) and an isolated detector + browser measurement pass, then one batch of fixes and one verification round.

| Rating | Before | After |
|---|---|---|
| Design health (Nielsen, /40) | 25 Acceptable | 32 Good |
| Technical audit (/20) | 10 Acceptable | 14 Good |
| Impeccable detector findings | 110 (56 contrast) | 63 (11 contrast, all large text that passes 3:1, or a hidden hover state) |

| Fixed | How |
|---|---|
| Free drink was a separate cart line (orphaned when the box was removed, could not be changed) | The free drink now belongs to its box line, with a picker in the drawer; picking a drink on the page also updates boxes already in the order |
| Brand orange failed contrast on every button, price and kicker (2.2-2.9:1) | New tokens: dark labels on orange buttons (6.2:1), --orange-ink for small orange text (5.6:1), --orange-hi for large orange text (4.0:1); focus ring 5.6:1; darker combo gradients; social tags on a dark pill |
| Phone: no feedback when tapping donuts into the box, chat button covering controls | A box bar follows you while you tap the tray; tray cards show "1 in box"; the chat button tucks away while you scroll down and over the home hero buttons |
| Half-filled box lost on reload | The box of 6 is saved and restored |
| Checkout live on an empty order; "pick-up or delivery" with no way to choose | Checkout is disabled when empty; the drawer has a Pick-up / Delivery choice and a ready-by time inside opening hours |
| Menu cards had no description or allergen info; no way to filter 32 donuts | One honest line per donut (glaze + toppings), a "Contains nuts" flag, taste filters (Chocolatey, Fruity, Coffee & tea, Nutty, Sprinkles & mallows) |
| Sticky bars covered section titles after a jump | Jumps stop at scroll-margin-top under the sticky bars |
| Chat lists rendered absolutely positioned (class clash with the menu hero) | Hero cloud renamed .hc |
| Page overflowed at 320 px (newsletter row) | The row shrinks |
| Tap targets under 44 px | 44 px minimum on touch screens |
| Accessibility | Skip link; intro "Skip" button no longer inside an aria-hidden region; box lid works with the keyboard; signature tabs are a real tab set (arrow keys, tabpanel); ribbon pauses on hover; WebGL scenes stop their idle motion under reduced motion; focused orbit items come to the front |
| Performance | 84 small image copies (-sm.webp) for chips, drawer rows, chat cards; menu-hero animations pause off screen; width transition replaced by transform; stray will-change removed |
| Copy | "Best seller" tag on a non-signature donut is now "Staff pick"; the nav says "Order a box" on both pages; the menu box table explains hand-picking online (10% off) vs counter boxes; combo hint says "tap for sprinkles!" |

Kept on purpose (user brief): busy menu hero, full intro with a random donut on every load, TechNext fonts, Caveat kickers, futuristic glows and grids, approved home hero.
Not done: 82 duplicated selector overrides in style.css (a refactor, no visual change), the CLS from the pinned Signature section, quantities in the cart.
