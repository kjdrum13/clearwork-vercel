// api/retro.js
// Vercel serverless function — port of netlify/functions/retro.js
// Generates 90-day retrospective

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { project, weeklyResets, tone } = req.body;
    if (!project) {
      return res.status(400).json({ error: 'project required' });
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

    const resetSummary = weeklyResets && weeklyResets.length > 0
      ? weeklyResets.slice(-12).map((r, i) => `Week ${i + 1}: ${r.note || 'no note'}`).join('\n')
      : 'No weekly reset data available';

    const prompt = `You are helping someone reflect on completing a 90-day project runway. ${toneInstruction}

Original vision:
${project.vision || 'Not provided'}

Project name: ${project.name || 'Unnamed project'}

Weekly reset notes (last 12 weeks):
${resetSummary}

Milestones completed: ${(project.milestones || []).filter(m => m.done).length} of ${(project.milestones || []).length}

Generate a 90-day retrospective with:
1. WHAT YOU ACTUALLY BUILT (honest, specific — what exists now that didn't 90 days ago)
2. THE REAL STORY (what the pattern of their weekly notes reveals about how they work)
3. WHAT SURPRISED YOU (1-2 things that went differently than planned — good or bad)
4. WHAT YOU KNOW NOW (the most important thing learned about yourself or the project)
5. WHAT COMES NEXT (not a full plan — just the one most obvious next move)

Be honest. This is a retrospective, not a celebration. Acknowledge what didn't happen.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text;
    return res.status(200).json({ retro: text });
  } catch (err) {
    console.error('Retro error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
