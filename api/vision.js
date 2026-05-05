// api/vision.js
// Vercel serverless function — port of netlify/functions/vision.js
// Generates AI vision synthesis from user answers

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { answers, tone } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array required' });
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

    const prompt = `You are a vision clarity coach. A user has answered 8 questions about what they are building. ${toneInstruction}

User answers:
${answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}

Generate a vision synthesis with exactly these sections:
1. VISION STATEMENT (2-3 sentences capturing the core of what they're building and why)
2. WHO IT'S FOR (1-2 sentences — specific, not generic)
3. WHAT MAKES IT REAL (2-3 honest observations about their answers — strengths and the one thing that could derail them)
4. FIRST 3 ACTIONS (numbered, concrete, doable this week)

Be specific to their actual answers. Do not be generic. Do not use corporate language.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text;
    return res.status(200).json({ vision: text });
  } catch (err) {
    console.error('Vision error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
