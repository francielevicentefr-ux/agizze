# 🖼️ Espaços de mídia do site — como subir fotos e vídeos

O site tem **slots de mídia** prontos (mostram um placeholder com o símbolo da Agizze até receberem o arquivo real). Trocar é simples: você me envia o arquivo (ou coloca em `assets/`) e eu ploto, ou você mesmo edita.

## Slots disponíveis (index.html)

| Slot | Local | Proporção | Ideal para |
|---|---|---|---|
| `media-hero` | Topo (hero), ao lado do título | 4:3 | Foto forte da operação / equipe, ou vídeo curto mudo |
| `media-operacao` | Faixa entre "Como trabalhamos" e "Sobre" | 16:9 | **Vídeo da operação** em loop (câmara fria, separação, carga) |
| `media-sobre` | Seção "Sobre", ao lado da história | 4:3 | Foto da equipe ou da sede |
| `media-candidatos` | Seção "Trabalhe conosco" | 4:3 | Foto de colaboradores reais (com autorização de imagem) |

## Como trocar o placeholder por uma imagem
Dentro do slot, substituir o bloco `<div class="ph">…</div>` por:
```html
<img src="assets/hero.jpg" alt="Equipe Agizze na operação logística" />
```
E adicionar o atributo `data-filled` na div `.media` (esconde o placeholder).

## Como trocar por um vídeo (loop, sem som — recomendado para a faixa 16:9)
```html
<video autoplay muted loop playsinline poster="assets/operacao-poster.jpg">
  <source src="assets/operacao.mp4" type="video/mp4" />
</video>
```
Regras para vídeo na web (importante):
- **Curto** (10–20s) e **comprimido** (~3–8 MB). Nada de arquivo bruto de GB.
- **Mudo** (`muted`) e **loop** — toca sozinho sem incomodar.
- Sempre com `poster` (imagem que aparece antes de carregar).

## O que me enviar
- 1 foto boa (horizontal, alta resolução) para o hero **ou** um clipe curto.
- 1 clipe curto da operação (já comprimido) para a faixa 16:9.
- Se for foto de pessoas: **autorização de uso de imagem** (regra do briefing).

Os arquivos vão para a pasta `assets/`. Pode me mandar que eu otimizo (redimensiono/comprimo) e ploto.
