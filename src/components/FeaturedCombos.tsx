import React, { useState } from 'react';
import { CustomAcaiItem, ComboItem, Complement } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Minus, Flame, Trash2, Package } from 'lucide-react';

interface FeaturedCombosProps {
  onSelectCombo: (item: CustomAcaiItem) => void;
}

export const FeaturedCombos: React.FC<FeaturedCombosProps> = ({ onSelectCombo }) => {
  const {
    combos,
    updateCombo,
    addCombo,
    deleteCombo,
    cupSizes,
    baseOptions,
    complements,
    storeSettings,
    updateStoreSettings,
    isEditMode: rawIsEditMode,
  } = useStore();
  const { canEditStore } = useAuth();
  const isEditMode = rawIsEditMode && canEditStore;

  if (!storeSettings.showCombosSection && !isEditMode) {
    return null;
  }

  const [showNewComboModal, setShowNewComboModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBadge, setNewBadge] = useState('Promoção Especial');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('26.90');
  const [newStock, setNewStock] = useState('25');
  const [newIcon, setNewIcon] = useState('🍧');
  const [newSizeId, setNewSizeId] = useState(cupSizes[1]?.id || '500ml');

  const handleOrderCombo = (combo: ComboItem) => {
    if (!combo.available || combo.stock <= 0) return;

    const sizeObj = cupSizes.find((s) => s.id === combo.sizeId) || cupSizes[0];
    const baseObj = baseOptions.find((b) => b.id === combo.baseId) || baseOptions[0];
    const compObjs = combo.complementIds
      .map((id) => complements.find((c) => c.id === id))
      .filter((c): c is Complement => Boolean(c));

    // Deduct 1 from combo stock as well
    updateCombo(combo.id, { stock: Math.max(0, combo.stock - 1) });

    const item: CustomAcaiItem = {
      id: `combo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      size: sizeObj,
      base: baseObj,
      complements: compObjs,
      notes: `Combo Especial: ${combo.title}`,
      itemPrice: combo.price,
      quantity: 1,
    };
    onSelectCombo(item);
  };

  const handleCreateCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created: ComboItem = {
      id: `combo_${Date.now()}`,
      title: newTitle.trim(),
      badge: newBadge.trim() || 'Destaque',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description:
        newDesc.trim() || 'Combinação especial preparada pela nossa equipe com ingredientes selecionados.',
      sizeId: newSizeId,
      baseId: baseOptions[0]?.id || 'tradicional',
      complementIds: complements.slice(0, 3).map((c) => c.id),
      price: Math.max(0, parseFloat(newPrice.replace(',', '.')) || 25),
      icon: newIcon || '🍧',
      stock: Math.max(0, parseInt(newStock, 10) || 20),
      available: true,
    };
    addCombo(created);
    setNewTitle('');
    setNewDesc('');
    setShowNewComboModal(false);
  };

  return (
    <section className="py-14 border-b border-zinc-800/80 bg-zinc-950/60" id="combos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Receitas Prontas Recomendadas</span>
              </div>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() =>
                    updateStoreSettings({
                      showCombosSection: !storeSettings.showCombosSection,
                    })
                  }
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border transition-all cursor-pointer ${
                    storeSettings.showCombosSection
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}
                  title="Clique para ativar ou ocultar a seção de combos para os clientes"
                >
                  {storeSettings.showCombosSection ? '✓ Seção Visível' : '✕ Seção Oculta'}
                </button>
              )}
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Combos Prontos Mais Pedidos
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              {isEditMode
                ? 'Modo Lojista: Edite títulos, descrições, valores (R$) e estoque de combos diretamente abaixo. Se sua loja não trabalha com combos, clique em "Seção Visível" para ocultar.'
                : 'Se preferir não montar do zero, escolha uma dessas combinações consagradas'}
            </p>
          </div>

          {isEditMode && (
            <button
              type="button"
              onClick={() => setShowNewComboModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Combo</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {combos.map((combo) => {
            const sizeObj = cupSizes.find((s) => s.id === combo.sizeId) || cupSizes[0];
            const compObjs = combo.complementIds
              .map((id) => complements.find((c) => c.id === id))
              .filter((c): c is Complement => Boolean(c));
            const isOut = !combo.available || combo.stock <= 0;

            if (isEditMode) {
              return (
                <div
                  key={combo.id}
                  className="p-5 rounded-3xl bg-zinc-900 border-2 border-amber-400/50 flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={combo.badge}
                        onChange={(e) => updateCombo(combo.id, { badge: e.target.value })}
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300"
                        placeholder="Selo (ex: Mais Vendido)"
                      />
                      <input
                        type="text"
                        value={combo.icon}
                        onChange={(e) => updateCombo(combo.id, { icon: e.target.value })}
                        className="w-10 text-center bg-zinc-950 border border-zinc-700 rounded-lg py-1 text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => deleteCombo(combo.id)}
                        className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900"
                        title="Excluir combo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                        Nome do Combo:
                      </label>
                      <input
                        type="text"
                        value={combo.title}
                        onChange={(e) => updateCombo(combo.id, { title: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                        Descrição dos Ingredientes:
                      </label>
                      <textarea
                        rows={3}
                        value={combo.description}
                        onChange={(e) => updateCombo(combo.id, { description: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-300"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Valor Combo (R$):</span>
                        <input
                          type="number"
                          step="0.50"
                          value={combo.price}
                          onChange={(e) =>
                            updateCombo(combo.id, {
                              price: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-full bg-zinc-950 border border-amber-400/60 rounded-xl px-2.5 py-1.5 text-sm font-black text-amber-300"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-zinc-400 block">Qtd. Disponível:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateCombo(combo.id, { stock: combo.stock - 1 })}
                            className="w-7 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            value={combo.stock}
                            onChange={(e) =>
                              updateCombo(combo.id, { stock: parseInt(e.target.value, 10) || 0 })
                            }
                            className="w-12 text-center bg-zinc-950 border border-zinc-700 rounded-lg py-1.5 text-xs font-bold text-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateCombo(combo.id, { stock: combo.stock + 1, available: true })
                            }
                            className="w-7 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Status do Combo:</span>
                      <button
                        type="button"
                        onClick={() => updateCombo(combo.id, { available: !combo.available })}
                        className={`px-3 py-1 rounded-lg font-bold text-xs ${
                          combo.available && combo.stock > 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {combo.available && combo.stock > 0 ? '✓ Ativo na Página' : '✕ Pausado / Esgotado'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={combo.id}
                className={`p-6 rounded-3xl bg-zinc-900/70 border transition-all flex flex-col justify-between group shadow-xl ${
                  isOut
                    ? 'border-zinc-900 opacity-60'
                    : 'border-zinc-800 hover:border-purple-500/40 hover:bg-zinc-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${combo.badgeColor}`}
                    >
                      {combo.badge}
                    </span>
                    <span className="text-2xl">{combo.icon}</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                      {combo.title}
                    </h3>
                    <span className="text-xs text-zinc-400 font-semibold">
                      ({sizeObj?.volume || '500ml'})
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{combo.description}</p>

                  {/* Ingredients Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {compObjs.map((c) => (
                      <span
                        key={c.id}
                        className="text-[11px] text-zinc-300 px-2 py-0.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {isOut ? 'Esgotado' : `${combo.stock} disponíveis`}
                    </span>
                    <span className="text-xl font-extrabold text-white tabular-nums">
                      R$ {combo.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    disabled={isOut}
                    onClick={() => handleOrderCombo(combo)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isOut
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/40 cursor-pointer'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isOut ? 'Indisponível' : 'Pedir este Copo'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL PARA CRIAR NOVO COMBO */}
      {showNewComboModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCombo}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-black text-white">Criar Novo Combo na Vitrine</h3>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Ícone</label>
                <input
                  type="text"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-lg"
                />
              </div>
              <div className="col-span-3">
                <label className="text-[11px] text-zinc-400 block mb-1">Nome do Combo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Combo Casal 2x 500ml"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Selo de Destaque</label>
                <input
                  type="text"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Tamanho Base</label>
                <select
                  value={newSizeId}
                  onChange={(e) => setNewSizeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                >
                  {cupSizes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.volume} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Descrição</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descreva os acompanhamentos do combo..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Estoque Inicial</label>
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewComboModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-black"
              >
                Publicar Combo
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
