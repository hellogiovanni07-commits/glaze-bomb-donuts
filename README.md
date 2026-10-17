# Glaze Bomb Donuts (local concept site)

Product-focused concept site for a filled-donut shop (no holes). Static HTML/CSS/JS, private GitHub repo (hellogiovanni07-commits/glaze-bomb-donuts).

- Orange theme. TechNext type: Plus Jakarta Sans (titles), Inter (body), Caveat (handwritten kickers). The hero can't be text-selected.
- Pages: `index.html` (hero, ticker, signature six, build your own, box of 6 + free drink, explore the menu, how we make them, reviews, visit, social) and `menu.html` (20 premium, 12 classic, 12 hot/iced drinks, combos, boxes + free drink).
- `gallery.html`: product shots (3D renders) + drawn placeholders for the shop and kitchen photos, filters and a photo viewer. Swap a placeholder for a real photo by giving its item in `js/gallery.js` an image instead of an `icon`.
- `location.html`: address, live open status, the week's hours (today marked), an illustrated map, getting here, pick-up steps, contact (placeholders) and FAQ.
- Header on every page: Home / Menu / Gallery / Location.
- Animated intro, header that hides on scroll down and comes back on scroll up, "Glazy" chat assistant (typo tolerant, knows the whole site, can add to the order).
- Orders, checkout and newsletter are demo only (nothing is sent).

## 3D
- **Live 3D** (three.js, loaded after the intro): the hero / signature / build-your-own donut on the home page, the flavor of the week, the drinks counter and the box + free drink deal on the menu page. The deal box holds six real 3D donuts (the same model as the hero) that drop in after the lid opens; tap it to make them hop.
- **Every other donut and cup** (menu cards, tray, box slots, explore cards, social wall, chips, combos, box table, cart, chat) is a pre-rendered image of the same 3D model in `assets/3d/` (84 WebP files: 34 donuts in two views, 12 drinks and 4 donut boxes; about 2 MB in total, lazy-loaded). Box items in the cart and the chat show the 3D donut box. So there is one WebGL canvas on the home page instead of one per picture.
- The donut model (`js/donut.js`): fried brioche with blisters, pores, a pale fry ring and an oily/dry roughness map; poured sugar glaze with drips and a thin edge; marble, sesame dust and crumb-coat finishes; drizzle in stripes, a cross-hatch or a spiral; sprinkles, crumbs, almonds, cheese, marshmallows, coconut, nuts, biscuit, wafer bar, mango jam. Phones get half-size texture maps.

### Re-render the 3D images (after changing a flavor or the model)
1. `python -m http.server 4612 --directory .`
2. `python qa/gb_render3d.py http://localhost:4612 .` (the script lives in `~/ClaudeWork/qa`; it drives headless Chrome through `tools/render3d.html`)
3. Make the small copies: `python qa/fix_d_motion.py` (or any PIL resize to 128/160 px, saved as `*-sm.webp`).
4. Bump `ART_VERSION` in `js/data.js` so browsers fetch the new files.

All module URLs carry the same `?v=N`; change it everywhere at once, or the cart state splits between two copies of a module.

Preview: `python -m http.server 4612 --directory .` then open http://localhost:4612
