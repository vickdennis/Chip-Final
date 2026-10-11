import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { MobileCartItem } from '../../types/mobile';
import { toast } from '../Toast';

interface MobileCartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: MobileCartItem[];
  onUpdateQuantity: (id: string | number, delta: number) => void;
  onRemoveItem: (id: string | number) => void;
  onCheckout: () => void;
}

export const MobileCartSheet: React.FC<MobileCartSheetProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? (subtotal >= 50000 ? 0 : 3500) : 0;
  const total = subtotal + delivery;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full sm:max-w-md bg-[#111318] border-t border-white/10 rounded-t-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] text-left"
          >
            {/* Pull Bar */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D2F843]" />
                <h3 className="text-base font-bold text-white">Your Cart</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                  {items.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-neutral-500">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">Your cart is empty</p>
                  <p className="text-xs text-neutral-500">Add an NFC card or digital service to get started.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-neutral-900 border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-xs font-bold text-[#D2F843] shrink-0">
                          NFC
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                        <div className="text-[11px] font-mono text-[#D2F843] font-semibold mt-0.5">
                          ₦{item.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-neutral-900 border border-white/10 rounded-xl p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Price Breakdown & Checkout */}
            {items.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="space-y-1.5 text-xs text-neutral-400 font-mono">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-white">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery (Nigeria):</span>
                    <span className="text-white">
                      {delivery === 0 ? 'FREE (Special Promo)' : `₦${delivery.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                    <span>Total:</span>
                    <span className="text-[#D2F843]">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  className="w-full py-4 rounded-2xl bg-[#D2F843] hover:bg-[#c3eb34] active:scale-[0.98] text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D2F843]/15 cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Secured by Paystack 256-Bit Bank Encryption
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
