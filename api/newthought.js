// api/newthought.js
// Vercel serverless function — port of netlify/functions/newthought.js
// Evaluates a new idea against the active project

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { thought, project, tone } = req.body;
    if (!thought || !project) {
      return res.status(400).json({ error: 'thought and project required' });
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

    const prompt = `You are helping someone evaluate a new idea against their active project. ${toneInstruction}

Active project vision:
${project.vision || 'Not provided'}

New idea or thought:
"${thought}"

Evaluate this new thought. Be honest and specific. Then give one of three recommendations:

INTEGRATE — This idea strengthens the current project and should be folded in now.
BACKBURNER — This is worth keeping but now is not the time. Save it for later.
EXAMINE — This is a significant pivot. It deserves real consideration before acting.

Format:
RECOMMENDATION: [INTEGRATE / BACKBURNER / EXAMINE]
REASONING: (2-3 sentences — specific to their project and idea, no generic advice)
ACTION: (1 concrete next step based on the recommendation)`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text;
    return res.status(200).json({ result: text });
  } catch (err) {
    console.error('NewThought error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
