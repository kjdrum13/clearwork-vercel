// api/save-project.js
// Saves or updates a user's project data in Supabase, keyed by email.
// Called from the app after vision generation and on any significant change.

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, project_data, is_paid } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    if (!project_data || typeof project_data !== 'object') {
      return res.status(400).json({ error: 'project_data object required' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Upsert — insert or update based on email
    const response = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        project_data,
        is_paid: is_paid === true,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase save error:', err);
      return res.status(500).json({ error: 'Failed to save project' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('save-project error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
