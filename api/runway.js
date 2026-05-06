export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { answers, vision, tone } = req.body;
    if (!answers || !vision) return res.status(400).json({ error: 'answers and vision required' });

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const visionSummary = typeof vision === 'object' ? (vision.what || JSON.stringify(vision).slice(0, 200)) : String(vision).slice(0, 200);

    const prompt = `You are a 90-day planning expert. Create a runway for this project:

${visionSummary}

Return ONLY valid JSON, no markdown, no preamble:
{
  "phases": [
    {
      "title": "Phase 1 name",
      "goal": "One sentence goal for this phase",
      "phase": 1,
      "milestones": [
        {"id": "m1", "text": "Specific milestone 1", "week": 1, "phase": 1},
        {"id": "m2", "text": "Specific milestone 2", "week": 2, "phase": 1},
        {"id": "m3", "text": "Specific milestone 3", "week": 3, "phase": 1}
      ],
      "focus": "What to focus on most days in this phase"
    },
    {
      "title": "Phase 2 name",
      "goal": "One sentence goal for this phase",
      "phase": 2,
      "milestones": [
        {"id": "m4", "text": "Specific milestone 4", "week": 5, "phase": 2},
        {"id": "m5", "text": "Specific milestone 5", "week": 6, "phase": 2},
        {"id": "m6", "text": "Specific milestone 6", "week": 7, "phase": 2}
      ],
      "focus": "What to focus on most days in this phase"
    },
    {
      "title": "Phase 3 name",
      "goal": "One sentence goal for this phase",
      "phase": 3,
      "milestones": [
        {"id": "m7", "text": "Specific milestone 7", "week": 9, "phase": 3},
        {"id": "m8", "text": "Specific milestone 8", "week": 10, "phase": 3},
        {"id": "m9", "text": "Specific milestone 9", "week": 11, "phase": 3}
      ],
      "focus": "What to focus on most days in this phase"
    }
  ]
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
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
