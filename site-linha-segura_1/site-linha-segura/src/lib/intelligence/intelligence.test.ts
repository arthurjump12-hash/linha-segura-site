import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  aggregateByEquipment,
  buildRanges,
  eventsInRanges,
  eventsToCSV,
  occupancyByHour,
  previousRanges,
  rankEquipment,
  summarize,
  totalSeconds,
} from "./analytics.ts";
import { demoEquipment } from "./equipment.ts";
import { prototypeRun } from "./prototype.ts";
import { DAY, classify, defaultRules, generateSessions, sessionsToEvents, zoneStateAt } from "./simulator.ts";
import type { EquipmentZone, OccupancyEvent, PresenceSession } from "./types.ts";

const eq: EquipmentZone[] = [
  { id: "a", name: "Aparelho A", category: "inferiores", cameraId: "c", plan: { x: 0, y: 0, w: 1, h: 1 }, view: { x: 0, y: 0, w: 1, h: 1 }, popularity: 1, stay: [60, 60] },
  { id: "b", name: "Aparelho B", category: "peito", cameraId: "c", plan: { x: 0, y: 0, w: 1, h: 1 }, view: { x: 0, y: 0, w: 1, h: 1 }, popularity: 1, stay: [60, 60] },
];
const t0 = DAY + 10 * 3600; // dia 1, 10:00
const s = (id: string, equipmentId: string, start: number, dur: number, confidence = 0.9): PresenceSession => ({
  id,
  trackId: "T-0000",
  equipmentId,
  start,
  end: start + dur,
  confidence,
});

describe("classificação e duração de eventos", () => {
  test("duração = fim − início; curta vira passagem; baixa confiança vira inconclusivo", () => {
    const ev = sessionsToEvents([s("1", "a", t0, 300), s("2", "a", t0 + 400, 8), s("3", "b", t0, 200, 0.4)], defaultRules);
    assert.equal(ev.find((e) => e.id === "1")!.duration, 300);
    assert.equal(ev.find((e) => e.id === "1")!.kind, "ocupacao");
    assert.equal(ev.find((e) => e.id === "2")!.kind, "passagem");
    assert.equal(ev.find((e) => e.id === "3")!.kind, "inconclusivo");
    assert.equal(classify(defaultRules.confirmSeconds, 0.9, defaultRules), "ocupacao");
  });

  test("evento em andamento é cortado no instante atual e só conta após a confirmação", () => {
    const sessions = [s("1", "a", t0, 600)];
    assert.equal(sessionsToEvents(sessions, defaultRules, t0 + 10).length, 0);
    const [e] = sessionsToEvents(sessions, defaultRules, t0 + 120);
    assert.equal(e.duration, 120);
    assert.equal(e.inProgress, true);
  });

  test("estados da região: presença → ocupado → encerrado → livre", () => {
    const sessions = [s("1", "a", t0, 100)];
    assert.equal(zoneStateAt(sessions, "a", t0 + 5, defaultRules).status, "presenca");
    assert.equal(zoneStateAt(sessions, "a", t0 + 50, defaultRules).status, "ocupado");
    assert.equal(zoneStateAt(sessions, "a", t0 + 110, defaultRules).status, "encerrado");
    assert.equal(zoneStateAt(sessions, "a", t0 + 500, defaultRules).status, "livre");
    assert.equal(zoneStateAt([s("2", "a", t0, 100, 0.3)], "a", t0 + 50, defaultRules).status, "inconclusivo");
  });
});

describe("agregação e ranking", () => {
  const events: OccupancyEvent[] = sessionsToEvents(
    [s("1", "a", t0, 600), s("2", "a", t0 + 1000, 600), s("3", "b", t0, 1800), s("4", "b", t0 + 2000, 5)],
    defaultRules,
  );
  const ranges = [{ from: t0, to: t0 + 3600 }];

  test("soma eventos, tempo, média e taxa por equipamento", () => {
    const stats = aggregateByEquipment(events, eq, ranges);
    const a = stats.find((x) => x.equipmentId === "a")!;
    const b = stats.find((x) => x.equipmentId === "b")!;
    assert.equal(a.eventos, 2);
    assert.equal(a.tempoTotal, 1200);
    assert.equal(a.duracaoMedia, 600);
    assert.equal(a.taxa, 1200 / 3600);
    assert.equal(b.eventos, 1);
    assert.equal(b.passagens, 1);
    assert.equal(b.tempoTotal, 1800);
  });

  test("ranking muda conforme a métrica: eventos ≠ tempo acumulado", () => {
    const stats = aggregateByEquipment(events, eq, ranges);
    assert.equal(rankEquipment(stats, "eventos")[0].equipmentId, "a");
    assert.equal(rankEquipment(stats, "tempoTotal")[0].equipmentId, "b");
    assert.equal(rankEquipment(stats, "taxa")[0].equipmentId, "b");
    const sum = summarize(stats);
    assert.equal(sum.eventos, 3);
    assert.equal(sum.maisUtilizado!.equipmentId, "b");
    assert.equal(sum.menosUtilizado!.equipmentId, "a");
  });

  test("ocupação por hora distribui eventos que atravessam a virada da hora", () => {
    const ev = sessionsToEvents([s("1", "a", t0 + 3000, 1200)], defaultRules);
    const rows = occupancyByHour(ev, [{ from: t0, to: t0 + 7200 }], ["a"], 6, 22);
    assert.equal(rows.find((r) => r.hour === 10)!.occupied, 600);
    assert.equal(rows.find((r) => r.hour === 11)!.occupied, 600);
  });
});

