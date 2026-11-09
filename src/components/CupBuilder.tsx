import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CupSize,
  BaseOption,
  Complement,
  ComplementCategory,
  CustomAcaiItem,
} from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { InteractiveCup } from './InteractiveCup';
import {
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Sparkles,
  Trash2,
  Edit3,
  Package,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CupBuilderProps {
  onAddToCart: (item: CustomAcaiItem) => void;
}

export const CupBuilder: React.FC<CupBuilderProps> = ({ onAddToCart }) => {
  const {
    cupSizes,
    updateCupSize,
    addCupSize,
    deleteCupSize,
    baseOptions,
    complements,
    updateComplement,
    addComplement,
    deleteComplement,
    isEditMode: rawIsEditMode,
    posMode,
    setPosMode,
  } = useStore();
  const { canEditStore, isStoreStaff } = useAuth();
  const isEditMode = rawIsEditMode && canEditStore;

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
  const [notes, setNotes] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<Complement | null>(null);

  // Modal states for adding new items in Edit Mode
  const [showNewComplementModal, setShowNewComplementModal] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompPrice, setNewCompPrice] = useState('3.50');
  const [newCompStock, setNewCompStock] = useState('40');
  const [newCompEmoji, setNewCompEmoji] = useState('🍓');
  const [newCompColor, setNewCompColor] = useState('#EF4444');

  const [showNewSizeModal, setShowNewSizeModal] = useState(false);
  const [newSizeVolume, setNewSizeVolume] = useState('1 Litro');
  const [newSizeName, setNewSizeName] = useState('Família');
  const [newSizePrice, setNewSizePrice] = useState('36.00');
  const [newSizeGratis, setNewSizeGratis] = useState('5');
  const [newSizeStock, setNewSizeStock] = useState('25');

  const selectedSize =
    cupSizes.find((s) => s.id === selectedSizeId) || cupSizes[0] || {
      id: '500ml',
      name: 'Médio',
      volume: '500ml',
      basePrice: 22,
      includedComplementsCount: 3,
      heightClass: 'h-80',
      stock: 50,
      available: true,
    };

  const selectedBase =
    baseOptions.find((b) => b.id === selectedBaseId) || baseOptions[0] || {
      id: 'tradicional',
      name: 'Açaí Tradicional',
      description: '',
      color: '#380B44',
      accentColor: '#5C1D6E',
      stock: 50,
      available: true,
    };

  const selectedComplements = selectedComplementIds
    .map((id) => complements.find((c) => c.id === id))
    .filter((c): c is Complement => Boolean(c && c.available && c.stock > 0));

  useEffect(() => {
    if (!cupSizes.some((s) => s.id === selectedSizeId) && cupSizes.length > 0) {
      setSelectedSizeId(cupSizes[0].id);
    }
  }, [cupSizes, selectedSizeId]);

  useEffect(() => {
    if (!baseOptions.some((b) => b.id === selectedBaseId) && baseOptions.length > 0) {
      setSelectedBaseId(baseOptions[0].id);
    }
  }, [baseOptions, selectedBaseId]);

  const categories: { id: ComplementCategory; label: string; icon: string }[] = [
    { id: 'frutas', label: 'Frutas', icon: '🍓' },
    { id: 'cremes', label: 'Cremes & Pastas', icon: '🥛' },
    { id: 'crocantes', label: 'Crocantes & Grãos', icon: '🥣' },
    { id: 'coberturas', label: 'Caldas & Coberturas', icon: '🍯' },
  ];

  // Pricing calculations
  const includedCount = selectedSize.includedComplementsCount;
  const currentCount = selectedComplements.length;
  const extraCount = Math.max(0, currentCount - includedCount);

  let extraCost = 0;
  if (currentCount > includedCount) {
    const sortedByPrice = [...selectedComplements].sort((a, b) => b.price - a.price);
    const chargedItems = sortedByPrice.slice(includedCount);
    extraCost = chargedItems.reduce((acc, item) => acc + item.price, 0);
  }

  const baseExtra = selectedBase.extraPrice || 0;
  const totalPrice = selectedSize.basePrice + baseExtra + extraCost;

  const handleToggleComplement = (complement: Complement) => {
    if (!complement.available || complement.stock <= 0) return;

    if (selectedComplementIds.includes(complement.id)) {
      setSelectedComplementIds((prev) => prev.filter((id) => id !== complement.id));
    } else {
      setSelectedComplementIds((prev) => [...prev, complement.id]);
      setLastAddedItem(complement);
    }
  };

  const handleRemoveComplement = (complementId: string) => {
    setSelectedComplementIds((prev) => prev.filter((id) => id !== complementId));
  };

  const handleClearAll = () => {
    setSelectedComplementIds([]);
  };

  const handleAddCurrentCup = () => {
    if (!selectedSize.available || selectedSize.stock <= 0) {
      alert('Este tamanho de copo está esgotado no momento.');
      return;
    }
    if (!selectedBase.available || selectedBase.stock <= 0) {
      alert('Esta base está esgotada no momento.');
      return;
    }

    const newItem: CustomAcaiItem = {
      id: `acai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      size: selectedSize,
      base: selectedBase,
      complements: [...selectedComplements],
      notes: notes.trim(),
      itemPrice: totalPrice,
      quantity: 1,
    };

    onAddToCart(newItem);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleCreateComplement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    const created: Complement = {
      id: `comp_${Date.now()}`,
      name: newCompName.trim(),
      category: activeCategory,
      price: Math.max(0, parseFloat(newCompPrice.replace(',', '.')) || 0),
      costPrice: 1.0,
      color: newCompColor,
      textColor: '#FFFFFF',
      textureType:
        activeCategory === 'frutas'
          ? 'sliced'
          : activeCategory === 'coberturas'
          ? 'drizzle'
          : activeCategory === 'crocantes'
          ? 'granules'
          : 'paste',
      iconEmoji: newCompEmoji || '🍓',
      stock: Math.max(0, parseInt(newCompStock, 10) || 0),
      available: true,
    };
    addComplement(created);
    setNewCompName('');
    setShowNewComplementModal(false);
  };

  const handleCreateSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSizeVolume.trim()) return;
    const created: CupSize = {
      id: `size_${Date.now()}`,
      name: newSizeName.trim() || newSizeVolume.trim(),
      volume: newSizeVolume.trim(),
      basePrice: Math.max(0, parseFloat(newSizePrice.replace(',', '.')) || 20),
      includedComplementsCount: Math.max(0, parseInt(newSizeGratis, 10) || 3),
      heightClass: 'h-96',
      badge: 'Novo',
      stock: Math.max(0, parseInt(newSizeStock, 10) || 20),
      available: true,
    };
    addCupSize(created);
    setShowNewSizeModal(false);
  };

  const filteredComplements = complements.filter((c) => c.category === activeCategory);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="montar-copo">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>
            {isEditMode
              ? 'Modo Editor: Altere Valores, Quantidades em Estoque e Itens Abaixo'
              : 'Montador Interativo Lado a Lado'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Monte o Copo e Veja as Camadas ao Vivo
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {isEditMode
            ? 'Modifique o preço de cada copo, quantos acompanhamentos grátis vêm inclusos e a quantidade disponível em estoque.'
            : 'Clique nos complementos na lista ao lado para ver cada ingrediente cair e preencher o copo instantaneamente!'}
        </p>
      </div>

      {/* TOP CONFIG BAR: Size & Base selectors */}
      <div
        className={`mb-6 p-4 sm:p-5 rounded-3xl bg-zinc-900/90 border shadow-xl flex flex-col gap-6 ${
          isEditMode ? 'border-amber-400/50 ring-1 ring-amber-400/20' : 'border-zinc-800'
        }`}
      >
        {/* BANNER INFORMATIVO: ATENDIMENTO NO BALCÃO (PDV) */}
        {isStoreStaff && posMode === 'balcao' && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <strong className="text-amber-300 font-extrabold uppercase tracking-wide">
                Modo Balcão / PDV Ativo:
              </strong>
              <span className="text-zinc-200">
                Monte o pedido presencialmente no balcão. Conclusão rápida sem taxa de entrega.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPosMode('delivery')}
              className="text-[11px] font-bold text-amber-200/80 hover:text-white underline cursor-pointer self-start sm:self-auto shrink-0"
            >
              Mudar para Delivery
            </button>
          </div>
        )}

        {/* 1. Size Selector */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span>1. Escolha o Tamanho do Copo</span>
              {isEditMode && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                  Editável: Preço, Grátis e Estoque
                </span>
              )}
            </label>
            {isEditMode && (
              <button
                type="button"
                onClick={() => setShowNewSizeModal(true)}
                className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Tamanho</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cupSizes.map((size) => {
              const isSelected = selectedSize.id === size.id;
              const isOut = !size.available || size.stock <= 0;

              if (isEditMode) {
                return (
                  <div
                    key={size.id}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-400/40 space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={size.volume}
                        onChange={(e) => updateCupSize(size.id, { volume: e.target.value })}
                        className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-sm font-black text-white"
                        placeholder="500ml"
                      />
                      <input
                        type="text"
                        value={size.name}
                        onChange={(e) => updateCupSize(size.id, { name: e.target.value })}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-300"
                        placeholder="Nome"
                      />
                      {cupSizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteCupSize(size.id)}
                          className="p-1.5 rounded-lg bg-red-950/50 text-red-400 hover:bg-red-900/60"
                          title="Excluir tamanho"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Valor (R$):</span>
                        <input
                          type="number"
                          step="0.50"
                          value={size.basePrice}
                          onChange={(e) =>
                            updateCupSize(size.id, {
                              basePrice: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-full bg-zinc-900 border border-amber-400/50 rounded-lg px-2 py-1 font-bold text-amber-300"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Compl. Grátis:</span>
                        <input
                          type="number"
                          value={size.includedComplementsCount}
                          onChange={(e) =>
                            updateCupSize(size.id, {
                              includedComplementsCount: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 font-bold text-white"
                        />
                      </div>
                    </div>

                    {/* Stock & Availability Controls */}
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[10px] text-zinc-400">Qtd:</span>
                        <button
                          type="button"
                          onClick={() => updateCupSize(size.id, { stock: size.stock - 1 })}
                          className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={size.stock}
                          onChange={(e) =>
                            updateCupSize(size.id, { stock: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-12 text-center bg-zinc-900 border border-zinc-700 rounded py-0.5 text-xs font-bold text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateCupSize(size.id, { stock: size.stock + 1, available: true })
                          }
                          className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => updateCupSize(size.id, { available: !size.available })}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                          size.available && size.stock > 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {size.available && size.stock > 0 ? (
                          <>
                            <Eye className="w-3 h-3" /> Ativo
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Pausado
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={size.id}
                  disabled={isOut}
                  onClick={() => setSelectedSizeId(size.id)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center relative ${
                    isOut
                      ? 'bg-zinc-950/40 text-zinc-600 border-zinc-900 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/50 ring-2 ring-purple-400/40 cursor-pointer'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white cursor-pointer'
                  }`}
                >
                  <span className="text-base font-black leading-tight">{size.volume}</span>
                  <span className="text-xs opacity-95 tabular-nums font-bold mt-0.5">
                    R$ {size.basePrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] opacity-80 mt-0.5">
                    ({size.includedComplementsCount} compl. grátis)
                  </span>
                  <span
                    className={`mt-1 text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      isOut
                        ? 'bg-red-500/20 text-red-300'
                        : isSelected
                        ? 'bg-black/25 text-purple-100'
                        : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {isOut ? 'Esgotado' : `${size.stock} disp.`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN STAGE: COPO E COMPLEMENTOS LADO A LADO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LADO ESQUERDO: COPO INTERATIVO AO VIVO */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 flex flex-col items-center">
          <div className="w-full">
            <InteractiveCup
              size={selectedSize}
              base={selectedBase}
              complements={selectedComplements}
              onRemoveComplement={handleRemoveComplement}
              onClearAll={handleClearAll}
              lastAddedComplement={lastAddedItem}
            />
          </div>

          {/* Floating Price Indicator below cup */}
          <div className="mt-3 w-full p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Valor deste copo:</span>
              <span className="text-lg font-black text-white tabular-nums">
                R$ {totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-zinc-400 block">Adicionais:</span>
              <span
                className={`font-bold ${extraCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}
              >
                {currentCount <= includedCount
                  ? `${currentCount} de ${includedCount} grátis usados`
                  : `${includedCount} grátis + ${extraCount} pago${extraCount > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: COMPLEMENTOS IMEDIATAMENTE AO LADO */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Category Tabs */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2">
            <div className="flex items-center justify-between mb-2 px-2 pt-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>3. Adicionar Complementos ao Copo</span>
              </span>
              {isEditMode ? (
                <button
                  type="button"
                  onClick={() => setShowNewComplementModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo Item nesta Aba</span>
                </button>
              ) : (
                <span className="text-[11px] text-zinc-400">
                  Toque no item para entrar no copo ➔
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Complements Grid */}
          <div
            className={`bg-zinc-900/90 border rounded-3xl p-4 sm:p-5 shadow-xl ${
              isEditMode ? 'border-amber-400/50' : 'border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 px-1">
              <span>
                {isEditMode
                  ? 'Edite nome, valor (R$) e quantidade em estoque de cada item:'
                  : 'Selecione os itens desejados:'}
              </span>
              <span className="text-purple-300 font-medium">
                {currentCount} selecionado{currentCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredComplements.map((item) => {
                const isSelected = selectedComplementIds.includes(item.id);
                const isOut = !item.available || item.stock <= 0;

                if (isEditMode) {
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-zinc-950 border border-amber-400/40 space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.iconEmoji}
                          onChange={(e) =>
                            updateComplement(item.id, { iconEmoji: e.target.value })
                          }
                          className="w-9 h-9 text-center rounded-xl bg-zinc-900 border border-zinc-700 text-base"
                          title="Emoji do item"
                        />
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateComplement(item.id, { name: e.target.value })}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white"
                        />
                        <button
                          type="button"
                          onClick={() => deleteComplement(item.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60"
                          title="Excluir complemento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 items-center text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-400 block">Preço Adicional (R$):</span>
                          <input
                            type="number"
                            step="0.50"
                            value={item.price}
                            onChange={(e) =>
                              updateComplement(item.id, {
                                price: Math.max(0, parseFloat(e.target.value) || 0),
                              })
                            }
                            className="w-full bg-zinc-900 border border-amber-400/50 rounded-lg px-2 py-1 font-bold text-amber-300"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-400 block">Quantidade Estoque:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateComplement(item.id, { stock: item.stock - 1 })
                              }
                              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={item.stock}
                              onChange={(e) =>
                                updateComplement(item.id, {
                                 stock: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-12 text-center bg-zinc-900 border border-zinc-700 rounded py-1 text-xs font-bold text-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateComplement(item.id, {
                                  stock: item.stock + 1,
                                  available: true,
                                })
                              }
                              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-zinc-900 text-[11px]">
                        <span className="text-zinc-500">Status na vitrine:</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateComplement(item.id, { available: !item.available })
                          }
                          className={`px-2.5 py-0.5 rounded-md font-bold ${
                            item.available && item.stock > 0
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {item.available && item.stock > 0 ? '✓ Em Estoque' : '✕ Esgotado'}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isOut}
                    onClick={() => handleToggleComplement(item)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                      isOut
                        ? 'bg-zinc-950/40 border-zinc-900 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-950/50 ring-2 ring-purple-500/40 cursor-pointer active:scale-[0.98]'
                        : 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-800/40 cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner border border-white/10 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: item.color }}
                      >
                        <span className="text-lg">{item.iconEmoji}</span>
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                            isSelected
                              ? 'text-purple-200'
                              : 'text-white group-hover:text-purple-300'
                          }`}
                        >
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          {isOut ? (
                            <span className="text-red-400 font-bold">Esgotado</span>
                          ) : isSelected ? (
                            <span className="text-emerald-400 font-semibold">✓ No Copo</span>
                          ) : (
                            <span>+ R$ {item.price.toFixed(2).replace('.', ',')}</span>
                          )}
                          {!isOut && (
                            <span className="text-[10px] text-zinc-500">
                              ({item.stock} un.)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 group-hover:bg-purple-600 group-hover:text-white'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}

              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setShowNewComplementModal(true)}
                  className="p-4 rounded-2xl border-2 border-dashed border-amber-400/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[96px]"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs font-extrabold">Adicionar Novo Complemento</span>
                </button>
              )}
            </div>

            {/* Special Instructions Input */}
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <label
                htmlFor="notes-field"
                className="block text-xs font-semibold text-zinc-300 mb-1.5"
              >
                Observações deste copo (opcional):
              </label>
              <input
                id="notes-field"
                type="text"
                placeholder="Ex: pouco leite condensado, mandar paçoca separada..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Final Action Bar */}
            <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-zinc-400 block">
                  Total do Copo Personalizado:
                </span>
                <span className="text-2xl font-black text-white tabular-nums">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleAddCurrentCup}
                className={`flex items-center justify-center gap-2 py-3.5 px-7 rounded-2xl font-extrabold text-sm text-white shadow-xl transition-all cursor-pointer ${
                  addedAnimation
                    ? 'bg-emerald-600 shadow-emerald-900/40 ring-2 ring-emerald-400'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-950/60'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-5 h-5 animate-bounce" />
                    <span>Adicionado à Sacola!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Adicionar à Sacola</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: NOVO COMPLEMENTO */}
      {showNewComplementModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setShowNewComplementModal(false)}
            />
            <form
              onSubmit={handleCreateComplement}
              className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl my-auto"
            >
              <h3 className="text-lg font-black text-white">Novo Complemento ({activeCategory})</h3>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Emoji</label>
                  <input
                    type="text"
                    value={newCompEmoji}
                    onChange={(e) => setNewCompEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-lg"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[11px] text-zinc-400 block mb-1">Nome do Ingrediente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bis Picado, Creme de Pistache..."
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={newCompPrice}
                    onChange={(e) => setNewCompPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Qtd. Estoque</label>
                  <input
                    type="number"
                    value={newCompStock}
                    onChange={(e) => setNewCompStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Cor da Camada</label>
                  <input
                    type="color"
                    value={newCompColor}
                    onChange={(e) => setNewCompColor(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewComplementModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-black cursor-pointer"
                >
                  Criar Complemento
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

      {/* MODAL: NOVO TAMANHO DE COPO */}
      {showNewSizeModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setShowNewSizeModal(false)}
            />
            <form
              onSubmit={handleCreateSize}
              className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl my-auto"
            >
              <h3 className="text-lg font-black text-white">Adicionar Novo Tamanho</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Volume (ex: 1 Litro)</label>
                  <input
                    type="text"
                    required
                    value={newSizeVolume}
                    onChange={(e) => setNewSizeVolume(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Título (ex: Família)</label>
                  <input
                    type="text"
                    required
                    value={newSizeName}
                    onChange={(e) => setNewSizeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Valor Base (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={newSizePrice}
                    onChange={(e) => setNewSizePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Compl. Grátis</label>
                  <input
                    type="number"
                    value={newSizeGratis}
                    onChange={(e) => setNewSizeGratis(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Qtd. Estoque</label>
                  <input
                    type="number"
                    value={newSizeStock}
                    onChange={(e) => setNewSizeStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSizeModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-black cursor-pointer"
                >
                  Salvar Tamanho
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </div>
  );
};
