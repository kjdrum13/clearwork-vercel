// api/runway.js
// Vercel serverless function — port of netlify/functions/runway.js
// Generates 90-day project runway from vision + answers

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { answers, vision, tone } = req.body;
    if (!answers || !vision) {
      return res.status(400).json({ error: 'answers and vision required' });
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

    const prompt = `You are a 90-day planning expert. ${toneInstruction}

Vision summary:
${vision}

Original answers:
${answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}

Create a 90-day project runway. Structure it as exactly 3 phases of 30 days each.

For each phase provide:
- PHASE NAME (short, evocative)
- PHASE GOAL (1 sentence — what done looks like at the end of this phase)
- MILESTONES (3-5 specific, concrete milestones for this phase)
- WEEKLY FOCUS (what the person should be doing most days this phase)

Make the milestones specific to their actual project. No generic advice. Each milestone should be something you could check off.

Format clearly with Phase 1, Phase 2, Phase 3 headings.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text;
    return res.status(200).json({ runway: text });
  } catch (err) {
    console.error('Runway error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
