import React from 'react';
import { LayoutDashboard, User, Users, ShoppingBag, Grid } from 'lucide-react';
import { MobileTab } from '../../types/mobile';

interface MobileBottomNavProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  newLeadsCount?: number;
  cartCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  newLeadsCount = 0,
  cartCount = 0,
}) => {
  const navItems = [
    {
      id: 'home' as MobileTab,
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'profile' as MobileTab,
      label: 'Profile',
      icon: User,
    },
    {
      id: 'leads' as MobileTab,
      label: 'Leads',
      icon: Users,
      badge: newLeadsCount > 0 ? (newLeadsCount > 99 ? '99+' : newLeadsCount) : undefined,
    },
    {
      id: 'shop' as MobileTab,
      label: 'Shop',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'more' as MobileTab,
      label: 'More',
      icon: Grid,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d12]/95 backdrop-blur-xl border-t border-white/10 px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#D2F843]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  }`}
                />

                {/* Badge indicator */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D2F843] text-black text-[10px] font-mono font-bold flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-medium tracking-tight transition-colors ${
                  isActive ? 'font-bold text-[#D2F843]' : 'text-neutral-400'
                }`}
              >
                {item.label}
              </span>

              {/* Active pill dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#D2F843]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
