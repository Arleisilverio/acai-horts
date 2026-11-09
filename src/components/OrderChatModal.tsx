import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare, Bot, User, Store, Clock } from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface OrderChatModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: 'lojista' | 'cliente';
  senderName?: string;
}

const QUICK_MESSAGES_STAFF = [
  'Olá! Seu pedido já está sendo preparado com muito carinho! 🍓',
  'Seu açaí está pronto para retirada no balcão! 🛍️',
  'O entregador acabou de sair com o seu pedido! 🛵',
  'Precisamos confirmar uma informação dos seus complementos, pode nos responder aqui?',
];

const QUICK_MESSAGES_CLIENT = [
  'Olá! Gostaria de saber o tempo estimado do meu pedido?',
  'Por favor, pode caprichar no leite condensado? Obrigado! 😊',
  'Já estou aguardando no portão / balcão.',
  'Qualquer dúvida sobre o endereço pode me avisar aqui!',
];

export const OrderChatModal: React.FC<OrderChatModalProps> = ({
  order,
  isOpen,
  onClose,
  currentUserRole = 'lojista',
  senderName = 'Atendente da Loja',
}) => {
  const { getOrderMessages, sendOrderMessage } = useStore();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = order ? getOrderMessages(order.id) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages.length]);

  if (!isOpen || !order) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    try {
      setSending(true);
      await sendOrderMessage(
        order.id,
        text,
        currentUserRole,
        senderName
      );
      if (!textToSend) setInputText('');
    } finally {
      setSending(false);
    }
  };

  const quickMessages =
    currentUserRole === 'lojista' ? QUICK_MESSAGES_STAFF : QUICK_MESSAGES_CLIENT;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col h-[600px] max-h-[90vh] z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-fuchsia-600 flex items-center justify-center text-white shadow-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">Chat do Pedido</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {order.code}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {currentUserRole === 'lojista'
                  ? `Cliente: ${order.customer.name}`
                  : `Conversando com a Equipe do Açaí`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Pedido no topo do Chat */}
        <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="truncate max-w-[220px]">
            {order.items.map((it) => `${it.quantity}x Copo ${it.size.volume}`).join(', ')}
          </span>
          <span className="font-bold text-white shrink-0">
            Total: R$ {order.total.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-zinc-950">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-zinc-400">Nenhuma mensagem ainda.</p>
              <p className="text-[11px] text-zinc-500 max-w-xs">
                Use este canal direto para tirar dúvidas sobre o preparo, entrega ou adicionais do
                pedido.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderRole === currentUserRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-zinc-500">
                    <span className="font-semibold text-zinc-400">
                      {isMine ? 'Você' : msg.senderName}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                      isMine
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-br-sm'
                        : 'bg-zinc-800/90 text-zinc-200 border border-zinc-700/50 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Mensagens Rápidas */}
        <div className="px-3 py-2 bg-zinc-900/60 border-t border-zinc-800/80 overflow-x-auto flex gap-1.5 shrink-0 scrollbar-none">
          {quickMessages.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 border border-zinc-700/60 whitespace-nowrap cursor-pointer transition shrink-0 hover:text-white"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-3 sm:p-4 bg-zinc-900/90 border-t border-zinc-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem para o pedido..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-40 text-white cursor-pointer transition shadow-lg shrink-0"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
