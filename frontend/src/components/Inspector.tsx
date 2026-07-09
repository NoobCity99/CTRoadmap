import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { uploadTileIcon } from "../lib/api";
import { getFamilyMembershipState } from "../lib/atlasSelectors";
import { LINK_TYPES, TILE_TYPES, TILE_TYPE_CONFIG } from "../lib/constants";
import type { AppMode, Atlas, Family, FlowStep, LayoutTemplate, Link, LinkSourcePort, LinkTargetPort, LinkType, Selection, Tile, TileIconRef, TileStack, TileType } from "../types/atlas";

interface InspectorProps {
  atlas: Atlas;
  layoutTemplate: LayoutTemplate;
  mode: AppMode;
  selection: Selection;
  onUpdateTile: (tile: Tile) => void;
  onUpdateFamily: (family: Family) => void;
  onUpdateStack: (stack: TileStack) => void;
  onUnstack: (stackId: string) => void;
  onDeleteTile: (tileId: string) => void;
  onDeleteFamily: (familyId: string) => void;
  onDuplicateTile: (tileId: string) => void;
  onAddSubtile: (parentId: string) => void;
  onToggleTileFamily: (tileId: string, familyId: string, included: boolean) => void;
  onUpdateLink: (link: Link) => void;
  onDeleteLink: (linkId: string) => void;
  onPromoteTile: (tileId: string) => void;
  onPromoteLink: (linkId: string) => void;
}

