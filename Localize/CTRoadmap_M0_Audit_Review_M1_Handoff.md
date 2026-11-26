# CTRoadmap Localization — M0 Audit Review and M1 Handoff

**Reviewed:** 2026-11-18 M0 audit bundle (uploaded as `M0_2026-11-18_b4f7aa9.zip`)  
**Repository:** `NoobCity99/CTR_Dev_Core`, branch `v0.10.1`  
**Source baseline:** `b4f7aa9ff2c107eccd43bc7baf676de0a9106a38`  
**Status:** Recommendation and Codex handoff; no repository changes authorized or performed here.

## Verdict

**Proceed to M1a, but not M2 or broad conversion yet.** The audit demonstrates a viable shared runtime insertion point, identifies source/translation boundaries, and proposes testable milestones. The static candidate ledger is **not** an approved catalog: most suggested keys remain provisional, and existing English display labels sometimes double as application-data identifiers or matching tokens. Preserve those contracts until their owning migration waves.

### Audit provenance and coverage

- 641 files in the coverage ledger; 483 with candidates; 18,131 occurrence rows in the inventory.
- 2,810 classified system-interface occurrences, 348 export occurrences, 72 potential persisted defaults, 4,321 uncertain occurrences, 8,906 machine/protocol occurrences, 1,390 user-authored occurrences, and 284 developer-only diagnostics.
- 58 focused behavioral findings, 39 proposed logical pilot messages represented by 47 source occurrences.
- Source hashes, artifact counts, parsed source and Git baseline checks passed. **No application build, unit, browser, Docker, or full-stack tests were run.** The reported working tree was unchanged but contained a pre-existing untracked `dev/Localize/` directory.
- Codex could not read *Localization Research.pdf* during M0. This review separately considers that project research, whose selected direction—react-i18next/i18next, stable semantic keys, bundled language catalogs, English fallback, feature namespaces, safe user-data separation, and incremental migration—agrees with the M0 recommendations.
- Independent inventory spot-check found **38 distinct provisional UI-key suggestions that map to more than one source text/expression**. Some may be intentional repeated contexts, but they show why inferred candidate keys cannot be bulk-imported into the English catalog. Adjudicate keys by meaning and usage before use.

## Priority rules

1. **Language is UI preference, not Atlas content.** Do not add it to `atlas.json`, view data, histories, autosave, or backend update settings. Do not root-key/remount desktop, mobile, Canvas, Rack, or CodeMirror by locale.
2. **Preserve exact English behavior.** Start with English catalog and DEV-only pseudolocale. Keep existing English strings/accessible names for converted scope. A partially translated Spanish/French catalog must not silently become a publicly supported production language.
3. **Keep canonical identifiers and saved defaults untouched.** Tile types, link types, hardware port IDs, numeric P-/C-/BP- labels, code-language IDs, schema keys, and user-authored values do not translate. Do not translate `NEW NODE N`, `Code Note`, `Manual Note N`, `New port`, or similar stored/matched defaults without a separate data-model decision and regression tests.
4. **Do not translate logic inputs.** Ingest presentation currently compares `Manager` and `Engine` display strings; update advisory compares specific English backend sentences. Introduce stable codes/IDs with legacy fallbacks before those surfaces' M6 migration.
5. **Separate source and consumer messages.** Translate stored/cached statuses at display time via `{key, params, rawFallback}`, not by storing the currently selected language's final sentence. Some formatters/collators/date logic currently follow browser locale; explicitly pass the selected UI locale where the converted scope needs it.
6. **Export is its own architectural wave.** Browser PNG titles and server-produced Markdown/Mermaid/PDF contain generated English. The PDF payload also includes already-resolved labels; its Python renderer hardcodes `lang=en`, English headings and dates. In M7, freeze request locale, distinguish derived labels from authored content, and establish request-scoped generation/download identity to prevent shared output paths crossing locales. JSON/YAML canonical outputs remain unchanged.
7. **Mobile shares the runtime, not necessarily the control yet.** M1 supports the same selected language when the app's desktop/mobile shells switch within the same browser origin. A separate device/browser does not inherit localStorage. Add reachable mobile language selection later in M6.
8. **The English master is incremental and authoritative.** Catalogs per feature namespace plus source/meaning metadata are the source for new-language templates. A language can be added to a future Docker release by supplying reviewed catalogs and manifest entry, without editing feature components. Runtime drop-in language-pack loading is a separate M9 feature, not included in M1.

## Source-specific blockers for later waves

