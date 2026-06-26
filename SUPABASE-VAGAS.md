# 🗄️ Portal de Vagas com Supabase — Guia de Configuração

O portal de vagas pode ler as vagas **direto de um banco Supabase**. O seu sistema Agizze grava as vagas no banco, e o portal mostra automaticamente — sem arquivo manual, sem commit.

> **Como funciona:** o portal faz uma leitura pública (chave `anon`) na tabela `vagas`, protegida por **RLS** (só mostra vagas `ativa = true`, e ninguém consegue escrever pela chave pública). O sistema Agizze escreve usando a chave **`service_role`** (apenas no servidor).

---

## Passo a passo (5 minutos)

### 1. Criar o projeto Supabase
- Acesse **https://supabase.com** → crie uma conta (pode ser com o GitHub) → **New project**.
- Nome: `agizze` · defina uma senha de banco · região: **South America (São Paulo)**.

### 2. Criar a tabela e a segurança
- No projeto: menu **SQL Editor** → **New query**.
- Cole **todo** o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
- Isso cria a tabela `vagas`, os índices, a RLS de leitura pública e insere as 6 vagas de exemplo.

### 3. Pegar as chaves
- Menu **Project Settings → API**. Copie:
  - **Project URL** → ex.: `https://xxxxxxxx.supabase.co`
  - **anon public** (em "Project API keys") → chave longa, **pode ficar no frontend** (é protegida pela RLS)
  - **service_role** → **SECRETA**, só para o sistema escrever. **Nunca** colocar no site.

### 4. Ligar no portal
Me envie a **Project URL** e a **anon public**. Eu coloco no topo do `vagas.html`:
```js
var SUPABASE_URL  = 'https://xxxxxxxx.supabase.co';
var SUPABASE_ANON = 'eyJ...sua-chave-anon...';
```
Faço commit → o portal passa a ler do Supabase automaticamente. (Sem isso preenchido, ele segue mostrando os exemplos do `vagas.json`.)

---

## Como o sistema Agizze grava as vagas

O sistema escreve na tabela `vagas` usando a chave **`service_role`** (no backend). Exemplos:

**Criar/atualizar uma vaga (REST):**
```
POST  https://xxxxxxxx.supabase.co/rest/v1/vagas
Headers:
  apikey: <service_role>
  Authorization: Bearer <service_role>
  Content-Type: application/json
  Prefer: resolution=merge-duplicates   # faz upsert pelo id
Body:
  { "id":"AGZ-101", "titulo":"Conferente", "cidade":"Itajaí", "uf":"SC",
    "area":"Conferência", "tipo":"CLT", "turno":"Diurno",
    "descricao":"...", "ativa":true, "publicada_em":"2026-07-01" }
```

**Tirar uma vaga do ar (sem apagar):** atualizar `ativa = false`.
```
PATCH https://xxxxxxxx.supabase.co/rest/v1/vagas?id=eq.AGZ-101
Body: { "ativa": false }
```

> O sistema também pode usar a biblioteca `@supabase/supabase-js` no backend, ou editar direto pela interface **Table Editor** do Supabase.

---

## Colunas da tabela `vagas`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | text (PK) | id da vaga no sistema (ex.: AGZ-001) |
| `titulo` | text | obrigatório |
| `cidade`, `uf` | text | viram filtro de cidade |
| `area` | text | vira filtro de área |
| `tipo` | text | vira filtro de tipo (CLT, Temporário…) |
| `turno` | text | ex.: Diurno, Escala 12x36 |
| `descricao` | text | texto curto |
| `ativa` | boolean | `false` esconde do portal |
| `publicada_em` | date | ordena (mais recentes primeiro) |
| `criada_em` | timestamptz | automático |

---

## Próximos passos
1. Você cria o projeto e roda o SQL (passos 1–2).
2. Me envia **Project URL + anon public** (passo 3).
3. Eu ligo o portal e publico (passo 4).
4. Seu dev conecta o sistema para gravar via `service_role`.

Quando quiser, também dá para mover os **formulários** (proposta e banco de talentos) para o Supabase em vez do Jotform — é só pedir.
