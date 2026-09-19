# Public CTR project log

## 2026-09-19 — Themes, backgrounds, and custom icons

- Implementation branch: `Canvas-Theme-UD`.
- Read-only reference: `CTR_Dev_Core/master`, commit `46aef242e3fbb84937d6850439745f5a1ec699ce`, rechecked before implementation.
- Preserved existing working-tree contents and recorded protected-file hashes before editing.
- Restored the nine-theme/twelve-background appearance model with public-only v2 preferences. Cyber + Hex remains the default, including invalid-preference recovery.
- Isolated browser tests on port 4175 so they cannot reuse the private edition's development server.
- Integrated standard and cover/reveal themes into public graph mapping, tiles, links, and MiniMap. Added the Blueprint font, Stellar artwork, and all static/advanced backgrounds without private application modes.
- Settings retains its collapsible appearance section. Expand Preview, choose a Canvas Theme and Canvas Background, then Apply Canvas Style. Reset changes the draft to Cyber + Hex; Cancel or closing Settings discards unapplied changes.
- Added the persistent icon API and Inspector icon library. Select an editable tile, choose Icon, then select a Lucide icon or upload PNG/JPEG/WebP up to 512 KiB. Uploads select automatically; Use Default removes the tile reference; Edit exposes library deletion.
- Icon files live under `data/assets/icons/`; only icon references belong in Atlas JSON. Browser-local theme choices never dirty Atlas. Uploaded files are excluded from Git and image build context.
- Theme/lifecycle tests exposed an existing issue where read-only planned tiles could lose their React Flow measurements and remain hidden. Display-only measurement/selection updates now pass through in either mode; position edits still obey lifecycle and Canvas-lock rules.
- Graph remapping retains measured node sizes and refreshes handle geometry after nodes are measured, keeping links visible across theme and selection changes without disturbing the initial fit-to-view.
- Animated backgrounds own their viewport subscriptions and schedulers. Reduced motion, hidden documents, frozen previews, and unavailable Web Animations preserve a static scene; Nebula keeps the reference zoom transition from 0.73 to 1.10.
- Icon editing guards against selection and editability changes during requests. Successful deletion invalidates mounted image glyphs without rewriting other tiles. A delayed library response is reconciled with uploads/deletions completed while it was pending.
- The initial expanded browser run passed all 35 cases on the isolated public server, including appearance drafts, all theme/background combinations in the matrix, both connector styles, zoom limits, animation lifecycle, and icon persistence/fallbacks. Final failure-path and responsive checks are included in the completed validation below.

### Completed validation

- Browser: all 40 Chromium tests passed on port 4175 with strict binding and server reuse disabled. Coverage includes every theme with representative tiles, planned/selected/dragging states, children/stacks and both connector styles; every background across zoom limits; draft isolation and zero appearance-triggered saves; reduced motion, visibility, static fallbacks, upload/list/delete failures, stale requests, missing images, save/reload, and narrow-screen controls. Hover/drag tests wait for the initial camera animation to settle.
- Frontend: 62 unit tests passed; TypeScript and the Vite production build passed. The build reports a nonblocking warning for the approximately 501 kB JavaScript bundle; no frontend dependencies or build settings were changed.
- Backend: all 12 tests passed under the container's Python 3.12 environment, including multipart validation, exact 512 KiB limits, UUID names, library ordering, supported serving/deletion, traversal/symlink protection, and Atlas reference round trips. `python -m compileall -q backend` passed.
- Docker: `docker compose build` passed with an isolated local image/project (`ctrpublic-themes-review`), temporary data/export mounts, and port 18089. HTTP checks covered PNG/JPEG/WebP upload/serve/delete, invalid requests, asset loading, and persistence after restart and recreation.
- A production Chromium session against that container applied Stellar + Nebula Dive, uploaded an actual icon, observed autosave, reloaded both preferences and the saved icon, deleted the icon, and verified default rendering without runtime errors.
- Removed the isolated test container and network after verification. The private-edition server was left running and untouched.
- Final scope review found no restored private features. The reference repository was only read. Existing unrelated working-tree changes, frontend package files, Dockerfile, and distribution configuration were preserved.
- Protected-file SHA-256 values match the pre-implementation snapshot exactly:

| File | SHA-256 |
| --- | --- |
| `latest.json` | `6509996fcadf4cf95c9995e1d2d8b340fdbe3b314e809b1ff033045d340badb3` |
| `README.md` | `99fe3fa68bf458c80f5c7d25b7f70625497386fa716550c1acaef4c14f572af7` |
| `CTR_install.sh` | `2116500cd77fa6bb1e35bb616323ad9fb2f16060f78b897e75e842b3ceb842ca` |
| `CTR_uninstall.sh` | `0eee72d3d14a248448feb63ab24dc98092be1e2a6ba74102be7328497c673563` |
| `CTRBETA_release-compose.yml` | `c2833d1b3dbaee48cab761612d82eff92fe25c2f5bf3c6f2bc3ee17adf4184ee` |
