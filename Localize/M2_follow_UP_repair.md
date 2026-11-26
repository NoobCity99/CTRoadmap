# Codex — CTRoadmap Language-Neutral Responsive Layout Refactor

## Objective

Remove the language-specific layout accommodations introduced during M2 and replace them with **universal, content-responsive behavior**.

CTRoadmap should accommodate long labels, expanded translations, and long unbroken words **regardless of the selected language**.

This is a targeted post-M2 refinement. Do not expand localization scope or introduce new translation keys.

### Reference

W3C — [Text size in translation](https://www.w3.org/International/articles/article-text-size)

Use its guidance to favor flexible layouts, text reflow, and avoidance of unnecessarily restrictive fixed-width containers.

## 1. Repository and baseline

- Repository: `NoobCity99/CTR_Dev_Core`
- Branch: `v0.10.1`
- Reference M2 commit: `7da58a1` (*M2 pass 1*)

Read `AGENTS.md`, inspect the current working tree, and review relevant style ownership documentation before editing. Preserve any changes made after the reference commit.

## 2. Existing issue

M2 introduced CSS selectors specific to Pseudo-English (`en-XA`) to accommodate its approximately 40% expanded text.

These include:

**`frontend/src/styles/shell-responsive.css`**
- `.topbar:lang(en-XA) .topbar__actions`
- `.topbar:lang(en-XA) .toolbar-button`
- `.app-shell:lang(en-XA)`
- `.topbar:lang(en-XA)` and its responsive grid arrangements
- Pseudolanguage-specific toolbar menu and popover positioning

**`frontend/src/styles/shell-workspaces.css`**
- `.workspace-switcher__item:lang(en-XA):not(:hover, :focus-visible)`

Audit these selectors and look for other language-specific text-length accommodations.

The underlying layout behavior may be useful, but it should not depend on `en-XA`.

## 3. Required implementation

### A. Universal TopBar reflow

Refactor the TopBar so its layout responds to available space and the intrinsic dimensions of its content.

Requirements:

- Buttons and labels should retain natural width where space permits.
- Toolbar actions should wrap or reflow when available space becomes insufficient.
- The TopBar and its containing grid row must accommodate additional height when necessary.
- SearchBox and Settings controls must remain usable.
- The branding area must retain its intended appearance.
- Open Import, Export, and Reset menus must stay visible and correctly positioned even when their trigger buttons move to another row.
- Avoid overlapping or obscuring nearby controls.

Prefer CSS Grid, Flexbox, intrinsic sizing, `minmax()`, `min-width: 0`, and appropriate wrapping behavior.

**Do not simply apply all current Pseudo-English overrides globally without evaluating the resulting English layout.** Preserve the compact existing appearance when content fits naturally.

### B. Universal handling of long labels and words

Apply appropriate text-overflow rules to affected controls regardless of language.

- Allow natural wrapping where controls support multiple lines.
- Accommodate unusually long, unbroken translated words.
- Permit components to grow vertically where needed.
- Preserve readable line heights.
- Avoid clipping, overlapping, or hiding control text.

Use `overflow-wrap: anywhere` or similar techniques selectively on text-bearing elements where appropriate.

Do not apply aggressive word-breaking globally to the entire application.

**Avoid using truncation, ellipses, smaller fonts, or hidden overflow as the default solution.**

### C. Workspace switcher

Preserve the existing hover-reactive Workspace buttons.

Requirements:

- Resting buttons maintain their recognizable icon presentation.
- Hover/focus expands the appropriate button to reveal its full translated label.
- Expansion responds to actual text length, not the active locale.
- Long labels remain readable without covering adjacent controls.
- Animations, active states, keyboard focus, and navigation remain functional.
- The behavior must work equally for English, Pseudo-English, and future languages.

Do not introduce language-specific width calculations or hard-coded label-length thresholds.

### D. Eliminate locale-dependent layout branches

Remove `:lang(en-XA)` conditions used specifically to control:

- Width
- Height
- Padding
- Wrapping
- Flex/grid arrangements
- Popover positioning

Replace these with content- and viewport-responsive rules.

Locale-specific CSS remains legitimate for future typography or writing-direction requirements, but **not as a substitute for properly responsive control layouts**.

Do not add JavaScript that measures translated character counts to choose layout modes unless CSS solutions have been demonstrated insufficient.

## 4. Testing requirements

Test the same components under:

- English (`en`)
- Pseudo-English (`en-XA`), retaining its existing 40% expansion
- Synthetic extra-long labels and unbroken words, supplied through isolated test fixtures without modifying production catalogs

Test both **Classic and ZIMA** at representative viewport widths including 1440, 1280, 1024, 920, 680, and 390 CSS pixels.

Verify:

1. English maintains its current intended appearance where content fits.
2. Pseudo-English no longer requires language-specific layout CSS.
3. Long labels reflow appropriately.
4. The TopBar grows vertically rather than clipping.
5. Import/Export/Reset popovers remain within the viewport.
6. Workspace hover/focus animations reveal readable labels.
7. Keyboard navigation and menu interaction remain intact.
8. No horizontal document overflow is introduced.
9. Language switching preserves mounted component state, search input, Atlas state, history, and unsaved editor contents.

Include regression checks that demonstrate the **same responsive behavior works with a long English test string**, not just Pseudo-English.

Update existing Playwright tests rather than removing or weakening their layout assertions. Preserve screenshots in tracked directories by using temporary test-output paths.

## 5. Safety and scope boundaries

Do not modify:

- Translation catalogs or message keys
- The Pseudo-English expansion generator
- Language preference persistence
- i18next runtime or manifest
- Atlas data structures, history, or persistence
- Backend or export behavior
- Unrelated Canvas, Handbook, Rack, or Settings styling

Preserve all existing English and Pseudo-English behavior except the necessary improvements to responsive layout.

Follow established CSS file ownership and avoid accumulating unnecessary overrides.

## 6. Completion report

Report:

1. All language-specific layout selectors discovered.
2. Which selectors were removed or generalized.
3. The universal responsive mechanism replacing them.
4. Whether English appearance changed and why.
5. Test commands and results.
6. Any remaining text-clipping or layout limitations.

**Acceptance gate:** Long labels and expanded translations must be accommodated by the same responsive rules in every language, with no `en-XA`-specific layout patches required for these components.

Stop after this focused refactor. Do not begin M2.5 or M3, and do not commit or push without separate authorization.