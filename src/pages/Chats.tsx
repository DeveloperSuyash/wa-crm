import { useEffect, useState, useRef } from "react";
import {
  Search,
  Send,
  Bot,
  Zap,
  Phone,
  MoreVertical,
  ArrowLeft,
  MessageSquare,
  CheckCheck,
  Clock,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Conversation, Message, Contact } from "../lib/types";

export default function Chats() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<
    (Conversation & { contact: Contact })[]
  >([]);
  const [selectedConv, setSelectedConv] = useState<
    (Conversation & { contact: Contact }) | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("*, contact:contacts(*)")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false });
    if (data) setConversations(data as (Conversation & { contact: Contact })[]);
    setLoading(false);
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
    await supabase
      .from("conversations")
      .update({ unread_count: 0 })
      .eq("id", convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c)),
    );
  };

  const selectConversation = async (
    conv: Conversation & { contact: Contact },
  ) => {
    setSelectedConv(conv);
    setShowChat(true);
    await loadMessages(conv.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !user) return;
    setSending(true);

    // Save to database
    const { data } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        conversation_id: selectedConv.id,
        contact_id: selectedConv.contact_id,
        content: newMessage.trim(),
        direction: "outbound",
        message_type: "manual",
        status: "sent",
      })
      .select()
      .single();

    if (data) {
      setMessages((prev) => [...prev, data as Message]);

      // Send via WhatsApp API
      const { data: profile } = await supabase
        .from("profiles")
        .select("whatsapp_api_token, whatsapp_phone_id")
        .eq("id", user.id)
        .single();

      if (profile?.whatsapp_api_token && profile?.whatsapp_phone_id) {
        const phone = selectedConv.contact?.phone?.replace("+", "");
        await fetch(
          `https://graph.facebook.com/v19.0/${profile.whatsapp_phone_id}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${profile.whatsapp_api_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phone,
              type: "text",
              text: { body: newMessage.trim() },
            }),
          },
        );
      }

      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
        })
        .eq("id", selectedConv.id);

      await supabase
        .from("contacts")
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString(),
        })
        .eq("id", selectedConv.contact_id);
    }

    setNewMessage("");
    setSending(false);
    loadConversations();
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { day: "2-digit", month: "short" });
  };

  const filtered = conversations.filter(
    (c) =>
      c.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact?.phone?.includes(searchQuery),
  );

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-emerald-500",
      "bg-blue-500",
      "bg-orange-500",
      "bg-rose-500",
      "bg-teal-500",
      "bg-cyan-500",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const MessageTypeIcon = ({ type }: { type: string }) => {
    if (type === "ai") return <Bot className="w-3 h-3 text-orange-400" />;
    if (type === "auto") return <Zap className="w-3 h-3 text-yellow-400" />;
    return null;
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      <div
        className={`
        w-full lg:w-80 xl:w-96 border-r border-gray-200 flex flex-col flex-shrink-0
        ${showChat ? "hidden lg:flex" : "flex"}
      `}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-1 p-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 animate-pulse"
                >
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1.5"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
              <MessageSquare className="w-12 h-12 mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                No conversations yet
              </p>
              <p className="text-xs mt-1">
                Messages from WhatsApp will appear here
              </p>
            </div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                  selectedConv?.id === conv.id
                    ? "bg-emerald-50 border-l-2 border-l-emerald-500"
                    : ""
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full ${getAvatarColor(conv.contact?.name || "A")} flex items-center justify-center text-white font-semibold text-base flex-shrink-0`}
                >
                  {(conv.contact?.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-900 text-sm font-semibold truncate">
                      {conv.contact?.name || "Unknown"}
                    </span>
                    <span className="text-gray-400 text-xs flex-shrink-0">
                      {conv.last_message_at
                        ? formatTime(conv.last_message_at)
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-gray-500 text-xs truncate">
                      {conv.contact?.last_message || "No messages yet"}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        {conv.unread_count > 9 ? "9+" : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div
        className={`
        flex-1 flex flex-col overflow-hidden
        ${showChat ? "flex" : "hidden lg:flex"}
      `}
      >
        {!selectedConv ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-9 h-9 text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold text-base">
              Select a conversation
            </p>
            <p className="text-sm mt-1">
              Choose a chat from the list to start messaging
            </p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 bg-white">
              <button
                onClick={() => setShowChat(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div
                className={`w-9 h-9 rounded-full ${getAvatarColor(selectedConv.contact?.name || "A")} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
              >
                {(selectedConv.contact?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-semibold text-sm">
                  {selectedConv.contact?.name}
                </p>
                <p className="text-gray-400 text-xs">
                  {selectedConv.contact?.phone}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundColor: "#f9fafb",
              }}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                  <Clock className="w-8 h-8 mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-sm xl:max-w-md ${msg.direction === "outbound" ? "items-end" : "items-start"} flex flex-col`}
                    >
                      <div
                        className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.direction === "outbound"
                            ? "bg-emerald-500 text-white rounded-tr-sm"
                            : "bg-white text-gray-800 rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 ${msg.direction === "outbound" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <span className="text-gray-400 text-[10px]">
                          {formatTime(msg.created_at)}
                        </span>
                        <MessageTypeIcon type={msg.message_type} />
                        {msg.direction === "outbound" && (
                          <CheckCheck className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none"
                    style={{ maxHeight: "100px" }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-400 text-[10px] mt-1.5 text-center">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
