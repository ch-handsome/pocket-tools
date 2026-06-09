# Title Visual Design — F² Tilted Icon Scheme

**Date:** 2026-06-09
**Status:** Approved

## Overview

Unify the "Pocket Tools" title visual style between `Layout` header and `Home` hero page, using a tilted gradient icon block as the brand's visual anchor. The title text reads "ocket Tools" because the gradient "P" icon visually substitutes for the letter P.

## Scope

- `src/layout/index.tsx` — header brand area (icon + text)
- `src/pages/Home.tsx` — hero section (icon + title + subtitle)
- `.env` — `VITE_APP_TITLE` / `VITE_APP_DESCRIPTION` already in place

## Design Decisions

### Gradient Icon
- Shape: rounded square (`rounded-lg`, 8px radius in header, 10px in hero)
- Gradient: `from-sky-500 to-cyan-400` (unchanged from current)
- Rotation: `-15deg` (`transform: rotate(-15deg)`, `transform-origin: center`)
- Shadow: `shadow-sm` resting, `group-hover:shadow-md` on hover
- The "P" letter inside rotates with the box (the rotation is subtle enough that counter-rotation is unnecessary and adds complexity)

### Title Text
- Reading: "ocket Tools" — the icon stands in for the letter "P"
- Header: `font-semibold text-lg` (unchanged weight/size)
- Hero: `font-bold text-3xl sm:text-4xl tracking-tight` (unchanged)
- Color: inherited from `text-foreground` / default (no gradient text)
- Both locations read from `import.meta.env.VITE_APP_TITLE || "Pocket Tools"`

### Subtitle (Home Hero only)
- Reads from `import.meta.env.VITE_APP_DESCRIPTION`
- Fallback: "精选开发工具集合，快速完成日常任务"

### Responsive Behavior
- Header: icon + text hidden on `sm:` breakpoint via `hidden sm:block` (unchanged from current)
- Hero: always visible, centered layout
- No layout shift — the icon dimensions match the current square size

### Dark Mode
- Gradient colors remain the same (sky-500/cyan-400 are vibrant in both modes)
- Shadow becomes more visible on dark backgrounds (currently `shadow-sm` adapts naturally)

## Files Changed

| File | Change |
|------|--------|
| `src/layout/index.tsx` | Add `rotate(-15deg)` to the gradient "P" icon div; change text from "Pocket Tools" to `import.meta.env.VITE_APP_TITLE` |
| `src/pages/Home.tsx` | Restructure hero to show icon + title side by side; add rotated icon block before title text; use env vars for title/subtitle |
| `.env` | Already created with `VITE_APP_TITLE` and `VITE_APP_DESCRIPTION` |
