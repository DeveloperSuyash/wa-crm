import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard as Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Template } from "../lib/types";

interface FormData {
  name: string;
  category: string;
  language: string;
  content: string;
  variables: string;
}
const emptyForm: FormData = {
  name: "",
  category: "UTILITY",
  language: "en",
  content: "",
  variables: "",
};

export default function Templates() {
  const { user, profile } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setTemplates(data as Template[]);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setError("");
    setShowModal(true);
  };
  const openEdit = (t: Template) => {
    setEditing(t);
    setFormData({
      name: t.name,
      category: t.category,
      language: t.language,
      content: t.content,
      variables: t.variables?.join(", ") || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing) {
      const { count } = await supabase
        .from("templates")
        .select("id", { count: "exact" })
        .eq("user_id", user!.id);

      const limits: Record<string, number> = {
        free: 5,
        basic: 10,
        standard: 50,
        pro: 999999,
        enterprise: 999999,
      };
      const limit = limits[profile?.plan || "free"] || 5;

      if ((count || 0) >= limit) {
        setError(
          `Template limit reached! (${limit} templates). Upgrade your plan.`,
        );
        return;
      }
    }
    if (!formData.name.trim() || !formData.content.trim()) {
      setError("Name and content are required");
      return;
    }
    setSaving(true);
    const vars = formData.variables
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const payload = {
      user_id: user!.id,
      name: formData.name.trim(),
      category: formData.category,
      language: formData.language,
      content: formData.content.trim(),
      variables: vars,
      status: "pending",
    };
    if (editing) {
      const { error } = await supabase
        .from("templates")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("templates").insert(payload);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await supabase.from("templates").delete().eq("id", id);
    load();
  };

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ElementType }
  > = {
    pending: {
      label: "Pending Review",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      color: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle,
    },
    rejected: {
      label: "Rejected",
      color: "bg-red-100 text-red-600",
      icon: XCircle,
    },
  };

  const categoryColors: Record<string, string> = {
    UTILITY: "bg-blue-100 text-blue-700",
    MARKETING: "bg-orange-100 text-orange-700",
    AUTHENTICATION: "bg-teal-100 text-teal-700",
  };

  const languages: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    es: "Spanish",
    fr: "French",
    ar: "Arabic",
    pt: "Portuguese",
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-teal-50 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-gray-900 font-bold">Message Templates</p>
            <p className="text-gray-500 text-xs">
              Pre-approved WhatsApp message templates
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-blue-800 text-sm font-semibold">
            About WhatsApp Templates
          </p>
          <p className="text-blue-700 text-xs mt-1">
            Templates must be approved by WhatsApp before use. They are required
            for messaging customers outside the 24-hour window. Use {"{{1}}"},{" "}
            {"{{2}}"} for dynamic variables.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-24 bg-gray-100 rounded-lg"
              ></div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-teal-400" />
            </div>
            <p className="text-gray-600 font-semibold">No templates yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Create templates to message customers after 24 hours
            </p>
            <button
              onClick={openCreate}
              className="mt-4 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Template
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {templates.map((t) => {
              const status = statusConfig[t.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div
                  key={t.id}
                  className="px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h4 className="text-gray-900 font-semibold text-sm">
                          {t.name}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[t.category] || "bg-gray-100 text-gray-600"}`}
                        >
                          {t.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {languages[t.language] || t.language}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm font-mono bg-gray-50 px-3 py-2 rounded-lg border text-xs leading-relaxed">
                        {t.content}
                      </p>
                      {(t.variables || []).length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-400 text-xs">
                            Variables:
                          </span>
                          {t.variables.map((v) => (
                            <span
                              key={v}
                              className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono"
                            >{`{{${v}}}`}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-gray-400 text-xs mt-2">
                        Used {t.usage_count} times · Created{" "}
                        {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-gray-900 font-bold">
                {editing ? "Edit Template" : "New Template"}
              </h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="order_confirmation"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="UTILITY">Utility</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {Object.entries(languages).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Message Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder={`Hello {{1}}, your order {{2}} has been confirmed! Thank you for shopping with us.`}
                  rows={5}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Use {"{{1}}"}, {"{{2}}"} etc. for dynamic variables
                </p>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Variable Names (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.variables}
                  onChange={(e) =>
                    setFormData({ ...formData, variables: e.target.value })
                  }
                  placeholder="customer_name, order_id"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editing ? "Save Changes" : "Submit for Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
