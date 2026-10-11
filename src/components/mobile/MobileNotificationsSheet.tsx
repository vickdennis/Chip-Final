import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCheck, Users, ShoppingBag, Info, Sparkles } from 'lucide-react';
import { MobileNotification } from '../../types/mobile';

interface MobileNotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: MobileNotification[];
  onMarkAllAsRead: () => void;
  onClearNotification: (id: string | number) => void;
}

export const MobileNotificationsSheet: React.FC<MobileNotificationsSheetProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotification,
}) => {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'lead':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-[#D2F843]" />;
      case 'milestone':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

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
                <Bell className="w-5 h-5 text-[#D2F843]" />
                <h3 className="text-base font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#D2F843] text-black">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-neutral-500">
                    <CheckCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">You're all caught up</p>
                  <p className="text-xs text-neutral-500">New leads and system updates will appear here.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      n.is_read
                        ? 'bg-white/[0.02] border-white/5 text-neutral-400'
                        : 'bg-white/5 border-[#D2F843]/30 text-white shadow-sm'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                          {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed font-normal">{n.message}</p>
                    </div>
                    <button
                      onClick={() => onClearNotification(n.id)}
                      className="text-neutral-500 hover:text-white p-1 transition-colors cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
