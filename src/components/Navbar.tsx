import React, { useState } from 'react';
import {
  ShoppingBag,
  LayoutDashboard,
  Edit3,
  Check,
  Store,
  User,
  Crown,
  LogIn,
  LogOut,
  Menu,
  X,
  Camera,
  MessageSquare,
  Monitor,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { UserProfileModal } from './UserProfileModal';

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
    totalOrderMessagesCount,
  } = useStore();
  const { currentUser, isSuperAdmin, isStoreStaff, canEditStore, logout } = useAuth();
  const isEditMode = rawIsEditMode && canEditStore;

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Primeiro nome para exibição amigável
  const firstName = currentUser
    ? currentUser.name.trim().split(' ')[0]
    : 'Entrar';

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

  const handleUserClick = () => {
    if (currentUser) {
      setShowProfileModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80">
      {/* Announcement Banner if enabled */}
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
                <label className="flex items-center gap-1.5 text-[11px] text-amber-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storeSettings.showAnnouncement}
                    onChange={(e) => updateStoreSettings({ showAnnouncement: e.target.checked })}
                    className="rounded accent-amber-400"
                  />
                  Mostrar faixa
                </label>
              </div>
            ) : (
              <span className="font-semibold tracking-wide">{storeSettings.announcementBanner}</span>
            )}
          </div>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark & Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              onToggleView('store');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 group cursor-pointer text-left whitespace-nowrap"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-800 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
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
              <span className="text-sm sm:text-lg font-black tracking-tight text-white group-hover:text-purple-300 transition-colors block leading-none">
                {storeSettings.storeName}
              </span>
              <span className="text-[10px] text-zinc-400 hidden sm:inline-block">
                {storeSettings.tagline}
              </span>
            </div>
          </button>

          {/* Store Open/Closed Interactive Pill (Desktop) */}
          <button
            onClick={() => {
              if (canEditStore && (isEditMode || currentView === 'admin')) {
                updateStoreSettings({ isOpen: !storeSettings.isOpen });
              }
            }}
            title={
              canEditStore
                ? 'Clique para alternar entre Loja Aberta e Loja Fechada'
                : storeSettings.openingHours
            }
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
              storeSettings.isOpen
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-red-500/15 text-red-300 border-red-500/30'
            } ${canEditStore && (isEditMode || currentView === 'admin') ? 'cursor-pointer hover:scale-105 ring-1 ring-amber-400/40' : 'cursor-default'}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                storeSettings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span>{storeSettings.isOpen ? 'Aberto' : 'Fechado'}</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
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

        {/* Zone 3: Desktop Action Cluster */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Seletor Balcão / Delivery / Totem para equipe */}
          {isStoreStaff && currentView === 'store' && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setPosMode('balcao')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                    posMode === 'balcao'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Tirar pedidos no balcão da loja"
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
                  title="Modo padrão Delivery"
                >
                  <span>🛵 Delivery</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onToggleView('totem')}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center gap-1 transition cursor-pointer"
                title="Abrir Totem de Autoatendimento para clientes no salão"
              >
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                <span>Totem</span>
              </button>
            </div>
          )}

          {/* User Profile Pill com Foto + Primeiro Nome */}
          <button
            type="button"
            onClick={handleUserClick}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
              isSuperAdmin
                ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 hover:bg-amber-400/25 ring-1 ring-amber-400/30'
                : currentUser
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-200 hover:bg-purple-950/60'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
            title={currentUser ? `${currentUser.name} - Clique para ver/trocar foto de perfil` : 'Entrar ou Cadastrar'}
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400/60 shadow"
              />
            ) : currentUser ? (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-800 to-fuchsia-600 flex items-center justify-center text-[10px] font-black text-white">
                {firstName.charAt(0).toUpperCase()}
              </div>
            ) : (
              <LogIn className="w-3.5 h-3.5 text-zinc-400" />
            )}

            <div className="flex items-center gap-1">
              {isSuperAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              <span className="font-extrabold">{firstName}</span>
            </div>
          </button>

          {/* Toggle Editar Loja */}
          {canEditStore && (
            <button
              onClick={handleToggleEditMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                isEditMode && currentView === 'store'
                  ? 'bg-amber-400 hover:bg-amber-300 text-black border-amber-300 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border-amber-500/30'
              }`}
              title="Ativar Modo Edição da Loja"
            >
              {isEditMode && currentView === 'store' ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Concluir</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Loja</span>
                </>
              )}
            </button>
          )}

          {/* Switch to Admin PDV / Gestão */}
          <button
            onClick={handleOpenAdmin}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
              currentView === 'admin'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/50'
                : isSuperAdmin
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 hover:bg-amber-400/30 ring-1 ring-amber-400/40'
                : isStoreStaff
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-200 hover:bg-purple-950/60'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
            }`}
            title="Painel de Gestão, Usuários, Estoque e PDV"
          >
            {currentView === 'admin' ? (
              <>
                <Store className="w-3.5 h-3.5" />
                <span>Ver Vitrine</span>
              </>
            ) : (
              <>
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                <span>{isSuperAdmin ? 'Painel Master' : isStoreStaff ? 'Gestão & PDV' : 'Painel ADM'}</span>
              </>
            )}
            {activeOrdersCount > 0 && currentView !== 'admin' && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-500 text-black">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Cart Trigger (Desktop) */}
          {currentView === 'store' && (
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/50 transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="Abrir sacola de compras"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white shadow">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Zone 4: Mobile Top Controls (Sacola + Botão Menu Hambúrguer) */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          {/* Sacola no Celular */}
          {currentView === 'store' && (
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all cursor-pointer shrink-0"
              title="Sacola de compras"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white shadow animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* Botão Hambúrguer Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
            aria-label="Abrir menu de navegação"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}

            {/* Indicador no hambúrguer se houver pedidos ativos ou mensagens no chat */}
            {(activeOrdersCount > 0 || totalOrderMessagesCount > 0) && !isMobileMenuOpen && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 border-2 border-zinc-950 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          PAINEL DESLIZANTE DO MENU HAMBÚRGUER MOBILE
         ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-4 space-y-4 animate-in slide-in-from-top-3 duration-200">
          {/* Card do Usuário Logado / Login no Celular */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                onClick={handleUserClick}
                className="relative cursor-pointer group"
                title="Clique para trocar foto"
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400/80 shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-800 to-fuchsia-600 flex items-center justify-center text-white text-base font-black shadow">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                {currentUser && (
                  <span className="absolute bottom-0 right-0 p-1 rounded-full bg-amber-400 text-black shadow">
                    <Camera className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white">{firstName}</span>
                  {isSuperAdmin && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-[11px] text-zinc-400 block">
                  {isSuperAdmin
                    ? '👑 Criador / Super Admin'
                    : currentUser?.role === 'lojista'
                    ? '🏪 Lojista'
                    : currentUser?.role === 'gerente'
                    ? '👔 Gerente'
                    : currentUser
                    ? '👤 Cliente'
                    : 'Não autenticado'}
                </span>
              </div>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black cursor-pointer shadow"
              >
                Meu Perfil
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer shadow"
              >
                Entrar / Cadastrar
              </button>
            )}
          </div>

          {/* Links de Acesso Rápido */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <a
              href="#montar-copo"
              onClick={() => {
                onToggleView('store');
                setIsMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2"
            >
              <span>🍧</span>
              <span>Montar Copo</span>
            </a>

            {storeSettings.showCombosSection && (
              <a
                href="#combos"
                onClick={() => {
                  onToggleView('store');
                  setIsMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2"
              >
                <span>✨</span>
                <span>Combos Prontos</span>
              </a>
            )}
          </div>

          {/* Seção Operacional da Loja no Celular (Staff) */}
          {isStoreStaff && (
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-amber-500/20 space-y-2.5">
              <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider block">
                Operação da Loja & Balcão
              </span>

              {/* Balcão / Delivery */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPosMode('balcao');
                    if (currentView !== 'store') onToggleView('store');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer border ${
                    posMode === 'balcao'
                      ? 'bg-amber-400 text-black border-amber-300 shadow'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  <span>🛍️</span>
                  <span>Modo Balcão</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPosMode('delivery');
                    if (currentView !== 'store') onToggleView('store');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer border ${
                    posMode === 'delivery'
                      ? 'bg-purple-600 text-white border-purple-500 shadow'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  <span>🛵</span>
                  <span>Modo Delivery</span>
                </button>
              </div>

              {/* Botão Totem */}
              <button
                type="button"
                onClick={() => {
                  onToggleView('totem');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Monitor className="w-4 h-4 text-amber-400" />
                <span>🖥️ Abrir Totem de Autoatendimento</span>
              </button>

              {/* Botão Painel de Gestão */}
              <button
                type="button"
                onClick={() => {
                  handleOpenAdmin();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{currentView === 'admin' ? 'Voltar para a Vitrine' : 'Painel de Gestão & PDV'}</span>
                {activeOrdersCount > 0 && currentView !== 'admin' && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-black">
                    {activeOrdersCount}
                  </span>
                )}
              </button>

              {/* Botão Editar Loja */}
              {canEditStore && (
                <button
                  type="button"
                  onClick={() => {
                    handleToggleEditMode();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer border ${
                    isEditMode
                      ? 'bg-amber-400 text-black border-amber-300'
                      : 'bg-zinc-950 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditMode ? 'Concluir Edição da Loja' : 'Editar Loja (Modo Visual)'}</span>
                </button>
              )}

              {/* Alternar Status Aberto/Fechado da loja pelo mobile */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-zinc-400">Status da Loja:</span>
                <button
                  type="button"
                  onClick={() => updateStoreSettings({ isOpen: !storeSettings.isOpen })}
                  className={`px-3 py-1 rounded-full font-bold text-xs border ${
                    storeSettings.isOpen
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}
                >
                  {storeSettings.isOpen ? '● Aberto para Pedidos' : '○ Fechado'}
                </button>
              </div>
            </div>
          )}

          {/* Sair da Conta se logado */}
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-xs text-red-400 hover:text-red-300 font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          )}
        </div>
      )}

      {/* Modais Globais */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </header>
  );
};
