import { describe, expect, it } from "vitest";
import { LUCIDE_ICON_OPTIONS, lucideNameToIconRef, normalizeTileIconRef, uploadedResultToIconRef } from "./icons";
import type { Tile } from "../types/atlas";

const tile = (icon_ref: unknown): Tile => ({ id: "node", title: "Node", position: { x: 0, y: 0 }, type: "node", fields: { icon_ref } });

describe("public tile icon references", () => {
  it("retains the full reference Lucide library and serializes every selection", () => {
    expect(LUCIDE_ICON_OPTIONS).toHaveLength(46);
    for (const option of LUCIDE_ICON_OPTIONS) {
      expect(lucideNameToIconRef(option.name)).toEqual({ kind: "lucide", id: `lucide:${option.name}`, name: option.name });
      expect(normalizeTileIconRef(tile({ kind: "lucide", id: option.id }))).toEqual(lucideNameToIconRef(option.name));
    }
  });

  it.each([null, [], "lucide:Cpu", {}, { kind: "lucide", name: "missing" }, { kind: "lucide", name: "__proto__" }, { kind: "uploaded", filename: "missing.png" }])("falls back for malformed references %j", (ref) => {
    expect(normalizeTileIconRef(tile(ref))).toBeNull();
  });

  it("converts the API response into the exact uploaded Atlas reference", () => {
    const response = { id: "uuid", filename: "uuid.png", url: "/api/assets/icons/uuid.png", media_type: "image/png" };
    const ref = { ...response, kind: "uploaded", id: "uploaded:uuid.png" };
    expect(uploadedResultToIconRef(response)).toEqual(ref);
    expect(normalizeTileIconRef(tile(response))).toBeNull();
    expect(normalizeTileIconRef(tile(ref))).toEqual(ref);
  });
});
