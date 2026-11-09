import {
  CupSize,
  BaseOption,
  Complement,
  Neighborhood,
  Order,
  ComboItem,
  FinancialTransaction,
  StoreSettings,
} from '../types';

export const CUP_SIZES: CupSize[] = [
  { id: '300ml', name: 'Pequeno', volume: '300ml', basePrice: 16.0, includedComplementsCount: 2, heightClass: 'h-64', badge: 'Rápido & Leve', stock: 45, available: true },
  { id: '500ml', name: 'Médio Tradicional', volume: '500ml', basePrice: 22.0, includedComplementsCount: 3, heightClass: 'h-80', badge: 'Mais Pedido', stock: 80, available: true },
  { id: '700ml', name: 'Grande Turbinado', volume: '700ml', basePrice: 28.0, includedComplementsCount: 4, heightClass: 'h-96', badge: 'Para Dividir', stock: 35, available: true },
];

export const BASE_OPTIONS: BaseOption[] = [
  { id: 'tradicional', name: 'Açaí Tradicional Especial', description: 'Polpa de açaí puro da Amazônia.', color: '#380B44', accentColor: '#5C1D6E', extraPrice: 0, stock: 60, available: true },
  { id: 'banana', name: 'Açaí com Banana', description: 'Batido na hora com banana prata fresca.', color: '#46144A', accentColor: '#6E2573', extraPrice: 0, stock: 40, available: true },
  { id: 'zero', name: 'Açaí Zero Açúcar', description: '100% fruta pura sem açúcar adicionado.', color: '#2A0735', accentColor: '#430E52', extraPrice: 2.0, stock: 25, available: true },
  { id: 'cupuacu', name: 'Creme de Cupuaçu Puro', description: 'Polpa de cupuaçu doce e aveludada.', color: '#F0E6D2', accentColor: '#D8C6A5', extraPrice: 0, stock: 30, available: true },
  { id: 'meio_a_meio', name: 'Meio a Meio (Açaí + Cupuaçu)', description: 'O clássico contraste amazônico.', color: '#380B44', accentColor: '#E6D7BD', extraPrice: 0, stock: 40, available: true },
];

