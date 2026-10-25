/**
 * Modelo de dados da Linha Segura Intelligence.
 *
 * Fluxo conceitual: Camera → Detection → EquipmentZone → OccupancyEvent → Analytics
 *
 * As três origens de dados nunca se misturam:
 *  - "prototipo-real": resultados efetivamente medidos no protótipo (Canal 8).
 *  - "simulacao": dados sintéticos gerados no navegador para demonstração.
 *  - "producao": dados futuros, vindos de um backend seguro (ainda não implementado).
 *
 * Tempo: segundos absolutos de um calendário simulado. O dia `d` começa em `d * 86400`.
 */

export type DataSource = "prototipo-real" | "simulacao" | "producao";

export type EquipmentCategory = "cardio" | "inferiores" | "peito" | "costas";

export interface Camera {
  id: string;
  name: string;
  /** Posição e direção no mapa (coordenadas 0–100 x 0–64) */
  plan: { x: number; y: number; angle: number };
}

export interface EquipmentZone {
  id: string;
  name: string;
  category: EquipmentCategory;
  cameraId: string;
  /** Região de análise no mapa da academia (coordenadas 0–100 x 0–64) */
  plan: { x: number; y: number; w: number; h: number };
  /** Retângulo da região na imagem da câmera (0–1), usado na visualização da câmera */
  view: { x: number; y: number; w: number; h: number };
  /** Peso relativo de procura usado SOMENTE pela simulação */
  popularity: number;
  /** Faixa típica de permanência em segundos, usada SOMENTE pela simulação */
  stay: [number, number];
}

/** Uma detecção pontual de pessoa (conceitual; produzida por um modelo como o YOLO). */
export interface Detection {
  /** Identificador temporário do rastreamento. Não identifica a pessoa e é descartado ao fim do evento. */
  trackId: string;
  cameraId: string;
  equipmentId: string | null;
  t: number;
  confidence: number;
}

/** Permanência contínua de uma pessoa detectada dentro de uma região. */
export interface PresenceSession {
  id: string;
  trackId: string;
  equipmentId: string;
  start: number;
  end: number;
  /** Confiança média das detecções da sessão (0–1) */
  confidence: number;
}

export type EventKind = "ocupacao" | "passagem" | "inconclusivo";

export interface OccupancyEvent {
  id: string;
  equipmentId: string;
  start: number;
  end: number;
  duration: number;
  kind: EventKind;
  confidence: number;
  source: DataSource;
  /** Ainda em andamento no instante consultado */
  inProgress: boolean;
}

/** Estado de uma região em um instante. */
export type ZoneStatus = "livre" | "presenca" | "ocupado" | "encerrado" | "inconclusivo";

export interface DetectionRules {
  /** Permanência mínima (s) para presença virar ocupação estimada */
  confirmSeconds: number;
  /** Confiança mínima para classificar; abaixo disso o evento é inconclusivo */
  minConfidence: number;
  /** Por quanto tempo (s) uma região mostra "evento encerrado" após a saída */
  endedDisplaySeconds: number;
}

export interface TimeRange {
  from: number;
  to: number;
}

export interface EquipmentStats {
  equipmentId: string;
  /** Eventos de ocupação estimada iniciados no período */
  eventos: number;
  passagens: number;
  inconclusivos: number;
  /** Soma das durações de ocupação dentro do período (s) */
  tempoTotal: number;
  /** tempoTotal / eventos (s) */
  duracaoMedia: number;
  /** tempoTotal / tempo do período (0–1) */
  taxa: number;
}

export type RankMetric = "eventos" | "tempoTotal" | "taxa";

export type PeriodKey = "hoje" | "ontem" | "7dias";
export type BandKey = "todo" | "manha" | "tarde" | "noite";
