import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Order, OrderStatus, TransactionCategory, PaymentMethod } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { SuperAdminUsersPanel } from './SuperAdminUsersPanel';
import { OrderChatModal } from './OrderChatModal';
import { printOrderReceipt } from '../utils/printReceipt';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Bike,
  Store,
  Search,
  Printer,
  ChevronRight,
  ArrowLeft,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Sparkles,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  Edit3,
  Package,
  AlertTriangle,
  DollarSign,
  Target,
  Filter,
  Shield,
  Crown,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onBackToStore: () => void;
  onResetSeedData: () => void;
}

const CATEGORY_LABELS: Record<TransactionCategory, { label: string; color: string }> = {
  vendas: { label: 'Vendas & Pedidos', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  insumos_acai: { label: 'Polpa de Açaí / Bases', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  frutas_complementos: { label: 'Frutas, Cremes & Insumos', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  embalagens: { label: 'Copos, Tampas & Sacolas', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  motoboy: { label: 'Motoboy & Entregas', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  fixo_aluguel: { label: 'Aluguel, Energia & Fixos', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  marketing: { label: 'Marketing & Divulgação', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' },
  outros: { label: 'Outros Lançamentos', color: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/30' },
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onUpdateOrderStatus,
  onBackToStore,
  onResetSeedData,
}) => {
  const {
    storeSettings,
    updateStoreSettings,
    cupSizes,
    updateCupSize,
    baseOptions,
    updateBaseOption,
    complements,
    updateComplement,
    combos,
    updateCombo,
    neighborhoods,
    updateNeighborhood,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setIsEditMode,
    setPosMode,
    resetAllStoreData,
  } = useStore();

  const { isSuperAdmin, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'financeiro' | 'estoque' | 'kanban' | 'pagina' | 'usuarios'
  >(isSuperAdmin ? 'usuarios' : 'financeiro');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [selectedChatOrder, setSelectedChatOrder] = useState<Order | null>(null);
  const [txFilter, setTxFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');

  // New Financial Transaction Form state
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<'receita' | 'despesa'>('despesa');
  const [txCategory, setTxCategory] = useState<TransactionCategory>('insumos_acai');
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txPaymentMethod, setTxPaymentMethod] = useState<PaymentMethod>('pix');
  const [txStatus, setTxStatus] = useState<'pago' | 'pendente'>('pago');

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const q = searchQuery.toLowerCase();
    return (
      ord.code.toLowerCase().includes(q) ||
      ord.customer.name.toLowerCase().includes(q) ||
      ord.customer.phone.includes(q)
    );
  });

  // FINANCIAL METRICS CALCULATION
  const validOrders = orders.filter((o) => o.status !== 'cancelado');
  const ordersRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const deliveryFeesCollected = validOrders.reduce((acc, o) => acc + o.deliveryFee, 0);

  const manualRevenues = transactions
    .filter((t) => t.type === 'receita')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalGrossRevenue = ordersRevenue + manualRevenues;

  const totalExpenses = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingExpenses = transactions
    .filter((t) => t.type === 'despesa' && t.status === 'pendente')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalGrossRevenue - totalExpenses;
  const profitMargin =
    totalGrossRevenue > 0 ? Math.round((netProfit / totalGrossRevenue) * 100) : 0;

  const goalProgress = Math.min(
    100,
    Math.round((totalGrossRevenue / (storeSettings.monthlyGoal || 15000)) * 100)
  );

  // Low stock items alert
  const lowStockComplements = complements.filter((c) => c.stock <= 15);
  const lowStockSizes = cupSizes.filter((s) => s.stock <= 15);

  // Group orders for Kanban
  const newOrders = filteredOrders.filter((o) => o.status === 'novo');
  const prepOrders = filteredOrders.filter((o) => o.status === 'em_preparo');
  const deliveryOrders = filteredOrders.filter((o) => o.status === 'em_entrega');
  const doneOrders = filteredOrders.filter((o) => o.status === 'entregue');

  // Expenses breakdown by category
  const expenseCategories: TransactionCategory[] = [
    'insumos_acai',
    'frutas_complementos',
    'embalagens',
    'motoboy',
    'fixo_aluguel',
    'marketing',
    'outros',
  ];

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(txAmount.replace(',', '.'));
    if (!txDescription.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Preencha a descrição e um valor válido.');
      return;
    }

    addTransaction({
      type: txType,
      category: txCategory,
      description: txDescription.trim(),
      amount: parsedAmount,
      date: new Date().toISOString(),
      paymentMethod: txPaymentMethod,
      status: txStatus,
    });

    setTxDescription('');
    setTxAmount('');
    setShowTxModal(false);
  };

  const getPaymentIcon = (method?: string) => {
    switch (method) {
      case 'pix':
        return <QrCode className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Banknote className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar à Vitrine</span>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Gestão Financeira, Estoque & PDV</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {storeSettings.storeName} · Controle total de receitas, despesas, preços, quantidades e página
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIsEditMode(true);
                onBackToStore();
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Página ao Vivo</span>
            </button>

            <button
              onClick={() => {
                setTxType('receita');
                setTxCategory('vendas');
                setShowTxModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Receita</span>
            </button>

            <button
              onClick={() => {
                setTxType('despesa');
                setTxCategory('insumos_acai');
                setShowTxModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Lançar Despesa</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Deseja restaurar os pedidos e dados de demonstração?')) {
                  onResetSeedData();
                  resetAllStoreData();
                }
              }}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Restaurar dados de fábrica"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FINANCIAL KPI CARDS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Gross Revenue */}
          <div className="p-5 rounded-3xl bg-zinc-900/90 border border-emerald-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Receita Bruta (Entradas)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                R$ {totalGrossRevenue.toFixed(2).replace('.', ',')}
              </span>
              <p className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
                <span>Pedidos App: R$ {ordersRevenue.toFixed(2).replace('.', ',')}</span>
                <span className="text-emerald-400 font-semibold">{validOrders.length} vendas</span>
              </p>
            </div>
          </div>

          {/* Card 2: Total Expenses */}
          <div className="p-5 rounded-3xl bg-zinc-900/90 border border-red-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-300">
                Despesas & Custos (Saídas)
              </span>
              <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                R$ {totalExpenses.toFixed(2).replace('.', ',')}
              </span>
              <p className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
                <span>
                  {transactions.filter((t) => t.type === 'despesa').length} lançamentos
                </span>
                {pendingExpenses > 0 && (
                  <span className="text-amber-400 font-semibold">
                    R$ {pendingExpenses.toFixed(2).replace('.', ',')} a pagar
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Card 3: Net Profit (Lucro Líquido) */}
          <div
            className={`p-5 rounded-3xl bg-zinc-900/90 border flex flex-col justify-between ${
              netProfit >= 0 ? 'border-purple-500/30' : 'border-red-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Saldo / Lucro Líquido
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span
                className={`text-2xl sm:text-3xl font-black tabular-nums ${
                  netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                R$ {netProfit.toFixed(2).replace('.', ',')}
              </span>
              <p className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
                <span>Margem líquida atual:</span>
                <span
                  className={`font-bold ${
                    profitMargin >= 20 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {profitMargin}%
                </span>
              </p>
            </div>
          </div>

          {/* Card 4: Monthly Goal (Editável) */}
          <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Meta Mensal (R$)</span>
              </span>
              <input
                type="number"
                step="500"
                value={storeSettings.monthlyGoal}
                onChange={(e) =>
                  updateStoreSettings({
                    monthlyGoal: Math.max(100, parseFloat(e.target.value) || 1000),
                  })
                }
                className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-0.5 text-xs font-bold text-amber-300 text-right"
                title="Clique para editar sua meta de vendas"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-white">{goalProgress}% atingido</span>
                <span className="text-[11px] text-zinc-400">
                  Meta: R$ {storeSettings.monthlyGoal.toFixed(0)}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-900 rounded-2xl border border-zinc-800">
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'usuarios'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-amber-300 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>★ Painel Master & Lojistas</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('financeiro')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'financeiro'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>1. Fluxo de Caixa & DRE</span>
            </button>

            <button
              onClick={() => setActiveTab('estoque')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'estoque'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>2. Preços & Quantidades (Estoque)</span>
              {(lowStockComplements.length > 0 || lowStockSizes.length > 0) && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-black font-black">
                  {lowStockComplements.length + lowStockSizes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>3. Pedidos & Cozinha ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pagina')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'pagina'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>4. Configurações da Loja & Entregas</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            TAB 0: PAINEL MASTER DO CRIADOR (ARLEI) - GESTÃO DE LOJISTAS E GERENTES
           ===================================================================== */}
        {activeTab === 'usuarios' && isSuperAdmin && (
          <SuperAdminUsersPanel />
        )}

        {/* =====================================================================
            TAB 1: GESTÃO FINANCEIRA & FLUXO DE CAIXA
           ===================================================================== */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            {/* Breakdown Row: Expenses by Category & Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Despesas por Categoria */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Custos & Despesas por Categoria
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Para onde está indo o dinheiro da loja
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTxType('despesa');
                      setShowTxModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Custo</span>
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {expenseCategories.map((cat) => {
                    const catTotal = transactions
                      .filter((t) => t.type === 'despesa' && t.category === cat)
                      .reduce((acc, t) => acc + t.amount, 0);
                    if (catTotal === 0) return null;
                    const pct =
                      totalExpenses > 0 ? Math.round((catTotal / totalExpenses) * 100) : 0;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-zinc-200">
                            {CATEGORY_LABELS[cat].label}
                          </span>
                          <span className="font-bold text-white tabular-nums">
                            R$ {catTotal.toFixed(2).replace('.', ',')}{' '}
                            <span className="text-zinc-500 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Entradas por Meio de Pagamento & Delivery */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Meios de Recebimento & Entregas
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Valores recebidos nos pedidos da loja
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  {(['pix', 'cartao_credito', 'dinheiro'] as const).map((method) => {
                    const sum = validOrders
                      .filter((o) =>
                        method === 'cartao_credito'
                          ? o.paymentMethod === 'cartao_credito' ||
                            o.paymentMethod === 'cartao_debito'
                          : o.paymentMethod === method
                      )
                      .reduce((acc, o) => acc + o.total, 0);

                    return (
                      <div
                        key={method}
                        className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1"
                      >
                        <span className="text-[11px] text-zinc-400 uppercase font-bold block">
                          {method === 'pix'
                            ? 'PIX'
                            : method === 'cartao_credito'
                            ? 'Cartão'
                            : 'Dinheiro'}
                        </span>
                        <span className="text-sm font-black text-white tabular-nums block">
                          R$ {sum.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Bike className="w-5 h-5 text-purple-400" />
                    <div>
                      <span className="font-bold text-white block">
                        Taxas de Entrega Arrecadadas
                      </span>
                      <span className="text-zinc-400 text-[11px]">
                        Repasse ou controle de motoboys
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-black text-purple-300 tabular-nums">
                    R$ {deliveryFeesCollected.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* Cash Flow Ledger Table */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Livro Caixa — Lançamentos Financeiros</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Gerencie todas as despesas e entradas manuais, edite valores ou altere o status de pagamento
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-zinc-500" />
                  {(['todos', 'receita', 'despesa'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTxFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer ${
                        txFilter === f
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {f === 'todos' ? 'Todos' : f === 'receita' ? 'Entradas' : 'Saídas'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Tipo</th>
                      <th className="py-3.5 px-4">Descrição</th>
                      <th className="py-3.5 px-4">Categoria</th>
                      <th className="py-3.5 px-4">Valor (Editável)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {transactions
                      .filter((t) => (txFilter === 'todos' ? true : t.type === txFilter))
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] inline-flex items-center gap-1 ${
                                tx.type === 'receita'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {tx.type === 'receita' ? '+ Entrada' : '- Saída'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={tx.description}
                              onChange={(e) =>
                                updateTransaction(tx.id, { description: e.target.value })
                              }
                              className="w-full bg-transparent hover:bg-zinc-950 focus:bg-zinc-950 border border-transparent focus:border-purple-500 rounded-lg px-2 py-1 font-semibold text-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                                CATEGORY_LABELS[tx.category]?.color || ''
                              }`}
                            >
                              {CATEGORY_LABELS[tx.category]?.label || tx.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <span className="text-zinc-500">R$</span>
                              <input
                                type="number"
                                step="0.50"
                                value={tx.amount}
                                onChange={(e) =>
                                  updateTransaction(tx.id, {
                                    amount: Math.max(0, parseFloat(e.target.value) || 0),
                                  })
                                }
                                className={`w-24 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 font-black tabular-nums ${
                                  tx.type === 'receita' ? 'text-emerald-400' : 'text-red-400'
                                }`}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                updateTransaction(tx.id, {
                                  status: tx.status === 'pago' ? 'pendente' : 'pago',
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                tx.status === 'pago'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {tx.status === 'pago' ? '✓ Pago / Recebido' : '⏳ Pendente'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Excluir lançamento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: CONTROLE DE ESTOQUE, PREÇOS E QUANTIDADES EM MASSA
           ===================================================================== */}
        {activeTab === 'estoque' && (
          <div className="space-y-6">
            {/* Tamanhos de Copo Table */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Tamanhos de Copo — Preços & Estoque de Embalagens
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Altere o preço base, quantidade de complementos grátis e estoque de copos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cupSizes.map((size) => (
                  <div
                    key={size.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-purple-300">{size.volume}</span>
                      <button
                        onClick={() => updateCupSize(size.id, { available: !size.available })}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer ${
                          size.available && size.stock > 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {size.available && size.stock > 0 ? 'Ativo' : 'Esgotado'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">
                          Preço Base (R$)
                        </label>
                        <input
                          type="number"
                          step="0.50"
                          value={size.basePrice}
                          onChange={(e) =>
                            updateCupSize(size.id, {
                              basePrice: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 font-black text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">
                          Compl. Grátis
                        </label>
                        <input
                          type="number"
                          value={size.includedComplementsCount}
                          onChange={(e) =>
                            updateCupSize(size.id, {
                              includedComplementsCount: Math.max(
                                0,
                                parseInt(e.target.value, 10) || 0
                              ),
                            })
                          }
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 font-bold text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Estoque Copos:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCupSize(size.id, { stock: size.stock - 5 })}
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white cursor-pointer"
                        >
                          -5
                        </button>
                        <input
                          type="number"
                          value={size.stock}
                          onChange={(e) =>
                            updateCupSize(size.id, {
                              stock: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="w-16 text-center bg-zinc-900 border border-zinc-700 rounded-lg py-1 text-xs font-black text-white"
                        />
                        <button
                          onClick={() =>
                            updateCupSize(size.id, {
                              stock: size.stock + 10,
                              available: true,
                            })
                          }
                          className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white cursor-pointer"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complementos Spreadsheet Table */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Tabela de Complementos — Valores, Custos e Quantidades
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Modifique rapidamente o preço cobrado, o custo de compra e a quantidade disponível em estoque
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Item</th>
                      <th className="py-3.5 px-4">Categoria</th>
                      <th className="py-3.5 px-4">Preço Venda (R$)</th>
                      <th className="py-3.5 px-4">Custo (R$)</th>
                      <th className="py-3.5 px-4">Quantidade em Estoque</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {complements.map((comp) => {
                      const isLow = comp.stock <= 15;
                      return (
                        <tr key={comp.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{comp.iconEmoji}</span>
                              <input
                                type="text"
                                value={comp.name}
                                onChange={(e) =>
                                  updateComplement(comp.id, { name: e.target.value })
                                }
                                className="bg-transparent hover:bg-zinc-950 focus:bg-zinc-950 border border-transparent focus:border-purple-500 rounded-lg px-2 py-1 font-bold text-white"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 capitalize text-zinc-400">{comp.category}</td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              step="0.50"
                              value={comp.price}
                              onChange={(e) =>
                                updateComplement(comp.id, {
                                  price: Math.max(0, parseFloat(e.target.value) || 0),
                                })
                              }
                              className="w-20 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 font-black text-amber-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              step="0.25"
                              value={comp.costPrice || 1.0}
                              onChange={(e) =>
                                updateComplement(comp.id, {
                                  costPrice: Math.max(0, parseFloat(e.target.value) || 0),
                                })
                              }
                              className="w-20 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  updateComplement(comp.id, { stock: comp.stock - 1 })
                                }
                                className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                value={comp.stock}
                                onChange={(e) =>
                                  updateComplement(comp.id, {
                                    stock: parseInt(e.target.value, 10) || 0,
                                  })
                                }
                                className={`w-14 text-center bg-zinc-950 border rounded-lg py-1 font-black ${
                                  isLow
                                    ? 'border-amber-500 text-amber-300'
                                    : 'border-zinc-800 text-white'
                                }`}
                              />
                              <button
                                onClick={() =>
                                  updateComplement(comp.id, {
                                    stock: comp.stock + 1,
                                    available: true,
                                  })
                                }
                                className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  updateComplement(comp.id, {
                                    stock: comp.stock + 20,
                                    available: true,
                                  })
                                }
                                className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-[10px] font-bold cursor-pointer"
                              >
                                +20
                              </button>
                              {isLow && (
                                <span
                                  className="text-amber-400 flex items-center gap-0.5 text-[10px] font-bold"
                                  title="Estoque baixo"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                updateComplement(comp.id, { available: !comp.available })
                              }
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                                comp.available && comp.stock > 0
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {comp.available && comp.stock > 0 ? 'Disponível' : 'Esgotado'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: KANBAN DE PEDIDOS EM TEMPO REAL
           ===================================================================== */}
        {activeTab === 'kanban' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por código, cliente ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={() => {
                  setPosMode('balcao');
                  onClose();
                  setTimeout(() => {
                    document.getElementById('montar-copo')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>🛍️</span>
                <span>+ Tirar Pedido no Balcão (PDV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* COLUMN 1: NOVOS */}
              <div className="flex flex-col bg-zinc-900/60 border border-amber-500/20 rounded-3xl p-4 min-h-[480px]">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h3 className="text-sm font-bold text-white">Novos Pedidos</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
                    {newOrders.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {newOrders.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-10">Nenhum pedido novo</p>
                  ) : (
                    newOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-3 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-amber-300">{ord.code}</span>
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ord.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{ord.customer.name}</h4>
                          <div className="mt-1">
                            {ord.customer.orderType === 'balcao' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                🛍️ BALCÃO (PRESENCIAL)
                              </span>
                            ) : ord.customer.orderType === 'retirada' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                📦 RETIRADA
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                🛵 DELIVERY ({ord.customer.address?.neighborhood || 'Entrega'})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-zinc-950/60 text-xs space-y-1">
                          {ord.items.map((it, i) => (
                            <div key={i} className="flex justify-between text-zinc-300">
                              <span>
                                {it.quantity}x {it.size.volume}
                              </span>
                              <span className="text-zinc-500">{it.complements.length} compl.</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                          <span className="font-extrabold text-white tabular-nums">
                            R$ {ord.total.toFixed(2).replace('.', ',')}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedChatOrder(ord)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-300 hover:text-white cursor-pointer"
                              title="Chat com o Cliente"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedReceiptOrder(ord)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                              title="Imprimir Comanda"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onUpdateOrderStatus(ord.id, 'em_preparo')}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>Preparar</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 2: EM PREPARO */}
              <div className="flex flex-col bg-zinc-900/60 border border-blue-500/20 rounded-3xl p-4 min-h-[480px]">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white">Na Cozinha</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300">
                    {prepOrders.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {prepOrders.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-10">
                      Nenhum pedido em preparo
                    </p>
                  ) : (
                    prepOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-zinc-900 border border-blue-500/30 space-y-3 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-blue-300">{ord.code}</span>
                          <span className="text-[11px] text-zinc-400">
                            {new Date(ord.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{ord.customer.name}</h4>
                          <div className="mt-1">
                            {ord.customer.orderType === 'balcao' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                🛍️ BALCÃO
                              </span>
                            ) : ord.customer.orderType === 'retirada' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                📦 RETIRADA
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                🛵 DELIVERY
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-950/60 text-xs space-y-1">
                          {ord.items.map((it, i) => (
                            <div key={i} className="text-zinc-300">
                              <span className="font-semibold text-white">
                                {it.quantity}x Copo {it.size.volume}
                              </span>
                              <p className="text-[11px] text-zinc-400 truncate">
                                {it.complements.map((c) => c.name).join(', ')}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                          <span className="font-extrabold text-white">
                            R$ {ord.total.toFixed(2).replace('.', ',')}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedChatOrder(ord)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-300 hover:text-white cursor-pointer"
                              title="Chat com o Cliente"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedReceiptOrder(ord)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                              title="Imprimir Comanda"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                onUpdateOrderStatus(
                                  ord.id,
                                  ord.customer.orderType === 'balcao' ? 'entregue' : 'em_entrega'
                                )
                              }
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer ${
                                ord.customer.orderType === 'balcao'
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                              }`}
                            >
                              <span>{ord.customer.orderType === 'balcao' ? 'Entregar ao Cliente' : 'Despachar'}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 3: EM ENTREGA */}
              <div className="flex flex-col bg-zinc-900/60 border border-purple-500/20 rounded-3xl p-4 min-h-[480px]">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <h3 className="text-sm font-bold text-white">Saiu p/ Entrega</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300">
                    {deliveryOrders.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {deliveryOrders.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-10">Nenhum pedido em rota</p>
                  ) : (
                    deliveryOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-zinc-900 border border-purple-500/30 space-y-3 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-purple-300">{ord.code}</span>
                          {getPaymentIcon(ord.paymentMethod)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{ord.customer.name}</h4>
                          {ord.customer.address && (
                            <p className="text-xs text-zinc-400 truncate">
                              {ord.customer.address.street}, {ord.customer.address.number}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                          <span className="font-bold text-white">
                            R$ {ord.total.toFixed(2).replace('.', ',')}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedChatOrder(ord)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-300 hover:text-white cursor-pointer"
                              title="Chat com o Cliente"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onUpdateOrderStatus(ord.id, 'entregue')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Concluir</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 4: CONCLUÍDOS */}
              <div className="flex flex-col bg-zinc-900/60 border border-emerald-500/20 rounded-3xl p-4 min-h-[480px]">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Entregues / Balcão</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                    {doneOrders.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {doneOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2"
                    >
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-300">{ord.code}</span>
                          {ord.customer.orderType === 'balcao' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                              Balcão
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-emerald-400">
                          R$ {ord.total.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-zinc-400">
                        <span>{ord.customer.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedChatOrder(ord)}
                            className="text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" /> Chat
                          </button>
                          <button
                            onClick={() => setSelectedReceiptOrder(ord)}
                            className="text-zinc-300 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3 h-3" /> Recibo
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: CONFIGURAR PÁGINA & TAXAS DE ENTREGA
           ===================================================================== */}
        {activeTab === 'pagina' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Dados do Perfil da Loja (Estilo Página Social)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Altere as informações principais ou ative o modo visual na vitrine
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsEditMode(true);
                    onBackToStore();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 text-black font-black text-xs cursor-pointer"
                >
                  Ir para Edição Visual na Página
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Nome da Loja</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) => updateStoreSettings({ storeName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Slogan / Subtítulo</label>
                  <input
                    type="text"
                    value={storeSettings.tagline}
                    onChange={(e) => updateStoreSettings({ tagline: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">
                    WhatsApp de Pedidos (com DDD)
                  </label>
                  <input
                    type="text"
                    value={storeSettings.phone}
                    onChange={(e) => updateStoreSettings({ phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Chave PIX</label>
                  <input
                    type="text"
                    value={storeSettings.pixKey}
                    onChange={(e) => updateStoreSettings({ pixKey: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-emerald-300 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-zinc-400 font-semibold block mb-1">
                    Aviso / Promoção Fixada no Topo da Página
                  </label>
                  <input
                    type="text"
                    value={storeSettings.announcementBanner}
                    onChange={(e) => updateStoreSettings({ announcementBanner: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-zinc-400 font-semibold block mb-1">
                    Biografia / Apresentação da Loja
                  </label>
                  <textarea
                    rows={3}
                    value={storeSettings.bio}
                    onChange={(e) => updateStoreSettings({ bio: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                  />
                </div>

                {/* Chave de Impressão Automática de Comandas */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-purple-400" />
                      <span>Impressão Automática de Comandas</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Quando ativado, imprime o cupom imediatamente ao confirmar qualquer pedido (Delivery, Balcão ou Totem).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateStoreSettings({
                        autoPrintOrders: storeSettings.autoPrintOrders === false ? true : false,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border transition-all ${
                      storeSettings.autoPrintOrders !== false
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {storeSettings.autoPrintOrders !== false ? '✓ Impressão Automática Ativa' : '✕ Impressão Manual'}
                  </button>
                </div>

                {/* Banner de Capa da Loja */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Link (URL) do Banner de Capa da Loja</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditMode(true);
                        onBackToStore();
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                      }}
                      className="text-[11px] text-amber-300 hover:underline font-bold cursor-pointer"
                    >
                      Trocar Foto na Capa da Vitrine →
                    </button>
                  </div>
                  <input
                    type="text"
                    value={storeSettings.coverImageUrl}
                    onChange={(e) => updateStoreSettings({ coverImageUrl: e.target.value })}
                    placeholder="https://exemplo.com/banner.jpg ou /images/..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Chave de Ativar / Ocultar Seção de Combos */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Exibir Seção de Combos Prontos na Vitrine</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Desative caso sua loja trabalhe apenas com montagem personalizada de copos e não utilize combos fixos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateStoreSettings({
                        showCombosSection: !storeSettings.showCombosSection,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border transition-all ${
                      storeSettings.showCombosSection
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}
                  >
                    {storeSettings.showCombosSection ? '✓ Combos Ativados' : '✕ Combos Ocultados'}
                  </button>
                </div>
              </div>
            </div>

            {/* Taxas por Bairro */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <h3 className="text-base font-bold text-white">Taxas de Entrega por Bairro</h3>
              <div className="space-y-2.5">
                {neighborhoods.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <input
                      type="text"
                      value={n.name}
                      onChange={(e) => updateNeighborhood(n.id, { name: e.target.value })}
                      className="flex-1 bg-transparent font-bold text-white focus:outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500">R$</span>
                      <input
                        type="number"
                        step="0.50"
                        value={n.fee}
                        onChange={(e) =>
                          updateNeighborhood(n.id, {
                            fee: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 font-bold text-purple-300 text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: LANÇAR NOVA RECEITA OU DESPESA */}
        {showTxModal &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
              <div
                className="fixed inset-0 bg-black/85 backdrop-blur-md"
                onClick={() => setShowTxModal(false)}
              />
              <form
                onSubmit={handleAddTransaction}
                className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl my-auto"
              >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">
                  {txType === 'receita' ? 'Registrar Nova Entrada / Receita' : 'Lançar Despesa / Custo'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('receita');
                    setTxCategory('vendas');
                  }}
                  className={`py-2.5 rounded-xl font-bold text-xs cursor-pointer border ${
                    txType === 'receita'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  + Entrada (Receita)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('despesa');
                    setTxCategory('insumos_acai');
                  }}
                  className={`py-2.5 rounded-xl font-bold text-xs cursor-pointer border ${
                    txType === 'despesa'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  - Saída (Despesa)
                </button>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    txType === 'despesa'
                      ? 'Ex: Compra de 3 caixas de Açaí, Diária Motoboy...'
                      : 'Ex: Venda direta balcão, Evento...'
                  }
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Categoria
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Meio de Pagamento
                  </label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Status
                  </label>
                  <select
                    value={txStatus}
                    onChange={(e) => setTxStatus(e.target.value as 'pago' | 'pendente')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  >
                    <option value="pago">Pago / Liquidado</option>
                    <option value="pendente">Pendente (A Pagar)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black cursor-pointer"
                >
                  Salvar no Caixa
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

        {/* PRINTABLE RECEIPT MODAL */}
        <AnimatePresence>
          {selectedReceiptOrder &&
            createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div
                  className="fixed inset-0 bg-black/85 backdrop-blur-md"
                  onClick={() => setSelectedReceiptOrder(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-md bg-white text-zinc-900 rounded-3xl p-6 shadow-2xl z-10 font-mono text-xs border border-zinc-300 my-auto"
                >
                <button
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center pb-4 border-b border-dashed border-zinc-300">
                  <h3 className="text-lg font-black tracking-tight text-zinc-900">
                    {storeSettings.storeName}
                  </h3>
                  <p className="text-[11px] text-zinc-600">Comanda de Produção & Entrega</p>
                  <p className="font-bold text-sm text-purple-900 mt-1">
                    {selectedReceiptOrder.code}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {new Date(selectedReceiptOrder.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="py-3 border-b border-dashed border-zinc-300 space-y-1">
                  <p>
                    <strong>Cliente:</strong> {selectedReceiptOrder.customer.name}
                  </p>
                  <p>
                    <strong>Tel:</strong> {selectedReceiptOrder.customer.phone}
                  </p>
                  <p>
                    <strong>Modalidade:</strong>{' '}
                    {selectedReceiptOrder.customer.orderType === 'balcao'
                      ? '🛍️ VENDA BALCÃO (PRESENCIAL)'
                      : selectedReceiptOrder.customer.orderType === 'delivery'
                      ? '🛵 ENTREGA DELIVERY'
                      : '📦 RETIRADA'}
                  </p>
                  {selectedReceiptOrder.customer.address && (
                    <div className="mt-1 pt-1 border-t border-zinc-200 text-[11px]">
                      <p>
                        <strong>Endereço:</strong> {selectedReceiptOrder.customer.address.street},{' '}
                        {selectedReceiptOrder.customer.address.number}
                      </p>
                      <p>
                        <strong>Bairro:</strong>{' '}
                        {selectedReceiptOrder.customer.address.neighborhood}
                      </p>
                    </div>
                  )}
                </div>

                <div className="py-3 border-b border-dashed border-zinc-300 space-y-2">
                  <p className="font-bold uppercase tracking-wider text-[11px]">Itens:</p>
                  {selectedReceiptOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="space-y-1 bg-zinc-50 p-2 rounded border border-zinc-200"
                    >
                      <div className="flex justify-between font-bold text-zinc-900">
                        <span>
                          {item.quantity}x Copo {item.size.volume}
                        </span>
                        <span>
                          R$ {(item.itemPrice * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-700">Base: {item.base.name}</p>
                      <p className="text-[11px] text-zinc-600">
                        + {item.complements.map((c) => c.name).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="py-3 space-y-1 text-sm">
                  <div className="flex justify-between font-black text-base pt-1">
                    <span>TOTAL:</span>
                    <span>R$ {selectedReceiptOrder.total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      if (selectedReceiptOrder) {
                        printOrderReceipt(selectedReceiptOrder, storeSettings);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-sans font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Comanda</span>
                  </button>
                </div>
              </motion.div>
            </div>,
            document.body
          )}
        </AnimatePresence>

        {/* ORDER CHAT MODAL DO LOJISTA */}
        {selectedChatOrder && (
          <OrderChatModal
            order={selectedChatOrder}
            isOpen={!!selectedChatOrder}
            onClose={() => setSelectedChatOrder(null)}
            currentUserRole="lojista"
            senderName={currentUser?.name || 'Equipe da Loja'}
          />
        )}
      </div>
    </div>
  );
};