describe("filtros de período", () => {
  const now = 3 * DAY + 15 * 3600; // dia 3, 15:00

  test("hoje termina no instante atual; nunca inclui o futuro", () => {
    const [r] = buildRanges("hoje", "todo", now, 6, 22);
    assert.equal(r.from, 3 * DAY + 6 * 3600);
    assert.equal(r.to, now);
  });

  test("faixa da noite ainda não começou hoje às 15h", () => {
    assert.equal(buildRanges("hoje", "noite", now, 6, 22).length, 0);
  });

  test("7 dias ignora dias anteriores ao início da simulação", () => {
    const ranges = buildRanges("7dias", "manha", now, 6, 22);
    assert.equal(ranges.length, 4);
    assert.equal(totalSeconds(ranges), 4 * 6 * 3600);
  });

  test("período anterior é deslocado em um dia", () => {
    const prev = previousRanges(buildRanges("hoje", "todo", now, 6, 22), "hoje");
    assert.equal(prev[0].from, 2 * DAY + 6 * 3600);
  });

  test("eventos fora do período são excluídos e duração é cortada no limite", () => {
    const ev = sessionsToEvents([s("1", "a", t0 - 100, 300), s("2", "a", t0 + 3500, 600)], defaultRules);
    const inR = eventsInRanges(ev, [{ from: t0, to: t0 + 3600 }]);
    assert.equal(inR.length, 1);
    assert.equal(inR[0].duration, 100);
  });
});

describe("simulação determinística e reinício", () => {
  const cfg = { equipment: demoEquipment, days: 3, openHour: 6, closeHour: 22, seed: 42 };

  test("mesma semente gera os mesmos dados (reiniciar reproduz a simulação)", () => {
    assert.deepEqual(generateSessions(cfg), generateSessions(cfg));
  });

  test("sessões ficam dentro do horário e não se sobrepõem no mesmo equipamento", () => {
    const sessions = generateSessions(cfg);
    assert.ok(sessions.length > 100);
    for (const e of demoEquipment) {
      const list = sessions.filter((x) => x.equipmentId === e.id).sort((a, b) => a.start - b.start);
      for (let i = 0; i < list.length; i++) {
        const h = (list[i].start % DAY) / 3600;
        assert.ok(h >= 6 && h < 22);
        if (i) assert.ok(list[i].start >= list[i - 1].end);
      }
    }
  });
});

describe("exportação CSV", () => {
  test("exporta exatamente os eventos recebidos, com cabeçalho e fonte identificada", () => {
    const ev = sessionsToEvents([s("1", "a", t0, 300), s("2", "b", t0, 8)], defaultRules);
    const csv = eventsToCSV(ev, eq, t0 + 1000);
    const lines = csv.replace("﻿", "").split("\r\n");
    assert.equal(lines.length, 3);
    assert.match(lines[0], /^fonte;dia_simulado;equipamento;inicio;fim;duracao_s;classificacao/);
    assert.match(lines[1], /^Simulação demonstrativa;Hoje;Aparelho A;10:00:00;10:05:00;300;Ocupação estimada;0,90;não$/);
    assert.match(lines[2], /Passagem/);
  });
});

describe("dados reais do protótipo", () => {
  test("permanecem separados e fiéis ao teste do Canal 8", () => {
    assert.equal(prototypeRun.source, "prototipo-real");
    assert.equal(prototypeRun.videoSeconds, 32);
    assert.equal(prototypeRun.regions, 5);
    assert.equal(prototypeRun.events[0].approxSeconds, 31);
  });
});
