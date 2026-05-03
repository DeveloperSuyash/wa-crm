import { Menu, Bell, Search } from "lucide-react";
import { Page } from "../../lib/types";
import { useAuth } from "../../context/AuthContext";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  chats: "Chats",
  contacts: "Contacts",
  "auto-replies": "Auto Replies",
  "ai-settings": "AI Settings",
  broadcast: "Broadcast",
  templates: "Templates",
  billing: "Billing & Usage",
  settings: "Settings",
};

const pageDescriptions: Record<Page, string> = {
  dashboard: "Overview of your WhatsApp CRM",
  chats: "Manage all customer conversations",
  contacts: "Your customer contact list",
  "auto-replies": "Keyword-based automated responses",
  "ai-settings": "Configure AI-powered responses",
  broadcast: "Send messages to multiple contacts",
  templates: "Manage WhatsApp message templates",
  billing: "Track usage and manage your plan",
  settings: "Account and integration settings",
};

interface HeaderProps {
  currentPage: Page;
  onMenuClick: () => void;
  onNavigate: (page: Page) => void;
}

export default function Header({
  currentPage,
  onMenuClick,
  onNavigate,
}: HeaderProps) {
  const { profile, isTrialActive, trialDaysLeft } = useAuth();

  return (
    <div>
      {isTrialActive && profile?.plan === "free" && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
          <p className="text-amber-800 text-xs font-medium">
            🎉 Free Trial — <strong>{trialDaysLeft} days</strong> bache hain
          </p>
          <button
            onClick={() => onNavigate("billing")}
            className="text-xs bg-amber-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-amber-600"
          >
            Upgrade Now
          </button>
        </div>
      )}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-gray-900 font-bold text-lg leading-none">
              {pageTitles[currentPage]}
            </h1>
            <p className="text-gray-500 text-xs mt-0.5 hidden sm:block">
              {pageDescriptions[currentPage]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-40"
            />
          </div>
          <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>
        </div>
      </header>
    </div>
  );
}
