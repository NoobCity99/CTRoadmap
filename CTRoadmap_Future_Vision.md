# CTRoadmap Future Vision

**Status:** Conceptual direction, not a fixed roadmap  
**Purpose:** Guide future architecture, refactoring, entanglement audits, and product decisions  
**Primary deployment model:** Self-hosted Docker web app  
**Desktop packaging status:** Deferred unless user demand clearly justifies it

---

## 1. Product Identity

CTRoadmap is a **self-hosted visual infrastructure atlas** for homelab operators, small-network administrators, and technically curious users who want to document what exists in their environment and how it all fits together.

The app should help answer:

> What exists, where does it live, what depends on it, what does it support.?

CTRoadmap is not intended to be a generic diagramming tool, monitoring system, scanner, automation runner, or replacement for mature infrastructure platforms.

Its strength should be the ability to combine visual topology, human-readable explanation, structured data, and operational context in one local-first tool.

---

## 2. Primary Use Case

The core use case remains:

```text
A user runs CTRoadmap on their LAN or homelab server.
They open it in a browser.
They visually map their infrastructure using tiles, subtiles, relationships, flows, checks, URLs, notes, configs, scripts, and secret references.
The app saves the canonical source of truth as structured local data.
The user can export readable documentation and diagrams.
```

The app should feel natural to people already operating networked infrastructure:

- Docker users
- Homelab users
- Self-hosters
- Small office / lab administrators
- People documenting home servers, NAS boxes, services, containers, scripts, and network dependencies

If a user does not naturally want to self-host a Docker web app, they may not be the primary audience for CTRoadmap.

---

## 3. Deployment Philosophy

### Primary target

```text
Docker Compose / Docker image
```

Docker should remain the default public release path.

This is not a weakness. For CTRoadmap, Docker acts as a useful audience filter: the product is for people who are already managing infrastructure or are learning to do so.

### Secondary targets

Desktop packaging for Windows or Linux should be treated as a possible future experiment, not a current architectural driver.

Desktop versions should not shape core architecture unless real user demand appears.

Avoid adding:

- Tauri
- Electron
- pywebview
- PyInstaller
- native desktop wrappers
- Windows-specific app assumptions
- Linux desktop packaging assumptions

unless there is a clear future decision to pursue desktop distribution.

---

## 4. Product Boundary

CTRoadmap should be:

```text
A visual documentation and planning layer.
A topology explanation tool.
A relationship mapper.
A local-first homelab atlas.
An import/export-friendly front end for understanding infrastructure.
```

CTRoadmap should not try to become:

```text
A monitoring dashboard.
A live scanner.
A vulnerability scanner.
A NetBox replacement.
A CMDB replacement.
A Docker management panel.
An SSH automation runner.
A network automation platform.
A generic diagramming clone.
```

The product should remain focused on clarity, documentation, planning, and visual understanding.

---

## 5. Relationship To Existing Infrastructure Tools

Many serious users already have tools that know pieces of their infrastructure.

Examples:

- NetBox
- Nautobot
- LibreNMS
- Zabbix
- Prometheus
- Grafana
- Home Assistant
- Uptime Kuma
- Beszel
- Docker / Compose metadata
- Tailscale device lists
- Nmap scan results

CTRoadmap should not reinvent all of those wheels.

Instead, CTRoadmap should eventually be able to **import, reference, summarize, or visually contextualize** data from existing sources of truth.

The key idea:

```text
Other tools may know what exists.
CTRoadmap helps explain what it means.
```

Example:

```text
NetBox may know:
- devices
- interfaces
- IP addresses
- VLANs
- sites
- racks
- prefixes

CTRoadmap should explain:
- why a device matters
- what services depend on it
- what user-facing function it supports
- what scripts, configs, URLs, and checks relate to it
- what planned changes would affect it
- what failure points exist around it
```

---

## 6. Integration Philosophy

Future integrations should be **read-only first** and **preview-based**.

The default integration flow should be:

