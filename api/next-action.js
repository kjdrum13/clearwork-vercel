export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { vision, currentPhase, completedMilestones, incompleteMilestones, totalMilestones, completedCount, tone } = req.body;

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are a calm, experienced coach helping someone who is in the middle of building a real project. Your job is to give them ONE clear, grounded recommendation for what to do next.

Project vision: ${vision?.what || JSON.stringify(vision).slice(0, 200)}
Current phase: ${currentPhase?.title} — ${currentPhase?.goal}
Progress: ${completedCount} of ${totalMilestones} milestones complete

Completed so far:
${(completedMilestones||[]).map(m => '- ' + m).join('\n') || '- None yet'}

Still to do:
${(incompleteMilestones||[]).map(m => '- ' + m).join('\n') || '- All done'}

Write ONE paragraph, 3-5 sentences. Name the single most important next action. Be specific to what they wrote — no generic advice. Reference their actual milestones or vision. Tone: calm, direct, intelligent, human. No bullet points, no headers, no lists. Do not start with "I" or "You should".`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    });

    return res.status(200).json({ recommendation: message.content[0].text });

  } catch (err) {
    console.error('Next action error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
