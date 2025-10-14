const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function heuristicSummarize(text: string): string {
  const sentences = text
    .replace(/\s+/g, ' ')
    .match(/[^.!?]+[.!?]/g) || [text];
  const top = sentences.slice(0, 3).join(' ').trim();
  return top.length > 400 ? `${top.slice(0, 397)}...` : top;
}

export async function summarizeText(text: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    return heuristicSummarize(text);
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a concise financial news summarizer for India home loan context. Return 2-3 bullets.' },
          { role: 'user', content: `Summarize for India home loan borrowers: ${text}` }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });
    if (!response.ok) throw new Error(`OpenAI error ${response.status}`);
    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content || '';
    return content.trim() || heuristicSummarize(text);
  } catch {
    return heuristicSummarize(text);
  }
}
