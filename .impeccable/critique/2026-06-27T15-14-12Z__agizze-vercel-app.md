---
target: meu site (agizze.vercel.app)
total_score: 29
p0_count: 0
p1_count: 2
timestamp: 2026-06-27T15-14-12Z
slug: agizze-vercel-app
---
# Crítica de Design — Agizze RH (agizze.vercel.app)

## Design Health Score

| # | Heurística | Nota | Problema-chave |
|---|-----------|------|----------------|
| 1 | Visibilidade do status | 3 | Portal tem loading/empty/contador; one-pager não destaca seção ativa no scroll |
| 2 | Mundo real / linguagem | 3 | Ótimo PT-BR; jargão pontual para candidato ("Ponto de Controle", "matching com IA") |
| 3 | Controle e liberdade | 3 | Modal fecha por X/Esc/fora; sem "limpar filtros"; modal não devolve foco |
| 4 | Consistência | 4 | Sistema de tokens/componentes coeso entre index e vagas |
| 5 | Prevenção de erro | 3 | Forms Jotform com validação; falta consentimento LGPD nos formulários |
| 6 | Reconhecer vs lembrar | 3 | Nav com rótulos de texto; mas no mobile a nav some sem menu alternativo |
| 7 | Flexibilidade/eficiência | 3 | Busca+filtros no portal; sem atalhos de teclado |
| 8 | Estético/minimalista | 2 | Repetição de grids de cards + eyebrow em toda seção + zero imagem = cara de template |
| 9 | Recuperação de erro | 2 | Erro de fetch no portal aparece como "nenhuma vaga", mascarando falha de rede |
| 10 | Ajuda e documentação | 3 | FAQ sólida na home; sem ajuda contextual além disso |
| **Total** | | **29/40** | **Bom — base sólida, com pontos a corrigir** |

## Anti-Patterns Verdict

**LLM (minha avaliação):** Não grita "feito por IA" no nível grosseiro — paleta oficial da marca, logo real, voz consistente e modais elevam acima da média. Mas há **3 tells de gramática-IA** que puxam para baixo: (1) **zero imagem** num negócio de pessoas/logística, (2) **eyebrow tracked em quase toda seção** + numeração **01–06** em itens que não são sequência, (3) **muita repetição de grid de cards bordados** (soluções 6, MVV 3, segmentos 3, compromissos 6, contato 3). O conjunto faz o site parecer "esqueleto bonito" em vez de peça com direção de arte.

**Detector determinístico (6 achados):**
- `side-tab` (warning) — `index.html:98` `border-left:3px solid var(--brand)` no blockquote do "Sobre".
- `single-font` (warning) — `index.html:15` e `vagas.html:11`: só Outfit. (Nota: Outfit é fonte mandatória do manual da marca → preservação de identidade; mas a hierarquia tipográfica fica chapada.)
- `em-dash-overuse` (warning) — `index.html`: 8 travessões no corpo (cadência de IA).
- `numbered-section-markers` (advisory) — sequência 01–06 nos compromissos (não é sequência real).
- `dark-glow` (warning) — `vagas.html:89`: glow verde no botão flutuante de WhatsApp sobre fundo escuro.

**Overlay visual:** não disponível nesta sessão (sem automação de browser) — sem overlay no navegador; sinal de fallback registrado.

## Overall Impression
Funciona, está no ar, converte (CTAs + 2 formulários + portal real com Supabase) e respeita a marca. O que falta é **direção de arte**: o site é 90% tipografia + blocos de cor. Para um negócio de **gente em operação logística**, a ausência total de fotos reais é o maior buraco — é o que separa "template caprichado" de "empresa de verdade". A maior oportunidade isolada: **imagem real da operação** + **quebrar a monotonia de grids**.

## What's Working
1. **Aderência de marca impecável.** Cor `#E87F18`, logo oficial, favicon, tagline "Oportunidades que movem histórias" recorrente, voz (destemida/humana/ágil) — tudo consistente. Raro em geração de IA.
2. **Arquitetura de duplo público clara.** Empresas (proposta) e candidatos (banco de talentos + portal de vagas) coexistem sem competir. O portal com Supabase + busca/filtros é um diferencial real e funcional.
3. **Sistema visual coeso e modais limpos.** Tokens, espaçamento e componentes consistentes; formulários em modal (carregados só no clique) reduzem ruído e peso.

## Priority Issues

**[P1] Zero imagem num briefing que pede imagem**
- **Por que importa:** negócio de pessoas/logística sem nenhuma foto (operação, câmara fria, equipe em campo, candidatos) lê como incompleto e genérico. No register de marca, zero imagem aqui é bug, não "minimalismo". É o que mais derruba a percepção de empresa estabelecida.
- **Fix:** foto real no hero (operação rodando / equipe), 1 imagem em "Sobre", e thumbs em "Soluções". Você tem footage bruto (Drive "Glauco Prime") — dá para extrair frames; ou stock verificado de logística enquanto isso. Hero ganha um ponto focal visual no lugar do painel de texto.
- **Suggested command:** `$impeccable craft` (hero com imagem) / depois `$impeccable polish`

