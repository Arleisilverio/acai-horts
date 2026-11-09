import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Plus,
  Minus,
  QrCode,
  CreditCard,
  Printer,
  X,
  ChevronLeft,
  Volume2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { InteractiveCup } from './InteractiveCup';
import {
  CupSize,
  BaseOption,
  Complement,
  ComplementCategory,
  CustomAcaiItem,
  Order,
} from '../types';
import { printOrderReceipt } from '../utils/printReceipt';
import { supabase } from '../lib/supabase';

interface TotemViewProps {
  onExitTotem: () => void;
  onOrderCompleted?: (order: Order) => void;
}

const CATEGORIES: { id: ComplementCategory; label: string; icon: string }[] = [
  { id: 'frutas', label: 'Frutas Frescas', icon: '🍓' },
  { id: 'cremes', label: 'Cremes & Mousses', icon: '🥛' },
  { id: 'crocantes', label: 'Crocantes & Grãos', icon: '🥜' },
  { id: 'coberturas', label: 'Caldas & Coberturas', icon: '🍯' },
];

export const TotemView: React.FC<TotemViewProps> = ({ onExitTotem, onOrderCompleted }) => {
  const {
    storeSettings,
    cupSizes,
    baseOptions,
    complements,
    deductStockForOrder,
    addTransaction,
  } = useStore();

  // Estados da montagem no Totem
  const [selectedSizeId, setSelectedSizeId] = useState<string>(
    cupSizes[1]?.id || cupSizes[0]?.id || '500ml'
  );
  const [selectedBaseId, setSelectedBaseId] = useState<string>(
    baseOptions[0]?.id || 'tradicional'
  );
  const [selectedComplementIds, setSelectedComplementIds] = useState<string[]>([
    'fruta_morango',
    'creme_ninho',
    'croc_granola',
  ]);
  const [activeCategory, setActiveCategory] = useState<ComplementCategory>('frutas');

  // Estados do Checkout Totem
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao_credito' | 'cartao_debito'>('pix');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [countdown, setCountdown] = useState<number>(12);

  // Computados
  const selectedSize = cupSizes.find((s) => s.id === selectedSizeId) || cupSizes[0];
  const selectedBase = baseOptions.find((b) => b.id === selectedBaseId) || baseOptions[0];
  const selectedComplements = complements.filter((c) => selectedComplementIds.includes(c.id));

  const complementsPrice = selectedComplements.reduce((sum, c) => sum + (c.price || 0), 0);
  const unitPrice = (selectedSize?.basePrice || 0) + (selectedBase?.extraPrice || 0) + complementsPrice;

  const currentItem: CustomAcaiItem = {
    id: `totem_item_${Date.now()}`,
    size: selectedSize,
    base: selectedBase,
    complements: selectedComplements,
    quantity: 1,
    itemPrice: unitPrice,
  };

  const toggleComplement = (id: string) => {
    setSelectedComplementIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Timer para reiniciar o totem após pedido confirmado
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirmedOrder) {
      setCountdown(12);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleResetTotem();
            return 12;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [confirmedOrder]);

  const handleResetTotem = () => {
    setConfirmedOrder(null);
    setIsCheckoutOpen(false);
    setCustomerName('');
    setSelectedComplementIds(['fruta_morango', 'creme_ninho', 'croc_granola']);
    setSelectedSizeId(cupSizes[1]?.id || cupSizes[0]?.id || '500ml');
  };

  const handleFinishTotemOrder = async () => {
    const orderNumber = Math.floor(100 + Math.random() * 900);
    const orderCode = `#TOTEM-${orderNumber}`;
    const newOrder: Order = {
      id: `ord_totem_${Date.now()}`,
      code: orderCode,
      createdAt: new Date().toISOString(),
      isTotem: true,
      totemPassword: `${orderNumber}`,
      customer: {
        name: customerName.trim() || `Cliente Totem #${orderNumber}`,
        phone: 'Totem Presencial',
        orderType: 'balcao',
      },
      items: [currentItem],
      subtotal: unitPrice,
      deliveryFee: 0,
      total: unitPrice,
      paymentMethod,
      status: 'em_preparo', // Já vai direto para a cozinha preparar!
    };

    // Baixa estoque
    deductStockForOrder([currentItem]);

    // Registra entrada no financeiro / caixa da loja
    addTransaction({
      description: `Venda Totem (${orderCode}) - ${newOrder.customer.name}`,
      amount: unitPrice,
      type: 'receita',
      category: 'vendas',
      date: new Date().toISOString(),
      paymentMethod,
      status: 'pago',
      orderId: newOrder.id,
    });

    // Salva no Supabase se conectado
    if (supabase) {
      try {
        await supabase.from('acai_orders').insert({
          id: newOrder.id,
          code: newOrder.code,
          customer: newOrder.customer,
          items: newOrder.items,
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.deliveryFee,
          total: newOrder.total,
          payment_method: newOrder.paymentMethod,
          status: 'em_preparo',
        });
      } catch (e) {
        console.warn('Erro ao salvar pedido do totem no Supabase:', e);
      }
    }

    if (onOrderCompleted) {
      onOrderCompleted(newOrder);
    }

    setConfirmedOrder(newOrder);

    // Se autoPrintOrders estiver ativo ou se o lojista tiver impressora, já imprime automático!
    if (storeSettings.autoPrintOrders !== false) {
      setTimeout(() => {
        printOrderReceipt(newOrder, storeSettings);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col select-none overflow-x-hidden font-sans">
      {/* CABEÇALHO DO TOTEM */}
      <header className="bg-zinc-900/90 border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-fuchsia-600 flex items-center justify-center text-white text-2xl shadow-md overflow-hidden">
            {storeSettings.logoImageUrl ? (
              <img
                src={storeSettings.logoImageUrl}
                alt={storeSettings.storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{storeSettings.logoEmoji || '🍇'}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{storeSettings.storeName}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-black">
                🖥️ TOTEM DE AUTOATENDIMENTO
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Monte seu açaí na tela com toque e retire seu pedido fresquinho no balcão!
            </p>
          </div>
        </div>

        {/* Botão administrativo para funcionários saírem do Totem */}
        <button
          type="button"
          onClick={() => {
            if (confirm('Deseja sair do modo Totem de Autoatendimento?')) {
              onExitTotem();
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-zinc-700"
        >
          <span>Sair do Totem</span>
        </button>
      </header>

      {/* CORPO DO TOTEM: MONTAGEM DO COPO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
        {/* COLUNA ESQUERDA: COPO INTERATIVO EM TEMPO REAL */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl relative">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seu Copo em Tempo Real</span>
          </div>

          <div className="my-6 scale-110">
            {selectedSize && selectedBase && (
              <InteractiveCup
                size={selectedSize}
                base={selectedBase}
                complements={selectedComplements}
                onRemoveComplement={(id) => toggleComplement(id)}
                onClearAll={() => setSelectedComplementIds([])}
              />
            )}
          </div>

          <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 text-center space-y-1">
            <div className="text-xs text-zinc-400">Total do Copo</div>
            <div className="text-3xl font-black text-amber-400 tabular-nums">
              R$ {unitPrice.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-[11px] text-zinc-500">
              {selectedSize.volume} · {selectedBase.name} · {selectedComplements.length} adicionais
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: SELETOR DE TAMANHOS, BASES E COMPLEMENTOS TOUCH-FRIENDLY */}
        <div className="lg:col-span-7 space-y-6">
          {/* PASSO 1: ESCOLHA O TAMANHO */}
          <div className="space-y-2.5">
            <label className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs">
                1
              </span>
              <span>Escolha o Tamanho do Copo:</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {cupSizes.map((size) => {
                const isSelected = size.id === selectedSizeId;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 ring-2 ring-purple-500/50 shadow-lg shadow-purple-900/30 scale-102'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xl font-black text-white">{size.volume}</span>
                    <span className="text-sm font-extrabold text-purple-300">
                      R$ {size.basePrice.toFixed(2).replace('.', ',')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASSO 2: ESCOLHA A BASE */}
          <div className="space-y-2.5">
            <label className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs">
                2
              </span>
              <span>Escolha a Base de Açaí:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {baseOptions.map((base) => {
                const isSelected = base.id === selectedBaseId;
                return (
                  <button
                    key={base.id}
                    type="button"
                    onClick={() => setSelectedBaseId(base.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 ring-2 ring-purple-500/50'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{base.name}</span>
                    <span className="text-[11px] text-zinc-400">
                      {base.extraPrice && base.extraPrice > 0 ? `+ R$ ${base.extraPrice.toFixed(2)}` : 'Incluso'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASSO 3: COMPLEMENTOS COM CATEGORIAS EM ABAS TOUCH */}
          <div className="space-y-3">
            <label className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs">
                3
              </span>
              <span>Toque nos Adicionais para Colocar no Copo:</span>
            </label>

            {/* Abas de Categorias */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer border ${
                    activeCategory === cat.id
                      ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Grid de Itens da Categoria */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {complements
                .filter((c) => c.category === activeCategory)
                .map((comp) => {
                  const isAdded = selectedComplementIds.includes(comp.id);
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => toggleComplement(comp.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-purple-600/30 border-purple-400 ring-2 ring-purple-400/40 shadow-md'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{comp.iconEmoji || '✨'}</span>
                          <span className="text-xs font-bold text-white leading-tight">
                            {comp.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-purple-300 block">
                          {comp.price > 0
                            ? `+ R$ ${comp.price.toFixed(2).replace('.', ',')}`
                            : 'Grátis'}
                        </span>
                      </div>

                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isAdded
                            ? 'bg-purple-500 text-white'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isAdded ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </main>

      {/* BARRA FIXA INFERIOR DO TOTEM */}
      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 border-t border-zinc-800 p-4 sm:p-5 backdrop-blur-lg z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Valor Total a Pagar</span>
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
              R$ {unitPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="px-8 sm:px-12 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-black font-black text-base sm:text-lg flex items-center gap-3 shadow-xl shadow-amber-500/20 cursor-pointer transition transform hover:scale-102 active:scale-98"
          >
            <span>🛍️ FINALIZAR MEU PEDIDO</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </footer>

      {/* MODAL DE CHECKOUT & PAGAMENTO DO TOTEM */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => !confirmedOrder && setIsCheckoutOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-auto text-white overflow-hidden"
            >
              {!confirmedOrder ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <div>
                      <h2 className="text-xl font-black text-white">Pagamento no Totem</h2>
                      <p className="text-xs text-zinc-400">
                        Insira seu nome para ser chamado e escolha a forma de pagamento.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Nome do Cliente */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      Qual é o seu nome? (Para chamarmos no balcão)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: João, Mariana, Mesa 2..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Opção de Pagamento */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      Forma de Pagamento:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                          paymentMethod === 'pix'
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-extrabold ring-2 ring-amber-400/40'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                        }`}
                      >
                        <QrCode className="w-7 h-7" />
                        <span className="text-sm">PIX Instantâneo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cartao_credito')}
                        className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                          paymentMethod !== 'pix'
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-extrabold ring-2 ring-purple-500/40'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                        }`}
                      >
                        <CreditCard className="w-7 h-7" />
                        <span className="text-sm">Cartão (Maquininha)</span>
                      </button>
                    </div>

                    {paymentMethod === 'pix' && (
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
                        <div className="text-xs text-zinc-400">Chave PIX da Loja:</div>
                        <div className="text-sm font-mono font-bold text-amber-300 bg-black/60 px-3 py-2 rounded-xl border border-zinc-800">
                          {storeSettings.pixKey || 'pix@acaiexpress.com.br'}
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          Abra o app do seu banco, faça o pagamento do valor de R${' '}
                          {unitPrice.toFixed(2).replace('.', ',')} e clique em confirmar abaixo!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Resumo e Botão de Confirmação */}
                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-zinc-400">Total a pagar:</span>
                      <span className="text-2xl font-black text-amber-400 block">
                        R$ {unitPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleFinishTotemOrder}
                      className="px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm flex items-center gap-2 cursor-pointer shadow-xl shadow-amber-500/20"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirmar & Mandar p/ Cozinha</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* TELA DE SUCESSO DO TOTEM COM SENHA EM DESTAQUE */
                <div className="py-8 flex flex-col items-center text-center space-y-5">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      Pedido Enviado para a Cozinha!
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Sua comanda foi gerada e a cozinha já começou o preparo do seu copo!
                    </p>
                  </div>

                  {/* NÚMERO DA SENHA EM DESTAQUE GIGANTE */}
                  <div className="p-6 rounded-3xl bg-zinc-900 border-2 border-amber-400/50 w-full max-w-sm space-y-2 shadow-2xl">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">
                      Sua Senha de Retirada
                    </span>
                    <div className="text-5xl font-black text-amber-300 tracking-tight">
                      {confirmedOrder.code}
                    </div>
                    <div className="text-xs font-semibold text-zinc-300">
                      Cliente: {confirmedOrder.customer.name}
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-purple-400" />
                    <span>
                      {storeSettings.autoPrintOrders !== false
                        ? 'Comanda impressa automaticamente na impressora da cozinha.'
                        : 'Comanda salva no sistema do caixa.'}
                    </span>
                  </div>

                  {/* Botões de Ação & Timer de Retorno */}
                  <div className="w-full max-w-sm pt-4 space-y-3">
                    <button
                      type="button"
                      onClick={handleResetTotem}
                      className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Fazer Novo Pedido no Totem</span>
                    </button>

                    <p className="text-xs text-zinc-500">
                      Esta tela reiniciará automaticamente em{' '}
                      <span className="text-amber-400 font-bold">{countdown} segundos</span> para o
                      próximo cliente.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};