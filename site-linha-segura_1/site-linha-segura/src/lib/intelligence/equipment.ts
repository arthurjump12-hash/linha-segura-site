import type { Camera, EquipmentCategory, EquipmentZone } from "./types.ts";

/** Academia de demonstração (fictícia). Usada pela simulação e pelo mapa interativo. */

export const demoCameras: Camera[] = [
  { id: "cam-01", name: "CAM 01 · Cardio", plan: { x: 2, y: 2, angle: 35 } },
  { id: "cam-02", name: "CAM 02 · Peito e costas", plan: { x: 98, y: 2, angle: 145 } },
  { id: "cam-03", name: "CAM 03 · Membros inferiores", plan: { x: 98, y: 62, angle: 215 } },
];

export const demoEquipment: EquipmentZone[] = [
  { id: "esteira", name: "Esteira", category: "cardio", cameraId: "cam-01", plan: { x: 5, y: 6, w: 17, h: 13 }, view: { x: 0.1, y: 0.42, w: 0.36, h: 0.36 }, popularity: 1.25, stay: [600, 1800] },
  { id: "bicicleta", name: "Bicicleta", category: "cardio", cameraId: "cam-01", plan: { x: 25, y: 6, w: 14, h: 13 }, view: { x: 0.56, y: 0.45, w: 0.32, h: 0.33 }, popularity: 0.75, stay: [480, 1500] },
  { id: "supino", name: "Supino", category: "peito", cameraId: "cam-02", plan: { x: 43, y: 6, w: 16, h: 13 }, view: { x: 0.05, y: 0.58, w: 0.28, h: 0.28 }, popularity: 1.2, stay: [240, 720] },
  { id: "crossover", name: "Crossover", category: "peito", cameraId: "cam-02", plan: { x: 62, y: 6, w: 17, h: 13 }, view: { x: 0.38, y: 0.36, w: 0.24, h: 0.2 }, popularity: 0.95, stay: [180, 600] },
  { id: "puxada", name: "Puxada alta", category: "costas", cameraId: "cam-02", plan: { x: 82, y: 6, w: 13, h: 13 }, view: { x: 0.72, y: 0.34, w: 0.22, h: 0.2 }, popularity: 0.9, stay: [180, 540] },
  { id: "remada", name: "Remada", category: "costas", cameraId: "cam-02", plan: { x: 5, y: 27, w: 16, h: 12 }, view: { x: 0.6, y: 0.68, w: 0.32, h: 0.24 }, popularity: 0.7, stay: [180, 540] },
  { id: "extensora", name: "Cadeira extensora", category: "inferiores", cameraId: "cam-03", plan: { x: 62, y: 27, w: 15, h: 12 }, view: { x: 0.04, y: 0.4, w: 0.28, h: 0.2 }, popularity: 0.85, stay: [150, 480] },
  { id: "flexora", name: "Cadeira flexora", category: "inferiores", cameraId: "cam-03", plan: { x: 80, y: 27, w: 15, h: 12 }, view: { x: 0.42, y: 0.36, w: 0.24, h: 0.18 }, popularity: 0.6, stay: [150, 480] },
  { id: "leg-press", name: "Leg press", category: "inferiores", cameraId: "cam-03", plan: { x: 58, y: 46, w: 19, h: 13 }, view: { x: 0.06, y: 0.7, w: 0.4, h: 0.22 }, popularity: 1.1, stay: [240, 720] },
  { id: "hack", name: "Hack squat", category: "inferiores", cameraId: "cam-03", plan: { x: 80, y: 46, w: 15, h: 13 }, view: { x: 0.6, y: 0.64, w: 0.32, h: 0.26 }, popularity: 0.65, stay: [240, 660] },
];

export const categoryLabel: Record<EquipmentCategory, string> = {
  cardio: "Cardio",
  inferiores: "Membros inferiores",
  peito: "Peito",
  costas: "Costas",
};

export const categoryOrder: EquipmentCategory[] = ["cardio", "inferiores", "peito", "costas"];

export function equipmentById(list: EquipmentZone[], id: string) {
  return list.find((e) => e.id === id);
}

/** Nome curto para espaços pequenos (mapa e câmera) */
export function shortName(name: string) {
  const n = name.replace(/^Cadeira /, "");
  return n.charAt(0).toUpperCase() + n.slice(1);
}
