import type { Atlas } from "../types/atlas";

export async function loadAtlas(): Promise<Atlas> {
  const response = await fetch("/api/atlas");
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function saveAtlas(atlas: Atlas): Promise<Atlas> {
  const response = await fetch("/api/atlas", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(atlas)
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}
