-- ============================================================
--  Agizze · Portal de Vagas — Schema Supabase
--  Cole e rode no Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Tabela de vagas
create table if not exists public.vagas (
  id           text primary key,                 -- id da vaga no sistema Agizze (ex.: AGZ-001)
  titulo       text not null,
  cidade       text,
  uf           text,
  area         text,                              -- ex.: Câmara fria, Separação e picking, Conferência
  tipo         text,                              -- ex.: CLT, Temporário, PJ, Estágio
  turno        text,                              -- ex.: Diurno, Noturno, Escala 12x36
  descricao    text,
  ativa        boolean not null default true,     -- false = some do portal, sem apagar do banco
  publicada_em date    not null default current_date,
  criada_em    timestamptz not null default now()
);

-- 2) Índices úteis para os filtros
create index if not exists vagas_ativa_idx     on public.vagas (ativa);
create index if not exists vagas_cidade_idx    on public.vagas (cidade);
create index if not exists vagas_area_idx      on public.vagas (area);
create index if not exists vagas_publicada_idx on public.vagas (publicada_em desc);

-- 3) Segurança (RLS): o site lê só vagas ativas; ninguém escreve via chave pública
alter table public.vagas enable row level security;

drop policy if exists "leitura_publica_vagas_ativas" on public.vagas;
create policy "leitura_publica_vagas_ativas"
  on public.vagas
  for select
  to anon, authenticated
  using (ativa = true);

-- Garante o privilégio de leitura para as roles públicas (RLS continua filtrando)
grant select on public.vagas to anon, authenticated;

-- OBS: o sistema Agizze escreve (insert/update/delete) usando a chave
-- "service_role" (somente no servidor, NUNCA no frontend), que ignora a RLS.

-- 4) Vagas de exemplo (pode apagar quando o sistema começar a alimentar)
insert into public.vagas (id, titulo, cidade, uf, area, tipo, turno, descricao, publicada_em) values
  ('AGZ-001','Auxiliar de Câmara Fria','Itajaí','SC','Câmara fria','CLT','Escala 12x36','Atuação em ambiente refrigerado: movimentação, organização e apoio à operação logística. VT, VR e adicional de frio.','2026-06-24'),
  ('AGZ-002','Separador de Mercadorias','Navegantes','SC','Separação e picking','CLT','Diurno','Separação e conferência de pedidos com coletor, organização de paletes e apoio à expedição.','2026-06-23'),
  ('AGZ-003','Conferente de Logística','Itapema','SC','Conferência','CLT','Noturno','Conferência de cargas na entrada e saída, controle de divergências e registro no sistema.','2026-06-22'),
  ('AGZ-004','Ajudante de Carga e Descarga','Balneário Camboriú','SC','Carga e descarga','Temporário','Diurno','Carga e descarga de caminhões e movimentação de volumes. Vaga temporária com chance de efetivação.','2026-06-21'),
  ('AGZ-005','Auxiliar de Logística','Brusque','SC','Auxiliar de logística','CLT','Escala 6x1','Apoio às rotinas do armazém: recebimento, armazenagem, separação e expedição.','2026-06-20'),
  ('AGZ-006','Operador de Empilhadeira','Joinville','SC','Carga e descarga','CLT','Diurno','Operação de empilhadeira na movimentação de paletes e cargas. Necessária certificação válida.','2026-06-19')
on conflict (id) do nothing;
