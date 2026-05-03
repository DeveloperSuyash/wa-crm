import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Zap,
  Bot,
  Radio,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  X,
  Wifi,
  Gift,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Page } from "../../lib/types";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: {
  id: Page;
  label: string;
  icon: React.ElementType;
  badge?: string;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "chats", label: "Chats", icon: MessageSquare },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "auto-replies", label: "Auto Replies", icon: Zap },
  { id: "ai-settings", label: "AI Settings", icon: Bot },
  { id: "broadcast", label: "Broadcast", icon: Radio },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "guide", label: "Help & Guide", icon: HelpCircle },
  { id: "referral", label: "Refer & Earn", icon: Gift },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
}: SidebarProps) {
  const { profile, signOut } = useAuth();

  const initial = profile?.business_name?.charAt(0)?.toUpperCase() || "B";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 flex flex-col z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              {/* <Wifi className="w-4 h-4 text-white" /> */}

              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.121 1.529 5.857L.057 23.886l6.196-1.625A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.887 9.887 0 01-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">
                WA BOT
              </p>
              <p className="text-slate-400 text-xs mt-0.5">by DevSuyash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {profile?.business_name || "My Business"}
              </p>
              <span className="inline-flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400 text-xs capitalize">
                  {profile?.plan || "free"} plan
                </span>
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
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  transition-all duration-150 group
                  ${
                    active
                      ? "bg-emerald-500 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0" />
                <span className="flex-1 text-left font-medium">
                  {item.label}
                </span>
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