| Boundary | Audit evidence | Planning decision |
| --- | --- | --- |
| Tile labels/default titles | `lib/constants.ts`, `atlasMutations.ts`, `atlasSelectors.ts`, Python stack normalization | M3 display-only label resolvers; never change canonical title generation as a side effect |
| Physical ports | `physicalPorts/physicalLabels.ts`, backend `physical_labels.py` | M5 retain English recognized defaults and numeric identities; translate only interface descriptions |
| Code Note draft | `features/codeNotes/context.tsx` compares `Code Note` for dirty state | M4 leave sentinel unchanged pending independent feature redesign |
| INGEST source facts | `features/ingest/presentation.ts` compares `Manager`/`Engine` and display source names | M6 stable source/fact IDs before localization |
| Update warnings | `features/updateNotice/model.ts` compares backend English error sentences | M6 structured codes with compatibility fallback |
| PDF/Markdown | `features/handbookPdf/model.ts`, `backend/app/handbook_pdf/*.py`, `backend/app/exports.py` | M7 request-scoped locale + provenance-aware derived labels + isolated outputs |
| React Flow/CodeMirror | Library-provided aria strings / CodeMirror phrases | Localize via supported configuration APIs in owning waves; do not edit vendor files or reset editor session |
| Experience content | Bundle Markdown/Puck/CTA copy and version-eligibility IDs | Localized content publishing policy; never change dismissal/eligibility IDs |

## Rollout sequence and acceptance gates

| Task | Scope | Required gate before advancing |
| --- | --- | --- |
| **M1a** | Single initialized i18next runtime above `RootApp`; English master, locale manifest, preference resolver/storage, typed keys, one translated boot fallback | Build/typecheck and focused resolver/bootstrap tests pass; English still equivalent; no Atlas writes or remount |
| **M1b** | Language selector group above existing three Preferences tabs; persistent setting + cross-tab propagation | Original tabs/order and keyboard tests still pass; switching/reload/storage denial/desktop-mobile shell behavior tested |
| **M1c** | Deterministic new-language worklist/template generation, semantic context, catalog validation, build checks | Missing/unknown keys, empty values, placeholder/plural problems detected; added catalog+manifest works without feature edits |
| **M2a** | Approved shell/import/export/workspace/search/sidebar pilot subset; stable ImportMenu action IDs | English + DEV pseudo UI and accessibility tests; exact menu behavior and focus unchanged |
| **M2b** | Top-bar save/history/count/status pilot; test all 39 logical messages | 0/1/many, failed/saving/saved states switch without saving again; no Atlas/history/editor changes; both appearances and narrow screens pass |
| **M3** | Canonical/display separation and Canvas | Owner review of uncertain/default entries; regression tests for titles, stacks, fields, layers and relationships |
| **M4** | Handbook, NotePages, Code Editor | Preserve user notes, inserted field values, code, editor selection, draft recovery and export identity |
| **M5** | Rack, ports, cables, physical documentation | Numbering/port identity, provenance, physical geometry and rendering stay unchanged |
| **M6** | Swimlane, INGEST, update, settings/auth, mobile, Experiences | Remove label-dependent matching before translation; mobile navigation and content eligibility safe |
| **M7** | Browser/system export headings, Markdown/Mermaid, Handbook/Note PDF, locale formatting | Request identity, language freezing, generated text, fonts, concurrent exports, legacy schema/raw exports tested |
| **M8** | QA, translation review, coverage, contributor workflow, release | Accepted language coverage, pseudolocalized layouts, Docker resources and no runtime CDN/service |
| **M9 (deferred)** | Optional installable runtime language packs | Separate security/compatibility/storage/API/product design required |

## Immediate action: M1a only

Use the companion `Codex_M1a_Localization_Foundation_Prompt.txt`. Do not authorize M1b or M2 until M1a's source diff, tests, and acceptance findings have been reviewed. New installed package versions must be verified, not selected from recollection. Follow repository `AGENTS.md` and relevant existing tests. Preserve any pre-existing untracked files. Codex should report rather than silently working around failed baselines or branch drift.

### Product defaults chosen for the handoff

- The initial public supported-language list contains **English only** until another language is reviewed. A DEV-only pseudo-locale is allowed for test coverage. A small Spanish smoke catalog is optional in M2 development but is not an announced production language.
- Language selection belongs in a compact group *above* the existing Preferences tabs, keeping `Canvas / Diagrams`, `Code Editor`, `Handbook` and their default selection intact.
- Saved browser language wins; otherwise a supported exact browser locale/base match, then English. Missing translations fall back to English. Unsupported or corrupt storage must not crash the application.
- Right-to-left layout is deferred; store direction metadata for later but do not imply RTL support before layout tests.
- Adding another **bundled** locale later means updating catalogs/manifest and distributing a Docker release. Hot-drop catalog installation is deferred to M9.
