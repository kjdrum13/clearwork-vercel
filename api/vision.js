export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let { answers, tone } = req.body;
    if (!answers) return res.status(400).json({ error: 'answers required' });
    if (!Array.isArray(answers)) answers = Object.values(answers).filter(v => v && String(v).trim());

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const toneMap = { direct: 'Be direct and no-nonsense.', gentle: 'Be warm and supportive.', analytical: 'Be precise and structured.', creative: 'Be expansive and inspiring.' };
    const toneInstruction = toneMap[tone] || toneMap.direct;

    const prompt = `You are a sharp, experienced startup coach reviewing someone's project vision. ${toneInstruction} You do not give generic advice. You read what they actually wrote and respond to it specifically.

User answers:
${answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}

Return ONLY valid JSON, no markdown, no preamble:
{
  "what": "2-3 sentences. Describe what they are building in plain language. Make it sharper and clearer than how they said it. No corporate language.",
  "who": "2-3 sentences. Who specifically is this for and what exact problem does it solve for them. Be concrete — name the person, name the pain.",
  "why": "2-3 sentences. Why does this matter and why are they the right person to build it. If their answer was thin, say so honestly.",
  "success": "2-3 sentences. What does 90-day success look like in measurable terms. Name a number, a milestone, or a moment that proves it worked.",
  "actions": [
    {"text": "One specific action directly tied to what they wrote — something they can do in the next 7 days that will tell them if this idea has legs", "tag": "Clarity"},
    {"text": "One action that forces them to test their core assumption with a real person or real data this week", "tag": "Validation"},
    {"text": "One action that addresses the biggest risk or gap you see in their answers — be direct about what that gap is", "tag": "Focus"}
  ]
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const vision = JSON.parse(clean);
    return res.status(200).json(vision);

  } catch (err) {
    console.error('Vision error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
