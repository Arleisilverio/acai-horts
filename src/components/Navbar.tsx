import React, { useState } from 'react';
import { ShoppingBag, LayoutDashboard, Edit3, Check, Store, User, Crown, LogIn } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  cartItemCount: number;
  activeOrdersCount: number;
  currentView: 'store' | 'admin' | 'totem';
  onToggleView: (view: 'store' | 'admin' | 'totem') => void;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount,
  activeOrdersCount,
  currentView,
  onToggleView,
  onOpenCart,
}) => {
  const {
    storeSettings,
    updateStoreSettings,
    isEditMode: rawIsEditMode,
    setIsEditMode,
    posMode,
    setPosMode,
  } = useStore();
  const { currentUser, isSuperAdmin, isStoreStaff, canEditStore } = useAuth();
  const isEditMode = rawIsEditMode && canEditStore;
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleToggleEditMode = () => {
    if (!canEditStore) {
      alert('Apenas lojistas autorizados e o criador (Arlei) podem editar a loja.');
      setShowAuthModal(true);
      return;
    }

    if (currentView !== 'store') {
      onToggleView('store');
      setIsEditMode(true);
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleOpenAdmin = () => {
    if (!isStoreStaff) {
      setShowAuthModal(true);
      return;
    }
    onToggleView(currentView === 'admin' ? 'store' : 'admin');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      {(storeSettings.showAnnouncement || isEditMode) && (
        <div className="bg-gradient-to-r from-purple-900/90 via-fuchsia-900/90 to-purple-900/90 border-b border-purple-500/30 px-4 py-1.5 text-center text-xs text-white">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2">
            {isEditMode ? (
              <div className="flex flex-wrap items-center gap-2 w-full justify-center">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded">
                  Aviso do Topo:
                </span>
                <input
                  type="text"
                  value={storeSettings.announcementBanner}
                  onChange={(e) => updateStoreSettings({ announcementBanner: e.target.value })}
                  className="bg-black/40 border border-amber-400/50 rounded-lg px-3 py-1 text-xs text-white w-full max-w-xl focus:outline-none focus:border-amber-300"
                  placeholder="Digite uma promoção ou aviso de destaque..."
                />
              </div>
            ) : (
              <span className="font-semibold tracking-wide">{storeSettings.announcementBanner}</span>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onToggleView('store')}
            className="flex items-center gap-2.5 group cursor-pointer text-left whitespace-nowrap"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-800 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform overflow-hidden">
              {storeSettings.logoImageUrl ? (
                <img
                  src={storeSettings.logoImageUrl}
                  alt={storeSettings.storeName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-black">{storeSettings.logoEmoji || '🍇'}</span>
              )}
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-purple-300 transition-colors block leading-none">
                {storeSettings.storeName}
              </span>
              <span className="text-[10px] text-zinc-400 hidden sm:inline-block">
                {storeSettings.tagline}
              </span>
            </div>
          </button>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <a
            href="#montar-copo"
            onClick={() => onToggleView('store')}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Montar Copo
          </a>
          {storeSettings.showCombosSection && (
            <a
              href="#combos"
              onClick={() => onToggleView('store')}
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              Combos Prontos
            </a>
          )}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {isStoreStaff && currentView === 'store' && (
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setPosMode('balcao')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                    posMode === 'balcao'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Tirar pedidos no balcão"
                >
                  <span>🛍️ Balcão</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPosMode('delivery')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                    posMode === 'delivery'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Modo Delivery"
                >
                  <span>🛵 Delivery</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onToggleView('totem')}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center gap-1 transition cursor-pointer"
                title="Abrir Totem Kiosk"
              >
                <span>🖥️ Totem</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setShowAuthModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
          >
            {isSuperAdmin ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <User className="w-3.5 h-3.5 text-purple-400" />}
            <span className="hidden sm:inline">
              {currentUser ? currentUser.name.split(' ')[0] : 'Entrar / Cadastro'}
            </span>
          </button>

          {canEditStore && (
            <button
              onClick={handleToggleEditMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                isEditMode && currentView === 'store'
                  ? 'bg-amber-400 hover:bg-amber-300 text-black border-amber-300 shadow-lg'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 border-amber-500/30'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Loja</span>
            </button>
          )}

          <button
            onClick={handleOpenAdmin}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border bg-purple-600 text-white border-purple-500 shadow-md"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSuperAdmin ? 'Painel Master' : isStoreStaff ? 'Gestão & PDV' : 'Painel ADM'}
            </span>
            {activeOrdersCount > 0 && currentView !== 'admin' && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-500 text-black">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {currentView === 'store' && (
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};