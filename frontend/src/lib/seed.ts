import seedAtlas from "./seed_atlas.json";
import type { Atlas } from "../types/atlas";

export function createSeedAtlas(): Atlas {
  return JSON.parse(JSON.stringify(seedAtlas)) as Atlas;
}
