import { useEffect, useState } from "react";
import {
  Bot,
  Save,
  ToggleLeft,
  ToggleRight,
  Info,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { AiSettings } from "../lib/types";

const DEFAULT_PROMPT = `You are a helpful and friendly sales assistant for this business. Your goal is to:
- Answer customer queries politely and professionally
- Provide accurate product/service information
- Help convert leads into customers
- Respond in the customer's preferred language

Keep responses concise and helpful. Never make promises you can't keep.`;

export default function AISettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setSettings(data as AiSettings);
    } else {
      const defaultSettings = {
        user_id: user.id,
        is_enabled: false,
        model: "gpt-3.5-turbo",
        system_prompt: DEFAULT_PROMPT,
        language: "en",
        temperature: 0.7,
        max_tokens: 300,
        use_for_complex_only: true,
      };
      const { data: created } = await supabase
        .from("ai_settings")
        .insert(defaultSettings)
        .select()
        .single();
      if (created) setSettings(created as AiSettings);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings || !user) return;
    setSaving(true);
    const { error } = await supabase.from("ai_settings").upsert({
      ...settings,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    });
    if (!error) {
      await supabase
        .from("profiles")
        .update({ ai_enabled: settings.is_enabled })
        .eq("id", user.id);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (loading || !settings) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-32 bg-gray-100 rounded-xl"></div>
          <div className="h-48 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 p-2 rounded-lg">
            <Bot className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-gray-900 font-bold">AI Settings</p>
            <p className="text-gray-500 text-xs">
              Configure AI-powered auto responses
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
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 font-semibold">AI Auto Responses</h3>
              <p className="text-gray-500 text-sm mt-0.5">
                Let AI handle complex customer queries automatically
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, is_enabled: !settings.is_enabled })
              }
            >
              {settings.is_enabled ? (
                <ToggleRight className="w-10 h-10 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-300" />
              )}
            </button>
          </div>
          {settings.is_enabled && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-emerald-700 text-sm">
                AI is active. Make sure your OpenAI API key is set in Account
                Settings.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="text-gray-900 font-semibold">AI Configuration</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">
                AI Model
              </label>
              <select
                value={settings.model}
                onChange={(e) =>
                  setSettings({ ...settings, model: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="llama3-8b-8192">Llama 3 8B (Fast)</option>
                <option value="llama3-70b-8192">Llama 3 70B (Best)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">
                Response Language
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="hinglish">Hinglish (Hindi + English)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="ar">Arabic</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">
                Creativity (Temperature): {settings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-gray-400 text-xs mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">
                Max Response Length
              </label>
              <select
                value={settings.max_tokens}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    max_tokens: parseInt(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="150">Short (150 tokens)</option>
                <option value="300">Medium (300 tokens)</option>
                <option value="500">Long (500 tokens)</option>
                <option value="1000">Extended (1000 tokens)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-gray-900 text-sm font-medium">
                Smart Cost Optimization
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                Use AI only for complex queries, auto-reply for simple ones (hi,
                price, timing)
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  use_for_complex_only: !settings.use_for_complex_only,
                })
              }
            >
              {settings.use_for_complex_only ? (
                <ToggleRight className="w-9 h-9 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-gray-900 font-semibold">System Prompt</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-6 top-0 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-56 hidden group-hover:block z-10">
                This prompt defines how the AI behaves. Be specific about your
                business context and tone.
              </div>
            </div>
          </div>
          <textarea
            value={settings.system_prompt}
            onChange={(e) =>
              setSettings({ ...settings, system_prompt: e.target.value })
            }
            rows={8}
            placeholder="Describe your business context, tone, and how the AI should respond..."
            className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono"
          />
          <p className="text-gray-400 text-xs mt-2">
            Tip: Include your business name, products/services, tone of voice,
            and any specific instructions.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
          <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-orange-800 text-sm font-semibold">
              OpenAI API Key Required
            </p>
            <p className="text-orange-700 text-xs mt-1">
              To enable AI responses, add your OpenAI API key in Settings →
              Account Settings → AI API Key. Get yours at platform.openai.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
