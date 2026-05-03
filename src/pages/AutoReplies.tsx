import { useEffect, useState } from 'react';
import { Plus, Zap, CreditCard as Edit2, Trash2, X, Check, ToggleLeft, ToggleRight, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AutoReply } from '../lib/types';

interface FormData { keyword: string; match_type: string; reply_text: string; }
const emptyForm: FormData = { keyword: '', match_type: 'contains', reply_text: '' };

export default function AutoReplies() {
  const { user } = useAuth();
  const [rules, setRules] = useState<AutoReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AutoReply | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('auto_replies').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setRules(data as AutoReply[]);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setFormData(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (r: AutoReply) => {
    setEditing(r);
    setFormData({ keyword: r.keyword, match_type: r.match_type, reply_text: r.reply_text });
    setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.keyword.trim() || !formData.reply_text.trim()) { setError('Keyword and reply text are required'); return; }
    setSaving(true);
    const payload = { user_id: user!.id, keyword: formData.keyword.trim(), match_type: formData.match_type, reply_text: formData.reply_text.trim() };
    if (editing) {
      const { error } = await supabase.from('auto_replies').update(payload).eq('id', editing.id);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('auto_replies').insert(payload);
      if (error) { setError(error.message); setSaving(false); return; }
    }
    setSaving(false); setShowModal(false); load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('auto_replies').update({ is_active: !current }).eq('id', id);
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, is_active: !current } : r));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this auto reply rule?')) return;
    await supabase.from('auto_replies').delete().eq('id', id);
    load();
  };

  const matchTypeLabels: Record<string, string> = {
    exact: 'Exact Match', contains: 'Contains', starts_with: 'Starts With',
  };
  const matchTypeColors: Record<string, string> = {
    exact: 'bg-blue-100 text-blue-700', contains: 'bg-teal-100 text-teal-700', starts_with: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-50 p-2 rounded-lg"><Zap className="w-5 h-5 text-yellow-600" /></div>
          <div>
            <p className="text-gray-900 font-bold">{rules.length} Auto Reply Rules</p>
            <p className="text-gray-500 text-xs">Keyword-triggered automated responses</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <Hash className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-amber-800 text-sm font-semibold">How Auto Replies Work</p>
          <p className="text-amber-700 text-xs mt-1">When a customer sends a message containing a keyword, the system automatically replies with your configured response. Rules are checked in order of creation.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4 items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div><div className="h-3 bg-gray-100 rounded w-2/3"></div></div>
              </div>
            ))}
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mb-4"><Zap className="w-6 h-6 text-yellow-400" /></div>
            <p className="text-gray-600 font-semibold">No auto reply rules yet</p>
            <p className="text-gray-400 text-sm mt-1">Create rules to automate responses to common messages</p>
            <button onClick={openCreate} className="mt-4 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" /> Create First Rule
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rules.map((rule) => (
              <div key={rule.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${rule.is_active ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <Zap className={`w-4 h-4 ${rule.is_active ? 'text-yellow-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-gray-900 font-semibold text-sm">"{rule.keyword}"</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${matchTypeColors[rule.match_type]}`}>
                      {matchTypeLabels[rule.match_type]}
                    </span>
                    {!rule.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>}
                  </div>
                  <p className="text-gray-500 text-sm truncate">{rule.reply_text}</p>
                  <p className="text-gray-400 text-xs mt-1">Triggered {rule.trigger_count} times</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(rule.id, rule.is_active)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500">
                    {rule.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                  </button>
                  <button onClick={() => openEdit(rule)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-gray-900 font-bold">{editing ? 'Edit Rule' : 'New Auto Reply Rule'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Keyword *</label>
                <input
                  type="text" value={formData.keyword} onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="e.g., price, hello, timing"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Match Type</label>
                <select
                  value={formData.match_type} onChange={(e) => setFormData({ ...formData, match_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="contains">Contains — message includes keyword</option>
                  <option value="exact">Exact — message equals keyword exactly</option>
                  <option value="starts_with">Starts With — message begins with keyword</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Reply Message *</label>
                <textarea
                  value={formData.reply_text} onChange={(e) => setFormData({ ...formData, reply_text: e.target.value })}
                  placeholder="Enter the automated reply message..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Check className="w-4 h-4" />}
                {editing ? 'Save Changes' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
