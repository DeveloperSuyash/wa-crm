import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MoreVertical,
  Trash2,
  CreditCard as Edit2,
  X,
  Check,
  Users,
  Filter,
  Download,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Contact } from "../lib/types";

const TAG_COLORS: Record<string, string> = {
  lead: "bg-blue-100 text-blue-700",
  customer: "bg-emerald-100 text-emerald-700",
  vip: "bg-amber-100 text-amber-700",
  support: "bg-rose-100 text-rose-700",
  prospect: "bg-cyan-100 text-cyan-700",
};

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  tags: string;
  notes: string;
}

const emptyForm: ContactFormData = {
  name: "",
  phone: "",
  email: "",
  tags: "",
  notes: "",
};

export default function Contacts() {
  const { user, profile } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<ContactFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadContacts();
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setContacts(data as Contact[]);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingContact(null);
    setFormData(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || "",
      tags: contact.tags?.join(", ") || "",
      notes: contact.notes || "",
    });
    setError("");
    setShowModal(true);
    setMenuOpen(null);
  };

  const handleSave = async () => {
    if (!editingContact) {
      const { count } = await supabase
        .from("contacts")
        .select("id", { count: "exact" })
        .eq("user_id", user!.id);

      const limits: Record<string, number> = {
        free: 200,
        basic: 1000,
        standard: 5000,
        pro: 20000,
        enterprise: 999999,
      };
      const limit = limits[profile?.plan || "free"] || 200;

      if ((count || 0) >= limit) {
        setError(
          `Contact limit reached! (${limit} contacts). Upgrade your plan.`,
        );
        return;
      }
    }
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Name and phone are required");
      return;
    }
    setSaving(true);
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      user_id: user!.id,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      tags,
      notes: formData.notes.trim(),
    };

    if (editingContact) {
      const { error } = await supabase
        .from("contacts")
        .update(payload)
        .eq("id", editingContact.id);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("contacts").insert(payload);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setShowModal(false);
    loadContacts();
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Delete this contact? This will also delete their conversations and messages.",
      )
    )
      return;
    await supabase.from("contacts").delete().eq("id", id);
    setMenuOpen(null);
    loadContacts();
  };

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag
      ? (c.tags || []).includes(selectedTag)
      : true;
    return matchesSearch && matchesTag;
  });
  const exportCSV = () => {
    const headers = [
      "Name",
      "Phone",
      "Email",
      "Tags",
      "Notes",
      "Last Message",
      "Created At",
    ];
    const rows = contacts.map((c) => [
      c.name,
      c.phone,
      c.email || "",
      (c.tags || []).join(", "),
      c.notes || "",
      c.last_message || "",
      new Date(c.created_at).toLocaleDateString("en-IN"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contacts_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const avatarColors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-amber-500",
  ];
  const getColor = (name: string) =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2 rounded-lg">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-gray-900 font-bold">
              {contacts.length} Contacts
            </p>
            <p className="text-gray-500 text-xs">Your customer database</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          {/* Tag Filters */}
          {Array.from(new Set(contacts.flatMap((c) => c.tags || []))).length >
            0 && (
            <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag(null)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  selectedTag === null
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {Array.from(new Set(contacts.flatMap((c) => c.tags || []))).map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                      selectedTag === tag
                        ? "bg-emerald-500 text-white"
                        : TAG_COLORS[tag] ||
                          "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ),
              )}
            </div>
          )}
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-40 mb-1.5"></div>
                  <div className="h-3 bg-gray-100 rounded w-28"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users className="w-12 h-12 mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">
              {search ? "No contacts found" : "No contacts yet"}
            </p>
            <p className="text-xs mt-1">
              {search
                ? "Try a different search"
                : "Add your first contact to get started"}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Contact</div>
              <div className="col-span-3">Phone</div>
              <div className="col-span-2">Tags</div>
              <div className="col-span-2">Last Message</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map((contact) => (
                <div
                  key={contact.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-5 py-3.5 hover:bg-gray-50 transition-colors items-center"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${getColor(contact.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                    >
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 text-sm font-semibold truncate">
                        {contact.name}
                      </p>
                      {contact.email && (
                        <p className="text-gray-400 text-xs truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5 text-gray-600 text-sm">
                    <Phone className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
                    {contact.phone}
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {(contact.tags || []).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600"}`}
                      >
                        {tag}
                      </span>
                    ))}
                    {(contact.tags || []).length > 2 && (
                      <span className="text-xs text-gray-400">
                        +{contact.tags.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-gray-500 text-xs truncate hidden md:block">
                    {contact.last_message || "—"}
                  </div>
                  <div className="col-span-1 flex justify-end relative">
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === contact.id ? null : contact.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === contact.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 w-36">
                        <button
                          onClick={() => openEdit(contact)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-gray-900 font-bold">
                {editingContact ? "Edit Contact" : "Add Contact"}
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
              {[
                {
                  label: "Full Name *",
                  key: "name",
                  type: "text",
                  placeholder: "John Doe",
                },
                {
                  label: "Phone Number *",
                  key: "phone",
                  type: "tel",
                  placeholder: "+91 98765 43210",
                },
                {
                  label: "Email Address",
                  key: "email",
                  type: "email",
                  placeholder: "john@example.com",
                },
                {
                  label: "Tags (comma separated)",
                  key: "tags",
                  type: "text",
                  placeholder: "lead, customer, vip",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-gray-700 text-sm font-medium mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.key as keyof ContactFormData]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any notes about this contact..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
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
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editingContact ? "Save Changes" : "Add Contact"}
              </button>
            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-9" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}
