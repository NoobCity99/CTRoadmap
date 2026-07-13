import { ChevronDown, ChevronUp, Copy, Plus, Trash2, Upload, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { deleteTileIcon, listTileIcons, uploadTileIcon } from "../lib/api";
import { getFamilyMembershipState } from "../lib/atlasSelectors";
import { LINK_TYPES, TILE_TYPES, TILE_TYPE_CONFIG } from "../lib/constants";
import { iconRefLabel, LUCIDE_ICON_OPTIONS, lucideNameToIconRef, normalizeTileIconRef, TileIconGlyph, uploadedAssetToIconRef, uploadedResultToIconRef } from "../lib/icons";
import type { AppMode, Atlas, Family, FlowStep, LayoutTemplate, Link, LinkSourcePort, LinkTargetPort, LinkType, Selection, Tile, TileIconRef, TileStack, TileType, UploadedIconAsset } from "../types/atlas";

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
        <TileIconEditor defaultIcon={Icon} defaultLabel={config.label} accentColor={config.color} tile={selectedTile} onUpdateTile={onUpdateTile} />
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

function TileIconEditor({
  accentColor,
  defaultIcon,
  defaultLabel,
  onUpdateTile,
  tile
}: {
  accentColor: string;
  defaultIcon: LucideIcon;
  defaultLabel: string;
  onUpdateTile: (tile: Tile) => void;
  tile: Tile;
}) {
  const [expanded, setExpanded] = useState(false);
  const [uploadedIcons, setUploadedIcons] = useState<UploadedIconAsset[]>([]);
  const [loadingUploadedIcons, setLoadingUploadedIcons] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [editingUploadedIcons, setEditingUploadedIcons] = useState(false);
  const [deletingIconIds, setDeletingIconIds] = useState<Set<string>>(() => new Set());
  const [loadError, setLoadError] = useState("");
  const iconRef = normalizeTileIconRef(tile);
  const selectedIconId = iconRef?.id ?? "default";

  useEffect(() => {
    setExpanded(false);
    setEditingUploadedIcons(false);
    setLoadError("");
    setDeletingIconIds(new Set());
  }, [tile.id]);

  useEffect(() => {
    if (!expanded) return;
    let active = true;
    setLoadingUploadedIcons(true);
    setLoadError("");
    void listTileIcons()
      .then((result) => {
        if (active) setUploadedIcons(result.icons);
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Could not load uploaded icons.");
      })
      .finally(() => {
        if (active) setLoadingUploadedIcons(false);
      });
    return () => {
      active = false;
    };
  }, [expanded]);

  function applyIconRef(nextIconRef: TileIconRef | null) {
    const fields = { ...tile.fields };
    if (nextIconRef) fields.icon_ref = nextIconRef;
    else delete fields.icon_ref;
    onUpdateTile({ ...tile, fields });
  }

  function handleUpload(file: File) {
    setUploadingIcon(true);
    void uploadTileIcon(file)
      .then((uploaded) => {
        const nextIconRef = uploadedResultToIconRef(uploaded);
        setUploadedIcons((current) => [nextIconRef, ...current.filter((icon) => icon.id !== nextIconRef.id)]);
        applyIconRef(nextIconRef);
      })
      .catch((error) => window.alert(error instanceof Error ? error.message : "Icon upload failed"))
      .finally(() => setUploadingIcon(false));
  }

  function handleDeleteUploadedIcon(asset: UploadedIconAsset) {
    setDeletingIconIds((current) => new Set(current).add(asset.id));
    void deleteTileIcon(asset.filename)
      .then(() => {
        setUploadedIcons((current) => current.filter((icon) => icon.id !== asset.id));
        if (selectedIconId === asset.id) applyIconRef(null);
      })
      .catch((error) => window.alert(error instanceof Error ? error.message : "Icon delete failed"))
      .finally(() =>
        setDeletingIconIds((current) => {
          const next = new Set(current);
          next.delete(asset.id);
          return next;
        })
      );
  }

  return (
    <div className={expanded ? "icon-editor icon-editor--expanded" : "icon-editor"} style={{ "--tile-accent": accentColor } as CSSProperties}>
      <div className="icon-editor__summary">
        <div className="icon-editor__preview">
          <TileIconGlyph fallback={defaultIcon} iconRef={iconRef} size={24} strokeWidth={2.2} />
        </div>
        <div className="icon-editor__meta">
          <div className="field-editor__title">Icon</div>
          <strong>{iconRefLabel(iconRef, defaultLabel)}</strong>
          <span>{iconRef?.kind === "uploaded" ? "Uploaded icon" : iconRef?.kind === "lucide" ? "Lucide icon" : "Tile type default"}</span>
        </div>
      </div>
      <div className="icon-editor__actions">
        <button className="ghost-button" type="button" onClick={() => setExpanded((current) => !current)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Choose Icon
        </button>
        <button className="ghost-button" type="button" disabled={!iconRef} onClick={() => applyIconRef(null)}>
          <X size={16} /> Use Default
        </button>
      </div>
      {expanded ? (
        <div className="icon-library">
          <div className="icon-library__section-head">
            <button className="ghost-button icon-library__edit" type="button" onClick={() => setEditingUploadedIcons((current) => !current)}>
              {editingUploadedIcons ? "Done" : "Edit"}
            </button>
            <label className={uploadingIcon ? "ghost-button icon-library__upload icon-library__upload--busy" : "ghost-button icon-library__upload"}>
              <Upload size={16} />
              <span>{uploadingIcon ? "Uploading" : "Upload New Icon"}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (file) handleUpload(file);
                }}
              />
            </label>
          </div>
          <div className="icon-library__pool" role="listbox" aria-label="Icon library">
            {loadingUploadedIcons ? <div className="icon-library__empty">Loading uploaded icons...</div> : null}
            {loadError ? <div className="icon-library__empty icon-library__empty--error">{loadError}</div> : null}
            {!loadingUploadedIcons && !loadError && uploadedIcons.length === 0 ? <div className="icon-library__empty">No uploaded icons yet.</div> : null}
            {uploadedIcons.length ? (
              <div className="icon-library__grid">
                {uploadedIcons.map((asset) => {
                  const assetRef = uploadedAssetToIconRef(asset);
                  const selected = selectedIconId === assetRef.id;
                  const deleting = deletingIconIds.has(asset.id);
                  return (
                    <div key={assetRef.id} className={editingUploadedIcons ? "icon-library__option-shell icon-library__option-shell--editing" : "icon-library__option-shell"}>
                      <button
                        aria-pressed={selected}
                        className={selected ? "icon-library__option icon-library__option--selected" : "icon-library__option"}
                        disabled={deleting}
                        title={asset.filename}
                        type="button"
                        onClick={() => applyIconRef(assetRef)}
                      >
                        <TileIconGlyph alt={asset.filename} fallback={defaultIcon} iconRef={assetRef} size={22} />
                        <span>{asset.filename}</span>
                      </button>
                      {editingUploadedIcons ? (
                        <button
                          aria-label={`Remove ${asset.filename} from icon library`}
                          className="icon-library__delete"
                          disabled={deleting}
                          title={`Remove ${asset.filename}`}
                          type="button"
                          onClick={() => handleDeleteUploadedIcon(asset)}
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
            <div className="icon-library__divider" />
            <div className="icon-library__grid">
              {LUCIDE_ICON_OPTIONS.map((option) => {
                const selected = selectedIconId === option.id;
                return (
                  <button
                    key={option.id}
                    aria-pressed={selected}
                    className={selected ? "icon-library__option icon-library__option--selected" : "icon-library__option"}
                    title={option.label}
                    type="button"
                    onClick={() => {
                      const nextIconRef = lucideNameToIconRef(option.name);
                      if (nextIconRef) applyIconRef(nextIconRef);
                    }}
                  >
                    <option.Icon size={22} strokeWidth={2.2} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
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
