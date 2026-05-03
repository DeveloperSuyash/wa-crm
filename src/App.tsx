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
import { Page } from "./lib/types";

function AppContent() {
  const { user, loading } = useAuth();
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
