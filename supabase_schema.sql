-- SQL Schema com Políticas de Segurança RLS Blindadas para o Banco de Dados Açaí Express
-- Projeto Supabase: https://govygmvlodvynkfdxhji.supabase.co

-- 1. Tabela de Configurações da Loja
CREATE TABLE IF NOT EXISTS acai_store_settings (
  id TEXT PRIMARY KEY DEFAULT 'current_store',
  store_name TEXT NOT NULL DEFAULT 'AÇAÍ EXPRESS',
  tagline TEXT DEFAULT 'Sabor puro da Amazônia para você',
  bio TEXT DEFAULT 'Loja Oficial · Açaí Artesanal & Delivery Express.',
  is_open BOOLEAN DEFAULT true,
  show_combos_section BOOLEAN DEFAULT true,
  announcement_banner TEXT DEFAULT '🔥 Promoção de Hoje: Comprando 2 Copos de 500ml, o Leite Condensado é por nossa conta!',
  show_announcement BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  hero_card_image_url TEXT,
  hero_card_title TEXT DEFAULT 'Copo 500ml Artesanal',
  hero_card_subtitle TEXT DEFAULT 'Com Morango, Ninho & Granola',
  logo_emoji TEXT DEFAULT '🍇',
  logo_image_url TEXT,
  hero_badge_text TEXT DEFAULT 'Açaí Puro Artesanal · Delivery Rápido em Casa',
  hero_title_prefix TEXT DEFAULT 'Monte o seu',
  hero_title_highlight TEXT DEFAULT 'Copo de Açaí',
  hero_title_suffix TEXT DEFAULT 'camada por camada',
  hero_subtitle TEXT DEFAULT 'Escolha seu tamanho, frutas frescas, cremes artesanais e caldas que enchem o copo em tempo real na tela.',
  trust_badge1 TEXT DEFAULT '100% Fruta Pura sem Conservantes',
  trust_badge2 TEXT DEFAULT 'Entrega Rápida em Embalagem Térmica',
  trust_badge3 TEXT DEFAULT 'Preparo Médio em 15 Minutos',
  phone TEXT DEFAULT '5511999998888',
  address TEXT DEFAULT 'Av. Paulista, 1200 - Centro',
  opening_hours TEXT DEFAULT '12:00 às 23:00',
  pix_key TEXT DEFAULT 'pix@acaiexpress.com.br',
  min_order NUMERIC DEFAULT 15.0,
  monthly_goal NUMERIC DEFAULT 15000.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Tamanhos de Copo
CREATE TABLE IF NOT EXISTS acai_cup_sizes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  volume TEXT NOT NULL,
  base_price NUMERIC NOT NULL DEFAULT 0,
  included_complements_count INT NOT NULL DEFAULT 3,
  height_class TEXT DEFAULT 'h-80',
  badge TEXT,
  stock INT NOT NULL DEFAULT 50,
  available BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Complementos
CREATE TABLE IF NOT EXISTS acai_complements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'frutas', 'cremes', 'crocantes', 'coberturas'
  price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  color TEXT NOT NULL,
  text_color TEXT DEFAULT '#FFFFFF',
  texture_type TEXT DEFAULT 'sliced',
  icon_emoji TEXT DEFAULT '🍓',
  stock INT NOT NULL DEFAULT 50,
  available BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Combos
CREATE TABLE IF NOT EXISTS acai_combos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  badge TEXT,
  badge_color TEXT,
  description TEXT,
  size_id TEXT,
  complement_ids JSONB DEFAULT '[]'::jsonb,
  price NUMERIC NOT NULL DEFAULT 0,
  icon TEXT DEFAULT '🍧',
  stock INT NOT NULL DEFAULT 20,
  available BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Bairros e Taxas
CREATE TABLE IF NOT EXISTS acai_neighborhoods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 5.0,
  estimated_minutes TEXT DEFAULT '30-40 min',
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS acai_orders (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  change_for NUMERIC,
  status TEXT NOT NULL DEFAULT 'novo'
);

-- 7. Tabela de Livro Caixa / Transações Financeiras (Acesso Restrito)
CREATE TABLE IF NOT EXISTS acai_financial_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'receita' ou 'despesa'
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  payment_method TEXT,
  status TEXT DEFAULT 'pago',
  order_id TEXT
);

-- 8. Tabela de Usuários e Perfis de Acesso (RBAC)
CREATE TABLE IF NOT EXISTS acai_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cliente',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitação obrigatória de RLS em todas as tabelas
ALTER TABLE acai_store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE acai_cup_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE acai_complements ENABLE ROW LEVEL SECURITY;
ALTER TABLE acai_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE acai_neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE acai_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE acai_financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE acai_users ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURANÇA DEFENSIVAS:

-- Vitrine Pública: Somente Leitura (SELECT)
CREATE POLICY "Public read acai_store_settings" ON acai_store_settings FOR SELECT USING (true);
CREATE POLICY "Public read acai_cup_sizes" ON acai_cup_sizes FOR SELECT USING (true);
CREATE POLICY "Public read acai_complements" ON acai_complements FOR SELECT USING (true);
CREATE POLICY "Public read acai_combos" ON acai_combos FOR SELECT USING (true);
CREATE POLICY "Public read acai_neighborhoods" ON acai_neighborhoods FOR SELECT USING (true);

-- Pedidos: Somente criação de novos pedidos (INSERT). Sem SELECT ou DELETE anônimo.
CREATE POLICY "Public insert acai_orders" ON acai_orders FOR INSERT WITH CHECK (true);

-- Usuários: Somente cadastro de novos clientes (INSERT). Sem listagem anônima.
CREATE POLICY "Public insert acai_users" ON acai_users FOR INSERT WITH CHECK (true);

-- Financeiro: ZERO acesso público anônimo. Totalmente blindado.
-- (acai_financial_transactions permanece estritamente isolado sem políticas públicas)
