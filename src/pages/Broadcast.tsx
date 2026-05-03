import { useEffect, useState } from "react";
import {
  Radio,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Broadcast as BroadcastType } from "../lib/types";

export default function Broadcast() {
  const { user, profile } = useAuth();
  const [broadcasts, setBroadcasts] = useState<BroadcastType[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    scheduled_at: "",
  });
  const [contactCount, setContactCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      load();
      loadContactCount();
      loadTemplates();
    }
  }, [user]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("broadcasts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setBroadcasts(data as BroadcastType[]);
    setLoading(false);
  };

  const loadContactCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("contacts")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("status", "active");
    setContactCount(count || 0);
  };

  const loadTemplates = async () => {
    const { data } = await supabase
      .from("templates")
      .select("*")
      .eq("user_id", user!.id)
      .eq("status", "approved");
    if (data) setTemplates(data);
  };

  const handleCreate = async () => {
    const monthYear = new Date().toISOString().slice(0, 7);
    const { count } = await supabase
      .from("broadcasts")
      .select("id", { count: "exact" })
      .eq("user_id", user!.id)
      .gte("created_at", `${monthYear}-01`);

    const limits: Record<string, number> = {
      free: 2,
      basic: 5,
      standard: 20,
      pro: 999999,
      enterprise: 999999,
    };
    const limit = limits[profile?.plan || "free"] || 2;

    if ((count || 0) >= limit) {
      setError(`Broadcast limit reached! (${limit}/month). Upgrade your plan.`);
      return;
    }
    if (!formData.name.trim() || !formData.message.trim()) {
      setError("Name and message are required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("broadcasts").insert({
      user_id: user!.id,
      name: formData.name.trim(),
      message: formData.message.trim(),
      status: formData.scheduled_at ? "scheduled" : "draft", // ← ye hai?
      total_recipients: contactCount,
      scheduled_at: formData.scheduled_at
        ? new Date(
            new Date(formData.scheduled_at).getTime() - 5.5 * 60 * 60 * 1000,
          ).toISOString()
        : null,
    });
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setShowModal(false);
    setFormData({ name: "", message: "", scheduled_at: "" });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const broadcast = broadcasts.find((b) => b.id === id);
    if (!broadcast) return;

    await supabase
      .from("broadcasts")
      .update({ status: "sending" })
      .eq("id", id);
    load();

    // Get profile for WhatsApp credentials
    const { data: profile } = await supabase
      .from("profiles")
      .select("whatsapp_api_token, whatsapp_phone_id")
      .eq("id", user!.id)
      .single();
    if (!profile?.whatsapp_api_token || !profile?.whatsapp_phone_id) {
      await supabase
        .from("broadcasts")
        .update({ status: "failed" })
        .eq("id", id);
      load();
      return;
    }
    // Get all active contacts
    const { data: contacts } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user!.id)
      .eq("status", "active");

    let sentCount = 0;
    let failedCount = 0;

    // Send to each contact
    for (const contact of contacts || []) {
      const phone = contact.phone?.replace("+", "");
      try {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${profile!.whatsapp_phone_id}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${profile!.whatsapp_api_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phone,
              type: "text",
              text: {
                body: broadcast.message.replace(
                  "{{1}}",
                  contact.name || "Customer",
                ),
              },
            }),
          },
        );
        if (res.ok) sentCount++;
        else failedCount++;
      } catch {
        failedCount++;
      }
    }

    // Update broadcast status
    await supabase
      .from("broadcasts")
      .update({
        status: "completed",
        sent_count: sentCount,
        delivered_count: sentCount,
        failed_count: failedCount,
        sent_at: new Date().toISOString(),
      })
      .eq("id", id);

    load();
  };

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ElementType }
  > = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: Clock },
    scheduled: {
      label: "Scheduled",
      color: "bg-blue-100 text-blue-600",
      icon: Clock,
    },
    sending: {
      label: "Sending...",
      color: "bg-yellow-100 text-yellow-700",
      icon: Send,
    },
    completed: {
      label: "Completed",
      color: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle,
    },
    failed: {
      label: "Failed",
      color: "bg-red-100 text-red-600",
      icon: XCircle,
    },
  };
  const deleteBroadcast = async (id: string) => {
    if (!confirm("Delete this broadcast?")) return;
    await supabase.from("broadcasts").delete().eq("id", id);
    load();
  };

  const resendBroadcast = async (b: BroadcastType) => {
    const { data } = await supabase
      .from("broadcasts")
      .insert({
        user_id: user!.id,
        name: `${b.name} (Resend)`,
        message: b.message,
        status: formData.scheduled_at ? "scheduled" : "draft",
        scheduled_at: formData.scheduled_at || null,
        total_recipients: contactCount,
      })
      .select()
      .single();
    if (data) load();
  };
  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Radio className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-900 font-bold">Broadcast Messages</p>
            <p className="text-gray-500 text-xs">
              Send messages to multiple contacts at once
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setFormData({ name: "", message: "", scheduled_at: "" });
            setError("");
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> New Broadcast
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Broadcasts",
            value: broadcasts.length,
            icon: Radio,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active Contacts",
            value: contactCount,
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Completed",
            value: broadcasts.filter((b) => b.status === "completed").length,
            icon: CheckCircle,
            color: "text-teal-600",
            bg: "bg-teal-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-gray-900 font-bold text-xl">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-20 bg-gray-100 rounded-lg"
              ></div>
            ))}
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Radio className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-gray-600 font-semibold">No broadcasts yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Create a broadcast to send messages to all your contacts
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {broadcasts.map((b) => {
              const config = statusConfig[b.status] || statusConfig.draft;
              const Icon = config.icon;
              return (
                <div
                  key={b.id}
                  className="px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h4 className="text-gray-900 font-semibold text-sm">
                          {b.name}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {b.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {b.total_recipients} recipients
                        </span>
                        {b.sent_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Send className="w-3 h-3" />
                            {b.sent_count} sent
                          </span>
                        )}
                        {b.delivered_count > 0 && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="w-3 h-3" />
                            {b.delivered_count} delivered
                          </span>
                        )}
                        {b.scheduled_at && b.status === "scheduled" && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Clock className="w-3 h-3" />
                            Scheduled:{" "}
                            {(() => {
                              const d = new Date(b.scheduled_at);
                              const ist = new Date(
                                d.getTime() + 5.5 * 60 * 60 * 1000,
                              );
                              return ist.toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              });
                            })()}
                          </span>
                        )}
                        <span>
                          {new Date(b.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {b.status === "draft" && (
                      <button
                        onClick={() => updateStatus(b.id, "sending")}
                        className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex-shrink-0"
                      >
                        <Send className="w-3 h-3" /> Send Now
                      </button>
                    )}
                    {b.status === "completed" && (
                      <button
                        onClick={() => resendBroadcast(b)}
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex-shrink-0"
                      >
                        <Send className="w-3 h-3" /> Resend
                      </button>
                    )}
                    <button
                      onClick={() => deleteBroadcast(b.id)}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-gray-900 font-bold">New Broadcast</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && (
                <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-700 text-sm">
                  This message will be sent to{" "}
                  <strong>{contactCount} active contacts</strong>.
                </p>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Use Template (optional)
                </label>
                <select
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    const { data } = await supabase
                      .from("templates")
                      .select("*")
                      .eq("id", e.target.value)
                      .single();
                    if (data)
                      setFormData({ ...formData, message: data.content });
                  }}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select template --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Summer Sale Announcement"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Type your broadcast message here..."
                  rows={5}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
                <p className="text-gray-400 text-xs mt-1">
                  {formData.message.length}/1000 characters
                </p>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Schedule (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_at: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Khali chhodo — abhi bhejne ke liye
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
