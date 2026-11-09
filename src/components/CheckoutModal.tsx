import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CustomAcaiItem, Order, OrderType, PaymentMethod } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { AuthModal } from './AuthModal';
import { OrderChatModal } from './OrderChatModal';
import { printOrderReceipt } from '../utils/printReceipt';
import {
  X,
  Bike,
  Store,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  MessageSquare,
  Copy,
  Check,
  User,
  LogIn,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CustomAcaiItem[];
  onOrderCompleted: (newOrder: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
}) => {
  const {
    neighborhoods,
    storeSettings,
    deductStockForOrder,
    posMode,
    addTransaction,
    getOrderMessagesCount,
  } = useStore();
  const { currentUser, isStoreStaff } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const [orderType, setOrderType] = useState<OrderType>(
    isStoreStaff && posMode === 'balcao' ? 'balcao' : 'delivery'
  );
  const [name, setName] = useState(
    isStoreStaff && posMode === 'balcao' ? 'Cliente Balcão' : currentUser?.name || ''
  );
  const [phone, setPhone] = useState(
    isStoreStaff && posMode === 'balcao' ? '' : currentUser?.phone || ''
  );
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState(
    neighborhoods[0]?.id || 'centro'
  );
  const [street, setStreet] = useState(currentUser?.defaultAddress?.street || '');
  const [number, setNumber] = useState(currentUser?.defaultAddress?.number || '');
  const [reference, setReference] = useState(currentUser?.defaultAddress?.reference || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync if posMode changes
  useEffect(() => {
    if (isOpen) {
      if (isStoreStaff && posMode === 'balcao') {
        setOrderType('balcao');
        if (!name) setName('Cliente Balcão');
      } else if (!isStoreStaff) {
        setOrderType('delivery');
      }
    }
  }, [isOpen, posMode, isStoreStaff]);

  // Sync user details if user logs in
  useEffect(() => {
    if (currentUser && !isStoreStaff) {
      setName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.defaultAddress) {
        setStreet(currentUser.defaultAddress.street);
        setNumber(currentUser.defaultAddress.number);
        if (currentUser.defaultAddress.reference) {
          setReference(currentUser.defaultAddress.reference);
        }
      }
    }
  }, [currentUser, isStoreStaff]);

  useEffect(() => {
    if (
      neighborhoods.length > 0 &&
      !neighborhoods.some((n) => n.id === selectedNeighborhoodId)
    ) {
      setSelectedNeighborhoodId(neighborhoods[0].id);
    }
  }, [neighborhoods, selectedNeighborhoodId]);

  const subtotal = items.reduce((acc, item) => acc + item.itemPrice * item.quantity, 0);

  const selectedNeighborhood =
    neighborhoods.find((n) => n.id === selectedNeighborhoodId) ||
    neighborhoods[0] || {
      id: 'centro',
      name: 'Centro',
      fee: 5.0,
      estimatedMinutes: '25-35 min',
    };
  const deliveryFee = orderType === 'delivery' ? selectedNeighborhood.fee : 0;
  const total = subtotal + deliveryFee;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(storeSettings.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const isBalcao = orderType === 'balcao';

    if (!currentUser && !isBalcao) {
      setShowAuthModal(true);
      return;
    }

    const customerName = name.trim() || (isBalcao ? 'Cliente Balcão' : '');
    const customerPhone = phone.trim() || (isBalcao ? '(Atendimento Balcão)' : '');

    if (!customerName) {
      alert('Por favor, informe a identificação do cliente.');
      return;
    }
    if (!isBalcao && !customerPhone) {
      alert('Por favor, informe seu telefone / WhatsApp.');
      return;
    }
    if (orderType === 'delivery' && (!street.trim() || !number.trim())) {
      alert('Por favor, preencha a rua e o número para a entrega.');
      return;
    }

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      code: `#ACAI-${orderNumber}`,
      createdAt: new Date().toISOString(),
      customerId: currentUser?.id || 'balcao_presencial',
      customer: {
        name: customerName,
        phone: customerPhone,
        email: currentUser?.email || 'balcao@loja.local',
        orderType,
        address:
          orderType === 'delivery'
            ? {
                street: street.trim(),
                number: number.trim(),
                neighborhood: selectedNeighborhood.name,
                reference: reference.trim(),
              }
            : undefined,
      },
      items: [...items],
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      changeFor:
        paymentMethod === 'dinheiro' && changeFor ? parseFloat(changeFor) : undefined,
      status: 'novo',
    };

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    deductStockForOrder(items);
    onOrderCompleted(newOrder);
    setConfirmedOrder(newOrder);

    // Registra entrada no financeiro / caixa da loja
    addTransaction({
      description: `Venda ${newOrder.customer.orderType === 'balcao' ? 'Balcão' : 'Delivery'} (${newOrder.code}) - ${newOrder.customer.name}`,
      amount: newOrder.total,
      type: 'receita',
      category: 'vendas',
      date: new Date().toISOString(),
      paymentMethod: newOrder.paymentMethod,
      status: 'pago',
      orderId: newOrder.id,
    });

    // Se houver impressora conectada ou autoPrint ativo, imprime comanda automaticamente
    if (storeSettings.autoPrintOrders !== false) {
      setTimeout(() => {
        printOrderReceipt(newOrder, storeSettings);
      }, 400);
    }

    // Salvar pedido na nuvem com segurança se o banco estiver conectado
    if (supabase) {
      supabase
        .from('acai_orders')
        .insert({
          id: newOrder.id,
          code: newOrder.code,
          customer: newOrder.customer,
          items: newOrder.items,
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.deliveryFee,
          total: newOrder.total,
          payment_method: newOrder.paymentMethod,
          change_for: newOrder.changeFor,
          status: 'novo',
        })
        .then();
    }

    // Build WhatsApp message
    let message = `*NOVO PEDIDO ${newOrder.code} - ${storeSettings.storeName}*\n\n`;
    message += `*Cliente:* ${newOrder.customer.name} (Cadastrado)\n`;
    message += `*WhatsApp:* ${newOrder.customer.phone}\n`;
    message += `*Tipo:* ${
      orderType === 'delivery' ? '🛵 ENTREGA DELIVERY' : '🛍️ RETIRADA NO BALCÃO'
    }\n`;

    if (orderType === 'delivery' && newOrder.customer.address) {
      message += `*Endereço:* ${newOrder.customer.address.street}, ${newOrder.customer.address.number}\n`;
      message += `*Bairro:* ${newOrder.customer.address.neighborhood}\n`;
      if (newOrder.customer.address.reference) {
        message += `*Ref:* ${newOrder.customer.address.reference}\n`;
      }
    }

    message += `\n*ITENS DO PEDIDO:*\n`;
    newOrder.items.forEach((item, idx) => {
      message += `\n${idx + 1}. *Copo ${item.size.volume}* (${item.base.name})\n`;
      message += `   Qtd: ${item.quantity}x - R$ ${(item.itemPrice * item.quantity)
        .toFixed(2)
        .replace('.', ',')}\n`;
      message += `   Complementos: ${item.complements.map((c) => c.name).join(', ')}\n`;
      if (item.notes) {
        message += `   Obs: ${item.notes}\n`;
      }
    });

    message += `\n*RESUMO DE VALORES:*\n`;
    message += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (orderType === 'delivery') {
      message += `Taxa de Entrega (${selectedNeighborhood.name}): R$ ${deliveryFee
        .toFixed(2)
        .replace('.', ',')}\n`;
    }
    message += `*TOTAL A PAGAR:* R$ ${total.toFixed(2).replace('.', ',')}\n`;
    message += `*Forma de Pagamento:* ${
      paymentMethod === 'pix'
        ? 'PIX'
        : paymentMethod === 'cartao_credito'
        ? 'Cartão de Crédito'
        : paymentMethod === 'cartao_debito'
        ? 'Cartão de Débito'
        : `Dinheiro ${changeFor ? `(Troco p/ R$ ${changeFor})` : ''}`
    }\n\n`;
    message += `_Por favor, confirme o recebimento deste pedido!_`;

    if (orderType !== 'balcao') {
      const encoded = encodeURIComponent(message);
      const cleanPhone = storeSettings.phone.replace(/\D/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 600);
    }
  };

  const handleResetModal = () => {
    setConfirmedOrder(null);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-auto max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedOrder ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-white">
              {confirmedOrder.customer.orderType === 'balcao'
                ? 'Venda no Balcão Concluída!'
                : 'Pedido Enviado com Sucesso!'}
            </h3>
            <p className="text-sm text-zinc-400 mt-2 max-w-md">
              {confirmedOrder.customer.orderType === 'balcao' ? (
                <>
                  Comanda <span className="text-amber-300 font-bold">{confirmedOrder.code}</span> gerada e enviada para a linha de preparo.
                </>
              ) : (
                <>
                  Seu pedido <span className="text-purple-300 font-bold">{confirmedOrder.code}</span> foi
                  registrado e enviado para o WhatsApp do restaurante.
                </>
              )}
            </p>

            <div className="mt-6 w-full max-w-md p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-left text-sm space-y-3">
              <div className="flex justify-between border-b border-zinc-800 pb-3">
                <span className="text-zinc-400">Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {confirmedOrder.customer.orderType === 'balcao' ? 'Em Produção (Balcão)' : 'Aguardando Confirmação'}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Cliente / Mesa</span>
                <span className="text-white font-medium">{confirmedOrder.customer.name}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Modalidade</span>
                <span className="text-white font-medium">
                  {confirmedOrder.customer.orderType === 'balcao'
                    ? '🛍️ Consumo no Balcão / Loja'
                    : confirmedOrder.customer.orderType === 'delivery'
                    ? '🛵 Entrega em domicílio'
                    : '🏬 Retirada na loja'}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold text-base">
                <span className="text-white">Total a pagar</span>
                <span className="text-purple-300 tabular-nums">
                  R$ {confirmedOrder.total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 w-full max-w-md">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowChatModal(true)}
                  className="flex-1 py-3 px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950/40 relative"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>💬 Chat com a Loja</span>
                  {confirmedOrder && getOrderMessagesCount(confirmedOrder.id) > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white animate-pulse">
                      {getOrderMessagesCount(confirmedOrder.id)}
                    </span>
                  )}
                </button>

                {confirmedOrder.customer.orderType === 'balcao' && (
                  <button
                    type="button"
                    onClick={() => printOrderReceipt(confirmedOrder, storeSettings)}
                    className="flex-1 py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>🖨️ Imprimir Comanda</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleResetModal}
                className="w-full py-3 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                {confirmedOrder.customer.orderType === 'balcao'
                  ? '+ Novo Atendimento Balcão'
                  : 'Voltar para a Loja'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-white">
                {orderType === 'balcao' ? 'Pedido no Balcão (PDV Loja)' : 'Finalizar Pedido'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {orderType === 'balcao'
                  ? 'Atendimento presencial rápido sem frete. Emissão direta de comanda para a cozinha.'
                  : 'Conecte seu cadastro para salvar seu endereço e agilizar entregas futuras.'}
              </p>
            </div>

            {/* Banner de Cadastro / Login do Cliente (Exibido apenas se Delivery e não conectado) */}
            {!currentUser && orderType !== 'balcao' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/50 via-zinc-900 to-purple-950/50 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Identifique-se para continuar o pedido
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Clientes cadastrados salvam endereços e acompanham status.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar / Cadastrar-se</span>
                </button>
              </div>
            )}

            {/* Modalidade de Atendimento: Balcão vs Delivery vs Retirada */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Como será o pedido?
              </label>
              {isStoreStaff ? (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('balcao')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all cursor-pointer ${
                      orderType === 'balcao'
                        ? 'bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>🛍️ Balcão / Mesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all cursor-pointer ${
                      orderType === 'delivery'
                        ? 'bg-purple-950/50 border-purple-500 text-white ring-2 ring-purple-500/30'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Bike className="w-4 h-4 text-purple-400" />
                    <span>🛵 Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('retirada')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all cursor-pointer ${
                      orderType === 'retirada'
                        ? 'bg-purple-950/50 border-purple-500 text-white ring-2 ring-purple-500/30'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Store className="w-4 h-4 text-purple-400" />
                    <span>🏬 Retirada</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 font-bold text-sm transition-all cursor-pointer ${
                      orderType === 'delivery'
                        ? 'bg-purple-950/50 border-purple-500 text-white ring-2 ring-purple-500/30'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Bike className="w-5 h-5 text-purple-400" />
                    <span>Entrega Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('retirada')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 font-bold text-sm transition-all cursor-pointer ${
                      orderType === 'retirada'
                        ? 'bg-purple-950/50 border-purple-500 text-white ring-2 ring-purple-500/30'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Store className="w-5 h-5 text-purple-400" />
                    <span>Retirada na Loja</span>
                  </button>
                </div>
              )}
            </div>

            {/* Customer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {orderType === 'balcao' ? 'Identificação do Cliente ou Mesa / Comanda *' : 'Seu Nome *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={orderType === 'balcao' ? 'Ex: Mesa 03, Carlos Balcão...' : 'Ex: João da Silva'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {orderType === 'balcao' ? 'WhatsApp (Opcional no Balcão)' : 'WhatsApp com DDD *'}
                </label>
                <input
                  type="tel"
                  required={orderType !== 'balcao'}
                  placeholder="Ex: (11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Address fields if Delivery */}
            {orderType === 'delivery' && (
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Endereço de Entrega
                  </h4>
                  <span className="text-xs text-purple-300">
                    Taxa: R$ {deliveryFee.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Bairro (para cálculo da taxa)
                  </label>
                  <select
                    value={selectedNeighborhoodId}
                    onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {neighborhoods.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} — Taxa: R$ {n.fee.toFixed(2).replace('.', ',')} (
                        {n.estimatedMinutes})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Rua / Avenida *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rua das Palmeiras"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 342"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Complemento / Ponto de Referência (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Apto 12, Bloco B ou Próximo à padaria"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'bg-purple-950/50 border-purple-500 text-white ring-1 ring-purple-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PIX (Instantâneo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao_credito')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'cartao_credito' || paymentMethod === 'cartao_debito'
                      ? 'bg-purple-950/50 border-purple-500 text-white ring-1 ring-purple-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Cartão na Entrega</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'dinheiro'
                      ? 'bg-purple-950/50 border-purple-500 text-white ring-1 ring-purple-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Dinheiro Físico</span>
                </button>
              </div>

              {paymentMethod === 'pix' && (
                <div className="mt-3 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-400 block">
                      Chave PIX da Açaíteria:
                    </span>
                    <span className="text-zinc-300 font-mono">{storeSettings.pixKey}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40 font-semibold cursor-pointer"
                  >
                    {copiedPix ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar Chave'}</span>
                  </button>
                </div>
              )}

              {paymentMethod === 'dinheiro' && (
                <div className="mt-3 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                  <label className="text-xs text-zinc-300 whitespace-nowrap">
                    Precisa de troco para quanto?
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 50,00"
                    value={changeFor}
                    onChange={(e) => setChangeFor(e.target.value)}
                    className="w-32 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Price breakdown and submit */}
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Subtotal ({items.length} itens):</span>
                <span className="tabular-nums">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Taxa de entrega:</span>
                <span className="tabular-nums">
                  {orderType === 'delivery'
                    ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`
                    : orderType === 'balcao'
                    ? 'R$ 0,00 (Venda no Balcão)'
                    : 'Grátis (Retirada)'}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-zinc-800/60">
                <span>Total a pagar:</span>
                <span className="text-purple-300 text-xl tabular-nums">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-black text-base shadow-xl transition-all cursor-pointer ${
                orderType === 'balcao'
                  ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20 ring-2 ring-amber-400/50'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
              }`}
            >
              {orderType === 'balcao' ? (
                <>
                  <Store className="w-5 h-5 stroke-[2.5]" />
                  <span>Concluir Venda no Balcão & Gerar Comanda</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  <span>Confirmar Pedido & Enviar no WhatsApp</span>
                </>
              )}
            </button>
          </form>
        )}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="register_customer"
        />

        {/* Modal do Chat do Pedido para o Cliente */}
        {confirmedOrder && (
          <OrderChatModal
            order={confirmedOrder}
            isOpen={showChatModal}
            onClose={() => setShowChatModal(false)}
            currentUserRole="cliente"
            senderName={confirmedOrder.customer.name || 'Cliente'}
          />
        )}
      </motion.div>
    </div>,
    document.body
  );
};