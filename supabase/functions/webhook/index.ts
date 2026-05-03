import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('DB_URL')!,
  Deno.env.get('DB_SERVICE_KEY')!
)

async function callGroq(systemPrompt: string, userMessage: string, model: string, temperature: number, maxTokens: number) {
    const key = Deno.env.get('GROQ_API_KEY')
  console.log('Groq key exists:', !!key)
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 300,
    })
  })
  const data = await response.json()
    console.log('Groq response:', JSON.stringify(data))

  return data.choices?.[0]?.message?.content || null
}

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    if (mode === 'subscribe' && token === 'wa_verify_6b8b93ee-0ab') {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  if (req.method === 'POST') {
    const body = await req.json()
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages
    if (!messages?.length) return new Response('OK', { status: 200 })

    const msg = messages[0]
    const fromPhone = msg.from
    const text = msg.text?.body || ''
    const waMessageId = msg.id
const phoneNumberId = value?.metadata?.phone_number_id
    const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('whatsapp_phone_id', value?.metadata?.phone_number_id)
  .maybeSingle()

    if (!profile) return new Response('OK', { status: 200 })
      // Trial check karo
const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
const isTrialExpired = trialEndsAt ? trialEndsAt < new Date() : false;
const isPaidPlan = profile.plan !== 'free';

if (isTrialExpired && !isPaidPlan) {
  return new Response('OK', { status: 200 })
}
    const userId = profile.id

    let { data: contact } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('phone', `+${fromPhone}`)
      .maybeSingle()

    if (!contact) {
      const { data: newContact } = await supabase
        .from('contacts')
        .insert({ user_id: userId, name: fromPhone, phone: `+${fromPhone}` })
        .select().single()
      contact = newContact
    }

    let { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('contact_id', contact.id)
      .maybeSingle()

    if (!conv) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ user_id: userId, contact_id: contact.id })
        .select().single()
      conv = newConv
    }

    await supabase.from('messages').insert({
      user_id: userId,
      conversation_id: conv.id,
      contact_id: contact.id,
      content: text,
      direction: 'inbound',
      message_type: 'manual',
      status: 'delivered',
      wa_message_id: waMessageId,
    })

    await supabase.from('conversations').update({
      last_message_at: new Date().toISOString(),
      last_inbound_at: new Date().toISOString(),
      unread_count: (conv.unread_count || 0) + 1,
    }).eq('id', conv.id)

    await supabase.from('contacts').update({
      last_message: text,
      last_message_at: new Date().toISOString(),
    }).eq('id', contact.id)

    // Check auto-replies first
    const { data: rules } = await supabase
      .from('auto_replies')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    const lowerText = text.toLowerCase()
    const matched = rules?.find(r => {
      const kw = r.keyword.toLowerCase()
      if (r.match_type === 'exact') return lowerText === kw
      if (r.match_type === 'contains') return lowerText.includes(kw)
      if (r.match_type === 'starts_with') return lowerText.startsWith(kw)
      return false
    })

    let replyText = null
    let messageType = 'auto'

    if (matched) {
      replyText = matched.reply_text
      await supabase.from('auto_replies')
        .update({ trigger_count: matched.trigger_count + 1 })
        .eq('id', matched.id)
    } else if (profile.ai_enabled) {
  console.log('AI enabled, checking ai_settings...')
      const { data: aiSettings } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
  console.log('AI Settings:', JSON.stringify(aiSettings))

      if (aiSettings?.is_enabled) {
        replyText = await callGroq(
          aiSettings.system_prompt,
          text,
          aiSettings.model,
          aiSettings.temperature,
          aiSettings.max_tokens
        )
        console.log('Groq reply:', replyText)

        messageType = 'ai'
      }
    }

    // Send reply if we have one
    if (replyText) {
      await fetch(`https://graph.facebook.com/v19.0/${profile.whatsapp_phone_id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${profile.whatsapp_api_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: fromPhone,
          type: 'text',
          text: { body: replyText },
        }),
      })

      await supabase.from('messages').insert({
        user_id: userId,
        conversation_id: conv.id,
        contact_id: contact.id,
        content: replyText,
        direction: 'outbound',
        message_type: messageType,
        status: 'sent',
      })
    }

    return new Response('OK', { status: 200 })
  }

  return new Response('Method Not Allowed', { status: 405 })
})