export const COMPLEMENTS_CATALOG: Complement[] = [
  { id: 'fruta_morango', name: 'Morango Fresco', category: 'frutas', price: 3.5, costPrice: 1.2, color: '#EF4444', textColor: '#FFFFFF', textureType: 'sliced', iconEmoji: '🍓', stock: 50, available: true },
  { id: 'fruta_banana', name: 'Banana Prata Fatiada', category: 'frutas', price: 2.0, costPrice: 0.6, color: '#FEF08A', textColor: '#854D0E', textureType: 'sliced', iconEmoji: '🍌', stock: 60, available: true },
  { id: 'fruta_kiwi', name: 'Kiwi Tropical', category: 'frutas', price: 3.0, costPrice: 1.4, color: '#84CC16', textColor: '#365314', textureType: 'sliced', iconEmoji: '🥝', stock: 25, available: true },
  { id: 'fruta_uva', name: 'Uva Thompson sem Semente', category: 'frutas', price: 3.0, costPrice: 1.1, color: '#A855F7', textColor: '#FFFFFF', textureType: 'sliced', iconEmoji: '🍇', stock: 30, available: true },
  { id: 'fruta_manga', name: 'Manga Tommy em Cubos', category: 'frutas', price: 2.5, costPrice: 0.9, color: '#F59E0B', textColor: '#78350F', textureType: 'sliced', iconEmoji: '🥭', stock: 28, available: true },
  { id: 'creme_ninho', name: 'Leite em Pó Ninho', category: 'cremes', price: 3.0, costPrice: 1.0, color: '#FEF9C3', textColor: '#713F12', textureType: 'powder', iconEmoji: '🥛', stock: 80, available: true },
  { id: 'creme_nutella', name: 'Nutella Pura (Creme de Avelã)', category: 'cremes', price: 4.5, costPrice: 2.1, color: '#451A03', textColor: '#FFFFFF', textureType: 'drizzle', iconEmoji: '🌰', stock: 35, available: true },
  { id: 'creme_doce_leite', name: 'Doce de Leite Cremoso', category: 'cremes', price: 3.5, costPrice: 1.2, color: '#B45309', textColor: '#FFFFFF', textureType: 'paste', iconEmoji: '🍯', stock: 40, available: true },
  { id: 'creme_amendoim', name: 'Pasta de Amendoim Integral', category: 'cremes', price: 3.0, costPrice: 1.1, color: '#D97706', textColor: '#FFFFFF', textureType: 'paste', iconEmoji: '🥜', stock: 32, available: true },
  { id: 'creme_ovomaltine', name: 'Creme Crocante Ovomaltine', category: 'cremes', price: 4.0, costPrice: 1.7, color: '#7C2D12', textColor: '#FFFFFF', textureType: 'powder', iconEmoji: '🍫', stock: 25, available: true },
  { id: 'croc_granola', name: 'Granola Artesanal com Castanhas', category: 'crocantes', price: 2.5, costPrice: 0.7, color: '#D97706', textColor: '#FFFFFF', textureType: 'granules', iconEmoji: '🥣', stock: 70, available: true },
  { id: 'croc_pacoca', name: 'Paçoca Rolha Esfarelada', category: 'crocantes', price: 2.5, costPrice: 0.6, color: '#CA8A04', textColor: '#FFFFFF', textureType: 'powder', iconEmoji: '🥜', stock: 65, available: true },
  { id: 'croc_castanha', name: 'Castanha de Caju Triturada', category: 'crocantes', price: 4.0, costPrice: 1.6, color: '#FBBF24', textColor: '#78350F', textureType: 'granules', iconEmoji: '🌰', stock: 30, available: true },
  { id: 'croc_chocoball', name: 'Chocoball Crocante', category: 'crocantes', price: 2.5, costPrice: 0.8, color: '#3E2723', textColor: '#FFFFFF', textureType: 'granules', iconEmoji: '⚪', stock: 50, available: true },
  { id: 'croc_coco', name: 'Coco Ralado Fino Seco', category: 'crocantes', price: 2.0, costPrice: 0.5, color: '#F8FAFC', textColor: '#0F172A', textureType: 'powder', iconEmoji: '🥥', stock: 45, available: true },
  { id: 'calda_leite_cond', name: 'Leite Condensado Moça', category: 'coberturas', price: 2.5, costPrice: 0.8, color: '#FEF08A', textColor: '#854D0E', textureType: 'drizzle', iconEmoji: '🥫', stock: 90, available: true },
  { id: 'calda_mel', name: 'Mel Silvestre Puro', category: 'coberturas', price: 3.0, costPrice: 1.0, color: '#F59E0B', textColor: '#78350F', textureType: 'drizzle', iconEmoji: '🍯', stock: 40, available: true },
  { id: 'calda_morango', name: 'Calda de Morango Gourmet', category: 'coberturas', price: 2.5, costPrice: 0.7, color: '#BE123C', textColor: '#FFFFFF', textureType: 'drizzle', iconEmoji: '🍓', stock: 55, available: true },
  { id: 'calda_maracuja', name: 'Calda de Maracujá com Sementes', category: 'coberturas', price: 3.0, costPrice: 0.9, color: '#EAB308', textColor: '#713F12', textureType: 'drizzle', iconEmoji: '✨', stock: 35, available: true },
  { id: 'calda_chocolate', name: 'Cobertura de Chocolate Belga', category: 'coberturas', price: 3.0, costPrice: 1.1, color: '#29140B', textColor: '#FFFFFF', textureType: 'drizzle', iconEmoji: '🍫', stock: 50, available: true },
];

