import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import Chats from "./pages/Chats";
import Contacts from "./pages/Contacts";
import AutoReplies from "./pages/AutoReplies";
import AISettings from "./pages/AISettings";
import Broadcast from "./pages/Broadcast";
import Templates from "./pages/Templates";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Guide from "./pages/Guide";
import Referral from "./pages/Referral";
import { Page } from "./lib/types";

function AppContent() {
  const { user, loading, profile } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Loading WA CRM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === "signup") {
      return <Signup onSwitchToLogin={() => setAuthView("login")} />;
    }
    return <Login onSwitchToSignup={() => setAuthView("signup")} />;
  }

  const renderPage = () => {
    // Trial expired check
    if (!profile?.plan || profile.plan === "free") {
      const trialEndsAt = (profile as any)?.trial_ends_at;
      if (trialEndsAt && new Date(trialEndsAt) < new Date()) {
        if (currentPage === "billing") {
          return <Billing />;
        }
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
              <div className="text-5xl mb-4">⏰</div>
              <h2 className="text-gray-900 text-xl font-bold mb-2">
                Free Trial Khatam Ho Gaya Hai!
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Apna WhatsApp automation continue karne ke liye plan upgrade
                karo.
              </p>
              <button
                onClick={() => setCurrentPage("billing")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Upgrade Now 🚀
              </button>
              <p className="text-gray-400 text-xs mt-4">
                Questions? WhatsApp karo: +91 88875 32915
              </p>
            </div>
          </div>
        );
      }
    }
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "chats":
        return <Chats />;
      case "contacts":
        return <Contacts />;
      case "auto-replies":
        return <AutoReplies />;
      case "ai-settings":
        return <AISettings />;
      case "broadcast":
        return <Broadcast />;
      case "templates":
        return <Templates />;
      case "billing":
        return <Billing />;
      case "guide":
        return <Guide />;
      case "referral":
        return <Referral />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
