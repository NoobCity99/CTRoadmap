// STAR TUNING — deterministic density, dot sizes and seed. Generated once when
// this module loads, never on viewport updates. Speeds live in the CSS file.
export const STAR_MAP_SIZE = 2048;
const STAR_GROUPS = [
  { name: "small", count: 640, radius: 0.65, seed: 1701 },
  { name: "medium", count: 180, radius: 1.1, seed: 2903 },
  { name: "large", count: 48, radius: 1.7, seed: 4109 }
] as const;

function starMap(count: number, radius: number, seed: number): string {
  let state = seed;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const stars = Array.from({ length: count }, () => {
    const x = Math.round(2 + random() * (STAR_MAP_SIZE - 4));
    const y = Math.round(2 + random() * (STAR_MAP_SIZE - 4));
    return `<circle cx="${x}" cy="${y}" r="${radius}" opacity="${(0.35 + random() * 0.6).toFixed(2)}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${STAR_MAP_SIZE}" height="${STAR_MAP_SIZE}"><g fill="#dcecff">${stars}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const STAR_MAP_VARIABLES = Object.fromEntries(STAR_GROUPS.map(({ name, count, radius, seed }) => [
  `--zoom-stars-${name}`, starMap(count, radius, seed)
]));
