# CTRoadmap — M1c Build Specification

**Milestone:** M1c — Catalog Tooling, Validation & Language Onboarding  
**Target:** Private `NoobCity99/CTR_Dev_Core`, branch `v0.10.1`  
**Reviewed M1b reference commit:** `3da978e219ce6b03c371fa3dd5351f2b0be633cc` (*M1b menu and reg*)  
**Status:** Approved implementation scope — **audit first, repair only demonstrated gaps**  
**Owner:** Codex  
**No authorization to commit, push, deploy, or release**

## 1. Goal

Finish M1c as a **small stabilization and documentation milestone**, not a new localization architecture or a new translation wave.

M1a/M1b already introduced most of the required machinery: i18next/react-i18next, an English master and Pseudo-English catalog, a language manifest, a generated locale registry, a translator worksheet generator, build-time catalog checks, typed translation keys, and a temporary third-language registration test. **Preserve these implementations.** Your job is to inspect their real behavior, verify the intended maintenance contract, and make the smallest corrections needed to close demonstrable gaps.

**Definition of success:** CTRoadmap developers can add/update catalog entries and register a new bundled language through documented, deterministic, checked steps, with failures detected before shipping a broken build.

## 2. Read first / establish baseline

1. Read repository `AGENTS.md`, relevant coding/test conventions, `PROJECT_LOG.md`, and existing plans under `dev/Localize/`.
2. Verify the selected branch, `git rev-parse HEAD`, working-tree status, and any pre-existing modifications. The reference SHA above identifies the implementation reviewed when this spec was written; **do not reset the branch or discard newer work** if HEAD has advanced.
3. Inspect these actual owners before proposing changes:

   - `frontend/src/i18n/manifest.json`
   - `frontend/src/i18n/context.json`
   - `frontend/src/i18n/locales/en/{common,canvas}.json`
   - `frontend/src/i18n/locales/en-XA/{common,canvas}.json`
   - `frontend/src/i18n/i18next.d.ts`, `runtime.ts`, `preferences.ts`
   - `frontend/scripts/catalogs.mjs`, `catalogs.test.mjs`
   - `frontend/scripts/locale-registry.mjs`, `locale-icon.mjs`
   - `frontend/vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `package.json`
   - `frontend/tests/localization.spec.ts`, `settings-preferences.spec.ts`
   - Relevant entries in `.gitignore` and `.dockerignore`

4. Produce a concise **requirement → existing implementation → evidence → gap/action** matrix in your completion report. Do not manufacture changes to justify the milestone.

## 3. Non-negotiable boundaries

- **English is the master** catalog; Pseudo-English `en-XA` remains a valid selectable option in **all builds**, including production Docker, per the explicit product decision.
- Keep `includeDevelopmentLocalesInBuilds: true` in the checked-in manifest. If testing the alternative, do it only in an isolated, disposable fixture/source copy. Do **not** turn it off as part of release preparation.
- Maintain the existing `ctroadmap.language.v1` preference, live switching, browser-language fallback, and cross-tab synchronization.
- Do not translate additional Canvas, Handbook, Rack, Settings, mobile, or backend strings except where a minimal fix is essential to M1c tooling.
- Do not rewrite or migrate `atlas.json`, canonical tile/type IDs, saved titles, user-authored strings, Code Note contents, internal physical labels, history, or exports.
- Do not introduce a translation service, CDN, runtime-uploadable language packs, remote catalogs, a database, or a separate localization backend.
- Do not redesign the Language tab, radio buttons, badge artwork, or appearance CSS.
- Do not broaden the current left-to-right support into an RTL layout project. Document that boundary instead.
- Do not introduce a whole-repository lint migration or reformat unrelated files.
- Never overwrite, reset, or delete unrelated working-tree modifications. Do not commit, push, tag, publish, or deploy.

## 4. Work package A — Catalog validation audit and limited hardening

Inspect the existing `npm run i18n:check` implementation. **Verify rather than reimplement** the checks already present. At minimum establish whether failures correctly identify the source file/locale/key for:

| Contract | Expected behavior |
|---|---|
| JSON validity | Reject malformed JSON and duplicate properties, including escaped-name duplicates, before silent parser overwrites. |
| English master | Require nonempty English messages and complete corresponding translator-context entries. |
| Namespace/key shape | Reject unknown/missing namespaces and unexpected or missing catalog keys according to the existing complete-catalog policy. |
| Placeholders | Enforce exactly matching interpolation-variable names between English, translated messages, and context notes. Reject malformed placeholders. |
| Manifest | Validate canonical locale IDs, uniqueness, enabled/development metadata, namespace declarations, schema/format compatibility, and icon references. |
| Badge files | Require approved local, static SVG assets; reject path traversal/symlink escape, executable content, external references, and disallowed SVG features. |
| Enabled/disabled behavior | Verify declared locale availability and bundled resources agree with the manifest switch. |
| Diagnostics | A broken catalog should fail nonzero, with actionable error text identifying the problem. |

Use existing negative tests and temporary fixtures. Add **only focused regression cases for genuine missing coverage or behavior**. Preserve useful existing tests and resist creating a second validator/framework.

**Important:** The current validator intentionally requires complete translated catalogs and currently supports LTR locales. Do not silently relax or broaden that product contract in M1c.

## 5. Work package B — New-language worksheet generator

Verify `npm run i18n:template -- <locale>` (or its currently documented equivalent) from a clean checkout.

Acceptance requirements:

- The worksheet is generated **from the current English master**, not a stale manually maintained list.
- Output order is deterministic across identical runs.
- Each output entry includes the stable namespaced key, English value, translator context/meaning, UI surface, placeholder descriptions, and a blank translation field.
- Locale identifiers are validated with clear feedback for missing/invalid arguments.
- Default output does not modify source catalogs, manifest, existing translations, or runtime resources; a user may redirect stdout to a file outside the repository.
- Updating the English catalog and its context adds the new key to the next generated worksheet without editing the generator.

If the existing implementation already passes, **leave it unchanged**. Improve error handling only if an observed issue would materially impede contributors.

Do **not** build a translation-management website, importer, ZIP packaging workflow, or automated machine translation.

## 6. Work package C — TypeScript translation-key safety

Verify that `frontend/src/i18n/i18next.d.ts` derives typing from the generated English resource contract and that the current TypeScript build catches:

- unknown translation keys;
- a key used with the wrong namespace;
- incorrect interpolation variables where the supported typing/runtime contract can enforce them.

Use temporary negative TypeScript fixtures or equivalent compile-time tests; **do not commit files containing intentionally failing application code**. Preserve `strictKeyChecks` and the existing common/Canvas namespace structure.

Confirm the generated registry is available on a **fresh checkout with no `.cache/i18n/` directory** before the project's documented typecheck/build commands run. If IDE-only TypeScript setup has a limitation until generation occurs, document the required command instead of inventing a new infrastructure layer.

## 7. Work package D — Build and CI gate verification

Check the existing command chain instead of assuming it is insufficient. In the reviewed M1b source:

```text
npm run build
  → Experience validation
  → npm run typecheck
       → locale registry generation and validation
       → TypeScript compiler
  → Vite production build
