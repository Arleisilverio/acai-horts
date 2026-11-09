-- Schema SQL Supabase para Acai Express
CREATE TABLE IF NOT EXISTS acai_store_settings (
  id TEXT PRIMARY KEY DEFAULT 'current_store',
  store_name TEXT NOT NULL DEFAULT 'AÇAÍ EXPRESS',
  tagline TEXT DEFAULT 'Sabor puro da Amazônia para você',
  bio TEXT DEFAULT 'Loja Oficial · Açaí Artesanal & Delivery Express.',
  is_open BOOLEAN DEFAULT true,
  show_combos_section BOOLEAN DEFAULT true,
  announcement_banner TEXT,
  show_announcement BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  hero_card_image_url TEXT,
  logo_emoji TEXT DEFAULT '🍇',
  logo_image_url TEXT,
  phone TEXT DEFAULT '5511999998888',
  address TEXT DEFAULT 'Av. Paulista, 1200 - Centro',
  opening_hours TEXT DEFAULT '12:00 às 23:00',
  pix_key TEXT DEFAULT 'pix@acaiexpress.com.br',
  min_order NUMERIC DEFAULT 15.0,
  monthly_goal NUMERIC DEFAULT 15000.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);