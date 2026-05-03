export interface Profile {
  id: string;
  business_name: string;
  whatsapp_number: string;
  whatsapp_api_token: string;
  whatsapp_phone_id: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  ai_enabled: boolean;
  ai_api_key: string;
  trial_ends_at: string;
is_trial: boolean;
  monthly_message_limit: number;
  monthly_ai_limit: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  notes: string;
  status: 'active' | 'inactive' | 'blocked';
  last_message: string;
  last_message_at: string | null;
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  contact_id: string;
  last_message_at: string;
  last_inbound_at: string | null;
  unread_count: number;
  status: 'open' | 'closed' | 'archived';
  created_at: string;
  contact?: Contact;
}

export interface Message {
  id: string;
  user_id: string;
  conversation_id: string;
  contact_id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  message_type: 'manual' | 'auto' | 'ai' | 'template' | 'broadcast';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  wa_message_id: string;
  created_at: string;
}

export interface AutoReply {
  id: string;
  user_id: string;
  keyword: string;
  match_type: 'exact' | 'contains' | 'starts_with';
  reply_text: string;
  is_active: boolean;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  content: string;
  variables: string[];
  status: 'pending' | 'approved' | 'rejected';
  wa_template_id: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface AiSettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  model: string;
  system_prompt: string;
  language: string;
  temperature: number;
  max_tokens: number;
  use_for_complex_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface Broadcast {
  id: string;
  user_id: string;
  name: string;
  message: string;
  template_id: string | null;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  log_type: 'message' | 'ai' | 'broadcast';
  count: number;
  month_year: string;
  created_at: string;
}

export type Page =
  | 'dashboard'
  | 'chats'
  | 'contacts'
  | 'auto-replies'
  | 'ai-settings'
  | 'broadcast'
  | 'templates'
  | 'billing'
  | 'settings';
