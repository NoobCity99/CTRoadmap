import { ChevronDown, ChevronUp, Upload, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { deleteTileIcon, listTileIcons, uploadTileIcon } from "../lib/api";
import { iconRefLabel, LUCIDE_ICON_OPTIONS, lucideNameToIconRef, normalizeTileIconRef, TileIconGlyph, uploadedAssetToIconRef, uploadedResultToIconRef, notifyIconDeleted } from "../lib/icons";
import type { Tile, TileIconRef, UploadedIconAsset } from "../types/atlas";
import "./tileIconEditor.css";

export function TileIconEditor({
  accentColor,
  defaultIcon,
  defaultLabel,
  editable,
  onUpdateTile,
  tile
}: {
  accentColor: string;
  defaultIcon: LucideIcon;
  defaultLabel: string;
  editable: boolean;
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
  const libraryEdits = useRef(new Map<string, UploadedIconAsset | null>());
  const iconRef = normalizeTileIconRef(tile);
  const selectedIconId = iconRef?.id ?? "default";
  const latest = useRef({ tile, editable, onUpdateTile });
  latest.current = { tile, editable, onUpdateTile };
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    setExpanded(false);
    setEditingUploadedIcons(false);
    setLoadError("");
    setDeletingIconIds(new Set());
  }, [tile.id]);

  useEffect(() => {
    if (!expanded) return;
    let active = true;
    const edits = new Map<string, UploadedIconAsset | null>();
    libraryEdits.current = edits;
    setLoadingUploadedIcons(true);
    setLoadError("");
    void listTileIcons()
      .then((result) => {
        if (active) {
          // Upload/delete may finish before this older library snapshot arrives.
          const additions = [...edits.values()].filter((asset): asset is UploadedIconAsset => asset !== null).reverse();
          setUploadedIcons([...additions, ...result.icons.filter((asset) => !edits.has(asset.id))]);
        }
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
    if (!mounted.current || !latest.current.editable) return;
    const current = latest.current;
    const fields = { ...current.tile.fields };
    if (nextIconRef) fields.icon_ref = nextIconRef;
    else delete fields.icon_ref;
    current.onUpdateTile({ ...current.tile, fields });
  }

  function handleUpload(file: File) {
    if (!editable || uploadingIcon) return;
    setUploadingIcon(true);
    void uploadTileIcon(file)
      .then((uploaded) => {
        if (!mounted.current) return;
        const nextIconRef = uploadedResultToIconRef(uploaded);
        libraryEdits.current.set(nextIconRef.id, nextIconRef);
        setUploadedIcons((current) => [nextIconRef, ...current.filter((icon) => icon.id !== nextIconRef.id)]);
        applyIconRef(nextIconRef);
      })
      .catch((error) => { if (mounted.current) setLoadError(error instanceof Error ? error.message : "Icon upload failed"); })
      .finally(() => { if (mounted.current) setUploadingIcon(false); });
  }

  function handleDeleteUploadedIcon(asset: UploadedIconAsset) {
    if (!editable) return;
    setDeletingIconIds((current) => new Set(current).add(asset.id));
    void deleteTileIcon(asset.filename)
      .then(() => {
        notifyIconDeleted(asset.filename);
        if (!mounted.current) return;
        libraryEdits.current.set(asset.id, null);
        setUploadedIcons((current) => current.filter((icon) => icon.id !== asset.id));
        if (normalizeTileIconRef(latest.current.tile)?.id === asset.id) applyIconRef(null);
      })
      .catch((error) => { if (mounted.current) setLoadError(error instanceof Error ? error.message : "Icon delete failed"); })
      .finally(() => { if (mounted.current)
        setDeletingIconIds((current) => {
          const next = new Set(current);
          next.delete(asset.id);
          return next;
        })
      });
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
                aria-label="Upload New Icon"
                disabled={!editable || uploadingIcon}
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
