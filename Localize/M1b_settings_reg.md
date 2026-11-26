Here’s a **detailed Codex prompt** you can give it for **M1b**.

---

# CTRoadmap — Codex Prompt for M1b  
**Language tab in Preferences + catalog-driven language registration**

## Repository / branch / baseline

Work in private repository `NoobCity99/CTR_Dev_Core`, branch `v0.10.1`.

M1a is already upstream. Treat the current branch state as the starting point.  
Do **not** re-implement M1a from scratch. Build on what is already present.

Before making changes:

1. Inspect `AGENTS.md`
2. Inspect `PROJECT_LOG.md`
3. Confirm current HEAD and working-tree status
4. Review the existing M1a implementation:
   - `frontend/src/i18n/`
   - `frontend/src/components/settings/sections/PreferencesSettings.tsx`
   - `frontend/src/components/settings/settings.css`
   - `frontend/tests/localization.spec.ts`
   - `frontend/tests/settings-preferences.spec.ts`

Also review the existing localization planning docs in `dev/Localize/`.

## Objective

Implement **M1b** with two goals:

### Goal A — Upgrade the language selector UI
Move language selection out of the inline selector-above-tabs treatment and make **Language** its own tab within the **Settings → Preferences** section.

Inside that tab, the user should choose a language using a **radio-style list** where each option contains:

- a radio control
- the language name text
- a **round flag icon**

For this milestone, there are only two language options:

1. **English**
2. **Pseudo-English (`en-XA`)**

### Goal B — Resolve Priority 1 from the review
Make language registration **fully catalog-driven** so that adding a future language does **not** require editing the runtime code to manually import and wire in that locale.

The runtime should be driven by locale metadata and a catalog-loading mechanism rather than hard-coded imports for each language.

---

## Scope boundaries

### In scope
- Preferences UI restructure so **Language** becomes its own tab
- Improved language picker presentation
- Preference persistence and switching
- Catalog-driven locale registration
- Locale icon metadata / display metadata
- English + pseudo-English support only
- Tests, validation, and documentation updates

### Out of scope
- Broad expansion of translatable UI strings beyond what M1a already converted
- New real languages such as Spanish/French/German yet
- Backend export/PDF localization
- RTL layout support
- Runtime-uploaded language packs
- Any Atlas schema/data changes
- Any unrelated settings reorganization beyond what is needed for the Language tab

---

## Design requirements

## 1) Preferences navigation change

Currently, Preferences contains tabbed sections such as:
- Canvas / Diagrams
- Code Editor
- Handbook
- etc.

Change this so **Language** becomes its own first-class tab in the Preferences tabset.

### Requirements
- Add a new tab labeled **Language**
- Place it as the **first tab** in the Preferences tab list
- Preserve the existing keyboard navigation pattern for the Preferences tabs
- Preserve the existing tab IDs / accessibility approach as much as practical
- Do not break session retention, responsive layout behavior, or the existing tests beyond necessary updates

### Important
The old inline `<select>` above the tab strip should be removed and replaced by the Language tab content.

---

## 2) Language tab UI

Inside the new **Language** tab, show a language selection panel using a radio list.

Each language option should contain:
- a radio button
- a circular flag badge/icon
- language label text

### Expected display
For now, the UI should present something like:

- (o) [round USA flag icon] **English**
- ( ) [round pseudo flag icon] **Pseudo-English**

You may also include smaller secondary text if useful, such as the locale code:
- English — `en`
- Pseudo-English — `en-XA`

But keep the UI clean and straightforward.

### Behavior
- Selecting a radio option immediately switches the application language
- The selected option persists using the existing language preference storage key
- Switching languages must continue to update the mounted UI live, without reload
- Existing cross-tab synchronization behavior must remain
- Existing production-vs-dev behavior must remain correct:
  - Pseudo-English remains development-only
  - Production should hide pseudo-English and behave as English-only until real additional production languages are enabled

---

## 3) Flag icon implementation

The user has supplied this image as a reference for the English icon:

``

Use it as the visual basis for the **English / USA** icon treatment.

### English icon
Implement a round USA flag icon that matches the general appearance of the supplied image:
- circular badge
- glossy/button-like look is fine
- should work at small UI size
- should not require large raster dimensions

You may either:
- adapt the provided image into a suitable UI asset, or
- recreate a lightweight equivalent asset (preferably SVG if practical)

Prefer a solution that is easy to maintain and looks crisp in the UI.

### Pseudo-English icon
Create a matching round pseudo-language icon inspired by the same badge style, but recolored using:
- **purple**
- **yellow**
- **teal**

This pseudo icon does **not** need to represent a real country. It just needs to:
- visually pair with the English icon
- be clearly distinct
- use the same circular badge/button aesthetic

### Asset expectations
Store these icons in a sensible location under the frontend public/assets area, such as:
- `frontend/public/assets/i18n/flags/en.svg` (or png/webp if justified)
- `frontend/public/assets/i18n/flags/en-XA.svg`

If you use raster assets, keep them compact and UI-appropriate.

---

## 4) Locale metadata / catalog-driven registration

Resolve the existing architectural limitation where locales are still partly wired manually in runtime code.

### Current issue
M1a still explicitly imports locale JSON files in `runtime.ts`.

### Required outcome
A future bundled language should be addable by:
1. adding its catalog files
2. adding its locale entry/metadata
3. adding its icon asset

…without editing the runtime logic for that language specifically.

### Implement a locale registry/manifest model
Extend the locale metadata so each locale can declare at least:

- `id`
- `nativeLabel`
- `direction`
- `enabled`
- `developmentOnly`
- `namespaces`
- `formatVersion`
- `icon`
- optionally `englishLabel` or `displayLabel`
- optionally `description`

