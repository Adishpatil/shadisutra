# Images and line art

`src/data/images.ts` is the photo-slot registry used by the public pages. Keep
slot keys stable; update a slot's path, alt text, dimensions, aspect ratio, and
focal point together when its source changes. The existing
`src/data/gallery.json` remains the data input for the protected gallery
library; keep its seven gallery entries aligned with the corresponding slots.

## Photo slots

Dimensions are source dimensions. Display crops are set by each page and can
differ from the source aspect ratio. All listed files exist except
`heroMobile`, as last checked for this change.

| Slot | Path | Source / ratio | Used on |
|---|---|---:|---|
| `hero` | `public/images/hero/hero-1.webp` | 1280 x 597 / 2.14:1 | Home hero |
| `heroMobile` | `public/images/hero/hero-1-mobile.webp` | 900 x 1200 / 3:4 | Home hero on narrow screens; **missing** |
| `about` | `public/images/about/about-1.png` | 1536 x 1024 / 3:2 | Home About section, About page |
| `homeWedding` | `public/images/gallery/weddings/weddings-1.webp` | 1280 x 591 / 2.17:1 | Home event card |
| `homeBirthday` | `public/images/gallery/birthdays/birthdays-1.webp` | 591 x 1280 / 0.46:1 | Home event card |
| `homeFunction` | `public/images/gallery/functions/functions-1.webp` | 736 x 981 / 0.75:1 | Home event card |
| `introWedding` | `public/images/gallery/weddings/weddings-2.webp` | 1280 x 597 / 2.14:1 | Home intro, Gallery |
| `introBirthday` | `public/images/gallery/birthdays/birthdays-2.webp` | 591 x 1280 / 0.46:1 | Home intro, Gallery |
| `introFunction` | `public/images/gallery/functions/functions-2.webp` | 591 x 1280 / 0.46:1 | Home intro, Gallery |
| `serviceWedding` | `public/images/gallery/weddings/weddings-3.webp` | 591 x 1280 / 0.46:1 | Services, wedding service detail |
| `serviceBirthday` | `public/images/gallery/birthdays/birthdays-3.webp` | 736 x 1349 / 0.55:1 | Services, birthday service detail |
| `serviceFunction` | `public/images/gallery/functions/functions-3.webp` | 1280 x 591 / 2.17:1 | Services, function service detail |
| `recentWedding` | `public/images/gallery/weddings/weddings-4.webp` | 591 x 1280 / 0.46:1 | Home recent work, Gallery |
| `recentBirthday` | `public/images/gallery/birthdays/birthdays-4.webp` | 597 x 1280 / 0.47:1 | Home recent work, Gallery |
| `recentFunction` | `public/images/gallery/functions/functions-4.webp` | 1280 x 597 / 2.14:1 | Home recent work, Gallery |
| `aboutDetailWedding` | `public/images/gallery/weddings/weddings-5.webp` | 1280 x 591 / 2.17:1 | About page |
| `aboutDetailVenue` | `public/images/gallery/weddings/weddings-6.webp` | 1280 x 591 / 2.17:1 | About page |
| `galleryBirthday5` | `public/images/gallery/birthdays/birthdays-5.webp` | 1280 x 597 / 2.14:1 | Gallery |

Photo assets should be WebP for new slots. Preserve an existing slot's filename
and extension unless the registry path is changed too. Use descriptive alt text
in the registry, set a focal point as percentages from 0 to 100, and keep source
dimensions and `aspectRatio` accurate. Do not assign one photo twice on the same
page; shared sources are intentionally used on different pages with different
display crops.

After adding or changing files, run `npm run check:images`. It reports every
missing photo slot and line-art asset and exits nonzero while any are missing;
it is a manual check and is not part of the build. Restart the dev server after
adding files if its static-file view appears stale.

## Editing the gallery

The public Gallery uses the ordered `galleryImages` list in
`src/data/images.ts`; add or remove a registered slot there to change its
contents and position. Keep the corresponding entry in `src/data/gallery.json`
aligned (`src`, `category`, `alt`, `width`, `height`, and `featured`) for the
existing server-side gallery reader. Use distinct photo files and keep photo
reuse to different pages and crops.

If a photo does not appear, check its exact case-sensitive filename and
extension, run `npm run check:images`, then restart the dev server. When a file
exists but the crop is wrong, adjust its `focalPoint` in `images.ts`; when its
intrinsic size changes, update `width`, `height`, and `aspectRatio` there too.

## Line-art assets

Place single-weight, unfilled SVG line art at the exact paths below. Keep a
transparent background and a `viewBox` appropriate to the geometry. The masks
are tinted by CSS, so artwork should use opaque strokes. Existing inline
geometric fallbacks are provided for `arch`, `heart-line`, `divider-line`, and
`sun-lines`; other missing graphics are hidden. No SVG files currently exist in
`public/images/graphics/`; all nine listed graphics are currently missing.

| ID | Path | Use |
|---|---|---|
| `rings` | `public/images/graphics/rings.svg` | Services heading |
| `couple` | `public/images/graphics/couple.svg` | About heading |
| `hands` | `public/images/graphics/hands.svg` | Reserved; not currently rendered |
| `monogram-frame` | `public/images/graphics/monogram-frame.svg` | Reserved for initials; not currently rendered |
| `doves` | `public/images/graphics/doves.svg` | Reserved; not currently rendered |
| `arch` | `public/images/graphics/arch.svg` | Home hero and image fallbacks; About and service pages |
| `heart-line` | `public/images/graphics/heart-line.svg` | Home contact section |
| `divider-line` | `public/images/graphics/divider-line.svg` | Home statement and About page |
| `sun-lines` | `public/images/graphics/sun-lines.svg` | Home About section and About page |

When adding an SVG, keep its ID and path in `src/data/graphics.ts`; the shared
`LineArt` component and CSS mask rules use that registry. Use the same ID in
page components rather than adding page-specific copies.
