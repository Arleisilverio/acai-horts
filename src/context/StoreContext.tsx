import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CupSize,
  BaseOption,
  Complement,
  ComboItem,
  Neighborhood,
  FinancialTransaction,
  StoreSettings,
  CustomAcaiItem,
  OrderMessage,
} from '../types';
import {
  CUP_SIZES,
  BASE_OPTIONS,
  COMPLEMENTS_CATALOG,
  INITIAL_COMBOS,
  NEIGHBORHOODS,
  STORE_SETTINGS,
  INITIAL_TRANSACTIONS,
} from '../data/menuData';
import { supabase, isSupabaseConfigured, SUPABASE_URL } from '../lib/supabase';

interface StoreContextType {
  storeSettings: StoreSettings;
  updateStoreSettings: (partial: Partial<StoreSettings>) => void;

  cupSizes: CupSize[];
  updateCupSize: (id: string, partial: Partial<CupSize>) => void;
  addCupSize: (size: CupSize) => void;
  deleteCupSize: (id: string) => void;

  baseOptions: BaseOption[];
  updateBaseOption: (id: string, partial: Partial<BaseOption>) => void;
  addBaseOption: (base: BaseOption) => void;
  deleteBaseOption: (id: string) => void;

  complements: Complement[];
  updateComplement: (id: string, partial: Partial<Complement>) => void;
  addComplement: (complement: Complement) => void;
  deleteComplement: (id: string) => void;

  combos: ComboItem[];
  updateCombo: (id: string, partial: Partial<ComboItem>) => void;
  addCombo: (combo: ComboItem) => void;
  deleteCombo: (id: string) => void;

  neighborhoods: Neighborhood[];
  updateNeighborhood: (id: string, partial: Partial<Neighborhood>) => void;
  addNeighborhood: (neighborhood: Neighborhood) => void;
  deleteNeighborhood: (id: string) => void;

