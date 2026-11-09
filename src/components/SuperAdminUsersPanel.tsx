import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, UserProfile } from '../types';
import {
  Shield,
  UserPlus,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User,
  Crown,
  Search,
  Key,
} from 'lucide-react';

export const SuperAdminUsersPanel: React.FC = () => {
  const { usersList, addUserByAdmin, updateUserRole, removeUser, currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New staff form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('lojista');

  const filteredUsers = usersList.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    addUserByAdmin({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim(),
      role: newRole,
      active: true,
    });

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setShowAddModal(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Criador / Master</span>
          </span>
        );
      case 'lojista':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 w-fit">
            <Key className="w-3 h-3 text-purple-400" />
            <span>Lojista (Total)</span>
          </span>
        );
      case 'gerente':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 w-fit">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>Gerente (Operação)</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 w-fit">
            Cliente Delivery
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas ao Criador Arlei */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-zinc-900 border border-amber-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>Painel do Criador da Plataforma — Arlei</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-extrabold uppercase">
                Acesso Master
              </span>
            </h2>
            <p className="text-xs text-zinc-300 mt-0.5">
              Email Master: <span className="font-mono text-amber-300">arleisilverio41@gmail.com</span> · Gerencie lojistas, gerentes e clientes com permissão para operar e editar o app.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all self-stretch sm:self-auto justify-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Lojista / Gerente</span>
        </button>
      </div>

      {/* Tabela de Usuários e Gestão de Permissões */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Usuários Autorizados & Níveis de Acesso ({filteredUsers.length})</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Altere o papel de qualquer usuário para Lojista ou Gerente em tempo real
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Nome do Usuário</th>
                <th className="py-3.5 px-4">E-mail</th>
                <th className="py-3.5 px-4">Telefone / WhatsApp</th>
                <th className="py-3.5 px-4">Cargo / Nível</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.map((user) => {
                const isSuper = user.email.toLowerCase() === 'arleisilverio41@gmail.com';

                return (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xs text-zinc-300 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{user.name}</span>
                          {user.defaultAddress && (
                            <span className="text-[10px] text-zinc-500">
                              Bairro: {user.defaultAddress.neighborhood}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-300">{user.email}</td>

                    <td className="py-3.5 px-4 text-zinc-400">{user.phone || '—'}</td>

                    <td className="py-3.5 px-4">
                      {isSuper ? (
                        getRoleBadge('super_admin')
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateUserRole(user.id, e.target.value as UserRole, user.active)
                          }
                          className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="lojista">Lojista (Pode Editar Tudo)</option>
                          <option value="gerente">Gerente (Pedidos & PDV)</option>
                          <option value="cliente">Cliente Delivery</option>
                        </select>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isSuper ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Sempre Ativo
                        </span>
                      ) : (
                        <button
                          onClick={() => updateUserRole(user.id, user.role, !user.active)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            user.active
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          }`}
                        >
                          {user.active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Liberado</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Bloqueado</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {!isSuper && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover o acesso de ${user.name}?`)) {
                              removeUser(user.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remover usuário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Adicionar Lojista ou Gerente */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateStaff}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Autorizar Novo Membro</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Nome do Lojista ou Gerente *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Lucas Ferreira"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                E-mail de Login *
              </label>
              <input
                type="email"
                required
                placeholder="lucas@minhaloja.com.br"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                WhatsApp com DDD
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-0000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Papel / Permissões no App:
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="lojista">Lojista (Acesso Total: Editar Página, Preços, Estoque e Financeiro)</option>
                <option value="gerente">Gerente (Acesso Operacional: PDV, Pedidos e Cozinha)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black cursor-pointer shadow-md"
              >
                Salvar & Autorizar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
