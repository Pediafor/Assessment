# Logo Assets

This folder contains the platform brand assets. Replace the placeholder files with your final logos.

## Required Files

Provide both light and dark variants as SVG and PNG:

- `public/logos/light/logo.svg`
- `public/logos/light/logo.png`
- `public/logos/dark/logo.svg`
- `public/logos/dark/logo.png`

## Dimensions & Safe Areas

- Recommended canvas size (landscape): 512 × 128 px
- Minimum readable width: 160 px
- Safe area: keep at least 16 px padding on all sides
- Icon (square mark) recommended size: 112 × 112 px inside the canvas
- Text baseline: ~80 px from top on 128 px canvas (adjust to font)

## Colors

- Primary (brand): `#ed5622`
- Dark background: `#0f172a`
- Light background: `#ffffff`
- Neutral text: `#4e4e4e`

## Export Guidance

- SVG: outlined shapes/paths, no external fonts required
- PNG: export @1x (512×128), @2x (1024×256), @3x (1536×384)
- Keep the same visual balance between light and dark versions (contrast AA+)

## Usage

- Light theme: use `public/logos/light/logo.svg`
- Dark theme: use `public/logos/dark/logo.svg`

Update your header component to swap based on theme, e.g. using `next-themes`.
