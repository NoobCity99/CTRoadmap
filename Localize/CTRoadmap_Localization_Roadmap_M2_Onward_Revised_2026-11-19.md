# CTRoadmap — Localization Roadmap, M2 Onward (Revised)

**Revision date:** November 19, 2026  
**Project:** Private `NoobCity99/CTR_Dev_Core`, branch `v0.10.1`  
**Implementation reference:** `e2b6579b7c11a734a7b5fa92ac4d6fb5d23d958f` (*M1c finalze m1*)  
**Source roadmap:** `dev/Localize/CTRoadmap_Localization_Rollout_Plan_v0.10.1.md` (November 18, 2026)  
**Status:** Planning document; **does not authorize code changes, commits, or releases**.

## Revision decisions

This document starts with the unfinished work in **M2** and carries forward **every uncompleted task in the original M2–M8 milestones**, as well as optional M9 and the ongoing engineering safeguards.

Two additions are approved for planning:

1. **Expand Pseudo-English text by approximately 40%.** Lengthen translatable words/labels, rather than merely replacing Latin letters with accented characters. Use the enlarged pseudo strings to find clipping, wrapping, overlapping controls, and other layout problems. Keep Pseudo-English selectable in **all builds**, including Docker production builds.
2. **Add a font/script compatibility audit before enabling languages whose writing systems existing fonts cannot reliably display.** Audit both web UI and backend-rendered/exported documents. Do not assume a browser fallback proves CTRoadmap itself has dependable coverage.

Do **not** introduce new roadmap initiatives from the other Cloudflare article suggestions. Existing unfinished requirements in the original roadmap—including formatting in exports, plural/placeholder handling, and final translation review—remain because they were already planned and must not be deleted.

## Completed foundation — reference only (not to be reimplemented)

- **M0 — Complete:** Read-only source and behavior-risk inventory produced and reviewed.
- **M1a — Complete:** Shared `i18next`/`react-i18next` runtime; English and `en-XA` catalogs; the initial 10 Canvas-sidebar presentation targets (20 messages including companion text); browser-local preferences and English fallback.
- **M1b — Complete:** **Settings → Preferences → Language** tab with native-language radio options and circular icons; catalog/manifest-driven registration using a generated registry; Pseudo-English allowed in all builds.
- **M1c — Complete:** Strict catalog/manifest/icon validation, English-master translation worksheet generation, typed keys and interpolation, build-time validation, declarative third-language tests, and `frontend/src/i18n/README.md` contributor instructions.

**Current implementation contract:** English and Pseudo-English are the two bundled locales; `includeDevelopmentLocalesInBuilds: true` remains checked in; the actual browser-local preference key is `ctroadmap.language.v1`. The catalog validator currently requires every registered language—even one disabled in the picker—to contain complete namespace/key coverage. Registry generation precedes TypeScript and the production build. The supported direction is currently `ltr`.

The original M2 description partly overlaps work already completed in M1a. **Count that work as finished, but retain and complete the remaining M2 TopBar/menu/SearchBox/interaction requirements.**

---

## Continuing architecture and data-safety rules (apply to every milestone)

- Continue with **stable semantic message keys**, English as the authoritative master, versioned language manifests, and bundled language resources. Do not introduce a runtime translation service, CDN dependency, or translation database as a prerequisite.
- A **new bundled language** is added through namespace catalogs, manifest metadata, a validated icon, and a rebuild—no per-language modifications to UI component code or runtime import lists. **Runtime-installed packs** remain a separate optional M9.
- Keep the existing manifest-driven language picker, `ctroadmap.language.v1` preference, cross-tab synchronization, `document.documentElement.lang`, supported-language detection, English fallback, and instant mounted-UI updates. Never trigger Atlas autosave, Undo/Redo, a full app remount, or backend settings writes merely to change language.
- Do not translate `atlas.json`, canonical field names, tile/relationship IDs, enums, API codes, protocol tokens, CSS selectors, URLs, IPs, file-format identifiers, code snippets, keyboard shortcuts, or machine-readable JSON/YAML keys.
- Never automatically translate user-authored Tile/Family/layer names, notes, custom equipment labels, source code, Markdown, paths, and imported content. Classify persisted default names (such as `NEW NODE N` or generated layer titles) separately; **do not change their stored values without a specific product decision**.
- Localize application chrome, tooltips, accessibility labels, statuses, empty states, dialogs, and application-owned warnings. Prefer display-only adapters for model-backed English labels. Where backend errors are involved, prefer stable mappable error codes with a safe legacy-English fallback rather than translating API payload contracts.
- Keep English screen text and application behavior equivalent to the original unless wording changes are specifically approved. Use complete sentences with named placeholders where appropriate; do not translate or concatenate sentence fragments or repurpose keys only because their English text matches.
- A new source message requires its English value, a `context.json` note (meaning/surface/placeholders), a complete Pseudo-English value, and the corresponding lookup/test. Other registered catalogs must also remain complete to satisfy the current build policy.
- Preserve **one authoritative catalog source** if later frontend/backend export translation is added; Python must not acquire a separately authored, contradictory translation dictionary.
- Preserve the **original roadmap's** locale-aware formatting requirement for human-readable dates, times, and quantities in relevant work. This is not an added Cloudflare-driven workstream. Machine identifiers and literal numeric data remain unchanged.