export function Inspector({
  atlas,
  layoutTemplate,
  mode,
  selection,
  onUpdateTile,
  onUpdateFamily,
  onUpdateStack,
  onUnstack,
  onDeleteTile,
  onDeleteFamily,
  onDuplicateTile,
  onAddSubtile,
  onToggleTileFamily,
  onUpdateLink,
  onDeleteLink,
  onPromoteTile,
  onPromoteLink
}: InspectorProps) {
  const selectedTile = selection?.kind === "tile" ? atlas.tiles.find((tile) => tile.id === selection.id) : null;
  const selectedLink = selection?.kind === "link" ? atlas.links.find((link) => link.id === selection.id) : null;
  const selectedStack = selection?.kind === "stack" ? atlas.stacks?.find((stack) => stack.id === selection.id) : null;
  const selectedFamily = selection?.kind === "family" ? atlas.families?.find((family) => family.id === selection.id) : null;
  const handbookMode = layoutTemplate === "handbook";

  if (selectedFamily) {
    const members = selectedFamily.member_tile_ids.map((memberId) => atlas.tiles.find((tile) => tile.id === memberId)).filter((tile): tile is Tile => Boolean(tile));
    const familyColor = selectedFamily.color || "#38a3ff";

    return (
      <aside className="inspector">
        <div className="panel-title">Family Inspector</div>
        <div className="inspector__hero inspector__hero--family" style={{ "--family-color": familyColor } as CSSProperties}>
          <div>
            <input className="title-input" value={selectedFamily.title} onChange={(event) => onUpdateFamily({ ...selectedFamily, title: event.target.value || "Family" })} />
            <span>{members.length} member{members.length === 1 ? "" : "s"}</span>
          </div>
        </div>
        <div className="family-inspector">
          <label>
            Description
            <textarea value={selectedFamily.description} onChange={(event) => onUpdateFamily({ ...selectedFamily, description: event.target.value })} />
          </label>
          <label>
            Tag
            <input value={selectedFamily.tag ?? ""} onChange={(event) => onUpdateFamily({ ...selectedFamily, tag: event.target.value || null })} />
          </label>
          <label>
            Color
            <span className="family-color-picker">
              <span className="family-color-picker__swatch" style={{ "--family-color": familyColor } as CSSProperties} />
              <input type="color" value={familyColor} aria-label="Family color" onChange={(event) => onUpdateFamily({ ...selectedFamily, color: event.target.value })} />
              <strong>{familyColor.toUpperCase()}</strong>
            </span>
          </label>
          <label>
            Order
            <input type="number" disabled={handbookMode} value={selectedFamily.order} onChange={(event) => onUpdateFamily({ ...selectedFamily, order: Number(event.target.value) || 0 })} />
          </label>
          <div className="family-inspector__readout">
            <span>Position</span>
            <strong>{Math.round(selectedFamily.position.x)}, {Math.round(selectedFamily.position.y)}</strong>
          </div>
          <div className="family-inspector__readout">
            <span>Size</span>
            <strong>{Math.round(selectedFamily.size.width)} x {Math.round(selectedFamily.size.height)}</strong>
          </div>
          <div className="family-inspector__members">
            <span>Members</span>
            {members.length ? (
              <ul>
                {members.map((member) => (
                  <li key={member.id}>{member.title}</li>
                ))}
              </ul>
            ) : (
              <strong>No member tiles</strong>
            )}
          </div>
        </div>
        <button className="danger-button" disabled={handbookMode} onClick={() => onDeleteFamily(selectedFamily.id)}>
          <Trash2 size={16} /> Delete Family
        </button>
      </aside>
    );
  }

  if (selectedStack) {
    const parent = atlas.tiles.find((tile) => tile.id === selectedStack.parent_id);
    const members = selectedStack.member_ids.map((memberId) => atlas.tiles.find((tile) => tile.id === memberId)).filter((tile): tile is Tile => Boolean(tile));
    const config = TILE_TYPE_CONFIG[selectedStack.tile_type];
    const Icon = config.icon;
    const isMountStack = selectedStack.stack_kind === "mount_children";

    return (
      <aside className="inspector">
        <div className="panel-title">Stack Inspector</div>
        <div className="inspector__hero" style={{ "--tile-accent": config.color } as CSSProperties}>
          <Icon size={28} />
          <div>
            <input
              className="title-input"
              value={selectedStack.name}
              onChange={(event) => onUpdateStack({ ...selectedStack, name: event.target.value || defaultStackName(selectedStack), name_is_custom: true })}
            />
            <span>
              {isMountStack ? `${members.length} Mounted Items` : `${members.length} ${config.label} tiles`}
            </span>
          </div>
        </div>
        <div className="stack-inspector">
          <div>
            <span>{isMountStack ? "Mount" : "Parent"}</span>
            <strong>{parent?.title ?? selectedStack.parent_id}</strong>
          </div>
          <div>
            <span>Tile Type</span>
            <strong>{isMountStack ? "Mixed mounted items" : config.label}</strong>
          </div>
          <div>
            <span>Count</span>
            <strong>{members.length}</strong>
          </div>
          <div>
            <span>Members</span>
            <ul>
              {members.map((member) => (
                <li key={member.id}>{member.title}</li>
              ))}
            </ul>
          </div>
        </div>
        <button className="ghost-button" disabled={handbookMode} onClick={() => onUnstack(selectedStack.id)}>
          Unstack
        </button>
      </aside>
    );
  }

  if (selectedTile) {
    const config = TILE_TYPE_CONFIG[selectedTile.type];
    const Icon = config.icon;
    const tags = selectedTile.tags ?? [];
    const descendantIds = getDescendantIds(atlas.tiles, selectedTile.id);
    const fieldEntries = Object.entries(selectedTile.fields ?? {}).filter(
      ([key]) => !(selectedTile.type === "flow" && key === "steps") && !(selectedTile.type === "node" && key === "primary_node") && key !== "icon_ref"
    );
    const lifecycle = resolveLifecycle(selectedTile);
    const editable = isLifecycleEditable(lifecycle, mode);
    const primaryNode = selectedTile.type === "node" && selectedTile.fields?.primary_node === true;
    const iconRef = getTileIconRef(selectedTile);

    return (
      <aside className="inspector">
        <div className="panel-title">Inspector</div>
        <div className="inspector__hero" style={{ "--tile-accent": config.color } as CSSProperties}>
          <Icon size={28} />
          <div>
            <input
              className="title-input"
              disabled={!editable}
              value={selectedTile.title}
              onChange={(event) => onUpdateTile({ ...selectedTile, title: event.target.value })}
            />
            <span>{config.label} · {lifecycle.toUpperCase()}</span>
          </div>
        </div>
        {!editable ? (
          <ReadOnlyModeNotice lifecycle={lifecycle} mode={mode} kind="tile" onGoLive={lifecycle === "planned" && mode === "live" ? () => onPromoteTile(selectedTile.id) : undefined} />
        ) : null}
        <fieldset disabled={!editable} className="inspector__fieldset">
        <div className="icon-editor">
          <div className="field-editor__title">Icon</div>
          <div className="icon-editor__preview" style={{ "--tile-accent": config.color } as CSSProperties}>
            {iconRef ? <img src={iconRef.url} alt="" /> : <Icon size={24} strokeWidth={2.2} />}
          </div>
          <label className="ghost-button icon-editor__upload">
            Upload Icon
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (!file) return;
                void uploadTileIcon(file)
                  .then((uploaded) =>
                    onUpdateTile({
                      ...selectedTile,
                      fields: {
                        ...selectedTile.fields,
                        icon_ref: {
                          kind: "uploaded",
                          filename: uploaded.filename,
                          url: uploaded.url,
                          media_type: uploaded.media_type
                        }
                      }
                    })
                  )
                  .catch((error) => window.alert(error instanceof Error ? error.message : "Icon upload failed"));
              }}
            />
          </label>
          {iconRef ? (
            <button
              className="ghost-button"
              onClick={() => {
                const fields = { ...selectedTile.fields };
                delete fields.icon_ref;
                onUpdateTile({ ...selectedTile, fields });
              }}
            >
              Reset Icon
            </button>
          ) : null}
        </div>
        <label>
          Type
          <select
            disabled={handbookMode}
            value={selectedTile.type}
            onChange={(event) => onUpdateTile({ ...selectedTile, type: event.target.value as TileType })}
          >
            {TILE_TYPES.map((type) => (
              <option key={type} value={type}>
                {TILE_TYPE_CONFIG[type].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Parent
          <select
            disabled={handbookMode}
            value={selectedTile.parent ?? ""}
            onChange={(event) => onUpdateTile({ ...selectedTile, parent: event.target.value || null })}
          >
            <option value="">No parent</option>
            {atlas.tiles
              .filter((tile) => tile.id !== selectedTile.id && !descendantIds.has(tile.id))
              .map((tile) => (
                <option key={tile.id} value={tile.id}>
                  {tile.title}
                </option>
              ))}
          </select>
        </label>
        {selectedTile.type === "node" ? (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={primaryNode}
              onChange={(event) =>
                onUpdateTile({
                  ...selectedTile,
                  fields: { ...selectedTile.fields, primary_node: event.target.checked }
                })
              }
            />
            Primary Node
          </label>
        ) : null}
        {(atlas.families ?? []).length ? (
          <div className="family-membership">
            <div className="field-editor__title">Families</div>
            {(atlas.families ?? [])
              .slice()
              .sort((left, right) => left.order - right.order)
              .map((family) => {
                const membership = getFamilyMembershipState(selectedTile.id, family, atlas.tiles);
                return (
                  <label key={family.id} className={membership.inherited ? "checkbox-label checkbox-label--muted" : "checkbox-label"}>
                    <input
                      type="checkbox"
                      checked={membership.checked}
                      disabled={handbookMode || membership.inherited}
                      onChange={(event) => onToggleTileFamily(selectedTile.id, family.id, event.target.checked)}
                    />
                    {family.title}
                    {membership.inherited ? <small>Included through parent/child tree</small> : null}
                  </label>
                );
              })}
          </div>
        ) : null}
        <label>
          Tags
          <input
            value={tags.join(", ")}
            onChange={(event) =>
              onUpdateTile({
                ...selectedTile,
                tags: event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              })
            }
          />
        </label>
        <div className="field-editor">
          <div className="field-editor__title">Fields</div>
          {fieldEntries.map(([key, value]) => {
            const protectedField = selectedTile.type === "check" && key === "execution_enabled";
            return (
              <label key={key}>
                {key}
                <span className="field-editor__row">
                  {protectedField ? (
                    <input value="false" disabled />
                  ) : (
                    <input
                      value={String(value)}
                      onChange={(event) =>
                        onUpdateTile({
                          ...selectedTile,
                          fields: { ...selectedTile.fields, [key]: coerceFieldValue(value, event.target.value) }
                        })
                      }
                    />
                  )}
                  {!protectedField ? (
                    <button
                      className="field-editor__remove"
                      type="button"
                      title={`Remove ${key}`}
                      aria-label={`Remove ${key}`}
                      onClick={() => {
                        const fields = { ...selectedTile.fields };
                        delete fields[key];
                        onUpdateTile({ ...selectedTile, fields });
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </span>
              </label>
            );
          })}
          <button
            className="ghost-button"
            onClick={() => {
              const key = window.prompt("Field name");
              if (!key) return;
              onUpdateTile({ ...selectedTile, fields: { ...selectedTile.fields, [key]: "" } });
            }}
          >
            <Plus size={16} /> Add Field
          </button>
        </div>
        {selectedTile.type === "flow" ? <FlowStepEditor atlas={atlas} tile={selectedTile} onUpdateTile={onUpdateTile} /> : null}
        <label>
          Notes
          <textarea
            value={selectedTile.notes ?? ""}
            onChange={(event) => onUpdateTile({ ...selectedTile, notes: event.target.value })}
          />
        </label>
        <button className="ghost-button" disabled={handbookMode} onClick={() => onAddSubtile(selectedTile.id)}>
          <Plus size={16} /> Add Subtile
        </button>
        <button className="ghost-button" disabled={handbookMode} onClick={() => onDuplicateTile(selectedTile.id)}>
          <Copy size={16} /> Duplicate Tile
        </button>
        <button className="danger-button" disabled={handbookMode} onClick={() => onDeleteTile(selectedTile.id)}>
          <Trash2 size={16} /> Delete Tile
        </button>
        </fieldset>
      </aside>
    );
  }

  if (selectedLink) {
    const fromTile = atlas.tiles.find((tile) => tile.id === selectedLink.from);
    const toTile = atlas.tiles.find((tile) => tile.id === selectedLink.to);
    const lifecycle = resolveLifecycle(selectedLink);
    const editable = isLifecycleEditable(lifecycle, mode);
    const canPromoteLink = lifecycle === "planned" && resolveLifecycle(fromTile) === "live" && resolveLifecycle(toTile) === "live";

    return (
      <aside className="inspector">
        <div className="panel-title">Inspector</div>
        <div className="inspector__hero inspector__hero--link">
          <div>
            <div className="title-input title-input--readonly">{selectedLink.label || selectedLink.type}</div>
            <span>
              {fromTile?.title ?? selectedLink.from} to {toTile?.title ?? selectedLink.to} · {lifecycle.toUpperCase()}
            </span>
          </div>
        </div>
        {!editable ? (
          <ReadOnlyModeNotice
            lifecycle={lifecycle}
            mode={mode}
            kind="relationship"
            onGoLive={lifecycle === "planned" && mode === "live" && canPromoteLink ? () => onPromoteLink(selectedLink.id) : undefined}
            blockedReason={lifecycle === "planned" && mode === "live" && !canPromoteLink ? "Promote both endpoint tiles before promoting this relationship." : undefined}
          />
        ) : null}
        <fieldset disabled={!editable} className="inspector__fieldset">
        <label>
          From
          <select
            disabled={handbookMode}
            value={selectedLink.from}
            onChange={(event) => onUpdateLink({ ...selectedLink, from: event.target.value })}
          >
            {atlas.tiles.map((tile) => (
              <option key={tile.id} value={tile.id}>
                {tile.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          To
          <select
            disabled={handbookMode}
            value={selectedLink.to}
            onChange={(event) => onUpdateLink({ ...selectedLink, to: event.target.value })}
          >
            {atlas.tiles.map((tile) => (
              <option key={tile.id} value={tile.id}>
                {tile.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select
            disabled={handbookMode}
            value={selectedLink.type}
            onChange={(event) => {
              const type = event.target.value as LinkType;
              onUpdateLink({
                ...selectedLink,
                type,
                from_port: type === "contains" ? "child" : selectedLink.from_port,
                to_port: type === "contains" ? "parent" : selectedLink.to_port
              });
            }}
          >
            {LINK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          From Port
          <select
            disabled={handbookMode}
            value={resolveSourcePort(selectedLink)}
            onChange={(event) => onUpdateLink({ ...selectedLink, from_port: event.target.value as LinkSourcePort })}
          >
            <option value="out">OUT side</option>
            <option value="child">Child bottom</option>
          </select>
        </label>
        <label>
          To Port
          <select
            disabled={handbookMode}
            value={resolveTargetPort(selectedLink)}
            onChange={(event) => onUpdateLink({ ...selectedLink, to_port: event.target.value as LinkTargetPort })}
          >
            <option value="in">IN side</option>
            <option value="parent">Parent top</option>
          </select>
        </label>
        <label>
          Label
          <input
            value={selectedLink.label ?? ""}
            onChange={(event) => onUpdateLink({ ...selectedLink, label: event.target.value })}
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            disabled={handbookMode}
            checked={selectedLink.directional ?? true}
            onChange={(event) => onUpdateLink({ ...selectedLink, directional: event.target.checked })}
          />
          Directional
        </label>
        <label>
          Notes
          <textarea
            value={selectedLink.notes ?? ""}
            onChange={(event) => onUpdateLink({ ...selectedLink, notes: event.target.value })}
          />
        </label>
        <button className="danger-button" disabled={handbookMode} onClick={() => onDeleteLink(selectedLink.id)}>
          <Trash2 size={16} /> Delete Link
        </button>
        </fieldset>
      </aside>
    );
  }

  return (
    <aside className="inspector">
      <div className="panel-title">Inspector</div>
      <div className="empty-state">
        <strong>Select a tile, relationship, stack, or Family</strong>
        <span>Edit details, fields, tags, notes, relationships, and grouping here.</span>
      </div>
    </aside>
  );
}

interface FlowStepEditorProps {
  atlas: Atlas;
  tile: Tile;
  onUpdateTile: (tile: Tile) => void;
}

function FlowStepEditor({ atlas, tile, onUpdateTile }: FlowStepEditorProps) {
  const steps = normalizeFlowSteps(tile.fields.steps);
  const relatedLinks = atlas.links.filter((link) => link.from === tile.id || link.to === tile.id);
  const dependencies = relatedLinks.filter((link) => ["depends_on", "requires_key", "requires_config", "validates_with"].includes(link.type));
  const failures = relatedLinks.filter((link) => link.type === "fails_if");

  function updateSteps(nextSteps: FlowStep[]) {
    onUpdateTile({
      ...tile,
      fields: {
        ...tile.fields,
        steps: nextSteps.map((step, index) => ({ ...step, order: index + 1 }))
      }
    });
  }

  function updateStep(index: number, patch: Partial<FlowStep>) {
    updateSteps(steps.map((step, stepIndex) => (stepIndex === index ? { ...step, ...patch } : step)));
  }

  function addStep() {
    const firstTile = atlas.tiles[0]?.id ?? tile.id;
    const secondTile = atlas.tiles.find((candidate) => candidate.id !== firstTile)?.id ?? firstTile;
    updateSteps([
      ...steps,
      {
        order: steps.length + 1,
        from: firstTile,
        to: secondTile,
        action: "Describe action"
      }
    ]);
  }

  function moveStep(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const nextSteps = [...steps];
    const current = nextSteps[index];
    nextSteps[index] = nextSteps[targetIndex];
    nextSteps[targetIndex] = current;
    updateSteps(nextSteps);
  }

  return (
    <div className="flow-editor">
      <div className="field-editor__title">Flow Steps</div>
      {steps.length ? (
        steps.map((step, index) => (
          <div key={`${step.order}_${index}`} className="flow-step-row">
            <div className="flow-step-row__top">
              <strong>Step {index + 1}</strong>
              <div className="flow-step-row__actions">
                <button className="mini-icon-button" onClick={() => moveStep(index, -1)} disabled={index === 0} title="Move step up">
                  <ChevronUp size={14} />
                </button>
                <button className="mini-icon-button" onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} title="Move step down">
                  <ChevronDown size={14} />
                </button>
                <button className="mini-icon-button mini-icon-button--danger" onClick={() => updateSteps(steps.filter((_, stepIndex) => stepIndex !== index))} title="Delete step">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <label>
              From
              <select value={step.from} onChange={(event) => updateStep(index, { from: event.target.value })}>
                {atlas.tiles.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              To
              <select value={step.to} onChange={(event) => updateStep(index, { to: event.target.value })}>
                {atlas.tiles.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Action
              <input value={step.action} onChange={(event) => updateStep(index, { action: event.target.value })} />
            </label>
          </div>
        ))
      ) : (
        <div className="flow-empty">No flow steps yet.</div>
      )}
      <button className="ghost-button" onClick={addStep}>
        <Plus size={16} /> Add Flow Step
      </button>
      <FlowRelatedList title="Dependencies And Checks" links={dependencies} atlas={atlas} focusTileId={tile.id} />
      <FlowRelatedList title="Failure Points" links={failures} atlas={atlas} focusTileId={tile.id} />
    </div>
  );
}

function FlowRelatedList({ title, links, atlas, focusTileId }: { title: string; links: Link[]; atlas: Atlas; focusTileId: string }) {
  return (
    <div className="flow-related">
      <div className="flow-related__title">{title}</div>
      {links.length ? (
        links.map((link) => {
          const otherId = link.from === focusTileId ? link.to : link.from;
          const fromTile = atlas.tiles.find((tile) => tile.id === link.from);
          const toTile = atlas.tiles.find((tile) => tile.id === link.to);
          const otherTile = atlas.tiles.find((tile) => tile.id === otherId);
          return (
            <div key={link.id} className="flow-related__item">
              {fromTile?.title ?? link.from} {"->"} {toTile?.title ?? link.to}: {link.label || link.type}
              {otherTile ? <span>{otherTile.type}</span> : null}
            </div>
          );
        })
      ) : (
        <div className="flow-empty">None linked yet.</div>
      )}
    </div>
  );
}

function normalizeFlowSteps(value: unknown): FlowStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((step): step is Record<string, unknown> => Boolean(step) && typeof step === "object")
    .map((step, index) => ({
      order: Number(step.order) || index + 1,
      from: String(step.from ?? ""),
      to: String(step.to ?? ""),
      action: String(step.action ?? "")
    }))
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({ ...step, order: index + 1 }));
}

function coerceFieldValue(original: unknown, next: string): unknown {
  if (typeof original === "boolean") {
    return next === "true" || next === "1" || next.toLowerCase() === "yes";
  }
  return next;
}

function getTileIconRef(tile: Tile): TileIconRef | null {
  const iconRef = tile.fields?.icon_ref;
  if (!iconRef || typeof iconRef !== "object") return null;
  const candidate = iconRef as Partial<TileIconRef>;
  if (candidate.kind !== "uploaded" || typeof candidate.filename !== "string" || typeof candidate.url !== "string") return null;
  return {
    kind: "uploaded",
    filename: candidate.filename,
    url: candidate.url,
    media_type: typeof candidate.media_type === "string" ? candidate.media_type : undefined
  };
}

function defaultStackName(stack: TileStack): string {
  if (stack.stack_kind === "mount_children") return `${stack.member_ids.length} Mounted Items`;
  const label = TILE_TYPE_CONFIG[stack.tile_type].label;
  return `${stack.member_ids.length} ${label}${label.endsWith("s") ? "" : "s"}`;
}

function getDescendantIds(tiles: Tile[], tileId: string): Set<string> {
  const descendants = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const tile of tiles) {
      if (tile.parent && (tile.parent === tileId || descendants.has(tile.parent)) && !descendants.has(tile.id)) {
        descendants.add(tile.id);
        changed = true;
      }
    }
  }
  return descendants;
}

function ReadOnlyModeNotice({
  blockedReason,
  kind,
  lifecycle,
  mode,
  onGoLive
}: {
  blockedReason?: string;
  kind: "tile" | "relationship";
  lifecycle: "live" | "planned";
  mode: AppMode;
  onGoLive?: () => void;
}) {
  const message =
    lifecycle === "planned" && mode === "live"
      ? `This planned ${kind} is locked in Live View.`
      : `This live ${kind} is reference-only in Planning Mode.`;
  return (
    <div className="inspector__readonly">
      <strong>{message}</strong>
      {blockedReason ? <span>{blockedReason}</span> : null}
      {onGoLive ? (
        <button className="ghost-button" onClick={onGoLive}>
          Go Live
        </button>
      ) : null}
    </div>
  );
}

function resolveLifecycle(item: Tile | Link | null | undefined): "live" | "planned" {
  return item?.lifecycle === "planned" ? "planned" : "live";
}

function isLifecycleEditable(lifecycle: "live" | "planned", mode: AppMode): boolean {
  return mode === "planning" ? lifecycle === "planned" : lifecycle === "live";
}

function resolveSourcePort(link: Link): LinkSourcePort {
  return link.from_port ?? (link.type === "contains" ? "child" : "out");
}

function resolveTargetPort(link: Link): LinkTargetPort {
  return link.to_port ?? (link.type === "contains" ? "parent" : "in");
}
