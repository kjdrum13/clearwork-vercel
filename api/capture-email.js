// api/capture-email.js
// Vercel serverless function — port of netlify/functions/capture-email.js
// Captures user email and sends vision summary via Resend

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, vision, projectName } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const visionText = vision
      ? vision.replace(/\n/g, '<br>')
      : 'Your vision is saved in the app.';

    await resend.emails.send({
      from: 'Clearwork <hello@getclearwork.app>',
      to: email,
      subject: `Your Clearwork vision${projectName ? ` for ${projectName}` : ''}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
          <p style="font-size: 13px; color: #888; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 32px;">Clearwork</p>
          <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 24px; line-height: 1.3;">
            ${projectName ? `Your vision for ${projectName}` : 'Your vision summary'}
          </h1>
          <div style="font-size: 15px; line-height: 1.7; color: #333; background: #f9f7f3; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
            ${visionText}
          </div>
          <p style="font-size: 14px; color: #555; line-height: 1.6;">
            This is your personal vision summary from Clearwork. It lives in your app and this email — keep it somewhere you'll see it.
          </p>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
            <a href="https://getclearwork.app/app" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Continue in Clearwork →
            </a>
          </div>
          <p style="font-size: 12px; color: #aaa; margin-top: 32px;">
            getclearwork.app
          </p>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Capture email error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
