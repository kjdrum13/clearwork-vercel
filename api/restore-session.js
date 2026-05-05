// api/restore-session.js
// Vercel serverless function — port of netlify/functions/restore-session.js
// Placeholder: cross-device restore is Phase 2 (Supabase)
// App currently restores from localStorage

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  // Phase 2: fetch from Supabase here
  return res.status(404).json({ found: false });
}