  transactions: FinancialTransaction[];
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  updateTransaction: (id: string, partial: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;

  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;

  posMode: 'delivery' | 'balcao';
  setPosMode: (mode: 'delivery' | 'balcao') => void;

  isTotemMode: boolean;
  setIsTotemMode: (val: boolean) => void;

  orderMessages: OrderMessage[];
  totalOrderMessagesCount: number;
  sendOrderMessage: (
    orderId: string,
    message: string,
    senderRole: 'lojista' | 'cliente',
    senderName: string
  ) => Promise<void>;
  getOrderMessages: (orderId: string) => OrderMessage[];
  getOrderMessagesCount: (orderId: string) => number;

  deductStockForOrder: (items: CustomAcaiItem[]) => void;
  resetAllStoreData: () => void;

  // Supabase sync info
  isCloudSynced: boolean;
  supabaseUrl: string;
  setSupabaseCredentials: (url: string, anonKey: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [posMode, setPosMode] = useState<'delivery' | 'balcao'>('delivery');
  const [isTotemMode, setIsTotemMode] = useState<boolean>(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(isSupabaseConfigured);

  const [orderMessages, setOrderMessages] = useState<OrderMessage[]>(() =>
    loadFromStorage('acai_order_messages_v1', [])
  );

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() =>
    loadFromStorage('acai_store_settings_v2', STORE_SETTINGS)
  );
  const [cupSizes, setCupSizes] = useState<CupSize[]>(() =>
    loadFromStorage('acai_cup_sizes_v2', CUP_SIZES)
  );
  const [baseOptions, setBaseOptions] = useState<BaseOption[]>(() =>
    loadFromStorage('acai_base_options_v2', BASE_OPTIONS)
  );
  const [complements, setComplements] = useState<Complement[]>(() =>
    loadFromStorage('acai_complements_v2', COMPLEMENTS_CATALOG)
  );
  const [combos, setCombos] = useState<ComboItem[]>(() =>
    loadFromStorage('acai_combos_v2', INITIAL_COMBOS)
  );
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(() =>
    loadFromStorage('acai_neighborhoods_v2', NEIGHBORHOODS)
  );
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() =>
    loadFromStorage('acai_transactions_v2', INITIAL_TRANSACTIONS)
  );

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('acai_store_settings_v2', JSON.stringify(storeSettings));
    } catch {}
  }, [storeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('acai_cup_sizes_v2', JSON.stringify(cupSizes));
    } catch {}
  }, [cupSizes]);

  useEffect(() => {
    try {
      localStorage.setItem('acai_base_options_v2', JSON.stringify(baseOptions));
    } catch {}
  }, [baseOptions]);

  useEffect(() => {
    try {
      localStorage.setItem('acai_complements_v2', JSON.stringify(complements));
    } catch {}
  }, [complements]);

  useEffect(() => {
    try {
      localStorage.setItem('acai_combos_v2', JSON.stringify(combos));
    } catch {}
  }, [combos]);

  useEffect(() => {
    try {
      localStorage.setItem('acai_neighborhoods_v2', JSON.stringify(neighborhoods));
    } catch {}
  }, [neighborhoods]);

  useEffect(() => {
    try {
      localStorage.setItem('acai_transactions_v2', JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  // Load from Supabase on startup if configured
  useEffect(() => {
    if (!supabase) return;

    async function loadCloudData() {
      try {
        // Tentar tabela com prefixo acai_ ou padrão
        const { data: remoteSettings } = await supabase!
          .from('acai_store_settings')
          .select('*')
          .single();

        if (remoteSettings) {
          // map snake_case to camelCase
          setStoreSettings((prev) => ({
            ...prev,
            storeName: remoteSettings.store_name || prev.storeName,
            tagline: remoteSettings.tagline || prev.tagline,
            bio: remoteSettings.bio || prev.bio,
            isOpen: remoteSettings.is_open ?? prev.isOpen,
            showCombosSection: remoteSettings.show_combos_section ?? prev.showCombosSection,
            announcementBanner: remoteSettings.announcement_banner || prev.announcementBanner,
            showAnnouncement: remoteSettings.show_announcement ?? prev.showAnnouncement,
            coverImageUrl: remoteSettings.cover_image_url || prev.coverImageUrl,
            heroCardImageUrl: remoteSettings.hero_card_image_url || prev.heroCardImageUrl,
            heroCardTitle: remoteSettings.hero_card_title || prev.heroCardTitle,
            heroCardSubtitle: remoteSettings.hero_card_subtitle || prev.heroCardSubtitle,
            logoEmoji: remoteSettings.logo_emoji || prev.logoEmoji,
            logoImageUrl: remoteSettings.logo_image_url || prev.logoImageUrl,
            phone: remoteSettings.phone || prev.phone,
            address: remoteSettings.address || prev.address,
            openingHours: remoteSettings.opening_hours || prev.openingHours,
            pixKey: remoteSettings.pix_key || prev.pixKey,
            monthlyGoal: remoteSettings.monthly_goal || prev.monthlyGoal,
          }));
        }

        const { data: remoteComps } = await supabase!.from('acai_complements').select('*');
        if (remoteComps && remoteComps.length > 0) {
          setComplements(
            remoteComps.map((c: any) => ({
              id: c.id,
              name: c.name,
              category: c.category,
              price: parseFloat(c.price),
              costPrice: parseFloat(c.cost_price || 0),
              color: c.color,
              textColor: c.text_color,
              textureType: c.texture_type,
              iconEmoji: c.icon_emoji,
              stock: c.stock,
              available: c.available,
            }))
          );
        }

        setIsCloudSynced(true);
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local state:', err);
      }
    }

    loadCloudData();
  }, []);

  const setSupabaseCredentials = (url: string, anonKey: string) => {
    localStorage.setItem('acai_supabase_url', url);
    localStorage.setItem('acai_supabase_anon_key', anonKey);
    window.location.reload();
  };

  const updateStoreSettings = (partial: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const next = { ...prev, ...partial };
      if (supabase) {
        const payload = {
          id: 'current_store',
          store_name: next.storeName,
          tagline: next.tagline,
          bio: next.bio,
          is_open: next.isOpen,
          show_combos_section: next.showCombosSection,
          announcement_banner: next.announcementBanner,
          show_announcement: next.showAnnouncement,
          cover_image_url: next.coverImageUrl,
          hero_card_image_url: next.heroCardImageUrl,
          hero_card_title: next.heroCardTitle,
          hero_card_subtitle: next.heroCardSubtitle,
          logo_emoji: next.logoEmoji,
          logo_image_url: next.logoImageUrl,
          phone: next.phone,
          address: next.address,
          opening_hours: next.openingHours,
          pix_key: next.pixKey,
          monthly_goal: next.monthlyGoal,
        };

        supabase.from('acai_store_settings').upsert(payload).then();
      }
      return next;
    });
  };

  const updateCupSize = (id: string, partial: Partial<CupSize>) => {
    setCupSizes((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...partial };
        if (partial.stock !== undefined) {
          updated.stock = Math.max(0, partial.stock);
          if (updated.stock === 0) updated.available = false;
        }
        if (supabase) {
          supabase.from('cup_sizes').upsert(updated).then();
        }
        return updated;
      })
    );
  };

  const addCupSize = (size: CupSize) => {
    setCupSizes((prev) => [...prev, size]);
    if (supabase) {
      supabase.from('cup_sizes').upsert(size).then();
    }
  };

  const deleteCupSize = (id: string) => {
    setCupSizes((prev) => prev.filter((s) => s.id !== id));
    if (supabase) {
      supabase.from('cup_sizes').delete().eq('id', id).then();
    }
  };

  const updateBaseOption = (id: string, partial: Partial<BaseOption>) => {
    setBaseOptions((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, ...partial };
        if (partial.stock !== undefined) {
          updated.stock = Math.max(0, partial.stock);
          if (updated.stock === 0) updated.available = false;
        }
        if (supabase) {
          supabase.from('base_options').upsert(updated).then();
        }
        return updated;
      })
    );
  };

  const addBaseOption = (base: BaseOption) => {
    setBaseOptions((prev) => [...prev, base]);
    if (supabase) {
      supabase.from('base_options').upsert(base).then();
    }
  };

  const deleteBaseOption = (id: string) => {
    setBaseOptions((prev) => prev.filter((b) => b.id !== id));
    if (supabase) {
      supabase.from('base_options').delete().eq('id', id).then();
    }
  };

  const updateComplement = (id: string, partial: Partial<Complement>) => {
    setComplements((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...partial };
        if (partial.stock !== undefined) {
          updated.stock = Math.max(0, partial.stock);
          if (updated.stock === 0) updated.available = false;
        }
        if (supabase) {
          supabase
            .from('complements')
            .upsert({
              id: updated.id,
              name: updated.name,
              category: updated.category,
              price: updated.price,
              cost_price: updated.costPrice,
              color: updated.color,
              stock: updated.stock,
              available: updated.available,
            })
            .then();
        }
        return updated;
      })
    );
  };

  const addComplement = (complement: Complement) => {
    setComplements((prev) => [...prev, complement]);
    if (supabase) {
      supabase.from('complements').upsert(complement).then();
    }
  };

  const deleteComplement = (id: string) => {
    setComplements((prev) => prev.filter((c) => c.id !== id));
    if (supabase) {
      supabase.from('complements').delete().eq('id', id).then();
    }
  };

  const updateCombo = (id: string, partial: Partial<ComboItem>) => {
    setCombos((prev) =>
      prev.map((cb) => {
        if (cb.id !== id) return cb;
        const updated = { ...cb, ...partial };
        if (partial.stock !== undefined) {
          updated.stock = Math.max(0, partial.stock);
          if (updated.stock === 0) updated.available = false;
        }
        return updated;
      })
    );
  };

  const addCombo = (combo: ComboItem) => {
    setCombos((prev) => [...prev, combo]);
  };

  const deleteCombo = (id: string) => {
    setCombos((prev) => prev.filter((cb) => cb.id !== id));
  };

  const updateNeighborhood = (id: string, partial: Partial<Neighborhood>) => {
    setNeighborhoods((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...partial } : n))
    );
  };

  const addNeighborhood = (neighborhood: Neighborhood) => {
    setNeighborhoods((prev) => [...prev, neighborhood]);
  };

  const deleteNeighborhood = (id: string) => {
    setNeighborhoods((prev) => prev.filter((n) => n.id !== id));
  };

  const addTransaction = (tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    if (supabase) {
      supabase.from('financial_transactions').insert(newTx).then();
    }
  };

  const updateTransaction = (id: string, partial: Partial<FinancialTransaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...partial } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const deductStockForOrder = (items: CustomAcaiItem[]) => {
    items.forEach((item) => {
      const qty = item.quantity;
      setCupSizes((prev) =>
        prev.map((s) => {
          if (s.id !== item.size.id) return s;
          const nextStock = Math.max(0, s.stock - qty);
          return { ...s, stock: nextStock, available: nextStock > 0 ? s.available : false };
        })
      );
      setBaseOptions((prev) =>
        prev.map((b) => {
          if (b.id !== item.base.id) return b;
          const nextStock = Math.max(0, b.stock - qty);
          return { ...b, stock: nextStock, available: nextStock > 0 ? b.available : false };
        })
      );
      const compIds = item.complements.map((c) => c.id);
      setComplements((prev) =>
        prev.map((c) => {
          if (!compIds.includes(c.id)) return c;
          const nextStock = Math.max(0, c.stock - qty);
          return { ...c, stock: nextStock, available: nextStock > 0 ? c.available : false };
        })
      );
    });
  };

  // Sincronizar mensagens periodicamente do Supabase se disponível
  useEffect(() => {
    if (!supabase) return;

    async function fetchMessages() {
      try {
        const { data } = await supabase!
          .from('acai_order_messages')
          .select('*')
          .order('created_at', { ascending: true });
        if (data && data.length > 0) {
          setOrderMessages(
            data.map((m: any) => ({
              id: m.id,
              orderId: m.order_id,
              senderRole: m.sender_role,
              senderName: m.sender_name,
              message: m.message,
              createdAt: m.created_at,
            }))
          );
        }
      } catch {}
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  // Salvar mensagens no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('acai_order_messages_v1', JSON.stringify(orderMessages));
    } catch {}
  }, [orderMessages]);

  const sendOrderMessage = async (
    orderId: string,
    message: string,
    senderRole: 'lojista' | 'cliente',
    senderName: string
  ) => {
    const newMsg: OrderMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderId,
      message,
      senderRole,
      senderName,
      createdAt: new Date().toISOString(),
    };

    setOrderMessages((prev) => [...prev, newMsg]);

    if (supabase) {
      try {
        await supabase.from('acai_order_messages').insert({
          id: newMsg.id,
          order_id: newMsg.orderId,
          sender_role: newMsg.senderRole,
          sender_name: newMsg.senderName,
          message: newMsg.message,
          created_at: newMsg.createdAt,
        });
      } catch (e) {
        console.warn('Erro ao salvar mensagem no Supabase:', e);
      }
    }
  };

  const getOrderMessages = (orderId: string) => {
    return orderMessages.filter((m) => m.orderId === orderId);
  };

  const getOrderMessagesCount = (orderId: string) => {
    return orderMessages.filter((m) => m.orderId === orderId).length;
  };

  const totalOrderMessagesCount = orderMessages.length;

  const resetAllStoreData = () => {
    setStoreSettings(STORE_SETTINGS);
    setCupSizes(CUP_SIZES);
    setBaseOptions(BASE_OPTIONS);
    setComplements(COMPLEMENTS_CATALOG);
    setCombos(INITIAL_COMBOS);
    setNeighborhoods(NEIGHBORHOODS);
    setTransactions(INITIAL_TRANSACTIONS);
  };

  return (
    <StoreContext.Provider
      value={{
        storeSettings,
        updateStoreSettings,
        cupSizes,
        updateCupSize,
        addCupSize,
        deleteCupSize,
        baseOptions,
        updateBaseOption,
        addBaseOption,
        deleteBaseOption,
        complements,
        updateComplement,
        addComplement,
        deleteComplement,
        combos,
        updateCombo,
        addCombo,
        deleteCombo,
        neighborhoods,
        updateNeighborhood,
        addNeighborhood,
        deleteNeighborhood,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        isEditMode,
        setIsEditMode,
        posMode,
        setPosMode,
        isTotemMode,
        setIsTotemMode,
        orderMessages,
        totalOrderMessagesCount,
        sendOrderMessage,
        getOrderMessages,
        getOrderMessagesCount,
        deductStockForOrder,
        resetAllStoreData,
        isCloudSynced,
        supabaseUrl: SUPABASE_URL,
        setSupabaseCredentials,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};