import {
  LayoutDashboard, MessageSquare, Users, Zap, Bot,
  Radio, FileText, CreditCard, Settings, LogOut,
  ChevronRight, X, Wifi
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Page } from '../../lib/types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { id: Page; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chats', label: 'Chats', icon: MessageSquare },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'auto-replies', label: 'Auto Replies', icon: Zap },
  { id: 'ai-settings', label: 'AI Settings', icon: Bot },
  { id: 'broadcast', label: 'Broadcast', icon: Radio },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const initial = profile?.business_name?.charAt(0)?.toUpperCase() || 'B';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 flex flex-col z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">WA CRM</p>
              <p className="text-slate-400 text-xs mt-0.5">Business Suite</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{profile?.business_name || 'My Business'}</p>
              <span className="inline-flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400 text-xs capitalize">{profile?.plan || 'free'} plan</span>
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-150 group
                  ${active
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0" />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5" />}
                {item.badge && !active && (
                  <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