```text
1. Connect to or import from an external source.
2. Parse discovered objects.
3. Convert them into proposed CTRoadmap tiles and relationships.
4. Show the user an import preview.
5. Let the user accept, reject, merge, or mark proposed objects as planned.
6. Save only after user confirmation.
```

Avoid automatic mutation of the atlas without explicit user approval.

Avoid two-way sync in the early integration phases.

Avoid background scanning or automatic discovery as a core assumption.

Each integration should act as an adapter that produces a common internal shape:

```text
proposed_tiles
proposed_links
warnings
source_metadata
confidence_level
merge_candidates
```

Then the normal CTRoadmap UI should decide how the user reviews and accepts that data.

---

## 7. Future NetBox Direction

NetBox should be treated as a future optional import source, not a dependency and not a competitor.

A first NetBox integration should likely be:

```text
Read-only import preview
```

Possible first supported objects:

- devices
- virtual machines
- interfaces
- IP addresses
- prefixes
- VLANs
- sites
- racks / locations
- services, if available through the user's NetBox data model

The import should map external data into normal CTRoadmap atlas objects:

```text
NetBox device -> CTRoadmap node tile
NetBox VM -> CTRoadmap node or service tile
NetBox interface -> tile field or child tile, depending on UI design
NetBox IP address -> tile field or URL/reference tile
NetBox prefix/VLAN -> network/location/context tile
NetBox relationships -> CTRoadmap links where appropriate
```

Important principles:

- NetBox should remain optional.
- CTRoadmap should not require NetBox.
- CTRoadmap should not attempt to fully mirror NetBox.
- CTRoadmap should preserve its own atlas model.
- Imported data should be traceable back to its source.
- The user should be able to annotate imported objects with CTRoadmap-specific notes, flows, checks, failure points, and planning context.

---

## 8. Active Scanning Direction

Active scanning should not be a near-term core feature.

Possible future scanning sources may include:

- Nmap XML or JSON imports
- Tailscale device list imports
- Docker socket read-only collector
- Home Assistant entity/device imports
- Uptime Kuma monitor imports
- Beszel node/service imports

But these should be treated as optional adapters, not core app behavior.

Reasons to defer active scanning:

- security risk
- false positives
- firewall complications
- credential handling concerns
- support burden
- platform-specific networking behavior
- risk of turning CTRoadmap into an inferior clone of mature discovery tools

Preferred path:

```text
Manual atlas editor first.
Import/export second.
Read-only integrations third.
Assisted reconciliation fourth.
Optional scanners later.
```

---

## 9. Canonical Data Philosophy

The atlas should remain local-first, human-readable, backup-friendly, and AI-readable.

The canonical source of truth should remain a structured data file unless there is a strong future reason to change.

Current preferred source of truth:

```text
data/atlas.json
```

This file should remain:

- inspectable
- portable
- easy to back up
- easy to diff
- easy to import/export
- suitable for future automation or AI-assisted interpretation

SQLite, workspaces, profiles, or multi-user storage can be considered later, but should not be introduced casually.

---

## 10. Architecture Direction

The codebase should move toward clearer internal boundaries.

Desired conceptual structure:

```text
backend/
  app/
    atlas models
    validation
    storage
    export rendering
    import preview system
    integration adapters

frontend/
  src/
    canvas UI
    inspector UI
    atlas editing state
    API client layer
    import review UI
    settings UI

packaging/
  docker
  release scripts
```

Future integration structure could look like:

```text
backend/app/integrations/
  netbox/
    client.py
    mapper.py
    preview.py

  nmap/
    parser.py
    mapper.py

  docker/
    collector.py
    mapper.py

  tailscale/
    client.py
    mapper.py
```

Each adapter should transform external data into proposed CTRoadmap atlas changes. The core atlas model should not become tightly coupled to any one integration.

---

## 11. Entanglement Cleanup Priorities

Future entanglement analysis should look for code that makes CTRoadmap harder to evolve toward this integration-friendly, Docker-first architecture.

