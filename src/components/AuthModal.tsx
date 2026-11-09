import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { X, User, Shield, Mail, Phone, MapPin, CheckCircle2, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register_customer';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, registerCustomer, currentUser, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register_customer'>(defaultMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Customer register form state
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custStreet, setCustStreet] = useState('');
  const [custNumber, setCustNumber] = useState('');
  const [custNeighborhood, setCustNeighborhood] = useState('Centro');
  const [custReference, setCustReference] = useState('');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickLoginAsArlei = async () => {
    setLoading(true);
    setMessage(null);
    const res = await login('arleisilverio41@gmail.com');
    setLoading(false);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => onClose(), 800);
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setLoading(true);
    setMessage(null);
    const res = await login(loginEmail, loginPassword);
    setLoading(false);

    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => onClose(), 800);
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custEmail.trim() || !custPhone.trim()) {
      setMessage({ text: 'Por favor, preencha todos os campos obrigatórios (*).', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);
    const res = await registerCustomer({
      name: custName,
      email: custEmail,
      phone: custPhone,
      address: custStreet
        ? {
            street: custStreet,
            number: custNumber,
            neighborhood: custNeighborhood,
            reference: custReference,
          }
        : undefined,
    });
    setLoading(false);

    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => onClose(), 800);
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-auto max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/40 text-purple-300 mx-auto flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Sessão Ativa
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">{currentUser.name}</h3>
              <p className="text-xs text-purple-300 font-mono mt-0.5">{currentUser.email}</p>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
              <span className="text-zinc-400">Nível de Acesso:</span>
              <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  logout();
                  setMessage(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
              >
                Trocar de Conta / Sair
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white cursor-pointer"
              >
                Continuar no App
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Entrar / Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register_customer');
                  setMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  mode === 'register_customer'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Novo Cadastro (Cliente)
              </button>
            </div>

            {/* Notification alert */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-2xl text-xs font-bold mb-4 border ${
                    message.type === 'success'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-950/40 text-red-300 border-red-500/40'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB 1: LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-white">Identifique-se</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Acesso para Criador, Lojistas, Gerentes ou Clientes já cadastrados.
                  </p>
                </div>

                {/* Atalho Especial Super Admin Arlei */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-purple-950/40 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Acesso Rápido: Criador & Super Admin</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      arleisilverio41@gmail.com
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickLoginAsArlei}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <span>Entrar como Arlei (Criador do App)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <span className="absolute inset-x-0 h-px bg-zinc-800" />
                  <span className="relative bg-zinc-950 px-3 text-[10px] text-zinc-500 uppercase tracking-wider">
                    ou digite seu e-mail
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    E-mail Cadastrado *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Senha / Código de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    (Se for o seu primeiro acesso, informe o email para localizar sua conta)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-950/50 cursor-pointer transition-all"
                >
                  {loading ? 'Entrando...' : 'Acessar Conta'}
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER CUSTOMER */}
            {mode === 'register_customer' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-white">Criar Conta de Cliente</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Cadastre-se uma única vez para salvar seus endereços e agilizar seus pedidos no delivery!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Camila Silva"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      WhatsApp com DDD *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 98765-4321"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    E-mail para Login *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Endereço de Entrega */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Endereço Principal para Entrega (Opcional):</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Rua / Avenida"
                        value={custStreet}
                        onChange={(e) => setCustStreet(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Número"
                        value={custNumber}
                        onChange={(e) => setCustNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={custNeighborhood}
                      onChange={(e) => setCustNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500"
                    />
                    <input
                      type="text"
                      placeholder="Complemento / Apto / Ref."
                      value={custReference}
                      onChange={(e) => setCustReference(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Cadastrando...' : 'Concluir Cadastro & Entrar'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
};
