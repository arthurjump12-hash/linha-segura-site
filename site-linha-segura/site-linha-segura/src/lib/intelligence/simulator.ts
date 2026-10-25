import { createRandom } from "./random.ts";
import type { DetectionRules, EquipmentZone, EventKind, OccupancyEvent, PresenceSession, ZoneStatus } from "./types.ts";

/**
 * MOTOR DE SIMULAÇÃO (dados sintéticos).
 * Gera permanências de pessoas nas regiões dos equipamentos e aplica as mesmas
 * regras de classificação que um sistema real usaria. Nada aqui é dado medido.
 */

export const DAY = 86400;

export const defaultRules: DetectionRules = {
  confirmSeconds: 20,
  minConfidence: 0.6,
  endedDisplaySeconds: 25,
};

export interface SimConfig {
  equipment: EquipmentZone[];
  days: number;
  openHour: number;
  closeHour: number;
  seed: number;
  /** Multiplicador geral de movimento (1 = academia de porte médio) */
  traffic?: number;
}

/** Curva típica de procura ao longo do dia (0–1), com picos no início da manhã e no fim da tarde. */
export function hourDemand(hour: number) {
  const g = (mu: number, sigma: number, amp: number) => amp * Math.exp(-((hour - mu) ** 2) / (2 * sigma ** 2));
  return Math.min(1, 0.12 + g(7, 1.1, 0.75) + g(12.2, 0.9, 0.35) + g(18.7, 1.4, 0.9) + g(10, 1, 0.18));
}

/** Gera as permanências (sessões de presença) de todos os equipamentos em todos os dias. */
export function generateSessions(config: SimConfig): PresenceSession[] {
  const rnd = createRandom(config.seed);
  const traffic = config.traffic ?? 1;
  const sessions: PresenceSession[] = [];
  let n = 0;

  for (let d = 0; d < config.days; d++) {
    // pequena variação por dia (dias mais e menos movimentados)
    const dayFactor = 0.8 + rnd.next() * 0.4;
    for (const eq of config.equipment) {
      let t = d * DAY + config.openHour * 3600 + rnd.range(0, 600);
      const close = d * DAY + config.closeHour * 3600;
      while (t < close) {
        const hour = (t % DAY) / 3600;
        const demand = Math.max(0.03, hourDemand(hour) * eq.popularity * dayFactor * traffic);
        // intervalo livre: quanto maior a procura, menor a espera
        t += rnd.exp(300 / demand) + 15;
        if (t >= close) break;

        const r = rnd.next();
        let duration: number;
        let confidence: number;
        if (r < 0.2) {
          // pessoa passando pela região
          duration = rnd.range(3, 14);
          confidence = rnd.range(0.62, 0.95);
        } else if (r < 0.27) {
          // detecção difícil (oclusão, ângulo, iluminação)
          duration = rnd.range(25, 240);
          confidence = rnd.range(0.32, 0.58);
        } else {
          duration = rnd.range(eq.stay[0], eq.stay[1]);
          confidence = rnd.range(0.66, 0.97);
        }
        const end = Math.min(t + duration, close);
        sessions.push({
          id: `s${++n}`,
          trackId: `T-${rnd.hex(4)}`,
          equipmentId: eq.id,
          start: Math.round(t),
          end: Math.round(end),
          confidence: Math.round(confidence * 100) / 100,
        });
        t = end;
      }
    }
  }
  return sessions.sort((a, b) => a.start - b.start);
}

/** Classificação de uma permanência já encerrada (ou até `now`, se em andamento). */
export function classify(duration: number, confidence: number, rules: DetectionRules): EventKind {
  if (duration < rules.confirmSeconds) return "passagem";
  if (confidence < rules.minConfidence) return "inconclusivo";
  return "ocupacao";
}

/**
 * Converte permanências em eventos, considerando apenas o que já aconteceu até `now`.
 * Permanências em andamento ainda abaixo do tempo de confirmação não viram evento.
 */
export function sessionsToEvents(sessions: PresenceSession[], rules: DetectionRules, now = Infinity): OccupancyEvent[] {
  const events: OccupancyEvent[] = [];
  for (const s of sessions) {
    if (s.start > now) continue;
    const inProgress = s.end > now;
    const end = inProgress ? now : s.end;
    const duration = end - s.start;
    if (inProgress && duration < rules.confirmSeconds) continue;
    events.push({
      id: s.id,
      equipmentId: s.equipmentId,
      start: s.start,
      end,
      duration,
      kind: classify(duration, s.confidence, rules),
      confidence: s.confidence,
      source: "simulacao",
      inProgress,
    });
  }
  return events;
}

export interface ZoneState {
  status: ZoneStatus;
  session: PresenceSession | null;
  /** Segundos desde o início da permanência atual (ou desde o fim, para "encerrado") */
  elapsed: number;
}

/** Estado de uma região no instante `now`. */
export function zoneStateAt(sessions: PresenceSession[], equipmentId: string, now: number, rules: DetectionRules): ZoneState {
  let last: PresenceSession | null = null;
  for (const s of sessions) {
    if (s.equipmentId !== equipmentId || s.start > now) continue;
    if (s.end > now) {
      const elapsed = now - s.start;
      if (elapsed < rules.confirmSeconds) return { status: "presenca", session: s, elapsed };
      if (s.confidence < rules.minConfidence) return { status: "inconclusivo", session: s, elapsed };
      return { status: "ocupado", session: s, elapsed };
    }
    if (!last || s.end > last.end) last = s;
  }
  if (last && now - last.end <= rules.endedDisplaySeconds) {
    const kind = classify(last.end - last.start, last.confidence, rules);
    if (kind === "ocupacao") return { status: "encerrado", session: last, elapsed: now - last.end };
  }
  return { status: "livre", session: null, elapsed: 0 };
}

/** Índice por equipamento para consultas rápidas de estado. */
export function indexByEquipment(sessions: PresenceSession[]) {
  const map = new Map<string, PresenceSession[]>();
  for (const s of sessions) {
    const list = map.get(s.equipmentId);
    if (list) list.push(s);
    else map.set(s.equipmentId, [s]);
  }
  return map;
}
