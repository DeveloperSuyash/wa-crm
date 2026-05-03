import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('DB_URL')!,
  Deno.env.get('DB_SERVICE_KEY')!
)

Deno.serve(async () => {
const now = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString()
  
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)

  for (const broadcast of broadcasts || []) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('whatsapp_api_token, whatsapp_phone_id')
      .eq('id', broadcast.user_id)
      .single()

    if (!profile?.whatsapp_api_token) continue

    const { data: contacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', broadcast.user_id)
      .eq('status', 'active')

    let sentCount = 0

    for (const contact of contacts || []) {
      const phone = contact.phone?.replace('+', '')
      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${profile.whatsapp_phone_id}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${profile.whatsapp_api_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { body: broadcast.message },
          }),
        })
        if (res.ok) sentCount++
      } catch {}
    }

    await supabase.from('broadcasts').update({
      status: 'completed',
      sent_count: sentCount,
      delivered_count: sentCount,
      sent_at: new Date().toISOString(),
    }).eq('id', broadcast.id)
  }

  return new Response('OK', { status: 200 })
})