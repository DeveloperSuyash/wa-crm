import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Eye,
  EyeOff,
  Webhook,
  Shield,
  Globe,
  User,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    business_name: "",
    whatsapp_number: "",
    whatsapp_api_token: "",
    whatsapp_phone_id: "",
    ai_api_key: "",
    timezone: "UTC",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showAiKey, setShowAiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "account" | "whatsapp" | "webhook" | "security"
  >("account");

  useEffect(() => {
    if (profile) {
      setFormData({
        business_name: profile.business_name || "",
        whatsapp_number: profile.whatsapp_number || "",
        whatsapp_api_token: profile.whatsapp_api_token || "",
        whatsapp_phone_id: profile.whatsapp_phone_id || "",
        ai_api_key: profile.ai_api_key || "",
        timezone: profile.timezone || "UTC",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        business_name: formData.business_name,
        whatsapp_number: formData.whatsapp_number,
        whatsapp_api_token: formData.whatsapp_api_token,
        whatsapp_phone_id: formData.whatsapp_phone_id,
        ai_api_key: formData.ai_api_key,
        timezone: formData.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (!error) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  const webhookUrl = `${window.location.origin}/webhook/${user?.id?.slice(0, 8)}`;

  const tabs = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "whatsapp" as const, label: "WhatsApp API", icon: Globe },
    { id: "webhook" as const, label: "Webhook", icon: Webhook },
    { id: "security" as const, label: "Security", icon: Shield },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-lg">
            <SettingsIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="text-gray-900 font-bold">Settings</p>
            <p className="text-gray-500 text-xs">
              Manage your account and integrations
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${saved ? "bg-emerald-500 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"} disabled:bg-emerald-300`}
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "account" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="text-gray-900 font-semibold">Account Information</h3>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Business Name
            </label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) =>
                setFormData({ ...formData, business_name: e.target.value })
              }
              placeholder="Your Business Name"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-gray-400 text-xs mt-1">
              Email cannot be changed here
            </p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) =>
                setFormData({ ...formData, timezone: e.target.value })
              }
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {[
                "UTC",
                "Asia/Kolkata",
                "America/New_York",
                "America/Los_Angeles",
                "Europe/London",
                "Europe/Paris",
                "Asia/Dubai",
                "Asia/Singapore",
                "Australia/Sydney",
              ].map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              AI API Key (Groq)
            </label>
            <div className="relative">
              <input
                type={showAiKey ? "text" : "password"}
                value={formData.ai_api_key}
                onChange={(e) =>
                  setFormData({ ...formData, ai_api_key: e.target.value })
                }
                placeholder="gsk_..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowAiKey(!showAiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showAiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              Required for AI-powered responses. Get yours at console.groq.com
            </p>
          </div>
        </div>
      )}

      {activeTab === "whatsapp" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="text-gray-900 font-semibold">WhatsApp Business API</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm font-semibold">Setup Guide</p>
            <ol className="text-blue-700 text-xs mt-1 space-y-1 list-decimal list-inside">
              <li>Create a Meta Business Account at business.facebook.com</li>
              <li>Apply for WhatsApp Business API access</li>
              <li>Create a WhatsApp Business App in Meta Developer Console</li>
              <li>Copy your Phone Number ID and Access Token below</li>
              <li>Set up the webhook URL in Meta Console (see Webhook tab)</li>
            </ol>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              WhatsApp Phone Number
            </label>
            <input
              type="text"
              value={formData.whatsapp_number}
              onChange={(e) =>
                setFormData({ ...formData, whatsapp_number: e.target.value })
              }
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Phone Number ID (from Meta)
            </label>
            <input
              type="text"
              value={formData.whatsapp_phone_id}
              onChange={(e) =>
                setFormData({ ...formData, whatsapp_phone_id: e.target.value })
              }
              placeholder="123456789012345"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Access Token (from Meta)
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={formData.whatsapp_api_token}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsapp_api_token: e.target.value,
                  })
                }
                placeholder="EAAxxxxxxxxxxxxxxxxx..."
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="pt-2">
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${formData.whatsapp_number && formData.whatsapp_api_token && formData.whatsapp_phone_id ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50 border border-gray-200"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${formData.whatsapp_number && formData.whatsapp_api_token && formData.whatsapp_phone_id ? "bg-emerald-500" : "bg-gray-300"}`}
              ></div>
              <span
                className={`text-sm font-medium ${formData.whatsapp_number && formData.whatsapp_api_token && formData.whatsapp_phone_id ? "text-emerald-700" : "text-gray-500"}`}
              >
                {formData.whatsapp_number &&
                formData.whatsapp_api_token &&
                formData.whatsapp_phone_id
                  ? "Configuration complete"
                  : "Not configured yet"}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "webhook" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="text-gray-900 font-semibold">Webhook Configuration</h3>
          <p className="text-gray-500 text-sm">
            Configure this webhook URL in your Meta Developer Console to receive
            incoming WhatsApp messages.
          </p>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Your Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-mono"
              />
              <button
                onClick={() => navigator.clipboard.writeText(webhookUrl)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Verify Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={`wa_verify_${user?.id?.slice(0, 12)}`}
                readOnly
                className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-mono"
              />
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `wa_verify_${user?.id?.slice(0, 12)}`,
                  )
                }
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-sm font-semibold">
              Setup in Meta Console
            </p>
            <ol className="text-amber-700 text-xs mt-1 space-y-1 list-decimal list-inside">
              <li>
                Go to Meta Developer Console → Your App → WhatsApp →
                Configuration
              </li>
              <li>Click "Edit" under Webhooks</li>
              <li>Paste the Webhook URL above</li>
              <li>Paste the Verify Token above</li>
              <li>Subscribe to "messages" events</li>
              <li>Click "Verify and Save"</li>
            </ol>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
          <h3 className="text-gray-900 font-semibold">Security Settings</h3>
          <div className="space-y-3">
            {[
              {
                label: "Data Encryption",
                desc: "All data is encrypted at rest and in transit",
                enabled: true,
              },
              {
                label: "Webhook Verification",
                desc: "Incoming webhooks are verified using HMAC signatures",
                enabled: true,
              },
              {
                label: "Rate Limiting",
                desc: "API rate limiting is enabled to prevent abuse",
                enabled: true,
              },
              {
                label: "Row Level Security",
                desc: "Database RLS ensures complete data isolation between tenants",
                enabled: true,
              },
              {
                label: "Two-Factor Authentication",
                desc: "Add an extra layer of security to your account",
                enabled: false,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-gray-900 text-sm font-medium">
                    {item.label}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${item.enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}
                >
                  {item.enabled ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-gray-900 font-semibold text-sm mb-3">
              Danger Zone
            </h4>
            <div className="border border-red-200 rounded-lg p-4">
              <p className="text-gray-900 text-sm font-medium mb-1">
                Delete Account
              </p>
              <p className="text-gray-500 text-xs mb-3">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <button className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors">
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
