# Site Linha Segura

Site institucional da **Linha Segura · Segurança e Tecnologia**.
Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Framer Motion e Lucide.

## Iniciar o projeto

Requisitos: Node.js 20 ou superior.

```bash
npm install
npm run dev        # http://localhost:3000
```

Outros comandos:

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # testes do motor de dados (executor nativo do Node, sem dependências)
npm run build      # build de produção
npm start          # servir o build
npm run test:e2e   # testes de interface e acessibilidade (Playwright + axe-core)
```

Antes do primeiro `test:e2e`, instale o navegador de testes: `npx playwright install chromium`. Os testes de interface usam o build, então rode `npm run build` antes.

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Página inicial completa |
| `/sobre` | Empresa, princípios, processo e diferenciais |
| `/solucoes` | Todas as soluções e segmentos |
| `/solucoes/cameras` · `/alarmes` · `/controle-de-acesso` · `/redes` · `/automacao` | Páginas de cada solução |
| `/inteligencia-artificial` | IA e visão computacional |
| `/inteligencia-artificial/academias` | **Linha Segura Intelligence para academias** (experiência interativa principal) |
| `/projetos` | Protótipo de visão computacional |
| `/contato` | Formulário (aceita `?solucao=cameras`, por exemplo) |
| `/privacidade` | Política de privacidade (LGPD) |

## Linha Segura Intelligence (`/inteligencia-artificial/academias`)

Experiência comercial interativa, organizada em 12 blocos: hero com visão computacional simulada, academia digital clicável, detecções sem identificação, dashboard, ranking, mapa de calor, protótipo real × visão futura, simulador de cenários, como funciona, comparação, projeto-piloto, LGPD, FAQ e formulário de avaliação.

### Três origens de dados, nunca misturadas

| Origem | Onde fica | Onde aparece |
|---|---|---|
| **Dados reais do protótipo** (Canal 8) | `src/lib/intelligence/prototype.ts` | Somente no "Modo A · Protótipo real", com selo verde |
| **Dados sintéticos** (simulação) | `src/lib/intelligence/simulator.ts` | Academia digital, dashboard, ranking, mapa de calor, simulador e "Modo B", sempre com selo amarelo "Simulação" |
| **Dados de produção** (futuro) | `src/lib/intelligence/provider.ts` | Ainda não implementado. Requer backend seguro |

### Arquitetura

```
Camera → Detection → EquipmentZone → PresenceSession → OccupancyEvent → Analytics
```

- `types.ts`: tipos de todo o fluxo, com a origem do dado em cada evento.
- `equipment.ts`: academia fictícia (10 equipamentos, 3 câmeras).
- `simulator.ts`: gera permanências com semente fixa (mesma semente = mesmos dados) e classifica cada uma:
  - abaixo do **tempo mínimo** → passagem;
  - **confiança** abaixo do limite → inconclusivo;
  - caso contrário → ocupação estimada.
- `analytics.ts`: períodos, agregações, ranking, ocupação por hora, mapa de calor, categorias e CSV. São funções puras, sem React.
- `components/intelligence/`: interface. `SimulationProvider` é o único lugar que conecta a interface ao motor.

Estados da região: **livre**, **presença detectada**, **ocupação estimada**, **evento encerrado** e **detecção inconclusiva**. Cada um tem cor, ícone e texto.

### Como trocar a simulação por dados reais

1. Crie um **serviço backend** com acesso autorizado às câmeras (em uma VPS ou servidor local). Nunca conecte o navegador ao DVR/NVR.
2. Nesse serviço, rode a detecção (Python, YOLO, OpenCV) e grave **apenas eventos** (`OccupancyEvent`), sem imagens de pessoas.
3. Exponha uma API autenticada (`/events?from=&to=`), seguindo `createProductionProvider` em `provider.ts`.
4. No `SimulationProvider`, substitua `generateSessions(...)` pelos dados do provider de produção e marque a origem como `"producao"`.
5. **Não exponha** RTSP, IPs internos, usuários, senhas ou tokens no front-end. Credenciais ficam só no backend.

### Testes

- `npm test`: 15 testes do motor (duração de eventos, classificação, estados, agregação por equipamento, ranking, filtros de período, reinício determinístico, CSV e separação dos dados reais).
- `npm run test:e2e`: navegação móvel, controles por teclado, painel do equipamento, filtros com estado vazio, exportação de CSV conferida linha a linha, separação real × simulado e varredura de acessibilidade com axe-core (WCAG 2.2 AA) em desktop e celular.

Pesquisa e decisões de UX: `docs/UX-RESEARCH.md`.

## Recursos de experiência (UX)

- **Diagnóstico rápido "Monte sua solução"** (home e `/solucoes`): 3 passos (ambiente, objetivos, situação) que recomendam soluções e enviam o resumo para o WhatsApp ou para o formulário, já preenchido. Edite as opções em `src/content/finder.ts`.
- **Perguntas frequentes** em acordeão acessível, com Schema.org `FAQPage`. Edite em `src/content/faq.ts`.
- **Atalho de contato fixo**: barra inferior no celular e botão flutuante no desktop. Aparecem após a abertura e somem quando o formulário ou o rodapé estão na tela.
- **Formulário**: rascunho salvo automaticamente no navegador do visitante (com opção "Começar do zero"), contador de caracteres e validação por campo.

## Onde editar

| O quê | Arquivo |
|---|---|
| WhatsApp, e-mail, logo, vídeo, mensagens prontas | `src/config/site.ts` |
| Textos das soluções | `src/content/solutions.ts` |
| Processo, segmentos, diferenciais, IA e resultados do protótipo | `src/content/home.ts` |
| Cores, fontes e efeitos | `src/app/globals.css` |
| Seções da página inicial | `src/components/sections.tsx` |

## Logo oficial

A logo enviada está aplicada. Arquivos em `public/images/`:

| Arquivo | Uso |
|---|---|
| `logo-original.png` | Arquivo original enviado, intacto |
| `logo-linha-segura.png` | Logo completa (símbolo, nome e assinatura), fundo transparente: rodapé e imagem de compartilhamento |
| `logo-simbolo.png` + `logo-nome.png` | Símbolo e nome, lado a lado no cabeçalho e no menu |
| `src/app/icon.png`, `src/app/apple-icon.png` | Ícone da aba do navegador e do iPhone |

As versões transparentes são recortes do original: o fundo escuro foi removido sem redesenhar símbolo, tipografia ou proporções. Para trocar a logo, substitua os arquivos mantendo os nomes, ou ajuste os caminhos em `siteConfig.logo`. Para usar sempre a versão completa no cabeçalho, troque `<Logo />` por `<Logo variant="completa" />` em `src/components/Header.tsx`.

## Adicionar o vídeo demonstrativo

1. Exporte o vídeo em MP4 (H.264), com até ~15 MB, de preferência sem áudio.
2. Use somente imagens **autorizadas** e sem pessoas ou marcas identificáveis (aplique desfoque se necessário).
3. Coloque o arquivo em `public/videos/`, por exemplo `public/videos/prova-de-conceito.mp4`, e uma imagem de capa em `public/images/`.
4. Em `src/config/site.ts`:
   ```ts
   demoVideo: { src: "/videos/prova-de-conceito.mp4", poster: "/images/capa-video.jpg" },
   ```
5. Sem vídeo, o site exibe uma simulação animada, identificada como **ilustrativa**.

## Configurar WhatsApp e e-mail

- **WhatsApp:** em `src/config/site.ts`, `contact.whatsapp` recebe só números com 55 + DDD (ex.: `5527997777033`), e `contact.whatsappDisplay` é o texto exibido. **Confirme o DDD antes de publicar.** As mensagens pré-preenchidas ficam em `intentMessages`.
- **E-mail exibido no site:** preencha `contact.email`.
- **Envio do formulário por e-mail:** o formulário envia pela API da [Resend](https://resend.com).
  1. Crie a conta, verifique o domínio e gere uma chave de API.
  2. Copie `.env.example` para `.env.local` (ou configure na Vercel) e preencha:
     ```
     RESEND_API_KEY=...
     CONTACT_TO_EMAIL=seu-email@dominio.com.br
     CONTACT_FROM_EMAIL=Site Linha Segura <contato@seudominio.com.br>
     ```
  3. **Sem essas variáveis, nenhum envio é simulado:** o site avisa que a mensagem não foi enviada e oferece enviar o mesmo conteúdo pelo WhatsApp, já preenchido.

## Publicar na Vercel

1. Crie um repositório no GitHub e envie esta pasta (sem `node_modules` e `.next`).
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório. A Vercel detecta o Next.js automaticamente.
3. Em **Settings → Environment Variables**, adicione `NEXT_PUBLIC_SITE_URL` (o domínio final) e, se for usar o e-mail, as variáveis da Resend.
4. Clique em **Deploy**. Para usar um domínio próprio, vá em **Settings → Domains**.

Alternativa sem GitHub: `npx vercel` na pasta do projeto (pede login na Vercel).

## Integrações que dependem de credenciais

| Integração | Situação | O que falta |
|---|---|---|
| Envio do formulário por e-mail | Implementado | Chave da Resend e e-mail de destino |
| Domínio / URL canônica | Implementado | `NEXT_PUBLIC_SITE_URL` com o domínio real |
| WhatsApp | Funcionando | Confirmar o DDD |
| Logo oficial | Preparado | Arquivo da logo |
| Vídeo da prova de conceito | Preparado | Vídeo autorizado |

## SEO e desempenho

- Metadados e Open Graph por página, imagem OG gerada em `/opengraph-image`.
- `sitemap.xml`, `robots.txt`, Schema.org (`LocalBusiness` e `Service`).
- Fontes Space Grotesk e Inter hospedadas no próprio site (`src/fonts`, licença SIL OFL).
- Páginas estáticas, animações respeitam `prefers-reduced-motion`, sem bibliotecas pesadas além do Framer Motion.

## Conteúdo: cuidados adotados

- Nenhum número de clientes, certificação, depoimento ou parceria foi inventado.
- Os números do protótipo vêm do teste técnico de 32 s descrito na proposta e são apresentados com as ressalvas.
- Segmentos aparecem como aplicações possíveis, não como clientes.
- A política de privacidade é um modelo inicial. Revise com um profissional jurídico antes da publicação definitiva.
