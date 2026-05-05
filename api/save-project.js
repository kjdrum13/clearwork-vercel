// api/save-project.js
// Vercel serverless function — port of netlify/functions/save-project.js
// Placeholder: server-side persistence is Phase 2 (Supabase)
// App currently uses localStorage for project data

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  // Phase 2: persist to Supabase here
  return res.status(200).json({ success: true });
}
