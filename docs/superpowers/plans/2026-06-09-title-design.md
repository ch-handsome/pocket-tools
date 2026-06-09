# Title Visual Design Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply F² tilted icon visual design to the "Pocket Tools" title in Layout header and Home hero.

**Architecture:** Two files modified — `src/layout/index.tsx` (header brand area) and `src/pages/Home.tsx` (hero section). Both use the same pattern: a -15° rotated gradient "P" icon followed by "ocket Tools" text. Title text already reads from `.env` via earlier change.

**Tech Stack:** React + TypeScript + Tailwind CSS + Vite

---

### Task 1: Modify Layout Header — Tilt the "P" Icon

**Files:**
- Modify: `src/layout/index.tsx:39-47`

- [ ] **Step 1: Add rotation to the gradient icon div**

Add `-rotate-15` (a custom Tailwind rotation) or inline `style={{ transform: 'rotate(-15deg)' }}` to the gradient "P" icon div in the header.

Current code (lines 40-43):
```tsx
<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
  <span className="text-white text-sm font-bold">P</span>
</div>
```

Change to:
```tsx
<div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow -rotate-[15deg]">
  <span className="text-white text-sm font-bold">P</span>
</div>
```

Key: Add `-rotate-[15deg]` to the div's className. The inner "P" rotates with it (subtle -15° doesn't need counter-rotation).

- [ ] **Step 2: Verify the change**

Run: `npm run dev` and check the header icon is tilted ~-15° with the text reading "ocket Tools" next to it.

- [ ] **Step 3: Commit**

```bash
git add src/layout/index.tsx
git commit -m "feat: tilt gradient icon -15deg in layout header"
```

### Task 2: Restructure Home Hero — Add Rotated Icon Before Title

**Files:**
- Modify: `src/pages/Home.tsx:8-15`

- [ ] **Step 1: Restructure the hero title area**

Current code:
```tsx
<h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
  {import.meta.env.VITE_APP_TITLE || "Pocket Tools"}
</h1>
```

Change to — icon + title side by side, then subtitle below:
```tsx
<div className="flex items-center justify-center gap-3 mb-3">
  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-md -rotate-[15deg] shrink-0">
    <span className="text-white text-lg sm:text-xl font-bold">P</span>
  </div>
  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
    {import.meta.env.VITE_APP_TITLE || "Pocket Tools"}
  </h1>
</div>
```

And keep the subtitle `<p>` unchanged below this div.

- [ ] **Step 2: Verify**

Run: `npm run dev` and check the Home hero shows the rotated "P" icon to the left of "Pocket Tools" title.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: add tilted gradient icon in home hero title"
```

---

## Verification

1. Run `npm run dev`
2. Check Layout header: "P" square tilted -15°, text reads "Pocket Tools" (via env var)
3. Check Home page: Hero shows tilted "P" icon + "Pocket Tools" title + subtitle
4. Toggle dark mode: gradient and shadow should adapt cleanly
5. Resize to mobile: header text hides on small screens (existing behavior), hero stacks cleanly