export const INITIAL_COMBOS: ComboItem[] = [
  { id: 'combo_1', title: 'Clássico Ninho & Morango', badge: 'Campeão de Vendas', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30', description: 'Morango fresco, Leite Ninho e Granola.', sizeId: '500ml', baseId: 'tradicional', complementIds: ['fruta_morango', 'creme_ninho', 'croc_granola', 'calda_leite_cond'], price: 24.5, icon: '🍓', stock: 30, available: true },
  { id: 'combo_2', title: 'Bomba de Nutella & Paçoca', badge: 'Gourmet Turbinado', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30', description: 'Nutella pura, paçoca e Chocoball.', sizeId: '700ml', baseId: 'banana', complementIds: ['fruta_banana', 'creme_nutella', 'croc_pacoca', 'croc_chocoball', 'calda_chocolate'], price: 31.0, icon: '🍫', stock: 20, available: true },
  { id: 'combo_3', title: 'Açaí Fit Tropical', badge: 'Zero Açúcar', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', description: 'Zero açúcar com kiwi, morango e mel.', sizeId: '500ml', baseId: 'zero', complementIds: ['fruta_morango', 'fruta_kiwi', 'croc_castanha', 'calda_mel'], price: 25.0, icon: '🥝', stock: 18, available: true },
];

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: 'centro', name: 'Centro', fee: 4.0, estimatedMinutes: '20-30 min', active: true },
  { id: 'jd_tropical', name: 'Jardim Tropical', fee: 6.0, estimatedMinutes: '30-40 min', active: true },
  { id: 'vila_mariana', name: 'Vila Mariana', fee: 5.0, estimatedMinutes: '25-35 min', active: true },
  { id: 'bela_vista', name: 'Bela Vista', fee: 6.5, estimatedMinutes: '35-45 min', active: true },
  { id: 'parque_das_arvores', name: 'Parque das Árvores', fee: 8.0, estimatedMinutes: '40-50 min', active: true },
  { id: 'santa_cecilia', name: 'Santa Cecília', fee: 5.5, estimatedMinutes: '25-35 min', active: true },
];

export const STORE_SETTINGS: StoreSettings = {
  storeName: 'AÇAÍ EXPRESS',
  tagline: 'Sabor puro da Amazônia para você',
  bio: 'Loja Oficial · Açaí Artesanal & Delivery Express.',
  isOpen: true,
  showCombosSection: true,
  announcementBanner: '🔥 Promoção de Hoje: Comprando 2 Copos de 500ml, o Leite Condensado é por nossa conta!',
  showAnnouncement: true,
  coverImageUrl: '/images/acai_shop_hero_1794185825735.jpg',
  heroCardImageUrl: '/images/acai_cup_layered_1794185825692.jpg',
  heroCardTitle: 'Copo 500ml Artesanal',
  heroCardSubtitle: 'Com Morango, Ninho & Granola',
  logoEmoji: '🍇',
  logoImageUrl: '',
  heroBadgeText: 'Açaí Puro Artesanal · Delivery Rápido em Casa',
  heroTitlePrefix: 'Monte o seu',
  heroTitleHighlight: 'Copo de Açaí',
  heroTitleSuffix: 'camada por camada',
  heroSubtitle: 'Escolha seu tamanho, frutas e cremes em tempo real.',
  trustBadge1: '100% Fruta Pura sem Conservantes',
  trustBadge2: 'Entrega Rápida em Embalagem Térmica',
  trustBadge3: 'Preparo Médio em 15 Minutos',
  phone: '5511999998888',
  address: 'Av. Paulista, 1200 - Centro',
  openingHours: '12:00 às 23:00',
  pixKey: 'pix@acaiexpress.com.br',
  minOrder: 15.0,
  monthlyGoal: 15000.0,
  autoPrintOrders: true,
};

export const INITIAL_SEED_ORDERS: Order[] = [
  {
    id: 'ord_101',
    code: '#ACAI-1048',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    customer: { name: 'Camila Fernandes', phone: '(11) 98765-4321', orderType: 'delivery', address: { street: 'Rua das Flores', number: '240', neighborhood: 'Jardim Tropical' } },
    items: [{ id: 'item_1', size: CUP_SIZES[1], base: BASE_OPTIONS[0], complements: [COMPLEMENTS_CATALOG[0], COMPLEMENTS_CATALOG[5], COMPLEMENTS_CATALOG[10]], itemPrice: 24.5, quantity: 1 }],
    subtotal: 24.5, deliveryFee: 6.0, total: 30.5, paymentMethod: 'pix', status: 'novo'
  }
];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  { id: 'tx_1', type: 'despesa', category: 'insumos_acai', description: 'Compra de Polpa de Açaí', amount: 420.0, date: new Date().toISOString(), paymentMethod: 'pix', status: 'pago' }
];