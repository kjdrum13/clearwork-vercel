export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { projects, weeklyResetsCount, monthsActive, tone } = req.body;
    if (!projects || !projects.length) return res.status(400).json({ error: 'projects required' });

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const toneMap = {
      direct: 'Be direct and no-nonsense.',
      balanced: 'Be warm but honest.',
      guidance: 'Be encouraging and supportive.'
    };
    const toneInstruction = toneMap[tone] || toneMap.direct;

    const projectSummaries = projects.map((p, i) => {
      const pct = p.milestonesTotal > 0 ? Math.round((p.milestonesComplete / p.milestonesTotal) * 100) : 0;
      const status = p.milestonesTotal > 0 && p.milestonesComplete === p.milestonesTotal
        ? 'appears complete'
        : p.milestonesComplete === 0
          ? 'just getting started'
          : 'in progress';
      return `Project ${i + 1}: ${p.name}
- Vision: ${p.visionWhat || 'not specified'}
- Why it matters: ${p.visionWhy || 'not specified'}
- Milestones: ${p.milestonesComplete} of ${p.milestonesTotal} complete (${pct}%)
- Phases complete: ${p.phasesComplete}
- Status: ${status}
- Started: ${p.created ? new Date(p.created).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'unknown'}`;
    }).join('\n\n');

    const prompt = `You are a calm, experienced coach reviewing someone's year of work. ${toneInstruction}

Here is what they have been building:

${projectSummaries}

Weekly resets completed: ${weeklyResetsCount}
Months active: ${monthsActive}

Write a year-in-review reflection in exactly 3 paragraphs. No headers, no bullets, no lists.

Paragraph 1: What they worked on. Name the projects specifically. Be honest about what got traction and what did not.
Paragraph 2: What patterns emerged. Look across the projects for recurring themes, strengths, or obstacles. Be specific, not generic.
Paragraph 3: What to carry forward. One clear directional observation based on everything above. Not a to-do list. Not motivational filler. Grounded in what the data shows.

Be specific to what they actually built. No corporate language. No empty encouragement.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    });

    return res.status(200).json({ reflection: message.content[0].text });

  } catch (err) {
    console.error('Year review error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
