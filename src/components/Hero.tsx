import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDown,
  Bike,
  ShieldCheck,
  Sparkles,
  Clock,
  Camera,
  Edit3,
  CheckCircle2,
  MapPin,
  Phone,
  Image as ImageIcon,
  RotateCcw,
  Link2,
  UploadCloud,
  Check,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { compressImageFile } from '../utils/imageCompressor';

interface HeroProps {
  onScrollToBuilder: () => void;
  onOpenAdmin?: () => void;
}

const COVER_PRESETS = [
  {
    label: 'Loja & Tigelas Artesanais',
    url: '/images/acai_shop_hero_1794185825735.jpg',
  },
  {
    label: 'Copo em Camadas Gourmet',
    url: '/images/acai_cup_layered_1794185825692.jpg',
  },
  {
    label: 'Açaí com Frutas & Morango',
    url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Tigela Tropical Açaí Bowl',
    url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Açaí Energético Granola',
    url: 'https://images.unsplash.com/photo-1590080875899-7387e65df69a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Balcão de Frutas Selecionadas',
    url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80',
  },
];

export const Hero: React.FC<HeroProps> = ({ onScrollToBuilder, onOpenAdmin }) => {
  const { storeSettings, updateStoreSettings, isEditMode: rawIsEditMode, setIsEditMode, resetAllStoreData } =
    useStore();
  const { canEditStore } = useAuth();
  const isEditMode = rawIsEditMode && canEditStore;

  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageTarget, setImageTarget] = useState<'cover' | 'heroCard' | 'logo'>('cover');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const isBanner = imageTarget === 'cover';
      const compressed = await compressImageFile(
        file,
        isBanner ? 1400 : 800,
        isBanner ? 700 : 800,
        0.85
      );

      if (imageTarget === 'cover') {
        updateStoreSettings({ coverImageUrl: compressed });
        setShowCoverModal(false);
      } else if (imageTarget === 'heroCard') {
        updateStoreSettings({ heroCardImageUrl: compressed });
        setShowCoverModal(false);
      } else if (imageTarget === 'logo') {
        updateStoreSettings({ logoImageUrl: compressed });
        setShowLogoModal(false);
      }
    } catch (err) {
      alert('Não foi possível processar a foto. Tente outra imagem.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (imageTarget === 'cover') {
      updateStoreSettings({ coverImageUrl: urlInput.trim() });
      setShowCoverModal(false);
    } else if (imageTarget === 'heroCard') {
      updateStoreSettings({ heroCardImageUrl: urlInput.trim() });
      setShowCoverModal(false);
    }
    setUrlInput('');
  };

  const openImageEditor = (target: 'cover' | 'heroCard') => {
    if (!canEditStore) {
      return;
    }
    setImageTarget(target);
    setUrlInput(target === 'cover' ? storeSettings.coverImageUrl : storeSettings.heroCardImageUrl);
    setShowCoverModal(true);
  };

  return (
    <section className="relative overflow-hidden pb-12 border-b border-zinc-800/80">
      {/* Hidden File Input for Local Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* FLOATING EDIT MODE CONTROL BAR */}
      {isEditMode && canEditStore && (
        <div className="bg-amber-500/15 border-b border-amber-500/40 px-4 py-3 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black shrink-0">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-2">
                  <span>Modo Edição da Loja Ativo</span>
                </h4>
                <p className="text-[11px] text-zinc-300">
                  Clique diretamente nos textos, fotos, preços ou use os botões de estoque abaixo para modificar tudo ao vivo!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Painel de Gestão & Usuários
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm('Deseja restaurar todos os textos, preços e estoque para o padrão original?')) {
                    resetAllStoreData();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>
              <button
                onClick={() => setIsEditMode(false)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-colors cursor-pointer"
              >
                Salvar & Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORE PROFILE HEADER (COVER + AVATAR + BIO) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-2xl mb-8">
          {/* Cover Photo Banner */}
          <div className="relative h-48 sm:h-64 md:h-72 w-full bg-zinc-950 overflow-hidden group">
            <img
              src={storeSettings.coverImageUrl}
              alt="Capa da Loja"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

            {/* Edit Cover Photo Button - Acessível diretamente para Lojistas e Administradores */}
            {canEditStore && (
              <button
                type="button"
                onClick={() => openImageEditor('cover')}
                className="absolute bottom-4 right-4 px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-2xl backdrop-blur-md transition-all cursor-pointer bg-amber-400 hover:bg-amber-300 text-black ring-2 ring-black/50 hover:scale-105"
              >
                <Camera className="w-4 h-4" />
                <span>Trocar Banner de Capa</span>
              </button>
            )}
          </div>

          {/* Profile Info Bar under Cover */}
          <div className="px-5 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 relative z-10">
              {/* Avatar + Store Name & Verified Badge */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-purple-800 to-fuchsia-600 p-1 shadow-2xl border-4 border-zinc-900 shrink-0 group">
                  <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center overflow-hidden">
                    {storeSettings.logoImageUrl ? (
                      <img
                        src={storeSettings.logoImageUrl}
                        alt={storeSettings.storeName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl sm:text-5xl">{storeSettings.logoEmoji || '🍇'}</span>
                    )}
                  </div>
                  {canEditStore && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageTarget('logo');
                        setShowLogoModal(true);
                      }}
                      className="absolute -bottom-1 -right-1 p-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black shadow-lg cursor-pointer transition-transform hover:scale-105"
                      title="Alterar Logo da Loja"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isEditMode && canEditStore ? (
                      <input
                        type="text"
                        value={storeSettings.storeName}
                        onChange={(e) => updateStoreSettings({ storeName: e.target.value })}
                        className="text-xl sm:text-2xl font-black text-white bg-zinc-950 border border-amber-400/60 rounded-xl px-3 py-1 focus:outline-none"
                        placeholder="Nome da Loja"
                      />
                    ) : (
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                        <span>{storeSettings.storeName}</span>
                        <CheckCircle2 className="w-5 h-5 text-purple-400 fill-purple-500/20" />
                      </h2>
                    )}

                    {/* Status Badge */}
                    <button
                      type="button"
                      disabled={!canEditStore}
                      onClick={() => updateStoreSettings({ isOpen: !storeSettings.isOpen })}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${
                        storeSettings.isOpen
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      } ${canEditStore ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                      title={canEditStore ? 'Clique para alternar Aberto / Fechado' : undefined}
                    >
                      {storeSettings.isOpen ? '● Aberto Agora' : '● Fechado no Momento'}
                    </button>
                  </div>

                  {isEditMode && canEditStore ? (
                    <input
                      type="text"
                      value={storeSettings.tagline}
                      onChange={(e) => updateStoreSettings({ tagline: e.target.value })}
                      className="text-xs text-zinc-300 bg-zinc-950 border border-amber-400/40 rounded-lg px-2.5 py-1 w-full max-w-md focus:outline-none"
                      placeholder="Slogan curto da loja"
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-purple-300 font-semibold">
                      {storeSettings.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onScrollToBuilder}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/40 cursor-pointer"
                >
                  Montar Copo Agora
                </button>
              </div>
            </div>

            {/* Bio & Quick Store Details */}
            <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-7">
                {isEditMode && canEditStore ? (
                  <div>
                    <label className="text-[10px] font-bold uppercase text-amber-300 block mb-1">
                      Apresentação da Loja:
                    </label>
                    <textarea
                      rows={2}
                      value={storeSettings.bio}
                      onChange={(e) => updateStoreSettings({ bio: e.target.value })}
                      className="w-full text-xs text-zinc-200 bg-zinc-950 border border-amber-400/50 rounded-xl p-2.5 focus:outline-none"
                    />
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {storeSettings.bio}
                  </p>
                )}
              </div>

              <div className="lg:col-span-5 flex flex-wrap items-center gap-4 text-xs text-zinc-400 lg:justify-end">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  {isEditMode && canEditStore ? (
                    <input
                      type="text"
                      value={storeSettings.address}
                      onChange={(e) => updateStoreSettings({ address: e.target.value })}
                      className="bg-zinc-950 border border-amber-400/40 rounded px-2 py-0.5 text-xs text-white w-44"
                    />
                  ) : (
                    <span>{storeSettings.address}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {isEditMode && canEditStore ? (
                    <input
                      type="text"
                      value={storeSettings.openingHours}
                      onChange={(e) => updateStoreSettings({ openingHours: e.target.value })}
                      className="bg-zinc-950 border border-amber-400/40 rounded px-2 py-0.5 text-xs text-white w-32"
                    />
                  ) : (
                    <span>{storeSettings.openingHours}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {isEditMode && canEditStore ? (
                    <input
                      type="text"
                      value={storeSettings.phone}
                      onChange={(e) => updateStoreSettings({ phone: e.target.value })}
                      className="bg-zinc-950 border border-amber-400/40 rounded px-2 py-0.5 text-xs text-white w-36"
                      placeholder="5511999998888"
                    />
                  ) : (
                    <span>WhatsApp Delivery</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HERO MAIN CALL TO ACTION SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              {isEditMode && canEditStore ? (
                <input
                  type="text"
                  value={storeSettings.heroBadgeText}
                  onChange={(e) => updateStoreSettings({ heroBadgeText: e.target.value })}
                  className="bg-zinc-950 border border-amber-400/50 rounded px-2 py-0.5 text-xs text-white w-72"
                />
              ) : (
                <span>{storeSettings.heroBadgeText}</span>
              )}
            </div>

            {isEditMode && canEditStore ? (
              <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-900/90 border border-amber-400/40">
                <label className="text-[10px] font-bold uppercase text-amber-300 block">
                  Editar Título Principal da Vitrine:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={storeSettings.heroTitlePrefix}
                    onChange={(e) => updateStoreSettings({ heroTitlePrefix: e.target.value })}
                    className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    placeholder="Início"
                  />
                  <input
                    type="text"
                    value={storeSettings.heroTitleHighlight}
                    onChange={(e) => updateStoreSettings({ heroTitleHighlight: e.target.value })}
                    className="bg-zinc-950 border border-purple-500 rounded-lg px-3 py-1.5 text-xs text-purple-300 font-bold"
                    placeholder="Destaque"
                  />
                  <input
                    type="text"
                    value={storeSettings.heroTitleSuffix}
                    onChange={(e) => updateStoreSettings({ heroTitleSuffix: e.target.value })}
                    className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    placeholder="Final"
                  />
                </div>
              </div>
            ) : (
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] text-balance">
                {storeSettings.heroTitlePrefix}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                  {storeSettings.heroTitleHighlight}
                </span>{' '}
                {storeSettings.heroTitleSuffix}
              </h1>
            )}

            {isEditMode && canEditStore ? (
              <div>
                <label className="text-[10px] font-bold uppercase text-amber-300 block mb-1">
                  Subtítulo Explicativo:
                </label>
                <textarea
                  rows={2}
                  value={storeSettings.heroSubtitle}
                  onChange={(e) => updateStoreSettings({ heroSubtitle: e.target.value })}
                  className="w-full text-sm text-zinc-200 bg-zinc-900 border border-amber-400/50 rounded-xl p-3 focus:outline-none"
                />
              </div>
            ) : (
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl">
                {storeSettings.heroSubtitle}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onScrollToBuilder}
                className="flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-base shadow-xl shadow-purple-950/60 transition-all cursor-pointer"
              >
                <span>Começar a Montar Meu Copo</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              {storeSettings.showCombosSection && (
                <a
                  href="#combos"
                  className="flex items-center justify-center py-4 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-sm transition-all text-center"
                >
                  Ver Combos Prontos
                </a>
              )}
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                {isEditMode && canEditStore ? (
                  <input
                    type="text"
                    value={storeSettings.trustBadge1}
                    onChange={(e) => updateStoreSettings({ trustBadge1: e.target.value })}
                    className="bg-zinc-900 border border-amber-400/40 rounded px-2 py-1 text-xs text-white w-full"
                  />
                ) : (
                  <span>{storeSettings.trustBadge1}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-purple-400 shrink-0" />
                {isEditMode && canEditStore ? (
                  <input
                    type="text"
                    value={storeSettings.trustBadge2}
                    onChange={(e) => updateStoreSettings({ trustBadge2: e.target.value })}
                    className="bg-zinc-900 border border-amber-400/40 rounded px-2 py-1 text-xs text-white w-full"
                  />
                ) : (
                  <span>{storeSettings.trustBadge2}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                {isEditMode && canEditStore ? (
                  <input
                    type="text"
                    value={storeSettings.trustBadge3}
                    onChange={(e) => updateStoreSettings({ trustBadge3: e.target.value })}
                    className="bg-zinc-900 border border-amber-400/40 rounded px-2 py-1 text-xs text-white w-full"
                  />
                ) : (
                  <span>{storeSettings.trustBadge3}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-950/60 group">
              <img
                src={storeSettings.heroCardImageUrl}
                alt="Destaque do Açaí"
                referrerPolicy="no-referrer"
                className="w-full h-[340px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

              {isEditMode && canEditStore && (
                <button
                  type="button"
                  onClick={() => openImageEditor('heroCard')}
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Trocar Foto Destaque</span>
                </button>
              )}

              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-zinc-900/85 backdrop-blur-md border border-white/10 flex items-center justify-between gap-2">
                <div className="flex-1">
                  {isEditMode && canEditStore ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={storeSettings.heroCardTitle}
                        onChange={(e) => updateStoreSettings({ heroCardTitle: e.target.value })}
                        className="bg-zinc-950 border border-amber-400/50 rounded px-2 py-0.5 text-xs text-purple-300 font-bold w-full"
                      />
                      <input
                        type="text"
                        value={storeSettings.heroCardSubtitle}
                        onChange={(e) => updateStoreSettings({ heroCardSubtitle: e.target.value })}
                        className="bg-zinc-950 border border-amber-400/50 rounded px-2 py-0.5 text-xs text-white font-bold w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block">
                        {storeSettings.heroCardTitle}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {storeSettings.heroCardSubtitle}
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={onScrollToBuilder}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Montar Igual
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA TROCAR FOTO DE CAPA OU DESTAQUE */}
      {showCoverModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setShowCoverModal(false)}
            />
            <div className="relative z-10 w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {imageTarget === 'cover' ? 'Alterar Banner de Capa' : 'Alterar Foto de Destaque'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Envie do seu aparelho, cole um link da internet ou selecione uma foto pronta.
                  </p>
                </div>
              </div>

              {/* Opção 1: Enviar Foto do Dispositivo (Upload) com compressão inteligente */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <UploadCloud className="w-4 h-4" />
                  <span>1. Enviar do seu Aparelho (Upload)</span>
                </label>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950/50 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>{uploading ? 'Otimizando imagem...' : 'Selecionar Foto da Galeria ou Câmera'}</span>
                </button>
              </div>

              {/* Opção 2: Colar Link da Internet */}
              <form onSubmit={handleApplyUrl} className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Link2 className="w-4 h-4" />
                  <span>2. Ou Cole o Link (URL) de uma Imagem</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://exemplo.com/minha-foto.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs cursor-pointer shrink-0 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </form>

              {/* Opção 3: Galeria de Fotos Prontas de Açaí */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="text-xs font-bold text-zinc-300 block uppercase tracking-wider">
                  3. Ou Escolha uma Foto em Alta Resolução:
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {COVER_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        if (imageTarget === 'cover') {
                          updateStoreSettings({ coverImageUrl: preset.url });
                        } else {
                          updateStoreSettings({ heroCardImageUrl: preset.url });
                        }
                        setShowCoverModal(false);
                      }}
                      className="p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-400 text-left group cursor-pointer transition-all hover:scale-102"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-16 object-cover rounded-xl mb-1"
                      />
                      <span className="text-[10px] font-bold text-zinc-300 group-hover:text-amber-300 block truncate">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCoverModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL PARA TROCAR LOGO / EMOJI */}
      {showLogoModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setShowLogoModal(false)}
            />
            <div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl my-auto">
              <h3 className="text-lg font-black text-white">Editar Logo da Loja</h3>
              <button
                type="button"
                onClick={() => {
                  setImageTarget('logo');
                  fileInputRef.current?.click();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Fazer Upload da Logo (Imagem)</span>
              </button>

              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Ou escolha um Emoji para a Logo:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['🍇', '🍧', '🍓', '🥣', '🌴', '⚡', '👑', '💜'].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => {
                        updateStoreSettings({ logoEmoji: emo, logoImageUrl: '' });
                        setShowLogoModal(false);
                      }}
                      className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-500 text-xl flex items-center justify-center cursor-pointer"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};
