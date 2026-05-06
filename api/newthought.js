export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { thought, project, tone } = req.body;
    if (!thought) return res.status(400).json({ error: 'thought required' });

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are a focused project coach. Someone is working on a project and has a new thought or idea. Evaluate whether it helps or distracts.

Project: ${project?.name || 'unknown'}
Vision: ${project?.vision?.what || JSON.stringify(project?.vision || '').slice(0, 150)}
New thought: "${thought}"

Return ONLY valid JSON, no markdown:
{
  "verdict": "integrate",
  "reasoning": "2-3 sentences specific to their project and idea",
  "suggestion": "One concrete next step"
}

verdict must be exactly one of: "integrate", "backburner", "examine"
- integrate: directly serves the current project goal
- backburner: good idea but not for now
- examine: significant pivot that needs real consideration`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    return res.status(200).json(result);

  } catch (err) {
    console.error('NewThought error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
