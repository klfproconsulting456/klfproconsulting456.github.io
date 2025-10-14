import { getLoanNews } from './news.js';
import { summarizeText } from './summarize.js';
export async function streamAssistant(question, _req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    function send(event, payload) {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
    send('ready', { ok: true });
    try {
        const items = await getLoanNews();
        const top = items.slice(0, 6);
        const context = top.map(i => `- [${i.source}] ${i.text} (${i.time}) <${i.url}>`).join('\n');
        const prompt = `Answer the user question about India home loans. Use only the following recent headlines for context where relevant. Be concise, factual, avoid disclaimers, and if uncertain say so briefly.\n\nContext headlines:\n${context}\n\nQuestion: ${question}`;
        send('thinking', { message: 'Analyzing latest headlines...' });
        const summary = await summarizeText(prompt);
        // Stream chunked for better UX
        const chunks = summary.match(/.{1,200}(\s|$)/g) || [summary];
        for (const chunk of chunks) {
            send('content', { text: chunk.trim() });
            await new Promise(r => setTimeout(r, 80));
        }
        send('done', { ok: true });
    }
    catch (error) {
        send('error', { error: error?.message || 'assistant failed' });
    }
}
export async function answerOnce(question) {
    const items = await getLoanNews();
    const top = items.slice(0, 6);
    const context = top.map(i => `- [${i.source}] ${i.text} (${i.time}) <${i.url}>`).join('\n');
    const prompt = `Answer the user question about India home loans. Use only the following recent headlines for context where relevant. Be concise, factual, avoid disclaimers, and if uncertain say so briefly.\n\nContext headlines:\n${context}\n\nQuestion: ${question}`;
    const summary = await summarizeText(prompt);
    return summary;
}
