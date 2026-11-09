import React from 'react';
import { CustomAcaiItem } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CustomAcaiItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
}) => {
  const { posMode, setPosMode } = useStore();
  const { isStoreStaff } = useAuth();
  const subtotal = items.reduce((acc, item) => acc + item.itemPrice * item.quantity, 0);
  const totalCups = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {posMode === 'balcao' && isStoreStaff ? 'Atendimento Balcão (PDV)' : 'Sua Sacola de Açaí'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {totalCups === 0 ? 'Nenhum item' : `${totalCups} ${totalCups === 1 ? 'copo' : 'copos'} no pedido`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Seletor Rápido de Modalidade para Equipe da Loja */}
              {isStoreStaff && (
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPosMode('balcao')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      posMode === 'balcao'
                        ? 'bg-amber-400 text-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Balcão / Loja</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosMode('delivery')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      posMode === 'delivery'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Delivery</span>
                  </button>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800 text-purple-400">
                    <ShoppingBag className="w-8 h-8 opacity-60" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">Sua sacola está vazia</h4>
                  <p className="text-xs text-zinc-400 max-w-[220px] mb-6">
                    Personalize seu copo com açaí e complementos para começar o seu pedido.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
                  >
                    Montar meu Açaí Agora
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                            {item.size.volume}
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {item.base.name}
                          </h4>
                        </div>
                        
                        {/* Complements tags */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.complements.map((c) => (
                            <span
                              key={c.id}
                              className="text-[11px] text-zinc-300 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700/60 inline-flex items-center gap-1"
                            >
                              <span>{c.iconEmoji}</span>
                              <span>{c.name}</span>
                            </span>
                          ))}
                        </div>

                        {item.notes && (
                          <p className="mt-2 text-xs text-amber-300/90 italic bg-amber-950/20 p-1.5 rounded-lg border border-amber-900/30">
                            Obs: &ldquo;{item.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Pricing and Stepper */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-xl border border-zinc-800">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-white px-1 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-zinc-400 block">Subtotal</span>
                        <span className="text-sm font-bold text-purple-300 tabular-nums">
                          R$ {(item.itemPrice * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer with Checkout CTA */}
            {items.length > 0 && (
              <div className="p-5 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-zinc-400">Total a pagar:</span>
                  <span className="text-xl font-extrabold text-white tabular-nums">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCheckout();
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black text-sm shadow-xl transition-all cursor-pointer ${
                    posMode === 'balcao' && isStoreStaff
                      ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20 ring-2 ring-amber-400/50'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-950/50'
                  }`}
                >
                  {posMode === 'balcao' && isStoreStaff ? (
                    <>
                      <Store className="w-4 h-4 stroke-[2.5]" />
                      <span>Concluir Venda no Balcão (PDV)</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar para Entrega / Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-zinc-500 text-center mt-2">
                  {posMode === 'balcao' && isStoreStaff
                    ? 'Sem frete · Emissão de comanda para a cozinha e baixa no estoque'
                    : 'Taxa de entrega calculada no próximo passo'}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
