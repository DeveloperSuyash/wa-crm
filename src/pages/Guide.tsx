import { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  Zap,
  TrendingUp,
  MessageSquare,
  Bot,
  Radio,
  Users,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Star,
  DollarSign,
  Clock,
  Shield,
} from "lucide-react";

const faqs = [
  {
    q: "Kya WhatsApp number change ho jaayega?",
    a: "Nahi! Aapka existing WhatsApp number safe rehta hai. Business API alag system hai.",
  },
  {
    q: "AI kya language mein reply karta hai?",
    a: "AI Settings mein aap Hindi, English, ya Hinglish select kar sakte hain. Customer ki language mein bhi reply kar sakta hai.",
  },
  {
    q: "Broadcast ke liye template approve karna zaroori hai?",
    a: "24 ghante ke baad customer ko message karne ke liye template chahiye. 24 ghante ke andar free text message bhej sakte hain.",
  },
  {
    q: "Kitne contacts add kar sakte hain?",
    a: "Free trial mein 200, Basic mein 1,000, Standard mein 5,000, Pro mein 20,000 contacts.",
  },
  {
    q: "AI replies ka cost kya hai?",
    a: "Groq AI use ho raha hai jo bilkul free hai — 14,400 replies/day free mein milti hain!",
  },
  {
    q: "Agar internet band ho toh kya hoga?",
    a: "App Vercel aur Supabase pe hosted hai — 24/7 live rehta hai, aapka laptop/internet band ho toh bhi.",
  },
  {
    q: "Multiple WhatsApp numbers support karta hai?",
    a: "Pro plan mein 3 numbers, Enterprise mein unlimited numbers support hote hain.",
  },
  {
    q: "Data secure hai?",
    a: "Haan! Supabase Row Level Security use hoti hai — har user ka data bilkul alag aur secure hai.",
  },
];

const useCases = [
  {
    icon: "🛒",
    title: "Grocery / Kirana Store",
    points: [
      'Weekly reminder — "Stock khatam ho raha hoga!"',
      "Price inquiry ka auto reply",
      "New arrivals broadcast",
      "Home delivery orders manage karo",
    ],
    profit: "₹15,000-30,000 extra/month",
  },
  {
    icon: "💈",
    title: "Salon / Beauty Parlour",
    points: [
      "Appointment booking via WhatsApp",
      "Service price auto reply",
      "Offer broadcast to all customers",
      'Follow-up — "Aapka appointment kal hai"',
    ],
    profit: "₹10,000-20,000 extra/month",
  },
  {
    icon: "🍕",
    title: "Restaurant / Dhaba",
    points: [
      "Menu share auto reply",
      "Daily special broadcast",
      "Order confirmation messages",
      "Review collection automation",
    ],
    profit: "₹20,000-50,000 extra/month",
  },
  {
    icon: "🏫",
    title: "Coaching Center",
    points: [
      "Fee reminder automation",
      "New batch announcements",
      "Study material sharing",
      "Attendance updates to parents",
    ],
    profit: "₹25,000-60,000 extra/month",
  },
  {
    icon: "💊",
    title: "Medical Store / Clinic",
    points: [
      "Medicine availability auto reply",
      "Appointment reminders",
      "Health tips broadcast",
      "Prescription reminder",
    ],
    profit: "₹10,000-25,000 extra/month",
  },
  {
    icon: "👗",
    title: "Clothing / Fashion Store",
    points: [
      "New collection broadcast",
      "Size/price inquiry auto reply",
      "Sale announcement campaigns",
      "Order status updates",
    ],
    profit: "₹20,000-40,000 extra/month",
  },
];

