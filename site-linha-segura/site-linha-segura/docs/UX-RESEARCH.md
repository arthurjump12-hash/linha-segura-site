# Pesquisa de UX — Linha Segura Intelligence

Registro breve das referências e decisões que orientaram a experiência `/inteligencia-artificial/academias`.

## Como a pesquisa foi feita

- **Buscas na web** (outubro de 2026) sobre sites premium, dashboards SaaS, animações ao rolar e demonstrações de produtos de IA, incluindo termos com "reddit". As buscas retornaram principalmente artigos e resumos de discussões, e só um snapshot de post do r/web_design. **As threads do Reddit não foram lidas diretamente**, então os aprendizados abaixo não são atribuídos a comentários específicos.
- **Padrões de design systems** conhecidos (Linear, Vercel, Stripe, Apple, Raycast, Radix UI, shadcn/ui), usados como referência de comportamento, sem copiar layout nem identidade.
- **Skills realmente usadas:** `frontend-design` (instalada pelo usuário), `artifact-design` (diretrizes gerais de interface) e `dataviz` (método de gráficos, com o validador de paleta executado). Não havia skills específicas de motion, acessibilidade ou teste de navegador; os testes usam Playwright e axe-core diretamente.

Fontes consultadas:
- https://mikebamidele.is-a.dev/blog/what-makes-a-website-feel-premium-instead-of-template-based
- https://www.iiad.edu.in/the-circle/why-some-websites-just-feel-expensive/
- https://www.uxmatters.com/mt/archives/2025/03/from-features-to-value-designing-saas-dashboards-that-deliver-insights.php
- https://adamfard.com/blog/saas-dashboard-design
- https://feedbagel.com/post/critique-of-scroll-fade-animations-in-web-design
- https://www.thecreativemomentum.com/blog/are-scroll-triggered-animations-worth-your-time
- https://www.guideflow.com/blog/embed-interactive-demos-on-your-landing-page-to-maximize-your-visitors-conversion-rate
- https://dev.to/developeratul/let-the-product-sell-itself-5369

## Aprendizados aplicados

| Tema | Aprendizado | Como aplicamos |
|---|---|---|
| Premium | "Premium" vem de contenção, tipografia e espaçamento consistentes, não de efeitos | Mesma escala tipográfica do site; um único acento (ciano) por tela; efeitos só onde explicam algo |
| Animação | Fade em cada seção cansa e pesa no celular; o conteúdo não pode depender da animação para aparecer | Movimento só na simulação (que é o conteúdo); `prefers-reduced-motion` congela a simulação em um estado legível |
| Dashboard | Resumo antes do detalhe; poucos KPIs de decisão; filtros numa única linha acima dos gráficos | KPIs no topo, filtros únicos compartilhados por dashboard, ranking e mapa de calor |
| Métricas | Métricas diferentes não podem parecer equivalentes | Ranking separa eventos, tempo acumulado e taxa de ocupação, cada um com definição visível |
| Demonstração de IA | Demo interativa vende mais que descrição, mas precisa ser honesta | Toda simulação tem selo "Simulação"; dados reais do protótipo ficam em modo separado |
| Estados | Explicar a incerteza aumenta a confiança | Estados explícitos: livre, presença detectada, ocupação estimada, encerrado e inconclusivo, cada um com ícone e texto, não só cor |
| Interface "futurista" | Excesso de brilho, neon e texto pequeno prejudicam a leitura | Contraste AA, texto mínimo de 14 px nos painéis, brilho reservado a estados ativos |
| Comercial | Cada demo deve terminar numa próxima ação clara | CTAs de avaliação técnica após a demo, o dashboard e o piloto |
| Mobile | Dashboard no celular não é uma miniatura do desktop | Abas no celular, lista de equipamentos como alternativa à planta e painel em formato de gaveta inferior |
| Acessibilidade | Gráficos precisam de alternativa em texto | Tooltips por teclado, tabela de dados nos gráficos e exportação CSV |

## Padrões de referência (comportamento)

- **Linear / Raycast:** barra de comandos e controles compactos, atalhos visíveis, estados claros → controles da simulação (iniciar, pausar, reiniciar, velocidade) num dock compacto.
- **Stripe:** gráficos limpos, uma série em destaque, tooltips precisos → gráficos SVG próprios, eixo único, grade discreta.
- **Vercel:** dashboards escuros com hierarquia por luminosidade, não por cor → superfícies em camadas de azul-marinho.
- **Radix / shadcn:** diálogos com foco preso, Esc para fechar, `aria` correto → painel lateral do equipamento.
- **Apple:** storytelling por seção, uma ideia por tela → ordem da página: entender (hero), explorar (academia), medir (dashboard), confiar (protótipo real), agir (piloto e contato).
