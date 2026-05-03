import { useEffect, useState } from 'react';
import {
  MessageSquare, Users, Bot, Activity,
  TrendingUp, TrendingDown, ArrowUpRight,
  CheckCircle, Clock, Zap, BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Page } from '../lib/types';

interface Stats {
  totalMessages: number;
  totalContacts: number;
  aiReplies: number;
  activeChats: number;
  messagesThisMonth: number;
  autoReplies: number;
}

interface RecentMessage {
  contact_name: string;
  content: string;
  created_at: string;
  direction: string;
}

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0, totalContacts: 0, aiReplies: 0,
    activeChats: 0, messagesThisMonth: 0, autoReplies: 0,
  });
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [contactsRes, messagesRes, aiRes, chatsRes, autoRepliesRes] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('messages').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('messages').select('id', { count: 'exact' }).eq('user_id', user.id).eq('message_type', 'ai'),
        supabase.from('conversations').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'open'),
        supabase.from('auto_replies').select('id', { count: 'exact' }).eq('user_id', user.id).eq('is_active', true),
      ]);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthRes = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString());

      const recentRes = await supabase
        .from('messages')
        .select('content, direction, created_at, contact_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentRes.data && recentRes.data.length > 0) {
        const contactIds = [...new Set(recentRes.data.map((m) => m.contact_id))];
        const contactsData = await supabase.from('contacts').select('id, name').in('id', contactIds);
        const contactMap = Object.fromEntries((contactsData.data || []).map((c) => [c.id, c.name]));
        setRecentMessages(
          recentRes.data.map((m) => ({
            contact_name: contactMap[m.contact_id] || 'Unknown',
            content: m.content,
            created_at: m.created_at,
            direction: m.direction,
          }))
        );
      }

      setStats({
        totalContacts: contactsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        aiReplies: aiRes.count || 0,
        activeChats: chatsRes.count || 0,
        messagesThisMonth: monthRes.count || 0,
        autoReplies: autoRepliesRes.count || 0,
      });
      setLoading(false);
    };
    load();
  }, [user]);

  const usagePct = profile
    ? Math.min(100, Math.round((stats.messagesThisMonth / profile.monthly_message_limit) * 100))
    : 0;
  const aiPct = profile
    ? Math.min(100, Math.round((stats.aiReplies / profile.monthly_ai_limit) * 100))
    : 0;

  const statCards = [
    {
      label: 'Total Messages', value: stats.totalMessages,
      icon: MessageSquare, color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600',
      trend: '+12%', up: true,
    },
    {
      label: 'Total Contacts', value: stats.totalContacts,
      icon: Users, color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600',
      trend: '+5%', up: true,
    },
    {
      label: 'AI Replies', value: stats.aiReplies,
      icon: Bot, color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600',
      trend: '+28%', up: true,
    },
    {
      label: 'Active Chats', value: stats.activeChats,
      icon: Activity, color: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600',
      trend: '-2%', up: false,
    },
  ];

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-6 w-16 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-lg font-bold">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {profile?.business_name || 'there'}!
          </h2>
          <p className="text-gray-500 text-sm">Here's what's happening with your WhatsApp CRM today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          System Online
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${card.light} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${card.text}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-0.5">{card.label}</p>
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${card.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.trend} this month
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <h3 className="text-gray-900 font-semibold text-sm">Recent Messages</h3>
            </div>
            <button
              onClick={() => onNavigate('chats')}
              className="text-emerald-600 text-xs font-medium flex items-center gap-1 hover:underline"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMessages.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No messages yet. Connect your WhatsApp to get started.
              </div>
            ) : (
              recentMessages.map((msg, i) => (
                <div key={i} className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs flex-shrink-0">
                    {msg.contact_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-gray-900 text-sm font-medium">{msg.contact_name}</span>
                      <span className="text-gray-400 text-xs flex-shrink-0">{formatTime(msg.created_at)}</span>
                    </div>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{msg.content}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    msg.direction === 'inbound' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {msg.direction === 'inbound' ? 'In' : 'Out'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-900 font-semibold text-sm mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              Usage This Month
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-600 text-xs">Messages</span>
                  <span className="text-gray-900 text-xs font-semibold">
                    {stats.messagesThisMonth} / {profile?.monthly_message_limit?.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${usagePct > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${usagePct}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-xs mt-1">{usagePct}% used</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-600 text-xs">AI Replies</span>
                  <span className="text-gray-900 text-xs font-semibold">
                    {stats.aiReplies} / {profile?.monthly_ai_limit}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${aiPct > 80 ? 'bg-red-500' : 'bg-orange-500'}`}
                    style={{ width: `${aiPct}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-xs mt-1">{aiPct}% used</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-900 font-semibold text-sm mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              Quick Status
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Auto Replies Active', value: stats.autoReplies, icon: Zap, color: 'text-yellow-500' },
                { label: 'Open Conversations', value: stats.activeChats, icon: MessageSquare, color: 'text-blue-500' },
                { label: 'AI Enabled', value: profile?.ai_enabled ? 'Yes' : 'No', icon: Bot, color: 'text-orange-500' },
                { label: 'WhatsApp Connected', value: profile?.whatsapp_number ? 'Yes' : 'No', icon: Clock, color: 'text-emerald-500' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="text-gray-600 text-xs">{item.label}</span>
                    </div>
                    <span className="text-gray-900 text-xs font-semibold">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
            <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
            <p className="text-emerald-100 text-xs mb-3">Unlock unlimited messages, AI replies & priority support.</p>
            <button
              onClick={() => onNavigate('billing')}
              className="bg-white text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
