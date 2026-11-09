import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CupSize, BaseOption, Complement } from '../types';
import { Sparkles, Trash2, X, Plus, Layers, ArrowDown } from 'lucide-react';

interface InteractiveCupProps {
  size: CupSize;
  base: BaseOption;
  complements: Complement[];
  onRemoveComplement: (complementId: string) => void;
  onClearAll: () => void;
  lastAddedComplement?: Complement | null;
}

export const InteractiveCup: React.FC<InteractiveCupProps> = ({
  size,
  base,
  complements,
  onRemoveComplement,
  onClearAll,
  lastAddedComplement,
}) => {
  const [splashItem, setSplashItem] = useState<Complement | null>(null);

  // Trigger visual splash animation whenever lastAddedComplement changes
  useEffect(() => {
    if (lastAddedComplement) {
      setSplashItem(lastAddedComplement);
      const timer = setTimeout(() => {
        setSplashItem(null);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [lastAddedComplement]);

  // Height and width scaled nicely for clear side-by-side view
  const heightScale = size.id === '300ml' ? 'h-[340px]' : size.id === '500ml' ? 'h-[400px]' : 'h-[460px]';
  const widthClass = size.id === '300ml' ? 'w-[220px]' : size.id === '500ml' ? 'w-[250px]' : 'w-[270px]';

  // Group drizzles / top syrups
  const drizzleComplements = complements.filter((c) => c.textureType === 'drizzle');
  const hasDrizzle = drizzleComplements.length > 0;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full p-4 sm:p-6 bg-gradient-to-b from-purple-950/30 via-zinc-900/80 to-zinc-950 rounded-3xl border border-purple-500/20 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: base.accentColor }}
      />

      {/* Header bar of the cup */}
      <div className="w-full flex items-center justify-between z-10 mb-2 pb-2 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Copo em Tempo Real
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
            Copo {size.volume}
          </h3>
        </div>

        {complements.length > 0 ? (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-400 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 transition-all cursor-pointer font-medium"
            title="Esvaziar todos os complementos do copo"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Esvaziar</span>
          </button>
        ) : (
          <span className="text-[11px] text-zinc-500 italic">Vazio</span>
        )}
      </div>

      {/* Notification banner when item drops in */}
      <div className="w-full h-7 flex items-center justify-center z-20">
        <AnimatePresence>
          {splashItem && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold shadow-lg shadow-purple-900/50"
            >
              <span>{splashItem.iconEmoji}</span>
              <span>+ {splashItem.name} entrou no copo!</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Central Cup Stage */}
      <div className="relative flex items-end justify-center w-full my-auto py-2">
        
        {/* Floating Falling Item Particle */}
        <AnimatePresence>
          {splashItem && (
            <motion.div
              initial={{ y: -60, opacity: 0, scale: 0.5 }}
              animate={{ y: 20, opacity: 1, scale: 1.3 }}
              exit={{ y: 80, opacity: 0, scale: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeIn' }}
              className="absolute -top-6 z-50 pointer-events-none flex flex-col items-center"
            >
              <span className="text-3xl drop-shadow-xl">{splashItem.iconEmoji}</span>
              <div
                className="w-3 h-3 rounded-full animate-ping mt-1"
                style={{ backgroundColor: splashItem.color }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2D Realistic Cup Container */}
        <div className={`relative ${widthClass} ${heightScale} transition-all duration-500 flex flex-col items-center`}>
          
          {/* Top Cup Rim (Lip) */}
          <div className="w-[106%] h-4 rounded-full bg-gradient-to-r from-zinc-400/50 via-white/80 to-zinc-400/50 border border-white/60 shadow-lg relative z-30 flex items-center justify-center">
            <div className="w-[94%] h-2 rounded-full bg-zinc-950/80 border border-white/30" />

            {/* Overflowing Top Drizzle if any drizzle selected */}
            {hasDrizzle && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                className="absolute -top-1 w-full flex justify-around px-5 pointer-events-none z-40"
              >
                {drizzleComplements.map((drizzle, idx) => (
                  <motion.div
                    key={drizzle.id}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.08 }}
                    className="w-4 h-7 rounded-b-full shadow-lg"
                    style={{ backgroundColor: drizzle.color }}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Cup Body (Tapered Clear Acrylic Silhouette) */}
          <div
            className="w-full flex-1 relative overflow-hidden flex flex-col-reverse justify-start shadow-2xl"
            style={{
              clipPath: 'polygon(3% 0%, 97% 0%, 88% 100%, 12% 100%)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.15) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Plastic Reflections */}
            <div className="absolute top-0 left-3 w-4 h-full bg-gradient-to-r from-white/35 to-transparent pointer-events-none z-20" />
            <div className="absolute top-0 right-4 w-1.5 h-full bg-white/25 pointer-events-none z-20" />

            {/* Volume measurement markings on the side of the cup */}
            <div className="absolute right-3 top-0 bottom-4 w-6 flex flex-col justify-between py-6 text-[10px] font-mono text-white/50 pointer-events-none z-20 border-r border-white/20 select-none">
              <span className={size.id === '700ml' ? 'text-amber-300 font-extrabold' : ''}>— 700ml</span>
              <span className={size.id === '500ml' ? 'text-amber-300 font-extrabold' : ''}>— 500ml</span>
              <span className={size.id === '300ml' ? 'text-amber-300 font-extrabold' : ''}>— 300ml</span>
              <span>— 100ml</span>
            </div>

            {/* BASE LAYER (Açaí / Cupuaçu Foundation) */}
            <motion.div
              layout
              className="w-full relative transition-all duration-500 overflow-hidden"
              style={{
                height: complements.length === 0 ? '78%' : `${Math.max(26, 68 - complements.length * 8.5)}%`,
                backgroundColor: base.color,
                backgroundImage: `radial-gradient(ellipse at 35% 25%, ${base.accentColor} 0%, ${base.color} 75%)`,
              }}
            >
              {/* Rich frozen açaí crystal texture */}
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] [background-size:12px_12px]" />

              {/* Meio a Meio split visual if applicable */}
              {base.id === 'meio_a_meio' && (
                <div
                  className="absolute inset-y-0 right-0 w-1/2 border-l border-white/25"
                  style={{
                    backgroundColor: '#F0E6D2',
                    backgroundImage: 'radial-gradient(ellipse at 70% 30%, #FFF8E7 0%, #E6D7BD 80%)',
                  }}
                />
              )}

              {/* Base label inside the açaí */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white whitespace-nowrap z-10 shadow-md pointer-events-none flex items-center gap-1">
                <span>🍇</span>
                <span>Açaí Cremoso Puro</span>
              </div>
            </motion.div>

            {/* DYNAMIC COMPLEMENT LAYERS (Stacked from bottom to top as added) */}
            <AnimatePresence initial={false}>
              {complements.map((item, index) => {
                const isDrizzle = item.textureType === 'drizzle';
                const isSliced = item.textureType === 'sliced';
                const isPowder = item.textureType === 'powder';
                const isGranules = item.textureType === 'granules';

                return (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, y: -45, scaleY: 0.1 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                    className="w-full relative group cursor-pointer transition-all hover:brightness-110"
                    style={{
                      height: isDrizzle ? '28px' : '40px',
                      backgroundColor: item.color,
                      borderTop: '1.5px solid rgba(255,255,255,0.4)',
                      boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.25)',
                    }}
                    onClick={() => onRemoveComplement(item.id)}
                    title={`Clique para remover: ${item.name}`}
                  >
                    {/* Visual Textures based on complement type */}
                    {isSliced && (
                      <div className="absolute inset-0 flex items-center justify-around opacity-45 px-2 pointer-events-none">
                        <span className="w-5 h-5 rounded-full border border-black/30 bg-white/25 inline-block" />
                        <span className="w-6 h-6 rounded-full border border-black/30 bg-white/25 inline-block" />
                        <span className="w-5 h-5 rounded-full border border-black/30 bg-white/25 inline-block" />
                      </div>
                    )}

                    {isPowder && (
                      <div className="absolute inset-0 opacity-45 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />
                    )}

                    {isGranules && (
                      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(#3a1a00_2px,transparent_2px)] [background-size:8px_8px] pointer-events-none" />
                    )}

                    {isDrizzle && (
                      <div className="absolute inset-x-0 -bottom-1.5 h-3 flex justify-around pointer-events-none">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      </div>
                    )}

                    {/* Layer Pill Label with delete affordance on hover */}
                    <div className="absolute inset-0 flex items-center justify-between px-3 z-10">
                      <div className="flex items-center gap-1.5 drop-shadow-md">
                        <span className="text-sm">{item.iconEmoji}</span>
                        <span
                          className="text-[11px] font-extrabold truncate max-w-[130px]"
                          style={{ color: item.textColor || '#FFFFFF' }}
                        >
                          {item.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveComplement(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full bg-black/70 text-white hover:bg-red-500 hover:scale-110"
                        title="Remover este ingrediente"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty Copo Hint when zero complements */}
            {complements.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-8 flex flex-col items-center justify-center text-center px-4 text-white/70 pointer-events-none"
              >
                <Sparkles className="w-6 h-6 text-amber-400 mb-1.5 animate-bounce" />
                <p className="text-xs font-bold text-white">Copo aguardando complementos</p>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  Clique nos ingredientes ao lado para adicionar em tempo real!
                </p>
              </motion.div>
            )}
          </div>

          {/* Bottom Cup Base Foot */}
          <div className="w-[78%] h-3.5 rounded-b-xl bg-gradient-to-b from-zinc-700/70 to-zinc-950 border border-white/25 shadow-2xl" />
        </div>
      </div>

      {/* Mini Layer Index List (visual breakdown right below the cup) */}
      <div className="w-full pt-3 border-t border-zinc-800/80 z-10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Camadas no Copo ({complements.length}):</span>
          </span>
          <span className="font-bold text-purple-300">
            {complements.length} de {size.includedComplementsCount} grátis
          </span>
        </div>

        {complements.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
            {complements.map((c, idx) => (
              <span
                key={`${c.id}-${idx}`}
                onClick={() => onRemoveComplement(c.id)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-700/60 text-[10px] text-zinc-200 hover:border-red-500 hover:text-red-300 cursor-pointer transition-colors"
                title="Clique para remover"
              >
                <span>{c.iconEmoji}</span>
                <span className="truncate max-w-[80px]">{c.name}</span>
                <X className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-500 italic">
            Nenhum ingrediente ainda. Clique nos itens ao lado!
          </p>
        )}
      </div>

    </div>
  );
};
