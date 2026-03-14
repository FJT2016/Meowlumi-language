export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { word } = req.body;
  if (!word) return res.status(400).json({ error: 'No word provided' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is missing' });

  const SYSTEM_PROMPT = `You are the official translator for Meowlumi, a constructed language. Use these roots as building blocks:
mew=I/new/small, luma/lumori=light/see, flurr=good, mreek=bad, miru=go, miyah=come, nurrle=sleep, pawvi=eat, sipurr=drink, nyaveh=speak, purrelu=make, frishu=find, shimori=help, nurrika=take, pawshu=give, wemi=together, kishomi=big, mewlini=small, neko/nekowa=not/dark, lumashi=love/beautiful, purrika=soft, fushiki=fast, shimuri=happy, mireeka=sad, kishi=person, nurra=thing, lumara=place, shori=path, pawluri=warm, nurreli=cold, wesha=old, mewshi=new, fusha=run, nura=up, umi=all, nya=yes, shin=time, purrshin=past.
Rules: Join 2-3 roots with hyphens. Keep it musical and feline-sounding.
Respond ONLY with JSON (no markdown): {"meowlumi":"word","pos":"n/v/adj/adv/interj","breakdown":"which roots and why"}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Translate to Meowlumi: "${word}"` }
        ]
      })
    });

    const responseText = await response.text();
    console.log('OpenAI status:', response.status);
    console.log('OpenAI response:', responseText);

    if (!response.ok) {
      return res.status(500).json({ error: `OpenAI ${response.status}: ${responseText}` });
    }

    const data = JSON.parse(responseText);
    const text = data.choices?.[0]?.message?.content || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);

  } catch (e) {
    console.log('Caught error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