**Future namespace plan (verify ownership as work reaches each feature):** Existing `common` and `canvas`; potential `handbook`, `rack`, `swimlane`, `ingest`, `settings`, `mobile`, `exports`, `errors`, and `experiences`. Introduce only needed namespaces with matching English/Pseudo-English catalogs, manifest entries, context, and tests. Keep `features/codeNotes/languageCatalog.ts` separate: it is the programming-language selector, not the natural-language translation registry.

---

## M2 — Complete the small vertical pilot + 40%-expanded Pseudo-English

**Purpose:** Finish the **original representative 20–40-message pilot intent** without reopening M1 or beginning an all-Canvas migration. Extend the already working WorkspaceSwitcher/sidebar sample to the remaining representative entry points.

### M2 scope — carry forward from the original roadmap

1. **Representative surfaces:** Cover the relevant `TopBar`, `ImportMenu`, `ExportMenu`, and `SearchBox`/sidebar paths. Existing localized `WorkspaceSwitcher` and Canvas-sidebar strings remain in the pilot as **regression targets**, not work to reimplement.
2. **Candidate small additions:** `Search tiles...` field placeholder, *Tile Palette* heading, the existing Search Results empty/no-match states, and a limited number of menu labels. Choose a controlled additional key set after inspecting real source owners and the M0 inventory; defer the remainder to M3.
3. **Interaction variety:** Within the finished M2 vertical slice, cover visible labels, at least one `title`, one `aria-label`, one dynamic `{{count}}` message, one empty state, and at least one error/status/notification. Preserve complete sentences and interpolation variables.
4. **Pilot language:** Use the existing **English ↔ Pseudo-English** switch as the active acceptance test. The original roadmap also allowed a small reviewed Spanish sample; keep that as a **separately approved option**, not a prerequisite or an unreviewed public language launch.
5. **Behavior checks:** Switching while the app is mounted, reloading, opening/closing menus, keyboard navigation and accessibility, status updates, no raw translation keys or stale English-only status strings, no clipping, and no Atlas save/history change. Verify that any **development-only missing-key diagnostics** still identify the source surface/key without changing production behavior; add that diagnostic if the M1 implementation did not actually deliver it.

### NEW — Pseudo-English text expansion

- Update **all current Pseudo-English UI-message values** and establish a rule for **every subsequently added pseudo message**: aim for approximately **1.4× the English word length** while retaining the existing accent/pseudo-character treatment.
- Measure expansion across alphabetic, translatable words/labels. Because short words require rounding, treat **about +40%** as a target, not a demand for mathematically exact expansion for every two-letter word. Use an explicit, reproducible metric in the test report (for example, per-word character counts with a stated short-word tolerance). Character count is only a proxy; rendered width must also be tested.
- **Protect tokens verbatim:** `{{interpolation}}` placeholders and their names, named variables, numbers, URLs, IPs, file paths, code, technical identifiers, HTML/Markdown structure where applicable, and user-authored data. Preserve message meaning, punctuation, accessibility intent, and correct interpolation syntax. Do not blindly expand runtime text after interpolation.
- Prefer a **deterministic authoring/generation or validation workflow** for pseudo catalogs over hand-editing hundreds of future strings. Codex should choose the smallest approach consistent with the existing M1c catalog validator and strict complete-catalog policy. Do not introduce a new external translation service.
- Keep Pseudo-English accessible through the **Language radio tab in development and production/Docker**. Do not alter `includeDevelopmentLocalesInBuilds: true`.
- Update test expectations that rely on literal pseudo copy. Test long translated text in the Canvas sidebar, hover-reactive workspace buttons, TopBar, menu popovers, tooltips, radio settings, dialogs, and the new pilot messages.
- Check **Classic and ZIMA**, narrow desktop and mobile-width viewports where a given surface exists, keyboard focus, zoom/scaling, overflow/wrapping, and control hit areas. A passing glyph-length metric alone does **not** satisfy the visual acceptance gate.