```

`npm run i18n:check` also exists as an explicit standalone command. The build does **not** need to call both commands redundantly if the existing registry generation already executes the same catalog validation.

Requirements:

1. Prove a valid clean checkout passes catalog check, typecheck, and production build.
2. Prove a deliberately malformed catalog or manifest in a **disposable test copy** causes the **normal production build** to fail before producing a deliverable.
3. Prove generated `.cache/i18n/` output is deterministic for identical inputs, ignored by Git, and excluded from the Docker build context.
4. Check for an existing active CI workflow. **If it exists**, ensure a normal frontend build or equivalent strict catalog check is included; make only a minimal edit if missing. **If no CI workflow exists**, do not create a new full CI system for M1c: document that local/production build validation is the current gate and identify CI as a future operational choice.
5. Preserve the correct current behavior of `frontend/vite.config.ts`, `frontend/vitest.config.ts`, TypeScript, and the generated registry. Do not replace the architecture because another mechanism is fashionable.

Run failure-injection tests in isolated temporary directories. Restore no files because no production source files should be changed for these tests.

## 8. Work package E — Declarative third-language onboarding test

M1b already added a third-language fixture in `frontend/scripts/catalogs.test.mjs`. Verify that it is meaningful, repeatable, and representative. Strengthen it only if it misses a required acceptance criterion.

The fixture must demonstrate that a new **bundled** locale can be registered using only:

1. `src/i18n/locales/<locale>/...` catalog files;
2. an entry in `src/i18n/manifest.json`;
3. a valid SVG badge under `public/assets/i18n/flags/`.

Without editing `runtime.ts`, `preferences.ts`, `i18next.d.ts`, or UI components for that locale, verify:

- the registry includes its translated messages and display metadata;
- the Language radio list can derive the new option from that registry;
- both Vite and Vitest resolve the same resources and the production build includes the enabled locale;
- missing namespace/catalog/icon/manifest requirements fail with useful diagnostics;
- the checked-in Pseudo-English build policy remains unchanged.

All temporary locale files belong in a disposable fixture; **do not ship or commit a dummy third language**.

The tests do not need to add a real translated language, new artwork, or backend/PDF support.

## 9. Work package F — Contributor-facing language guide

Add one concise, durable Markdown guide close to the localization source, preferably:

`frontend/src/i18n/README.md`

If there is an existing authoritative guide at a better location, update that instead; avoid duplicate conflicting instructions.

It must explain, with exact working commands:

- the roles of `manifest.json`, English namespaces, translated namespaces, `context.json`, the generated registry, and the flag assets;
- the steps for adding a **new UI message** in English and the existing enabled catalogs, including semantic key naming and translator context;
- the steps for adding a **new bundled language** (worksheet → translation → badge → manifest → checks → build → UI verification);
- why adding a language is **catalog/manifest driven**, while adding a new feature message still requires the component to use the translation key;
- how `developmentOnly` and `includeDevelopmentLocalesInBuilds` interact, including the **current decision to ship Pseudo-English in all builds**;
- how English fallback works, what happens with unsupported or missing translations, and the existing completeness policy for build validation;
- how to run the validator, template generator, typecheck, focused tests, and production build;
- the difference between bundled locales and future runtime-installed language packs;
- current limitation to **LTR languages**, and a short **font/script coverage checkpoint** before a future non-Latin language is enabled (font work is *not* part of M1c);
- the rule that Tile IDs, Atlas user content, saved defaults, machine-readable export identifiers, and source-code snippets must not be translated.

Keep the guide practical; prefer a short step-by-step example using a fictional locale or documentation-only example. Do not put a sample locale into the production manifest.

## 10. Verification checklist

Run relevant commands from `frontend/` (adjust to existing documented scripts if their actual interfaces differ):

```bash
npm ci --no-audit --no-fund
npm run i18n:check
node --test scripts/catalogs.test.mjs
npm run typecheck
npm test -- src/i18n/runtime.test.ts src/lib/tileDisplay.test.ts src/lib/tagFilters.test.ts
npm run build
npm run --silent i18n:template -- es
```

For browser coverage, reuse the existing targeted suites rather than inventing a parallel harness:

```bash
npm run test:browser -- tests/localization.spec.ts tests/settings-preferences.spec.ts --output <outside-repository-temp-directory>
```

Also perform the **temporary broken-catalog build failure test** and inspect generated registry freshness on a clean cache. Use temporary output paths so Playwright does not overwrite tracked screenshots. The worksheet example should be inspected or redirected to a temporary file rather than committed.

Record exact commands, passing/failing counts, skipped checks, and environment limitations. A source inspection alone is not proof a test was run. If Docker is unavailable, report Docker verification as unperformed rather than passing. No real-backend end-to-end test is required for this catalog-tooling milestone.

## 11. Completion requirements and deliverables

**Deliverables:**

- A small set of fixes and regression tests **only if the audit identifies real gaps**.
- One concise contributor guide for adding/updating languages.
- An M1c section in `PROJECT_LOG.md`, following repository convention.
- A completion report containing the evidence matrix, changed files, commands/results, confirmed capabilities, known limitations, and outstanding future milestones.

**Acceptance gates:**

- English/Pseudo-English current behavior remains unchanged, including production availability of pseudo.
- Existing 20 M1b translation keys still resolve correctly, with no unnecessary expansion.
- New bundled locale onboarding is demonstrably declarative without runtime source edits.
- Catalog validation rejects bad entries *and* production builds fail on those entries.
- Translation key typing and default namespace behavior are preserved.
- Source catalog changes generate fresh registry/worksheet output; stale cache cannot silently ship.
- Existing Language tab, badge presentation, keyboard behavior, saved preference, editor state, Atlas state, and history remain unaffected.
- Documentation accurately reflects actual verified commands and behavior.

## 12. Explicit stop condition

**STOP after M1c.** Do not begin M2, wider sidebar localization, real-language translation, font replacement, RTL work, PDF/backend localization, downloadable language packs, or unrelated refactoring. Do not commit or push unless the user explicitly authorizes that separately.

If the checks show that M1b already fulfills almost every requirement, **that is a successful M1c result**: a concise guide, evidence-backed verification, and no unnecessary production changes are preferable to a new architecture.
