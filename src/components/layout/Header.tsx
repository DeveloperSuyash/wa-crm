import { Menu, Bell, Search, X } from "lucide-react";
import { Page } from "../../lib/types";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  chats: "Chats",
  contacts: "Contacts",
  "auto-replies": "Auto Replies",
  "ai-settings": "AI Settings",
  broadcast: "Broadcast",
  templates: "Templates",
  billing: "Billing & Usage",
  guide: "Help & Guide",
  referral: "Refer & Earn",
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
  guide: "Features, use cases aur setup guide",
  referral: "Refer karo aur commission kamao",
  settings: "Account and integration settings",
};

interface SearchResult {
  type: "contact" | "message";
  id: string;
  title: string;
  subtitle: string;
  page: Page;
}

interface HeaderProps {
  currentPage: Page;
  onMenuClick: () => void;
  onNavigate: (page: Page) => void;
}

function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unread, setUnread] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    loadNotifications();
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => loadNotifications(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data);
      setUnread(data.filter((n) => !n.is_read).length);
    }
  };

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    loadNotifications();
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    loadNotifications();
  };

  const getIcon = (type: string) => {
    if (type === "message") return "💬";
    if (type === "broadcast") return "📢";
    if (type === "referral") return "🎁";
    if (type === "trial") return "⏰";
    return "🔔";
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-gray-900 font-semibold text-sm">
              Notifications
            </h3>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors ${!n.is_read ? "bg-emerald-50/50" : ""}`}
                  >
                    <span className="text-lg flex-shrink-0">
                      {getIcon(n.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${!n.is_read ? "font-semibold text-gray-900" : "text-gray-700"}`}
                      >
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {n.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(n.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header({
  currentPage,
  onMenuClick,
  onNavigate,
}: HeaderProps) {
  const { user, profile, isTrialActive, trialDaysLeft } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const search = async (q: string) => {
    if (!user) return;
    setSearching(true);
    const [contactsRes, messagesRes] = await Promise.all([
      supabase
        .from("contacts")
        .select("id, name, phone")
        .eq("user_id", user.id)
        .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
        .limit(5),
      supabase
        .from("messages")
        .select("id, content, conversation_id")
        .eq("user_id", user.id)
        .ilike("content", `%${q}%`)
        .limit(5),
    ]);
    const searchResults: SearchResult[] = [];
    contactsRes.data?.forEach((c) => {
      searchResults.push({
        type: "contact",
        id: c.id,
        title: c.name,
        subtitle: c.phone,
        page: "contacts",
      });
    });
    messagesRes.data?.forEach((m) => {
      searchResults.push({
        type: "message",
        id: m.id,
        title: m.content.slice(0, 50) + (m.content.length > 50 ? "..." : ""),
        subtitle: "Message",
        page: "chats",
      });
    });
    setResults(searchResults);
    setShowResults(true);
    setSearching(false);
  };

  const handleResultClick = (result: SearchResult) => {
    onNavigate(result.page);
    setQuery("");
    setShowResults(false);
  };

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
          <div className="relative" ref={searchRef}>
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search contacts, messages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowResults(true)}
                className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-48"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setShowResults(false);
                  }}
                >
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {showResults && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                {searching ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No results found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {results.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleResultClick(r)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 ${r.type === "contact" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {r.type === "contact" ? "👤" : "💬"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm font-medium truncate">
                            {r.title}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {r.subtitle}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${r.type === "contact" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}
                        >
                          {r.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <NotificationBell userId={user?.id || ""} />
        </div>
      </header>
    </div>
  );
}
