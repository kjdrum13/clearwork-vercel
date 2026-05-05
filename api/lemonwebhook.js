// api/lemonwebhook.js
// Vercel serverless function — port of netlify/functions/lemonwebhook.js
// Handles LemonSqueezy subscription webhooks

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const secret = process.env.LEMONSQUEEZY_SIGNING_SECRET;
    const signature = req.headers['x-signature'];

    // Vercel provides the raw body via req.body when bodyParser is disabled
    // We need the raw string for HMAC — see config export below
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (signature !== hash) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventName = payload?.meta?.event_name;
    const email = payload?.data?.attributes?.user_email;

    console.log('LemonSqueezy webhook:', eventName, email);

    // Subscription access is managed client-side via LemonSqueezy customer portal.
    // Server-side persistence (Supabase/DB) is Phase 2.
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

// Disable body parsing so we can verify the raw HMAC signature
export const config = {
  api: {
    bodyParser: false
  }
};
