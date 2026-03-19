/**
 * M-EDL - États des Lieux Numériques
 * Constantes et Types
 */

export const EDL_ROOMS = [
  { id: "ENTRANCE", label: "Entrée Principale" },
  { id: "LIVING_ROOM", label: "Salon / Séjour" },
  { id: "KITCHEN", label: "Cuisine" },
  { id: "BATHROOM", label: "Sanitaires / Salles d'eau" },
  { id: "BEDROOM", label: "Chambres" },
  { id: "EXTERIOR", label: "Extérieur / Balcons" },
] as const;

export const EDL_STATES = [
  { id: "EXCELLENT", label: "Excellent", color: "bg-green-500" },
  { id: "GOOD", label: "Bon", color: "bg-blue-500" },
  { id: "AVERAGE", label: "Moyen", color: "bg-yellow-500" },
  { id: "BAD", label: "Mauvais", color: "bg-orange-500" },
  { id: "RENOVATE", label: "À rénover", color: "bg-red-500" },
] as const;

export interface EdlPiece {
  room: string;
  state: string;
  comment: string;
  photos: string[];
}

export interface EdlMeter {
  type: "WATER" | "ELECTRICITY" | "GAS";
  reading: string;
  photoUrl?: string;
}

export interface EdlEquipment {
  name: string;
  state: string;
}