**[P1] Navegação some no mobile sem menu alternativo**
- **Por que importa:** abaixo de ~940px, `.nav-links a:not(.nav-cta){display:none}` esconde Soluções/Vagas/Sobre/Contato e **não há hambúrguer**. Seu público candidato é majoritariamente mobile (operadores no celular) — eles ficam sem navegação de topo, dependendo de scroll/rodapé. Persona Casey falha aqui.
- **Fix:** adicionar menu hambúrguer (drawer/`<dialog>`) no mobile com os mesmos links. Touch targets ≥44px.
- **Suggested command:** `$impeccable adapt`

**[P2] Mesmice de composição: grid de cards + eyebrow em toda seção**
- **Por que importa:** soluções (6), MVV (3), segmentos (3), compromissos (6), contato (3) são todos "eyebrow + h2 + grid de cards bordados". A repetição é o tell de "identical card grids" + "kicker em toda seção". Vira monótono e reduz hierarquia.
- **Fix:** variar a direção de arte por seção — alternar lista/timeline/destaque editorial; remover a eyebrow de algumas seções (deixar como sistema deliberado, não em todas); compromissos como lista, não cards numerados.
- **Suggested command:** `$impeccable layout` + `$impeccable typeset`

**[P2] Contraste do texto muted no limite + erro de fetch mascarado**
- **Por que importa:** `--muted:#64707f` sobre `--bg-soft:#f5f6f8` fica ~4,4:1, abaixo do mínimo 4,5:1 para corpo (acessibilidade/legibilidade). E no portal, falha de rede mostra "nenhuma vaga encontrada" — engana o usuário (persona Riley) e some com vagas reais sem avisar.
- **Fix:** escurecer o muted para ~`#586273` (ou mais escuro nas seções soft); separar estado de erro ("não foi possível carregar — tente novamente") do estado vazio.
- **Suggested command:** `$impeccable audit` (contraste) + `$impeccable harden` (estados de erro)

**[P2] Tells de cadência: numeração 01–06 e travessões**
- **Por que importa:** os compromissos não são uma sequência ordenada — numerá-los 01–06 é scaffold editorial de IA. E 8 travessões no corpo é cadência reconhecível de IA.
- **Fix:** trocar números por bullets/ícones de linha ou nada; reduzir travessões para ≤2, usando vírgula/ponto/parênteses.
- **Suggested command:** `$impeccable typeset` + `$impeccable clarify`

## Persona Red Flags

**Jordan (primeiro acesso / candidato):** o hero é B2B ("resolva sua operação") — um candidato que chega pela primeira vez vê discurso de empresa antes da faixa "Procurando uma oportunidade?". Jargão "Ponto de Controle"/"gestão inteligente" não fala a língua dele. Risco de não se reconhecer no topo.

**Casey (mobile, uma mão, no corredor):** nav de topo some sem hambúrguer — não chega a Vagas pelo menu. CTA principal fica no topo (fora da zona do polegar). Ponto positivo: botão flutuante de WhatsApp no canto inferior (alcançável) e formulários responsivos.

**Riley (stress tester):** filtra o portal e, se a rede cair, vê "nenhuma vaga" em vez de erro — conclui que não há vagas. Combinações de filtro sem resultado mostram o empty state (ok). Descrições longas de vaga não quebram o layout (ok).

## Minor Observations
- Blockquote do "Sobre" usa `border-left` colorido (tell suave); trocar por aspa tipográfica grande ou estilo pleno.
- Glow verde no FAB de WhatsApp sobre fundo escuro (tell de "dark glow") — suavizar a sombra.
- Modais sem `role="dialog"`/`aria-modal` nem foco preso/devolvido (acessibilidade — persona Sam).
- Formulários coletam dados pessoais sem link de Política de Privacidade/consentimento (LGPD — já mapeado no MKT-ENTREGAS, mas é risco real).
- Fonte única Outfit é mandatória do manual (ok manter), mas é uma fonte "reflexo" de 2026 — uma display distinta nos títulos (mesmo que só nos H1/H2) elevaria muito sem ferir a marca.

## Questions to Consider
- E se o hero abrisse com **imagem real da operação** em vez de um painel de texto — quanto mais "empresa de verdade" ela pareceria?
- Os 6 compromissos precisam mesmo ser **cards numerados**, ou uma lista enxuta comunicaria com menos ruído?
- O candidato (maioria mobile) deveria ter um **caminho próprio** logo no topo, em vez de depender da faixa abaixo do hero B2B?
