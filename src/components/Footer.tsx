import React from 'react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <footer className="w-full bg-zinc-950 py-10 border-t border-zinc-900 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-900/60 flex items-center justify-center text-xs overflow-hidden">
            {storeSettings.logoImageUrl ? (
              <img
                src={storeSettings.logoImageUrl}
                alt={storeSettings.storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{storeSettings.logoEmoji || '🍇'}</span>
            )}
          </div>
          <span className="font-bold text-zinc-300">{storeSettings.storeName}</span>
          <span>·</span>
          <span>{storeSettings.tagline}</span>
        </div>

        <p className="text-zinc-500 text-center sm:text-right">
          © {new Date().getFullYear()} {storeSettings.storeName}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};
