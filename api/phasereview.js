// api/phasereview.js
// Vercel serverless function — port of netlify/functions/phasereview.js
// Generates an end-of-phase review

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { learning, project, tone } = req.body;
    if (!learning || !project) {
      return res.status(400).json({ error: 'learning and project required' });
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const toneMap = {
      direct:     'Be direct, clear, and no-nonsense.',
      gentle:     'Be warm, encouraging, and supportive.',
      analytical: 'Be precise, structured, and data-minded.',
      creative:   'Be imaginative, expansive, and inspiring.'
    };
    const toneInstruction = toneMap[tone] || toneMap.direct;

    const prompt = `You are helping someone reflect on a completed phase of their project. ${toneInstruction}

Project vision:
${project.vision || 'Not provided'}

What they learned or accomplished this phase:
"${learning}"

Milestones completed: ${project.completedMilestones || 'Not specified'}

Generate a phase review with:
1. WHAT YOU BUILT (honest summary of what actually happened — specific to their input)
2. THE REAL WIN (the most important thing that moved forward, even if small)
3. WHAT TO CARRY INTO NEXT PHASE (1-2 things — lessons, momentum, open questions)
4. NEXT PHASE FOCUS (1 sentence — the single most important thing for the next 30 days)

Be specific. Don't be generic. Don't celebrate things they didn't do.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text;
    return res.status(200).json({ review: text });
  } catch (err) {
    console.error('PhaseReview error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
