import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const PAGE = "/inteligencia-artificial/academias";

/** Pausa a simulação (se estiver rodando) para os números não mudarem durante o teste. */
async function pauseIfRunning(page: import("@playwright/test").Page) {
  const pause = page.getByRole("button", { name: "Pausar simulação", exact: true });
  if (await pause.count()) await pause.first().click();
}

test.describe("navegação móvel", () => {
  test("abre o menu, navega e fecha com Esc devolvendo o foco", async ({ page, isMobile }) => {
    test.skip(!isMobile, "apenas celular");
    await page.goto("/");
    const open = page.getByRole("button", { name: "Abrir menu" });
    await open.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "IA para academias" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
    await open.click();
    await dialog.getByRole("link", { name: "IA para academias" }).click();
    await expect(page).toHaveURL(new RegExp(`${PAGE}$`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Suas câmeras podem revelar");
  });

  test("não há rolagem horizontal nas páginas principais", async ({ page }) => {
    for (const path of ["/", PAGE, "/solucoes/cameras", "/contato"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("simulação e academia digital", () => {
  test("controles: pausar, reiniciar e velocidade por teclado", async ({ page }) => {
    await page.goto(`${PAGE}#academia-digital`);
    const controls = page.getByRole("group", { name: "Controles da simulação" });
    await expect(controls).toBeVisible();
    // começa sozinha ao entrar na tela
    await expect(controls.getByRole("button", { name: "Pausar simulação", exact: true })).toBeVisible();
    await controls.getByRole("button", { name: "Pausar simulação", exact: true }).click();
    await expect(controls.getByRole("button", { name: "Iniciar simulação", exact: true })).toBeVisible();
    await controls.getByRole("button", { name: "Reiniciar simulação", exact: true }).last().click();
    await controls.getByRole("button", { name: "Pausar simulação", exact: true }).click();
    await expect(controls).toContainText("17:45:");
    const speed = controls.getByRole("radio", { name: /60×/ });
    await speed.focus();
    await page.keyboard.press("ArrowRight");
    await expect(controls.getByRole("radio", { name: /300×/ })).toBeChecked();
  });

  test("selecionar equipamento abre o painel e Esc fecha", async ({ page, isMobile }) => {
    await page.goto(`${PAGE}#academia-digital`);
    const trigger = isMobile
      ? page.getByRole("list", { name: "Equipamentos e estado atual" }).getByRole("button").filter({ hasText: "Leg press" })
      : page.locator("#academia-digital").getByRole("button", { name: /^Leg press:/ });
    if (isMobile) await trigger.click();
    else {
      await trigger.focus();
      await page.keyboard.press("Enter");
    }
    const dialog = page.getByRole("dialog", { name: "Leg press" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Histórico de eventos");
    await expect(dialog).toContainText("Simulação demonstrativa");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

test.describe("dashboard, filtros e ranking", () => {
  test("faixa da noite ainda vazia às 17:45 mostra estado vazio", async ({ page }) => {
    await page.goto(`${PAGE}#dashboard`);
    await pauseIfRunning(page);
    await page.locator("#dash-faixa").selectOption("noite");
    await expect(page.getByText("Sem eventos para estes filtros ainda.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Exportar CSV \(0\)/ })).toBeDisabled();
  });

  test("exporta CSV somente com os eventos exibidos", async ({ page, isMobile }) => {
    test.skip(isMobile, "download testado no desktop");
    await page.goto(`${PAGE}#dashboard`);
    await pauseIfRunning(page);
    await page.locator("#dash-faixa").selectOption("manha");
    const btn = page.getByRole("button", { name: /Exportar CSV/ });
    const count = Number((await btn.innerText()).match(/\((\d+)\)/)![1]);
    expect(count).toBeGreaterThan(0);
    const [download] = await Promise.all([page.waitForEvent("download"), btn.click()]);
    const csv = readFileSync((await download.path())!, "utf8").replace(/^﻿/, "");
    const lines = csv.trim().split(/\r\n/);
    expect(lines[0]).toContain("fonte;dia_simulado;equipamento");
    expect(lines.length - 1).toBe(count);
    expect(lines.slice(1).every((l) => l.startsWith("Simulação demonstrativa;"))).toBe(true);
  });

  test("ranking muda com a métrica e explica a diferença", async ({ page }) => {
    await page.goto(`${PAGE}#ranking`);
    const section = page.locator("#ranking");
    const group = section.getByRole("radiogroup", { name: "Métrica do ranking" });
    await group.getByRole("radio", { name: /Tempo acumulado/ }).click();
    await expect(group.getByRole("radio", { name: /Tempo acumulado/ })).toHaveAttribute("aria-checked", "true");
    await expect(section.getByRole("heading", { name: "Tempo acumulado" })).toBeVisible();
    await section.getByRole("button", { name: "Ver tabela" }).click();
    await expect(section.getByRole("table")).toContainText("Taxa");
  });
});

test.describe("dados reais x simulados", () => {
  test("protótipo real e visão futura são claramente separados", async ({ page }) => {
    await page.goto(`${PAGE}#prototipo`);
    const sec = page.locator("#prototipo");
    await expect(sec.getByText("Dados reais do protótipo")).toBeVisible();
    await expect(sec).toContainText("Canal 8");
    await expect(sec).toContainText("≈ 31 s");
    await sec.getByRole("tab", { name: /Visão futura/ }).click();
    await expect(sec.getByText("Visão futura · dados simulados")).toBeVisible();
    await expect(sec.getByText("Dados reais do protótipo")).toHaveCount(0);
  });
});

test.describe("acessibilidade (axe-core)", () => {
  for (const path of ["/", PAGE, "/contato"]) {
    test(`sem violações sérias ou críticas em ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.length} · ${v.nodes[0]?.target}`)).toEqual([]);
    });
  }
});
