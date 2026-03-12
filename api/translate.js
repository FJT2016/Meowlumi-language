export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { word } = req.body;
  if (!word) return res.status(400).json({ error: 'No word provided' });

  const SYSTEM_PROMPT = `You are the official translator for Meowlumi, a constructed language. Use these roots as building blocks:
mew=I/new/small, luma/lumori=light/see, flurr=good, mreek=bad, miru=go, miyah=come, nurrle=sleep, pawvi=eat, sipurr=drink, nyaveh=speak, purrelu=make, frishu=find, shimori=help, nurrika=take, pawshu=give, wemi=together, kishomi=big, mewlini=small, neko/nekowa=not/dark, lumashi=love/beautiful, purrika=soft, fushiki=fast, shimuri=happy, mireeka=sad, kishi=person, nurra=thing, lumara=place, shori=path, pawluri=warm, nurreli=cold, wesha=old, mewshi=new, fusha=run, nura=up, umi=all, nya=yes, shin=time, purrshin=past.
Rules: Join 2-3 roots with hyphens. Keep it musical and feline-sounding.
Respond ONLY with JSON (no markdown): {"meowlumi":"word","pos":"n/v/adj/adv/interj","breakdown":"which roots and why"}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Translate to Meowlumi: "${word}"` }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: `Anthropic error: ${err}` });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