**M2 gate:** A controlled cross-feature pilot passes live-switch, reload, menu/status/keyboard, English parity, no untranslated keys, 40%-expanded pseudo layout, and save/history/CodeMirror-state regressions. Stop and repair framework defects before bulk key conversion.

---

## M2.5 — NEW: Font and script compatibility audit (read-only first)

**Timing:** After the expanded pseudo-layout pilot and **before enabling the first new language whose writing system requires font coverage not already proven**. The audit does not have to delay English/Pseudo-English keying in M3–M6; it is a **language-release gate**.

### Inventory and classification

1. Inventory **every bundled WOFF2/TTF/OTF face**, weights and styles; CSS `@font-face` declarations; actual selectors/font stacks including branding, Canvas, Handbook, Rack, Settings, mobile, dialogs, and decorative themes. Check generic/system fallback assumptions by platform.
2. Include **Docker/server-side fonts and PDF rendering**, including the current DejaVu dependency, separately from browser fonts. A browser displaying a character through OS fallback does not establish PDF coverage.
3. Analyze actual glyph and Unicode coverage in font files using a reproducible font inspection tool, then test browser rendering for **Latin, extended Latin, Cyrillic, Greek, and other planned scripts as relevant**. A Unicode cmap hit alone does not prove correct shaping or attractive typography.
4. Produce a **font × script/language compatibility matrix**, classifying each as *directly supported*, *browser fallback only*, *PDF fallback only*, *missing*, or *needs manual shaping/visual review*. Identify any licensing/redistribution, style consistency, weight, and download-size constraints for replacements.
5. Create sample strings containing diacritics, mixed user content, technical names, placeholders, and longer labels. Test both appearance modes, responsive layouts, mobile surfaces, and at least a representative PDF/export path. Note clipping, line height, replacement-glyph boxes, inconsistent weights, and RTL/shaping issues without claiming general RTL readiness.
6. Recommend **CSS fallback stacks / script-aware `@font-face` or `unicode-range` rules** and any additional bundled font faces **only where needed**. Font compatibility metadata belongs to typography/build documentation or CSS configuration, **not translation JSON keys**. Do not tag a font as universally permitted for a language solely from its filename or family name.

### Deliverable and gate

- Produce `dev/Localize/CTRoadmap_Font_Compatibility_Audit.md` (plus machine-readable matrix if useful), with tested font versions, method, platform/browser/PDF distinctions, and a priority-ordered remediation list.
- **No real non-Latin language may be enabled or described as fully supported** until the corresponding UI and export glyph/fallback/shaping deficiencies have been resolved and visually retested.
- Any required font implementation can be attached to the first milestone that needs that script (M3–M8); do not replace the existing visual identity preemptively.

---

## M3 — Common shell and Canvas editor

Preserve **all remaining original M3 scope**, in component-sized implementation batches:

- Migrate remaining shared chrome, TopBar and menus, search/sidebar controls, Canvas palette and built-in Tile/relationship type display labels, Inspector, Layers/filters, selection controls, dialogs, validation/warnings, and Canvas PNG system captions.
- Extract UI-label accessors from model registries such as `TILE_TYPE_CONFIG`. Keep stable type IDs, existing saved/default titles, selectors, search matching, selection and persisted values unchanged.
- Keep complete English message equivalents and corresponding Pseudo-English entries **with the M2 +40% expansion policy**. Expand each group with focused tests; do not attempt one Canvas mega-diff.
- **Gate:** Canvas display and editor workflows behave identically in English; the pilot locale works across Canvas; create/edit/save/Undo/Redo/PNG remain unaffected; no pseudolocalized label hides controls or alters business logic.

## M4 — Handbook and NotePages UI

Preserve **all original M4 scope**:

