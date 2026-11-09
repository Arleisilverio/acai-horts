export type UserRole = 'super_admin' | 'lojista' | 'gerente' | 'cliente';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  storeAccessId?: string;
  active: boolean;
  createdAt: string;
  avatarUrl?: string;
  defaultAddress?: {
    street: string;
    number: string;
    neighborhood: string;
    reference?: string;
    city?: string;
  };
}

export type CupSizeId = string;

export interface CupSize {
  id: CupSizeId;
  name: string;
  volume: string;
  basePrice: number;
  includedComplementsCount: number;
  heightClass: string;
  badge?: string;
  stock: number;
  available: boolean;
}

export interface BaseOption {
  id: string;
  name: string;
  description: string;
  color: string;
  accentColor: string;
  extraPrice?: number;
  stock: number;
  available: boolean;
}

export type ComplementCategory = 'frutas' | 'cremes' | 'crocantes' | 'coberturas';

export interface Complement {
  id: string;
  name: string;
  category: ComplementCategory;
  price: number;
  costPrice?: number;
  color: string;
  textColor?: string;
  textureType: 'sliced' | 'powder' | 'granules' | 'drizzle' | 'paste';
  iconEmoji: string;
  stock: number;
  available: boolean;
}

export interface ComboItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  sizeId: string;
  baseId: string;
  complementIds: string[];
  price: number;
  icon: string;
  stock: number;
  available: boolean;
}

export interface CustomAcaiItem {
  id: string;
  size: CupSize;
  base: BaseOption;
  complements: Complement[];
  notes?: string;
  itemPrice: number;
  quantity: number;
}

export type OrderStatus = 'novo' | 'em_preparo' | 'em_entrega' | 'entregue' | 'cancelado';
export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
export type OrderType = 'delivery' | 'retirada' | 'balcao';

export interface Neighborhood {
  id: string;
  name: string;
  fee: number;
  estimatedMinutes: string;
  active?: boolean;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  senderRole: 'lojista' | 'cliente';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  customerId?: string;
  isTotem?: boolean;
  totemPassword?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    orderType: OrderType;
    address?: {
      street: string;
      number: string;
      neighborhood: string;
      reference?: string;
    };
  };
  items: CustomAcaiItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  status: OrderStatus;
}

export type TransactionCategory =
  | 'vendas'
  | 'insumos_acai'
  | 'frutas_complementos'
  | 'embalagens'
  | 'motoboy'
  | 'fixo_aluguel'
  | 'marketing'
  | 'outros';

export interface FinancialTransaction {
  id: string;
  type: 'receita' | 'despesa';
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod?: PaymentMethod;
  status: 'pago' | 'pendente';
  orderId?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  bio: string;
  isOpen: boolean;
  showCombosSection: boolean;
  announcementBanner: string;
  showAnnouncement: boolean;
  coverImageUrl: string;
  heroCardImageUrl: string;
  heroCardTitle: string;
  heroCardSubtitle: string;
  logoEmoji: string;
  logoImageUrl?: string;
  heroBadgeText: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroTitleSuffix: string;
  heroSubtitle: string;
  trustBadge1: string;
  trustBadge2: string;
  trustBadge3: string;
  phone: string;
  address: string;
  openingHours: string;
  pixKey: string;
  minOrder: number;
  monthlyGoal: number;
  autoPrintOrders?: boolean;
}