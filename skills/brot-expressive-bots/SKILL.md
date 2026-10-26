---
name: brot-expressive-bots
description: Create, extend, or refine Brot animated SVG characters, emotion families, and the Brot wordmark in this repository. Use for new Brot variants, facial acting, materials, palettes, camera motion, README galleries, or animation repairs.
---

# Brot expressive bots

Extend the native SVG character system in `expressions/` while preserving Brot's friendly, compact identity.

## Work from the maintained source

- `expressions/generate.mjs` generates every character family except the featured bot.
- `expressions/glass-bot-performance.svg` is the hand-authored featured multi-expression sphere.
- `brand/brot-animated-logo.svg` is the compact wordmark; its `o` must visually match the featured sphere.
- `README.md` is the complete public gallery and should contain only current Brot assets.

Read [prompt examples](references/prompts.md) when inventing a new family or expression. Reuse an existing family when the request changes only palette, emotion, proportions, or motion. Create a new generator function only when the silhouette or material system changes substantially.

## Visual and motion invariants

- Deliver self-contained 256×256 SVG characters with accessible `title` and `desc`.
- Use native vector geometry; do not embed raster images or external resources.
- Preserve one identity within a family: shared neutral pose, scale, framing, material, and feature placement.
- Make expression changes geometric. Coordinate eyes, mouth when present, body turn, squash/stretch, and camera motion.
- Use five-second closed loops: neutral, preparation, readable peak, brief hold, recovery, exact neutral.
- Keep camera pan/zoom subordinate to the acting and prevent clipping at peak scale.
- Do not add floor grids or shadow-base ellipses. Add hands, feet, eyebrows, or mouths only when the user requests them or the established family already uses them.
- Keep README images at consistent display dimensions within each gallery.

## Generate and verify

After changing `expressions/generate.mjs`, run:

```bash
node expressions/generate.mjs
```

Parse every changed SVG as XML. Render the neutral pose and at least one peak pose with `scripts/render-svg.mjs`; a negative SMIL `begin` offset in a temporary copy is useful for peak inspection. Review silhouette, attachments, expression clarity, crop safety, and family consistency at 256px.

Update `README.md` when adding, renaming, replacing, or deleting public assets. Run `npm run check` and `npm run pack` before delivery.