- Migrate `HandbookView`, TOC, `lib/handbook.ts`-derived system headings and relationship labels, `HandbookAddressBook`, NotePages tabs/editor, Code Editor UI, and Handbook-related dialog text.
- Classify system-generated display headings versus user-authored Markdown, code, notes, stored content and references; leave the latter untouched.
- Apply 40%-expanded Pseudo-English and test longer headings in navigation, documentation panels and the Code Editor shell without disturbing unsaved drafts.
- **Gate:** User text/references and saved Atlas content remain unchanged; Handbook navigation functions normally; frontend preview headings localize. **PDF translation remains M7**, where frontend/Python contracts will be verified together.

## M5 — Rack, physical ports, cabling, physical documentation

Preserve **all original M5 scope**:

- Localize Rack workspace/Inspector/toolbar, rack hardware/faceplate settings, physical ports, cable interactions, Connect Table and physical documentation UI.
- Maintain machine enums, technical/physical port identifiers, Rack data, link/connection identities, freeform labels, and export semantics.
- Exercise long pseudo labels at 40% expansion on controls, interactive diagrams, cable labels and responsive layouts; check the relevant font audit results if the chosen real language requires additional scripts.
- **Gate:** Rack visuals, ports, cabling, relationships and exports remain behaviorally equivalent; longer labels do not obscure controls.

## M6 — Remaining application surfaces

Preserve **all original M6 scope**:

- Migrate Swimlane, Snapshot/INGEST, LLM-assisted import, Settings detail sections beyond the Language tab, authentication/access, update advisory, and the mobile shell with mobile-specific controls and text.
- Review bundled Experience content separately. Distinguish localization of published bundled copy from immutable theme/definition IDs or future user-created experience content. Treat authored Experience Markdown as a content-publishing process, **not** a blind JSX text replacement.
- Carry forward the original M0 finding that **host CLI output**, where applicable, is a **separate deferred localization scope**; inventory and explicitly disposition it rather than silently treating frontend UI localization as CLI coverage.
- Verify desktop and mobile share the same browser-local preference and react correctly to live switching. Test application-owned error states, keyboard/modal workflows, live notices, and 40%-expanded text under narrow layouts.
- **Gate:** UI messages localize as intended, accessible dialog/keyboard interactions survive, and no internal enum, JSON field, workflow state, or user-authored content is translated.

## M7 — Server-rendered documents and export consistency

Preserve **all original M7 scope**, with the font audit now an explicit prerequisite for new scripts:

- Audit and localize backend-generated Markdown headings/readable descriptions, Handbook PDF/physical documentation labels, and user-facing generated text in Mermaid/PNG when appropriate. The current server sources include `backend/app/handbook_pdf/render.py` (currently English HTML language/headings and generated-date copy) and `backend/app/exports.py` (English Markdown labels).
- Pass an **additive, validated locale** through the relevant export request/payload, defaulting to English for older clients. Derive Python-used catalog content from the same authoritative source as the frontend (or a generated/pinned export), never two independently maintained translations.
- Preserve schema keys and machine-readable YAML/JSON identifiers; retain user-authored Atlas content verbatim. Continue the original roadmap's human-readable date/time formatting requirement, with machine numbers and IDs kept stable.
- **Font gate:** Use the M2.5 coverage report to implement and verify any required server/PDF font assets, glyph fallback, text shaping and PDF layout before offering a new script in exported documents. Test longer pseudo headings and labels in print layouts as well.
- **Gate:** Exported documents match the selected locale where supported, offline export works, old clients and English defaults continue working, and no missing glyphs or user-data translations appear.

## M8 — Catalog completion, automation and release readiness

Preserve **all original M8 scope**:

- Finish English key coverage and translate a selected real launch language to a **reviewed/approved completeness threshold** before advertising it. Maintain strict key/namespace completeness, meaningful translator context (including optional ownership/screenshot guidance where useful), review of translations when an English source meaning changes, development missing-key diagnostics, and verified fallback behavior.
- Run **app-wide 40%-expanded pseudolocalization** in every converted surface. Validate character coverage, rendered widths, clipping, wrapping, ellipsis, tooltips, keyboard focus and responsive behavior. Ensure all newly added UI messages receive the same expansion treatment.
- Add CI gates for JSON validity, key completeness, runtime missing/empty-string handling, placeholder/plural consistency, unresolved keys, changed keys/English semantics, and a **ratcheting check against newly introduced hard-coded UI strings**. Include the existing validated catalog-registry/build path; no CI system was created during M1c.
- Execute frontend unit tests, Playwright/browser tests, backend and print/export tests, and **offline production Docker** regression tests. Include mobile/narrow layouts, dialogs, tooltips, accessibility, generated documents and font coverage.
- Review the M2.5 font matrix and require actual UI **and PDF** glyph/layout verification for every public launch language. Document the language onboarding, translation review, font fallbacks, and completeness policy (building on the M1c contributor guide).
- **Gate:** No unexplained missing English keys, no invalid translation key/placeholder, only reviewed languages advertised, bundled production catalogs available offline, font support demonstrated for enabled scripts, and relevant regression checks green.

