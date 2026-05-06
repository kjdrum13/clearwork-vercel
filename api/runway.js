export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { answers, vision, tone } = req.body;
    if (!answers || !vision) return res.status(400).json({ error: 'answers and vision required' });

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `Project vision: ${JSON.stringify(vision).slice(0, 300)}

Create a 90-day runway with exactly 3 phases. Return ONLY valid JSON, no markdown:
{
  "phases": [
    {
      "name": "Phase name",
      "goal": "One sentence goal",
      "milestones": ["milestone 1", "milestone 2", "milestone 3"],
      "weeklyFocus": "What to do most days"
    }
  ]
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const runway = JSON.parse(clean);
    return res.status(200).json(runway);

  } catch (err) {
    console.error('Runway error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
