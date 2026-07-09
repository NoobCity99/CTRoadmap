import { ChevronDown, ChevronUp } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { buildHandbookDocument } from "../lib/handbook";
import type { Atlas } from "../types/atlas";

interface HandbookTocProps {
  atlas: Atlas;
  selectedTileId: string | null;
  selectedVolumeId: string | null;
  onMoveFamily: (familyId: string, direction: -1 | 1) => void;
  onSelectTile: (volumeId: string, tileId: string) => void;
  onSelectVolume: (volumeId: string) => void;
}

export function HandbookToc({ atlas, selectedTileId, selectedVolumeId, onMoveFamily, onSelectTile, onSelectVolume }: HandbookTocProps) {
  const document = useMemo(() => buildHandbookDocument(atlas), [atlas]);
  const familyVolumes = document.volumes.filter((volume) => volume.family);

  return (
    <div className="handbook-toc">
      <div className="panel-title">TABLE OF CONTENTS</div>
      <div className="handbook-toc__list">
        {document.volumes.map((volume) => {
          const familyIndex = volume.family ? familyVolumes.findIndex((candidate) => candidate.family?.id === volume.family?.id) : -1;
          const volumeClassName = selectedVolumeId === volume.id ? "handbook-toc__volume handbook-toc__volume--selected" : "handbook-toc__volume";
          return (
            <section key={volume.id} className={volumeClassName} style={{ "--volume-color": volume.color } as CSSProperties}>
              <div className="handbook-toc__volume-row">
                <button type="button" className="handbook-toc__volume-title" onClick={() => onSelectVolume(volume.id)}>
                  {volume.title}
                </button>
                {volume.family ? (
                  <span className="handbook-toc__reorder">
                    <button type="button" title="Move volume up" disabled={familyIndex <= 0} onClick={() => onMoveFamily(volume.family!.id, -1)}>
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" title="Move volume down" disabled={familyIndex >= familyVolumes.length - 1} onClick={() => onMoveFamily(volume.family!.id, 1)}>
                      <ChevronDown size={14} />
                    </button>
                  </span>
                ) : null}
              </div>
              <div className="handbook-toc__chapters">
                {volume.chapters.map((chapter) => (
                  <button
                    key={chapter.tile.id}
                    type="button"
                    className={selectedTileId === chapter.tile.id ? "handbook-toc__entry handbook-toc__entry--selected" : "handbook-toc__entry"}
                    onClick={() => onSelectTile(volume.id, chapter.tile.id)}
                  >
                    {chapter.tile.title}
                  </button>
                ))}
                {volume.epilogue.map((section) => (
                  <button
                    key={section.tile.id}
                    type="button"
                    className={selectedTileId === section.tile.id ? "handbook-toc__entry handbook-toc__entry--selected handbook-toc__epilogue" : "handbook-toc__entry handbook-toc__epilogue"}
                    onClick={() => onSelectTile(volume.id, section.tile.id)}
                  >
                    {section.tile.title}
                  </button>
                ))}
                {!volume.chapters.length && !volume.epilogue.length ? <span className="handbook-toc__empty">No entries</span> : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
