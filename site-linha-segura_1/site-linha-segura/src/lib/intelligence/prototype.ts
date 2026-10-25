import type { DataSource } from "./types.ts";

/**
 * RESULTADOS REAIS do primeiro protótipo (fonte: proposta de projeto-piloto, Canal 8).
 * Não editar com valores simulados. Somente o que foi efetivamente medido.
 */
export const prototypeRun = {
  source: "prototipo-real" as DataSource,
  channel: 8,
  videoSeconds: 32,
  regions: 5,
  detection: "Detecção de pessoas",
  stack: ["Python", "YOLO", "OpenCV"],
  events: [
    { kind: "ocupacao" as const, label: "Ocupação registrada", approxSeconds: 31, region: "Aparelho junto à divisória" },
    { kind: "passagem" as const, label: "Passagem identificada", approxSeconds: null, region: "Região do hack squat" },
  ],
  report: "Relatório gerado automaticamente ao fim da análise",
  caveats: [
    "Amostra curta de um único canal, sem extrapolação.",
    "Não comprova operação contínua nem análise simultânea de vários canais.",
    "Imagens do local não são divulgadas.",
  ],
} as const;