Important cleanup targets:

### Config and paths

Look for:

- hardcoded data paths
- hardcoded export paths
- assumptions that writable files live inside the app source tree
- Docker-only paths leaking into general code
- local-dev assumptions leaking into production behavior

Preferred direction:

```text
Configurable backend data directory.
Configurable backend export directory.
Docker defaults preserved.
Local dev defaults preserved.
Future platform flexibility preserved.
```

### API boundaries

Look for:

- frontend components calling `fetch` directly
- API URLs scattered across the UI
- browser download behavior scattered outside the API client
- import/export logic split across unrelated files

Preferred direction:

```text
All frontend/backend communication goes through a central API client layer.
```

### Export boundaries

Look for:

- export rendering tightly coupled to filesystem writing
- Markdown/YAML/Mermaid generation that cannot be reused by future integrations or tests

Preferred direction:

```text
Render export content separately from writing files or serving downloads.
```

### Schema and validation drift

Look for:

- duplicated backend/frontend schema rules
- TypeScript validation disagreeing with Pydantic validation
- new fields added in one layer but not the other

Preferred direction:

```text
Backend Pydantic models remain authoritative.
Frontend validation helps the user but does not define the canonical schema.
```

### Integration readiness

Look for:

- atlas mutation code that cannot support import previews
- lack of merge/diff concepts
- data model fields that cannot track source metadata
- direct writes that bypass validation

Preferred direction:

```text
Future imports should produce proposed atlas changes, not immediately mutate the canonical atlas.
```

### Command execution risk

Look for:

- shell execution
- SSH execution
- Docker socket access
- host system mutations
- background jobs that act without user confirmation

Preferred direction:

```text
No command execution in the core app.
Checks remain documentation unless explicitly approved in a future phase.
```

---

## 12. Suggested Future Feature Order

This is not a fixed roadmap, but the preferred conceptual order is:

```text
1. Strengthen the manual atlas editor.
2. Improve save/load reliability.
3. Improve exports and downloads.
4. Improve import/export of atlas.json.
5. Add import preview infrastructure.
6. Add optional read-only NetBox import.
7. Add reconciliation tools for imported vs existing atlas data.
8. Add optional import adapters for other tools.
9. Consider active scanning only after the atlas/import system is mature.
```

Avoid building scanners, automation, or desktop packaging before the atlas editor and import/export model are strong.

---

## 13. Release Philosophy

The release model should remain simple:

```text
main branch is the source of truth
feature branches are temporary
Docker images are published from stable commits/tags
release notes describe user-facing changes
```

Do not create long-lived branches for each operating system.

Do not create separate product variants unless there is a strong reason.

Build one core app and release it through Docker first.

---

## 14. Short Positioning Statement

CTRoadmap is a self-hosted visual infrastructure atlas for homelab and small-network operators. It helps users map, explain, plan, and export the relationships between nodes, services, storage, configs, URLs, checks, and operational flows. It is not a monitoring system, scanner, automation runner, or NetBox replacement; it can eventually import from existing sources of truth where appropriate.

---

## 15. Guidance For The Next Entanglement Audit

The next audit should answer:

```text
What parts of the current codebase make CTRoadmap harder to keep Docker-first, local-first, integration-friendly, and non-executing?
```

The audit should specifically identify:

- hardcoded paths
- Docker assumptions that leak into core logic
- browser assumptions that limit future import/export behavior
- scattered API calls
- schema drift risk
- export/file-writing coupling
- places where integration adapters would be awkward to add
- places where import preview or reconciliation would be difficult
- any accidental movement toward command execution or host control
- areas where documentation, README, or project log no longer match actual behavior

The output should distinguish between:

```text
Fix now before more features build on it.
Fix soon, but not blocking.
Defer until integration work begins.
Ignore unless desktop packaging returns.
```

The goal is not to perfect the architecture prematurely.

The goal is to keep the app clean enough that future imports, integrations, exports, and atlas features can be added without turning the codebase into separate tangled products.