## Optional future M9 — Runtime-installable language packs

**Not part of the initial rollout; retain as the original optional future milestone.** Pursue only if users must add languages **without a Docker rebuild, restart or release**.

- Introduce a controlled read-only catalog delivery layer or persistent `/app/data/locales/` override, with approved manifest/catalog compatibility, allowed locale IDs, namespace restrictions, file-size limits, UTF-8/JSON checks, static-safe icon validation, no executable content or remote assets, and controlled refresh.
- Preserve bundled English fallback, versioned key compatibility, offline operation, and safe precedence when multiple packs exist.
- **Do not mount a host directory over the compiled frontend assets.** That could hide built-in resources or tie the user to the image filesystem layout.
- Design/release/test this independently rather than quietly treating the M1b bundled registry as a runtime pack loader.

---

## Acceptance checklist for every Codex batch / PR

- Confirm branch and actual baseline SHA. Preserve unrelated work and document affected features, namespaces and files.
- Classify each source string: translatable UI display, user-authored content, persisted default, or machine-readable token. Do not bulk-replace ambiguous literals.
- Add semantic keys, exact English master values, translator context and **complete messages with correctly named placeholders/plural expressions**. Update Pseudo-English at ~40% expanded word length; do not alter variable names.
- Preserve English wording/behavior unless approved. Share translation keys only where meaning truly matches.
- Update tests/snapshots intentionally; run relevant catalog validation, generator/typecheck, feature/browser tests and production build. Exercise Atlas Save/Undo/Redo, CodeMirror state and relevant export/data contracts.
- Check **both appearance themes and narrow layouts** using expanded pseudo text. When enabling a new writing system, verify the font/script gate and record browser-vs-PDF results.
- Report tested paths, cases/commands and results, unchanged user content/canonical values, any unconverted copy, risks and readiness for the next wave.
- Keep Pseudo-English selectable in all builds and preserve `includeDevelopmentLocalesInBuilds: true` unless the user explicitly changes that policy.
- Do not commit/push/deploy/release unless the specific task authorizes it.

## Immediate next action

Prepare **M2 only** for Codex: inventory the remaining M2 source strings, choose a small representative key set, implement the ~40% pseudo-word expansion for existing and new entries, and verify English/pseudo live-switch behavior and layout. **Do not combine M2 with a complete M3 Canvas migration.**

The **font compatibility audit is the next separate task (M2.5)** and is mandatory *before* a real language needing unverified script coverage can be enabled. Its audit may be conducted in parallel with subsequent English/pseudo-only migration, provided its release gate is maintained.

## Source references and preservation note

- Original roadmap: `dev/Localize/CTRoadmap_Localization_Rollout_Plan_v0.10.1.md` (planning date 2026-11-18).
- Current implementation: `frontend/src/i18n/`, `frontend/scripts/catalogs.mjs`, `frontend/scripts/locale-registry.mjs`, `frontend/src/i18n/README.md`, and November 19 M1a/M1b/M1c entries in `PROJECT_LOG.md`.
- Prior research source: *Localization Research.pdf* (November 17, 2026), as cited by the original roadmap.

**Preservation check:** All unfinished work from the original M2 through M8 survives in the same milestone categories: representative pilot and interaction messages (M2); shared shell/Canvas (M3); Handbook/NotePages (M4); Rack/physical (M5); remaining UI/mobile/INGEST/Experiences and deferred host CLI scope (M6); backend Markdown/PDF/Mermaid/PNG exports and client compatibility (M7); catalog completeness/CI/accessibility/mobile/offline Docker/release verification (M8). Optional runtime packs (M9) and the per-batch engineering checklist are retained. The only new scoped work is **40%-expanded Pseudo-English** (begins M2; continues thereafter) and the **font/script audit** (M2.5, with M7/M8 gates). No other Cloudflare article recommendations are introduced as new tasks.
