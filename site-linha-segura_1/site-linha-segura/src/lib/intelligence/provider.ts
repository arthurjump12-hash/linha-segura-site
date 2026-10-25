import { generateSessions, sessionsToEvents, type SimConfig } from "./simulator.ts";
import type { DetectionRules, OccupancyEvent, PresenceSession, TimeRange } from "./types.ts";

/**
 * Ponto único de troca entre dados simulados e dados de produção.
 *
 * Hoje o site usa `createSimulatedProvider`. No futuro, um backend seguro
 * (com acesso autorizado às câmeras, fora do navegador) poderá implementar
 * `IntelligenceProvider` e expor apenas eventos agregados por HTTPS.
 *
 * Regras para a integração real:
 *  - Nunca conectar o navegador diretamente ao DVR/NVR.
 *  - Nunca expor RTSP, IPs internos, usuários, senhas ou tokens no front-end.
 *  - Enviar ao site apenas eventos e indicadores, sem imagens de pessoas.
 */
export interface IntelligenceProvider {
  readonly source: "simulacao" | "producao";
  getSessions(range: TimeRange): Promise<PresenceSession[]>;
  getEvents(range: TimeRange, rules: DetectionRules): Promise<OccupancyEvent[]>;
}

export function createSimulatedProvider(config: SimConfig): IntelligenceProvider {
  const sessions = generateSessions(config);
  return {
    source: "simulacao",
    async getSessions(range) {
      return sessions.filter((s) => s.start < range.to && s.end > range.from);
    },
    async getEvents(range, rules) {
      return sessionsToEvents(sessions, rules, range.to).filter((e) => e.start >= range.from);
    },
  };
}

/** Exemplo de implementação futura. Requer um endpoint de backend autenticado. */
export function createProductionProvider(baseUrl: string, getToken: () => Promise<string>): IntelligenceProvider {
  const get = async <T,>(path: string): Promise<T> => {
    const res = await fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${await getToken()}` } });
    if (!res.ok) throw new Error(`Falha ao consultar ${path}: ${res.status}`);
    return res.json() as Promise<T>;
  };
  return {
    source: "producao",
    getSessions: (r) => get<PresenceSession[]>(`/sessions?from=${r.from}&to=${r.to}`),
    getEvents: (r) => get<OccupancyEvent[]>(`/events?from=${r.from}&to=${r.to}`),
  };
}