### Loading architecture
Refactor the i18n runtime so locale catalogs are discovered/assembled from a registry rather than hard-coded locale-by-locale imports.

Because this is a Vite frontend, use a maintainable approach compatible with bundling, such as:
- `import.meta.glob(...)`
- or a generated module map
- or another compile-time-safe pattern

### Requirements
- Do not fetch language catalogs over the network
- Keep all catalogs bundled/offline
- Preserve current production exclusion of development-only pseudo locale resources
- Ensure catalog loading is deterministic and validated
- Ensure missing resources fail clearly in development
- Keep English fallback behavior

### Important
The goal is not “dynamic arbitrary runtime language packs.”
The goal is “**future bundled languages can be registered declaratively rather than by hand-editing runtime imports**.”

---

## 5) Translation / catalog scope

Do **not** expand localization widely in this task.

Keep the actual translated UI scope limited to what M1a already established, unless a small companion string is truly necessary for the new Language tab UI.

You may add new keys only for the language-selection surface itself, such as:

- `preferences.languageTab`
- `preferences.languageHeading`
- `preferences.languageDescription`
- `preferences.languageOptionEnglish`
- `preferences.languageOptionPseudo`
- any needed accessibility/help text

Keep these names semantically clean and consistent with the existing catalog structure.

Also update:
- English catalog
- Pseudo-English catalog
- translator context / notes
- type-safe key support
- catalog validation checks

---

## 6) Accessibility and UX requirements

The new Language tab and radio list must be accessible.

### Requirements
- Proper tab semantics for the Preferences tabset
- Proper radio-group semantics
- Clear accessible names for each radio option
- Keyboard operable:
  - tab to the group
  - arrow keys should work naturally within the radio group if feasible
  - space/enter should select as expected
- Visible selected state
- Icon should be decorative unless useful for labeling
- The interface should remain clean in narrow layouts and both existing appearance modes

---

## 7) Styling requirements

Match CTRoadmap’s existing UI style system.

### Requirements
- The Language tab should feel native to current Settings UI
- The radio items should look polished and intentional, not like raw browser default controls dropped into the page
- Preserve responsive behavior
- Ensure icon and label alignment stays stable on narrow widths
- Avoid creating a one-off styling system that will be hard to extend for future languages

A good structure would be something like:
- a card/panel for language selection
- stacked language options
- each option a click-target row
- radio + icon + labels

But use your judgment within the existing design language.

---

## 8) Persistence and switching behavior

Preserve and verify all M1a behavior:

- stored key remains `ctroadmap.language.v1` unless there is a compelling compatibility reason otherwise
- saved supported ID takes precedence
- browser language fallback still works
- cross-tab synchronization still works
- invalid saved values fall back safely
- storage-denied environments still allow in-memory switching for the session
- no Atlas save/history mutation/backend settings write should be triggered by a language change
- no app remount beyond what is unavoidable for normal React rerendering
- CodeMirror / editor state preservation behavior should continue to hold

---

## 9) Tests

Update and extend tests rather than weakening them.

### Required verification areas
Update/add targeted tests for:

#### Preferences / Settings
- Language appears as its own Preferences tab
- Existing Preferences tabs still work
- Keyboard navigation across tabs still works
- Narrow layout remains usable

#### Language switching
- English ↔ pseudo-English switching still works
- Radio selection changes the active language immediately
- Selected language persists across reload
- Cross-tab synchronization still works
- Invalid localStorage value still falls back
- Denied storage still allows session switching

#### UI rendering
- Round English icon appears
- Round pseudo-English icon appears
- Selected language row and radio state remain in sync
- The original 10 M1a localized targets still update correctly
- Production build excludes or hides pseudo-English as appropriate

#### State integrity
- No Atlas save or history mutation from language switch
- Unsaved editor state still preserved

### If existing tests need updating
Update them carefully to reflect the new Language tab UX rather than simply deleting expectations.

---

## 10) Build / validation / docs

Update all necessary supporting pieces:

- `i18n:check`
- template generation if needed
- locale manifest validation to include icon metadata
- any type definitions affected by catalog-driven loading
- `PROJECT_LOG.md`

Document:
- changed files
- locale registration pattern
- how to add a future bundled language
- how icon assets are registered
- how development-only locales are handled

---

## 11) Implementation notes / guardrails

### Preserve these invariants
- No Atlas schema changes
- No translated strings used as logic IDs
- No changes to canonical defaults like `NEW NODE N`
- No backend localization changes yet
- No runtime network fetch for locale assets/catalogs
- No broad M2/M3 migration creep

### Avoid
- hard-coding locale-specific imports in runtime
- one-off special cases for `en-XA` if they can be represented in metadata
- storing flag behavior in translation catalogs
- coupling locale display assets to i18next message files directly

### Prefer
- locale manifest as source of truth
- bundler-assisted catalog discovery
- a clean separation between:
  - locale metadata
  - locale resources
  - locale UI presentation assets

---

## 12) Deliverables

At completion, report:

1. Summary of what changed
2. Files changed
3. Locale registration architecture
4. New catalog keys added
5. Icon asset implementation details
6. Test commands run and results
7. Any open issues / limitations
8. Recommended next-step candidates for the next localization wave

---

## 13) Stop condition

Stop after completing this M1b scope.

Do **not** begin:
- broader Canvas localization
- Handbook/Rack localization
- backend/PDF localization
- real additional languages
- runtime-uploaded language packs

unless explicitly instructed later.

---

If you want, I can also turn this into a **slightly shorter “production-ready Codex prompt” version** with less explanation and more direct task language.