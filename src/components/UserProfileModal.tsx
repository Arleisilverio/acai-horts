import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, User, Mail, Phone, Crown, Shield, LogOut, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { compressImageFile } from '../utils/imageCompressor';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, isSuperAdmin, updateCurrentUserAvatar, updateCurrentUserProfile, logout } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentUser) return null;

  const firstName = currentUser.name.trim().split(' ')[0] || 'Usuário';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Comprime a foto de perfil para uma resolução adequada (400x400) com alta qualidade e peso leve
      const compressed = await compressImageFile(file, 400, 400, 0.85);
      await updateCurrentUserAvatar(compressed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Erro ao processar imagem de avatar:', err);
      alert('Não foi possível carregar esta imagem. Tente uma foto menor ou em formato JPG/PNG.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await updateCurrentUserProfile({
      name: name.trim(),
      phone: phone.trim(),
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const roleLabel =
    currentUser.role === 'super_admin'
      ? '👑 Super Admin / Criador'
      : currentUser.role === 'lojista'
      ? '🏪 Lojista Autorizado'
      : currentUser.role === 'gerente'
      ? '👔 Gerente da Loja'
      : '👤 Cliente';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 text-white my-auto overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>Meu Perfil</span>
              {isSuperAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-black">
                  CRIADOR
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400">Gerencie sua foto e dados de acesso</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Upload Area */}
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <div className="relative group">
            <div
              className={`w-28 h-28 rounded-full overflow-hidden border-3 shadow-2xl transition-all ${
                isSuperAdmin
                  ? 'border-amber-400 shadow-amber-500/20 ring-4 ring-amber-400/20'
                  : 'border-purple-500 shadow-purple-500/20 ring-4 ring-purple-500/20'
              }`}
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-fuchsia-700 flex items-center justify-center text-white text-3xl font-black">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Upload Button Overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black shadow-lg cursor-pointer transition transform hover:scale-110 active:scale-95 disabled:opacity-50"
              title="Trocar Foto de Perfil"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-3 text-xs font-bold text-amber-300 hover:text-amber-200 hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Otimizando imagem...' : 'Subir / Trocar Foto de Perfil'}</span>
          </button>

          <span className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
            {roleLabel}
          </span>
        </div>

        {/* Feedback de sucesso */}
        {saveSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Alterações salvas com sucesso!</span>
          </div>
        )}

        {/* Form Dados */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Nome Completo</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>E-mail</span>
            </label>
            <input
              type="email"
              value={currentUser.email}
              disabled
              className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-purple-400" />
              <span>Telefone / WhatsApp</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-zinc-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-950/50 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Dados</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};
