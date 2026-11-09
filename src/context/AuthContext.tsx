import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  usersList: UserProfile[];
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isStoreStaff: boolean; // super_admin, lojista ou gerente
  canEditStore: boolean;
  login: (email: string, passOrCode?: string) => Promise<{ success: boolean; message: string }>;
  registerCustomer: (data: {
    name: string;
    email: string;
    phone: string;
    address?: { street: string; number: string; neighborhood: string; reference?: string };
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateCurrentUserAvatar: (avatarUrl: string) => Promise<void>;
  updateCurrentUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  // Gestão de Usuários (Acesso exclusivo do Super Admin Arlei)
  addUserByAdmin: (user: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  updateUserRole: (userId: string, role: UserRole, active: boolean) => void;
  removeUser: (userId: string) => void;
}

const SUPER_ADMIN_EMAIL = 'arleisilverio41@gmail.com';

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr_super_admin',
    name: 'Arlei Silvério (Criador do App)',
    email: SUPER_ADMIN_EMAIL,
    phone: '(11) 99999-8888',
    role: 'super_admin',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('acai_users_list_v3');
      if (saved) return JSON.parse(saved);
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('acai_auth_user_v3');
      if (saved) return JSON.parse(saved);
      // Padrão: inicializar logado como Super Admin Arlei para facilidade imediata de gestão
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  // Persist session and users list
  useEffect(() => {
    try {
      localStorage.setItem('acai_users_list_v3', JSON.stringify(usersList));
    } catch {}
  }, [usersList]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('acai_auth_user_v3', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('acai_auth_user_v3');
      }
    } catch {}
  }, [currentUser]);

  // Sync users with Supabase profiles table if available
  useEffect(() => {
    if (!supabase) return;

    async function syncProfiles() {
      try {
        const { data } = await supabase!.from('profiles').select('*');
        if (data && data.length > 0) {
          // Merge remote profiles
          const merged: UserProfile[] = data.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.name || 'Usuário',
            email: p.email || '',
            phone: p.phone,
            role:
              p.email === SUPER_ADMIN_EMAIL
                ? 'super_admin'
                : p.role === 'super_admin'
                ? 'super_admin'
                : p.role === 'lojista'
                ? 'lojista'
                : p.role === 'gerente'
                ? 'gerente'
                : 'cliente',
            active: p.active !== false,
            createdAt: p.created_at || new Date().toISOString(),
            avatarUrl: p.avatar_url || undefined,
          }));

          // Garante que o Super Admin Arlei esteja sempre presente
          if (!merged.some((u) => u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())) {
            merged.unshift(INITIAL_USERS[0]);
          }

          setUsersList(merged);
        }
      } catch (err) {
        console.warn('Profiles fetch error, using local accounts:', err);
      }
    }

    syncProfiles();
  }, []);

  const login = async (
    email: string,
    _passOrCode?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Se for o email do criador Arlei, loga direto como Super Admin
    if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
      const superAdminUser: UserProfile = {
        id: 'usr_super_admin',
        name: 'Arlei Silverio (Criador do App)',
        email: SUPER_ADMIN_EMAIL,
        phone: '(11) 99999-8888',
        role: 'super_admin',
        active: true,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(superAdminUser);
      return { success: true, message: 'Bem-vindo, Arlei! Painel de Controle Master liberado.' };
    }

    // Busca na lista local de usuários autorizados
    const found = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        message: 'Email não encontrado. Cadastre-se como cliente ou solicite acesso ao administrador Arlei.',
      };
    }

    if (!found.active) {
      return {
        success: false,
        message: 'Esta conta está temporariamente desativada pelo administrador.',
      };
    }

    setCurrentUser(found);
    return {
      success: true,
      message: `Bem-vindo de volta, ${found.name}! Logado como ${found.role.replace('_', ' ').toUpperCase()}.`,
    };
  };

  const registerCustomer = async (data: {
    name: string;
    email: string;
    phone: string;
    address?: { street: string; number: string; neighborhood: string; reference?: string };
  }): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = usersList.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      // Atualiza dados e loga
      const updated: UserProfile = {
        ...existing,
        name: data.name.trim(),
        phone: data.phone.trim(),
        defaultAddress: data.address,
      };
      setUsersList((prev) => prev.map((u) => (u.id === existing.id ? updated : u)));
      setCurrentUser(updated);
      return { success: true, message: `Conta atualizada! Bem-vindo(a), ${updated.name}.` };
    }

    const newCustomer: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      role: 'cliente',
      active: true,
      createdAt: new Date().toISOString(),
      defaultAddress: data.address,
    };

    setUsersList((prev) => [newCustomer, ...prev]);
    setCurrentUser(newCustomer);

    // Salva no Supabase se disponível
    if (supabase) {
      supabase
        .from('profiles')
        .upsert({
          id: newCustomer.id,
          email: newCustomer.email,
          full_name: newCustomer.name,
          phone: newCustomer.phone,
          role: 'cliente',
          active: true,
        })
        .then();
    }

    return {
      success: true,
      message: `Cadastro realizado com sucesso! Bem-vindo(a), ${newCustomer.name}.`,
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateCurrentUserAvatar = async (avatarUrl: string) => {
    if (!currentUser) return;
    const updated: UserProfile = { ...currentUser, avatarUrl };
    setCurrentUser(updated);
    setUsersList((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));

    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', currentUser.id);
      } catch (e) {
        console.warn('Erro ao salvar avatar no Supabase:', e);
      }
    }
  };

  const updateCurrentUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated: UserProfile = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsersList((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));

    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.name,
            phone: updated.phone,
            avatar_url: updated.avatarUrl,
          })
          .eq('id', currentUser.id);
      } catch (e) {
        console.warn('Erro ao atualizar perfil no Supabase:', e);
      }
    }
  };

  const addUserByAdmin = (user: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const newUser: UserProfile = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setUsersList((prev) => [newUser, ...prev]);

    if (supabase) {
      supabase
        .from('profiles')
        .upsert({
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.name,
          phone: newUser.phone,
          role: newUser.role,
          active: newUser.active,
        })
        .then();
    }
  };

  const updateUserRole = (userId: string, role: UserRole, active: boolean) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        // Não permite rebaixar o Super Admin Arlei
        if (u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
          return { ...u, role: 'super_admin', active: true };
        }
        return { ...u, role, active };
      })
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role, active } : null));
    }

    if (supabase) {
      supabase.from('profiles').update({ role, active }).eq('id', userId).then();
    }
  };

  const removeUser = (userId: string) => {
    setUsersList((prev) =>
      prev.filter((u) => {
        if (u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return true;
        return u.id !== userId;
      })
    );

    if (supabase) {
      supabase.from('profiles').delete().eq('id', userId).then();
    }
  };

  const isSuperAdmin = Boolean(
    currentUser &&
      currentUser.active &&
      (currentUser.role === 'super_admin' ||
        currentUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())
  );

  const isStoreStaff = Boolean(
    currentUser &&
      currentUser.active &&
      (isSuperAdmin ||
        currentUser.role === 'lojista' ||
        currentUser.role === 'gerente')
  );

  const canEditStore = Boolean(
    currentUser &&
      currentUser.active &&
      (isSuperAdmin || currentUser.role === 'lojista')
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        isAuthenticated: Boolean(currentUser),
        isSuperAdmin,
        isStoreStaff,
        canEditStore,
        login,
        registerCustomer,
        logout,
        updateCurrentUserAvatar,
        updateCurrentUserProfile,
        addUserByAdmin,
        updateUserRole,
        removeUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};