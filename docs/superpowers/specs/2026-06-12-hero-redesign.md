---
name: hero-redesign
description: Redesign of the Home page Animated Gradient Hero section with abstract geometric style and typewriter effect
metadata:
  type: project
  status: approved
---

# Hero Redesign — Home Page

## Overview

Redesign the Animated Gradient Hero area on the Home page to a modern abstract geometric style with a purple/pink color scheme and a typewriter animation for the greeting text.

## Visual Design

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--hero-bg` | `#f8f5ff` (light) / dark variant | Hero container background |
| `--hero-text` | `#2e1065` | Main heading text |
| `--hero-subtitle` | `#a78bfa` | Subtitle/description text |
| `--hero-accent-1` | `#a78bfa` (opacity 0.10) | Large decorative circle |
| `--hero-accent-2` | `#f472b6` (opacity 0.08) | Secondary decorative circle |
| `--hero-accent-3` | `#c084fc` (opacity 0.06) | Small decorative circle |
| `--hero-btn-bg` | `#2e1065` | CTA button background |
| `--hero-btn-shadow` | `rgba(167,139,250,0.15)` | Button shadow |

### Layout

- Centered layout (unchanged from current)
- Content stacked vertically: heading → subtitle → CTA button
- Decorative geometric shapes positioned at edges/corners only, kept away from text content
- `rounded-2xl` container with `overflow: hidden`

### Decorative Elements

SVG-based abstract geometric shapes at the container edges:

1. **Large circle** — top-right corner, offset partially outside container
2. **Large circle** — bottom-left corner, offset partially outside container  
3. **Small rounded square** — top-left corner, rotated 25deg
4. **Small circle** — bottom-right corner
5. **Tiny accent dots** — near top and bottom edges

All shapes use the accent colors at low opacity (0.05-0.10). No shapes overlap or sit near the text content.

### Typography

- Heading: 32px, font-weight 700, color `#2e1065`, letter-spacing -0.5px
- Subtitle: 15px, color `#a78bfa`, max-width 340px
- CTA button: 14px, font-weight 500, pill shape (`border-radius: 24px`)

## Typewriter Animation

### Behavior

```
[empty] → 早 → 早上 → 早上好 → 早上好， → ... → 早上好，今天用什么工具？
                                                              ↓
                ← ← ← 清空 ← ← ← 停留 2000ms ← ← ← ← ← ← ←
                ↓
               无限循环
```

### Technical Spec

- **Character interval**: 80-120ms (slight randomization for natural feel)
- **Pause after full text**: 2000ms
- **Clear**: Instant (no backspace animation)
- **Cursor**: Vertical bar (`width: 2.5px`), blinks during pause, steady during typing
- **Sentence list**: All time-of-day greetings cycling:
  - `早上好，今天用什么工具？`
  - `上午好，今天用什么工具？`
  - `中午好，今天用什么工具？`
  - `下午好，今天用什么工具？`
  - `晚上好，今天用什么工具？`
- **Loop**: After clearing, next sentence in list is typed; cycles back to first after last

### Implementation approach

- React `useState` + `useEffect` with `setTimeout` chain
- No external animation library needed
- Cursor CSS animation via `@keyframes`

## Dark Mode

The current hero has a dark variant (`dark .hero-gradient-animated`). The new design will need a dark mode adaptation:

- Background: dark purple/gray (e.g. `#1a1625`)
- Text: light purple/white
- Decorative shapes: white at very low opacity
- Button: lighter purple background

## CSS Changes

Replace the existing `.hero-gradient-animated` and `.deco-blob` styles in `src/index.css` with:
- New `.hero-section` class for the container
- SVG-based decorative shapes (inline in component or CSS)
- Typewriter cursor animation keyframes

## Component Changes (`src/pages/Home/index.tsx`)

- Remove `.hero-gradient-animated` div structure
- Replace with new hero container including inline SVG decorations
- Add `useState`/`useEffect` typewriter logic
- Keep `getGreeting()` function but use all greetings in the typewriter cycle
- Keep "试试" button with `handleRecommend`

## Files Modified

1. `src/pages/Home/index.tsx` — Hero layout, typewriter logic
2. `src/index.css` — Replace hero gradient, blob styles; add cursor animation