export default function Guide() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contacts, setContacts] = useState(500);
  const [broadcastsPerMonth, setBroadcastsPerMonth] = useState(4);
  const [conversionRate, setConversionRate] = useState(5);
  const [avgOrderValue, setAvgOrderValue] = useState(500);

  const monthlyRevenue = Math.round(
    contacts * broadcastsPerMonth * (conversionRate / 100) * avgOrderValue,
  );

  return (
    <div className="p-4 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-50 p-2 rounded-lg">
          <HelpCircle className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="text-gray-900 font-bold">Help & Guide</p>
          <p className="text-gray-500 text-xs">
            Sab kuch samjho — features, use cases, aur profit
          </p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-8 text-white">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" /> Quick Start — 5 Steps mein Live Ho Jao
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { step: "1", title: "Signup karo", desc: "Free trial start karo" },
            {
              step: "2",
              title: "WhatsApp connect",
              desc: "Meta API setup karo",
            },
            { step: "3", title: "Auto replies", desc: "Keywords set karo" },
            { step: "4", title: "AI train karo", desc: "System prompt likho" },
            {
              step: "5",
              title: "Broadcast bhejo",
              desc: "Customers engage karo",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-white/20 rounded-xl p-3 text-center"
            >
              <div className="w-8 h-8 bg-white text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-2">
                {s.step}
              </div>
              <p className="font-semibold text-sm">{s.title}</p>
              <p className="text-emerald-100 text-xs mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-8">
        <h2 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> Features Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Bot,
              color: "bg-orange-50 text-orange-600",
              title: "AI Auto Replies",
              desc: "Groq AI se powered — customer ke complex questions ka automatically intelligent reply. 24/7 active.",
            },
            {
              icon: Zap,
              color: "bg-yellow-50 text-yellow-600",
              title: "Keyword Auto Replies",
              desc: '"price", "timing", "delivery" jaise keywords pe instant automated responses. Zero delay.',
            },
            {
              icon: Radio,
              color: "bg-blue-50 text-blue-600",
              title: "Broadcast Campaigns",
              desc: "Ek click mein 1000+ customers ko message bhejo. Scheduled broadcasts bhi set kar sakte ho.",
            },
            {
              icon: MessageSquare,
              color: "bg-emerald-50 text-emerald-600",
              title: "Live Chat CRM",
              desc: "Saari WhatsApp conversations ek jagah. Real-time messages, reply karo seedha app se.",
            },
            {
              icon: Users,
              color: "bg-teal-50 text-teal-600",
              title: "Contacts CRM",
              desc: "Customer database manage karo. Tags, notes, last message — sab ek jagah.",
            },
            {
              icon: Shield,
              color: "bg-purple-50 text-purple-600",
              title: "Secure & Reliable",
              desc: "24/7 live — laptop band ho toh bhi. Supabase RLS se data 100% secure.",
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
              >
                <div
                  className={`w-10 h-10 ${f.color} rounded-lg flex items-center justify-center mb-3`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-gray-900 font-semibold text-sm mb-1">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-500" /> ROI Calculator
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Calculate karo kitna extra revenue aa sakta hai
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Total Contacts:{" "}
              <span className="text-emerald-600 font-bold">{contacts}</span>
            </label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={contacts}
              onChange={(e) => setContacts(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-gray-400 text-xs mt-1">
              <span>100</span>
              <span>10,000</span>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Broadcasts/month:{" "}
              <span className="text-emerald-600 font-bold">
                {broadcastsPerMonth}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={broadcastsPerMonth}
              onChange={(e) => setBroadcastsPerMonth(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-gray-400 text-xs mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Conversion Rate:{" "}
              <span className="text-emerald-600 font-bold">
                {conversionRate}%
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-gray-400 text-xs mt-1">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Avg Order Value:{" "}
              <span className="text-emerald-600 font-bold">
                ₹{avgOrderValue}
              </span>
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={avgOrderValue}
              onChange={(e) => setAvgOrderValue(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-gray-400 text-xs mt-1">
              <span>₹100</span>
              <span>₹5,000</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
          <p className="text-emerald-700 text-sm font-medium mb-1">
            Estimated Extra Revenue
          </p>
          <p className="text-4xl font-bold text-emerald-600">
            ₹{monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-emerald-600 text-sm mt-1">per month</p>
          <p className="text-emerald-500 text-xs mt-2">
            {contacts} contacts × {broadcastsPerMonth} broadcasts ×{" "}
            {conversionRate}% conversion × ₹{avgOrderValue} order value
          </p>
        </div>
      </div>

      {/* Use Cases */}
      <div className="mb-8">
        <h2 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" /> Use Cases — Kaun Use
          Kar Sakta Hai
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc) => (
            <div
              key={uc.title}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              <div className="text-3xl mb-3">{uc.icon}</div>
              <h3 className="text-gray-900 font-semibold text-sm mb-2">
                {uc.title}
              </h3>
              <ul className="space-y-1.5 mb-3">
                {uc.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="bg-emerald-50 rounded-lg p-2 text-center">
                <p className="text-emerald-700 text-xs font-semibold">
                  {uc.profit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" /> Aksar Pooche Jaane
          Wale Sawaal
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-900 font-medium text-sm">
                  {faq.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white text-center">
        <Clock className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
        <h2 className="font-bold text-lg mb-2">Koi Sawaal Hai?</h2>
        <p className="text-slate-400 text-sm mb-4">
          Humse directly WhatsApp pe baat karo — 24/7 available
        </p>
        <button
          onClick={() =>
            window.open(
              "https://wa.me/917983145818?text=Hi, I need help with WA CRM",
              "_blank",
            )
          }
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          WhatsApp pe Poochho 💬
        </button>
      </div>
    </div>
  );
}
