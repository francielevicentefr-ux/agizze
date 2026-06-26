# 🔌 Portal de Vagas — Contrato de Integração com o Sistema Agizze

O portal de vagas (`vagas.html`) é **estático e rápido**: ele lê as vagas de um único arquivo **`vagas.json`** e renderiza com busca e filtros no navegador. O seu **sistema Agizze** alimenta o portal **mantendo esse arquivo atualizado**.

> Padrão adotado: o sistema **sincroniza** os dados para o `vagas.json` (o site nunca chama a API do sistema direto). Isso deixa o portal instantâneo, sem depender da disponibilidade do sistema e sem risco de rate limit.

---

## 1. Formato do arquivo `vagas.json`

```json
{
  "atualizado_em": "2026-06-26",
  "vagas": [
    {
      "id": "AGZ-001",
      "titulo": "Auxiliar de Câmara Fria",
      "cidade": "Itajaí",
      "uf": "SC",
      "area": "Câmara fria",
      "tipo": "CLT",
      "turno": "Escala 12x36",
      "descricao": "Texto curto da vaga e benefícios.",
      "publicada_em": "2026-06-24"
    }
  ]
}
```

### Campos

| Campo | Obrigatório | Descrição |
|---|---|---|
| `id` | recomendado | Identificador único da vaga no sistema (aparece na candidatura via WhatsApp) |
| `titulo` | **sim** | Cargo / título da vaga |
| `cidade` | sim | Cidade (vira filtro automático) |
| `uf` | não | Estado (ex.: SC) |
| `area` | sim | Área/categoria (vira filtro automático). Ex.: Câmara fria, Separação e picking, Conferência, Carga e descarga, Auxiliar de logística |
| `tipo` | sim | Vínculo (vira filtro). Ex.: CLT, Temporário, PJ, Estágio |
| `turno` | não | Ex.: Diurno, Noturno, Escala 12x36, 6x1 |
| `descricao` | não | Texto curto (1–3 linhas) |
| `publicada_em` | não | Data ISO `AAAA-MM-DD` (exibida como dd/mm/aaaa) |

> Os filtros (cidade, área, tipo) são **gerados automaticamente** a partir das vagas — não precisa configurar nada.
> Para **remover** uma vaga do ar, basta o sistema **não incluí-la** no próximo `vagas.json`.

---

## 2. Como o sistema Agizze alimenta (3 caminhos)

Escolha **um**, conforme o que o sistema suporta:

### Opção A — Sistema gera o `vagas.json` e faz commit no repositório *(mais simples)*
O sistema (ou um job dele) escreve o arquivo e dá `git push` / usa a API do GitHub para atualizar `vagas.json`. O deploy é automático (GitHub Actions → Vercel). **Recomendado se o sistema já tem acesso ao Git.**

### Opção B — Sincronização agendada (o site puxa do sistema)
O sistema expõe um **endpoint que devolve a lista de vagas em JSON** (ex.: `GET https://sistema.agizze.com.br/api/vagas`). Criamos um **GitHub Action agendado** (ex.: a cada 30 min) que busca esse endpoint, grava o `vagas.json` e publica. **Recomendado se o sistema tem uma API.**
> Precisamos de: URL do endpoint, formato da resposta e, se houver, o token/cabeçalho de autenticação.

### Opção C — Apontar o portal direto para a API *(só se houver CORS liberado)*
Em `vagas.html`, a variável `var FONTE = 'vagas.json'` pode apontar para a URL da API do sistema. Requer **CORS liberado** para o domínio do site e uma API estável e pública. Menos recomendado (deixa o portal dependente do sistema no ar).

---

## 3. O que o candidato faz no portal

- **Buscar / filtrar** por cargo, cidade, área e tipo.
- **Candidatar-se** em cada vaga → abre o **WhatsApp** com a vaga preenchida na mensagem.
- **Cadastrar currículo** → formulário **Banco de Talentos** (Jotform `261766278706065`).

> Evolução possível: trocar o "Candidatar-se" por um link direto para a página da vaga no sistema, ou por um formulário de candidatura por vaga. É só me dizer.

---

## 4. Situação atual

- `vagas.json` está com **6 vagas de exemplo** (campo `_aviso` sinaliza isso). **Substituir pelo feed real do sistema.**
- Enquanto não houver vagas, o portal mostra um **estado vazio** convidando ao Banco de Talentos.

---

## ✅ O que eu preciso de você / do dev do sistema

1. Qual **opção (A, B ou C)** o sistema vai usar para alimentar o `vagas.json`.
2. Se for **B/C**: a **URL da API de vagas**, o **formato** da resposta e a **autenticação** (se houver).
3. Confirmar os **campos** disponíveis no sistema (para mapear no JSON acima).

Com isso eu finalizo a integração (incluindo o Action de sincronização, se for o caso).
