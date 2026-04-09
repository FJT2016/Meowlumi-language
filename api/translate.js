export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);
if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

const { word } = req.body;
if (!word) return res.status(400).json({ error: ‘No word provided’ });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) return res.status(500).json({ error: ‘GEMINI_API_KEY is missing’ });

const PROMPT = `You are the official translator for Meowlumi, a constructed language. Use these roots as building blocks:
mew=I/new/small, luma/lumori=light/see, flurr=good, mreek=bad, miru=go, miyah=come, nurrle=sleep, pawvi=eat, sipurr=drink, nyaveh=speak, purrelu=make, frishu=find, shimori=help, nurrika=take, pawshu=give, wemi=together, kishomi=big, mewlini=small, neko/nekowa=not/dark, lumashi=love/beautiful, purrika=soft, fushiki=fast, shimuri=happy, mireeka=sad, kishi=person, nurra=thing, lumara=place, shori=path, pawluri=warm, nurreli=cold, wesha=old, mewshi=new, fusha=run, nura=up, umi=all, nya=yes, shin=time, purrshin=past.
Rules: Join 2-3 roots with hyphens. Keep it musical and feline-sounding.
Respond ONLY with JSON (no markdown): {“meowlumi”:“word”,“pos”:“n/v/adj/adv/interj”,“breakdown”:“which roots and why”}

Translate to Meowlumi: “${word}”`;

try {
const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
{
method: ‘POST’,
headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify({
contents: [{ parts: [{ text: PROMPT }] }],
generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
})
}
);

```
const responseText = await response.text();
console.log('Gemini status:', response.status);
console.log('Gemini response:', responseText);

if (!response.ok) {
  return res.status(500).json({ error: `Gemini ${response.status}: ${responseText}` });
}

const data = JSON.parse(responseText);
const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
const clean = text.replace(/```json|```/g, '').trim();
const parsed = JSON.parse(clean);
return res.status(200).json(parsed);
```

} catch (e) {
console.log(‘Caught error:’, e.message);
return res.status(500).json({ error: e.message });
}
}
