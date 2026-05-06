// api/save-project.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, project_data, is_paid } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
    if (!project_data) return res.status(400).json({ error: 'project_data required' });

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if row exists first
    const check = await fetch(
      `${url}/rest/v1/projects?email=eq.${encodeURIComponent(cleanEmail)}&select=id`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const existing = await check.json();
    const exists = existing && existing.length > 0;

    const response = await fetch(
      exists
        ? `${url}/rest/v1/projects?email=eq.${encodeURIComponent(cleanEmail)}`
        : `${url}/rest/v1/projects`,
      {
        method: exists ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          email: cleanEmail,
          project_data,
          is_paid: is_paid === true,
          updated_at: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Failed to save project' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('save-project error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
