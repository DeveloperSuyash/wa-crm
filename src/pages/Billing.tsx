import { useEffect, useState } from "react";
import {
  CreditCard,
  Check,
  Zap,
  Bot,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface UsageData {
  messages: number;
  ai: number;
  broadcasts: number;
  contacts: number;
  autoReplies: number;
}

const plans = [
  // {
  //   id: "free",
  //   name: "Free Trial",
  //   price: "₹0",
  //   period: "/3 days",
  //   features: [
  //     "200 contacts",
  //     "100 AI replies",
  //     "2 broadcasts",
  //     "5 templates",
  //     "1 team member",
  //     "Basic auto replies",
  //   ],
  //   limit: 1000,
  //   aiLimit: 100,
  //   color: "border-gray-200",
  //   btnColor: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  // },
  {
    id: "basic",
    name: "Basic",
    price: "₹1,199",
    period: "/month",
    features: [
      "1,000 contacts",
      "Unlimited manual chats",
      "500 AI replies/month",
      "5 broadcasts/month",
      "10 templates",
      "1 team member",
      "Basic CRM (tags, notes)",
      "200 free WA conversations",
    ],
    limit: 1000,
    aiLimit: 500,
    broadcastLimit: 5, // 👈 ye add karo
    autoReplyLimit: 10, // 👈 ye add karo
    contactLimit: 1000, // 👈 ye add karo
    color: "border-gray-200",
    btnColor: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  },
  {
    id: "standard",
    name: "Standard",
    price: "₹2,999",
    period: "/month",
    features: [
      "5,000 contacts",
      "2,000 AI replies/month",
      "20 broadcasts/month",
      "50 templates",
      "3 team members",
      "Basic automation",
      "Analytics",
      "1,000 free WA conversations",
    ],
    limit: 10000,
    aiLimit: 2000,
    broadcastLimit: 20, // 👈 ye add karo
    autoReplyLimit: 30, // 👈 ye add karo
    contactLimit: 5000, // 👈 ye add karo
    color: "border-emerald-400",
    btnColor: "bg-emerald-500 hover:bg-emerald-600 text-white",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹5,999",
    period: "/month",
    features: [
      "20,000 contacts",
      "10,000 AI replies/month",
      "Unlimited broadcasts",
      "Unlimited templates",
      "10 team members",
      "Advanced automation",
      "Full analytics",
      "Webhook + API access",
      "5,000 free WA conversations",
      "Priority support",
    ],
    limit: 999999,
    aiLimit: 10000,
    broadcastLimit: 999999, // 👈 ye add karo
    autoReplyLimit: 999999, // 👈 ye add karo
    contactLimit: 20000, // 👈 ye add karo
    color: "border-gray-200",
    btnColor: "bg-slate-800 hover:bg-slate-900 text-white",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited everything",
      "Unlimited numbers",
      "Custom AI training",
      "White-label option",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    limit: 999999,
    aiLimit: 999999,
    color: "border-gray-200",
    btnColor: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  },
];

export default function Billing() {
  const { user, profile } = useAuth();
  const [usage, setUsage] = useState<UsageData>({
    messages: 0,
    ai: 0,
    broadcasts: 0,
    contacts: 0,
    autoReplies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const monthYear = new Date().toISOString().slice(0, 7);
      const [msgRes, aiRes, bcRes, contactRes, arRes] = await Promise.all([
        supabase
          .from("messages")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .gte("created_at", `${monthYear}-01`),
        supabase
          .from("messages")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("message_type", "ai")
          .gte("created_at", `${monthYear}-01`),
        supabase
          .from("broadcasts")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("status", "completed")
          .gte("created_at", `${monthYear}-01`),
        supabase
          .from("contacts")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("auto_replies")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("is_active", true),
      ]);
      setUsage({
        messages: msgRes.count || 0,
        ai: aiRes.count || 0,
        broadcasts: bcRes.count || 0,
        contacts: contactRes.count || 0, // 👈 ye add karo
        autoReplies: arRes.count || 0, // 👈 ye add karo
      });
      setLoading(false);
    };
    load();
  }, [user]);

  const freePlan = {
    id: "free",
    name: "Free Trial",
    price: "₹0",
    period: "/3 days",
    features: [
      "200 contacts",
      "100 AI replies",
      "2 broadcasts",
      "5 templates",
      "1 team member",
      "Basic auto replies",
    ],
    limit: 1000,
    aiLimit: 100,
  };

  const currentPlan =
    profile?.plan === "free" || !profile?.plan
      ? freePlan
      : plans.find((p) => p.id === profile?.plan) || freePlan;
  const msgPct = Math.min(
    100,
    Math.round((usage.messages / (currentPlan.limit || 1000)) * 100),
  );
  const aiPct = Math.min(
    100,
    Math.round((usage.ai / (currentPlan.aiLimit || 100)) * 100),
  );

  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date((profile as any).trial_ends_at).getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-rose-50 p-2 rounded-lg">
          <CreditCard className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <p className="text-gray-900 font-bold">Billing & Usage</p>
          <p className="text-gray-500 text-xs">
            Monitor your usage and manage your plan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold">Current Month Usage</h3>
            <span className="text-gray-400 text-xs">
              {new Date().toLocaleDateString("en", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          {loading ? (
            <div className="space-y-5 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {[
                {
                  label: "Messages Sent",
                  value: usage.messages,
                  limit: currentPlan.limit,
                  pct: msgPct,
                  icon: MessageSquare,
                  color: "bg-blue-500",
                },
                {
                  label: "AI Replies Used",
                  value: usage.ai,
                  limit: currentPlan.aiLimit,
                  pct: aiPct,
                  icon: Bot,
                  color: "bg-orange-500",
                },
                {
                  label: "Broadcasts Sent",
                  value: usage.broadcasts,
                  limit: (currentPlan as any).broadcastLimit || 5,
                  pct: Math.min(
                    100,
                    Math.round(
                      (usage.broadcasts /
                        ((currentPlan as any).broadcastLimit || 5)) *
                        100,
                    ),
                  ),
                  icon: TrendingUp,
                  color: "bg-emerald-500",
                },
                {
                  label: "Contacts",
                  value: usage.contacts,
                  limit: (currentPlan as any).contactLimit || 1000,
                  pct: Math.min(
                    100,
                    Math.round(
                      (usage.contacts /
                        ((currentPlan as any).contactLimit || 1000)) *
                        100,
                    ),
                  ),
                  icon: Users,
                  color: "bg-teal-500",
                },
                {
                  label: "Auto Replies",
                  value: usage.autoReplies,
                  limit: (currentPlan as any).autoReplyLimit || 10,
                  pct: Math.min(
                    100,
                    Math.round(
                      (usage.autoReplies /
                        ((currentPlan as any).autoReplyLimit || 10)) *
                        100,
                    ),
                  ),
                  icon: Zap,
                  color: "bg-yellow-500",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-gray-900 text-sm font-semibold">
                        {item.value.toLocaleString()} /{" "}
                        {(item.limit || 0) < 999999
                          ? (item.limit || 0).toLocaleString()
                          : "Unlimited"}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${(item.pct || 0) > 80 ? "bg-red-500" : (item.pct || 0) > 60 ? "bg-yellow-500" : item.color}`}
                        style={{ width: `${item.pct}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {item.pct || 0}% used
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-gray-900 font-semibold mb-4">Current Plan</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900">
              {currentPlan.price}
            </span>
            <span className="text-gray-500 text-sm">{currentPlan.period}</span>
          </div>
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" /> {currentPlan.name} Plan
          </span>

          {profile?.plan === "free" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-amber-800 text-xs font-semibold">
                ⏳ Free Trial
              </p>
              <p className="text-amber-700 text-xs mt-1">
                {trialDaysLeft > 0
                  ? `${trialDaysLeft} din bache hain — upgrade karo!`
                  : "Trial khatam ho gayi — abhi upgrade karo!"}
              </p>
            </div>
          )}

          <ul className="space-y-2 mb-5">
            {currentPlan.features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-400 text-xs">
              Next billing date:{" "}
              <span className="text-gray-600 font-medium">
                {profile?.plan === "free" ? "N/A (Trial)" : "N/A"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-gray-900 font-bold text-lg mb-4">
          Upgrade Your Plan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border-2 ${plan.color} shadow-sm p-5 relative ${(plan as any).popular ? "ring-2 ring-emerald-400" : ""}`}
            >
              {(plan as any).popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                  Most Popular
                </div>
              )}
              <h4 className="text-gray-900 font-bold text-base mb-1">
                {plan.name}
              </h4>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-400 text-sm mb-0.5">
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (plan.id === (profile?.plan || "free")) return;
                  window.open(
                    `https://wa.me/917983145818?text=Hi, I want to upgrade to ${plan.name} plan (${plan.price}/month)`,
                    "_blank",
                  );
                }}
                className={`w-full py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${plan.btnColor} ${plan.id === (profile?.plan || "free") ? "opacity-60 cursor-default" : ""}`}
                disabled={plan.id === (profile?.plan || "free")}
              >
                {plan.id === (profile?.plan || "free") ? (
                  "Current Plan"
                ) : plan.price === "Custom" ? (
                  "Contact Sales"
                ) : (
                  <>
                    Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add-ons Section */}
      <div className="mt-8">
        <h3 className="text-gray-900 font-bold text-lg mb-2">Add-ons</h3>
        <p className="text-gray-500 text-sm mb-4">
          Extra resources kharidо apni zaroorat ke hisaab se
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: "Extra AI Replies",
              desc: "500 additional AI replies",
              price: "₹299",
              icon: "🤖",
            },
            {
              name: "Extra AI Replies",
              desc: "2,000 additional AI replies",
              price: "₹999",
              icon: "🤖",
            },
            {
              name: "Extra Contacts",
              desc: "1,000 additional contacts",
              price: "₹399",
              icon: "👥",
            },
            {
              name: "Extra Team Member",
              desc: "1 additional team member/month",
              price: "₹299",
              icon: "👤",
            },
            {
              name: "Setup + Onboarding",
              desc: "One-time setup assistance",
              price: "₹1,999",
              icon: "🚀",
            },
            {
              name: "AI Training",
              desc: "Custom system prompt setup",
              price: "₹999",
              icon: "✨",
            },
            {
              name: "Template Creation",
              desc: "5 WhatsApp approved templates",
              price: "₹499",
              icon: "📄",
            },
            {
              name: "Priority Support",
              desc: "1 month priority support",
              price: "₹499",
              icon: "⚡",
            },
          ].map((addon) => (
            <div
              key={addon.name + addon.price}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
            >
              <div className="text-2xl mb-2">{addon.icon}</div>
              <h4 className="text-gray-900 font-semibold text-sm">
                {addon.name}
              </h4>
              <p className="text-gray-500 text-xs mt-1 mb-3">{addon.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-bold">{addon.price}</span>
                <button
                  onClick={() =>
                    window.open(
                      `https://wa.me/917983145818?text=Hi, I want to purchase: ${addon.name} (${addon.price})`,
                      "_blank",
                    )
                  }
                  className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
