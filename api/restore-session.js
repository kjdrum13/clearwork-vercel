// api/restore-session.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/projects?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=project_data,is_paid,updated_at`,
      { method: 'GET', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );

    if (!response.ok) return res.status(500).json({ error: 'Failed to restore session' });

    const rows = await response.json();
    if (!rows || rows.length === 0) return res.status(404).json({ found: false });

    const row = rows[0];
    return res.status(200).json({ found: true, project_data: row.project_data, is_paid: row.is_paid, updated_at: row.updated_at });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
