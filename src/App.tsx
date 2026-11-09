import React, { useState, useEffect } from 'react';
import { CustomAcaiItem, Order, OrderStatus } from './types';
import { INITIAL_SEED_ORDERS } from './data/menuData';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CupBuilder } from './components/CupBuilder';
import { FeaturedCombos } from './components/FeaturedCombos';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/AdminDashboard';
import { TotemView } from './components/TotemView';

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin' | 'totem'>('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [cart, setCart] = useState<CustomAcaiItem[]>(() => {
    try {
      const saved = localStorage.getItem('acai_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('acai_orders');
      return saved ? JSON.parse(saved) : INITIAL_SEED_ORDERS;
    } catch {
      return INITIAL_SEED_ORDERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('acai_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('acai_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  const handleAddToCart = (item: CustomAcaiItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.size.id === item.size.id &&
          i.base.id === item.base.id &&
          i.notes === item.notes &&
          i.complements.length === item.complements.length &&
          i.complements.every((c) => item.complements.some((ic) => ic.id === c.id))
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [item, ...prev];
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  const handleResetSeedData = () => {
    setOrders(INITIAL_SEED_ORDERS);
  };

  const handleScrollToBuilder = () => {
    setCurrentView('store');
    const elem = document.getElementById('montar-copo');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'entregue' && o.status !== 'cancelado'
  ).length;

  return (
    <AuthProvider>
      <StoreProvider>
        {currentView === 'totem' ? (
          <TotemView
            onExitTotem={() => setCurrentView('store')}
            onOrderCompleted={handleOrderCompleted}
          />
        ) : (
          <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
            <Navbar
              cartItemCount={totalCartCount}
              activeOrdersCount={activeOrdersCount}
              currentView={currentView}
              onToggleView={(view) => setCurrentView(view)}
              onOpenCart={() => setIsCartOpen(true)}
            />

            {currentView === 'store' ? (
              <main className="flex-1">
                <Hero
                  onScrollToBuilder={handleScrollToBuilder}
                  onOpenAdmin={() => setCurrentView('admin')}
                />
                <CupBuilder onAddToCart={handleAddToCart} />
                <FeaturedCombos onSelectCombo={handleAddToCart} />
              </main>
            ) : (
              <main className="flex-1">
                <AdminDashboard
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onBackToStore={() => setCurrentView('store')}
                  onResetSeedData={handleResetSeedData}
                />
              </main>
            )}

            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              items={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
            />

            <CheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => setIsCheckoutOpen(false)}
              items={cart}
              onOrderCompleted={handleOrderCompleted}
            />

            {currentView === 'store' && <Footer />}
          </div>
        )}
      </StoreProvider>
    </AuthProvider>
  );
}