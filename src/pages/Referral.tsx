import { useEffect, useState } from "react";
import {
  Gift,
  Copy,
  Check,
  Users,
  DollarSign,
  TrendingUp,
  Share2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface Referral {
  id: string;
  referred_id: string;
  plan: string;
  commission: number;
  status: string;
  created_at: string;
}

export default function Referral() {
  const { user, profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    const { data } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setReferrals(data);
    setLoading(false);
  };

  const referralCode = (profile as any)?.referral_code || "";
  const referralLink = `https://app.wabot.devsuyash.in/?ref=${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarnings = referrals.reduce(
    (sum, r) => sum + (r.commission || 0),
    0,
  );
  const pendingEarnings = referrals
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + (r.commission || 0), 0);
  const paidEarnings = referrals
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + (r.commission || 0), 0);

  return (
    <div className="p-4 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-pink-50 p-2 rounded-lg">
          <Gift className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <p className="text-gray-900 font-bold">Refer & Earn</p>
          <p className="text-gray-500 text-xs">
            Refer karo, dono ko faayda milega!
          </p>
        </div>
      </div>

      {/* How it works banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-8 text-white">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5" /> Kaise Kaam Karta Hai?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🔗</div>
            <p className="font-semibold text-sm">Step 1</p>
            <p className="text-emerald-100 text-xs mt-1">
              Apna referral link share karo
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">👤</div>
            <p className="font-semibold text-sm">Step 2</p>
            <p className="text-emerald-100 text-xs mt-1">
              Friend signup kare tumhare link se
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">💰</div>
            <p className="font-semibold text-sm">Step 3</p>
            <p className="text-emerald-100 text-xs mt-1">
              Paid plan lete hi commission milti hai
            </p>
          </div>
        </div>
      </div>

      {/* Commission table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" /> Commission
          Structure
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-500 font-medium pb-3">
                  Plan
                </th>
                <th className="text-left text-gray-500 font-medium pb-3">
                  Friend ko
                </th>
                <th className="text-left text-gray-500 font-medium pb-3">
                  Tumhe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-3 font-medium">Basic ₹1,199</td>
                <td className="py-3 text-emerald-600 font-semibold">
                  20% off = ₹959
                </td>
                <td className="py-3 text-emerald-600 font-semibold">
                  ₹240 commission
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Standard ₹2,999</td>
                <td className="py-3 text-emerald-600 font-semibold">
                  20% off = ₹2,399
                </td>
                <td className="py-3 text-emerald-600 font-semibold">
                  ₹600 commission
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Pro ₹5,999</td>
                <td className="py-3 text-emerald-600 font-semibold">
                  20% off = ₹4,799
                </td>
                <td className="py-3 text-emerald-600 font-semibold">
                  ₹1,200 commission
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral Code + Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-gray-500 text-xs font-medium mb-2">
            TUMHARA REFERRAL CODE
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-lg font-bold text-emerald-600 tracking-widest">
              {referralCode || "Loading..."}
            </div>
            <button
              onClick={copyCode}
              className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-gray-500 text-xs font-medium mb-2">
            REFERRAL LINK
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-600 truncate">
              {referralLink}
            </div>
            <button
              onClick={copyLink}
              className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex-shrink-0"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Referrals",
            value: referrals.length,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Pending Earnings",
            value: `₹${pendingEarnings}`,
            icon: TrendingUp,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
          },
          {
            label: "Total Earned",
            value: `₹${totalEarnings}`,
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
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

      {/* Referrals list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-gray-900 font-semibold">Referral History</h3>
        </div>
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-4xl mb-4">🎁</div>
            <p className="text-gray-600 font-semibold">
              Abhi tak koi referral nahi
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Apna link share karo aur earn karna shuru karo!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {referrals.map((r) => (
              <div
                key={r.id}
                className="px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-900 text-sm font-medium">
                    New Referral
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(r.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-600 font-semibold text-sm">
                    +₹{r.commission}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout info */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-sm font-semibold mb-1">
          💳 Payout Policy
        </p>
        <p className="text-amber-700 text-xs leading-relaxed">
          Commission ₹500+ hone pe withdraw kar sakte hain. UPI pe directly
          transfer hoga. Withdrawal ke liye WhatsApp karein:{" "}
          <strong>+91 79831 45818</strong>
        </p>
      </div>
    </div>
  );
}
