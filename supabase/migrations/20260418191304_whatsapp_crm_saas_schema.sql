
/*
  # WhatsApp Automation + AI CRM SaaS Schema

  ## Overview
  Multi-tenant SaaS platform for WhatsApp automation and CRM.
  Each user/business is a separate tenant with isolated data.

  ## New Tables

  ### profiles
  - Extended user info: business name, WhatsApp number, plan, AI settings
  - Linked 1:1 to Supabase auth.users

  ### contacts
  - Customer contacts per tenant
  - Fields: name, phone, tags, last message, status

  ### conversations
  - WhatsApp conversation threads per contact
  - Tracks 24-hour window for messaging rules

  ### messages
  - Individual messages within conversations
  - Direction: inbound/outbound, type: manual/auto/ai/template

  ### auto_replies
  - Keyword-based auto reply rules per tenant
  - Supports exact match and contains matching

  ### templates
  - WhatsApp message templates with approval status
  - Used for outside 24-hour window messaging

  ### ai_settings
  - Per-tenant AI configuration
  - Custom prompts, language, toggle

  ### broadcasts
  - Mass messaging campaigns
  - Tracks sent/delivered/failed counts

  ### broadcast_recipients
  - Individual recipients per broadcast

  ### usage_logs
  - Track message and AI usage per tenant
  - Used for billing and analytics

  ## Security
  - RLS enabled on all tables
  - Each user can only access their own data
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL DEFAULT '',
  whatsapp_number text DEFAULT '',
  whatsapp_api_token text DEFAULT '',
  whatsapp_phone_id text DEFAULT '',
  plan text NOT NULL DEFAULT 'free',
  ai_enabled boolean NOT NULL DEFAULT false,
  ai_api_key text DEFAULT '',
  monthly_message_limit integer NOT NULL DEFAULT 1000,
  monthly_ai_limit integer NOT NULL DEFAULT 100,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- CONTACTS TABLE
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL,
  email text DEFAULT '',
  tags text[] DEFAULT '{}',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  last_message text DEFAULT '',
  last_message_at timestamptz,
  avatar_color text NOT NULL DEFAULT '#10b981',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, phone)
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  last_inbound_at timestamptz,
  unread_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, contact_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  direction text NOT NULL DEFAULT 'inbound',
  message_type text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'sent',
  wa_message_id text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- AUTO REPLIES TABLE
CREATE TABLE IF NOT EXISTS auto_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  match_type text NOT NULL DEFAULT 'contains',
  reply_text text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  trigger_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE auto_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own auto_replies"
  ON auto_replies FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auto_replies"
  ON auto_replies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auto_replies"
  ON auto_replies FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own auto_replies"
  ON auto_replies FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'UTILITY',
  language text NOT NULL DEFAULT 'en',
  content text NOT NULL,
  variables text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  wa_template_id text DEFAULT '',
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- AI SETTINGS TABLE
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  is_enabled boolean NOT NULL DEFAULT false,
  model text NOT NULL DEFAULT 'gpt-3.5-turbo',
  system_prompt text NOT NULL DEFAULT 'You are a helpful business assistant. Respond politely and professionally to customer queries.',
  language text NOT NULL DEFAULT 'en',
  temperature numeric NOT NULL DEFAULT 0.7,
  max_tokens integer NOT NULL DEFAULT 300,
  use_for_complex_only boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai_settings"
  ON ai_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_settings"
  ON ai_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_settings"
  ON ai_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- BROADCASTS TABLE
CREATE TABLE IF NOT EXISTS broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  message text NOT NULL,
  template_id uuid REFERENCES templates(id),
  status text NOT NULL DEFAULT 'draft',
  total_recipients integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  delivered_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own broadcasts"
  ON broadcasts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own broadcasts"
  ON broadcasts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own broadcasts"
  ON broadcasts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own broadcasts"
  ON broadcasts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- USAGE LOGS TABLE
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_type text NOT NULL DEFAULT 'message',
  count integer NOT NULL DEFAULT 1,
  month_year text NOT NULL DEFAULT to_char(now(), 'YYYY-MM'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage_logs"
  ON usage_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage_logs"
  ON usage_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(user_id, phone);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_replies_user_id ON auto_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_month ON usage_logs(user_id, month_year);
