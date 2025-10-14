import express from 'express';
import cors from 'cors';
import { getLoanNews, streamLoanNewsSSE } from './services/news.js';
import { summarizeText } from './services/summarize.js';
import { streamAssistant, answerOnce } from './services/assistant.js';
const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 8787;
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
// Fetch latest news (JSON)
app.get('/api/news', async (_req, res) => {
    try {
        const news = await getLoanNews();
        res.json({ items: news });
    }
    catch (error) {
        res.status(500).json({ error: error?.message || 'failed' });
    }
});
// Stream news via SSE
app.get('/api/news/stream', async (req, res) => {
    try {
        await streamLoanNewsSSE(req, res);
    }
    catch (error) {
        console.error('SSE error', error);
        try {
            res.end();
        }
        catch { }
    }
});
// Summarize text
app.post('/api/summarize', async (req, res) => {
    try {
        const { text } = req.body || {};
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'text is required' });
        }
        const summary = await summarizeText(text);
        res.json({ summary });
    }
    catch (error) {
        res.status(500).json({ error: error?.message || 'failed' });
    }
});
// Assistant answer (JSON, non-stream fallback)
app.post('/api/assistant', async (req, res) => {
    try {
        const { question } = req.body || {};
        if (!question || typeof question !== 'string') {
            return res.status(400).json({ error: 'question is required' });
        }
        const answer = await answerOnce(question);
        res.json({ summary: answer });
    }
    catch (error) {
        res.status(500).json({ error: error?.message || 'failed' });
    }
});
// Assistant chat (SSE stream)
app.post('/api/assistant/stream', async (req, res) => {
    try {
        const { question } = req.body || {};
        if (!question || typeof question !== 'string') {
            return res.status(400).json({ error: 'question is required' });
        }
        await streamAssistant(question, req, res);
    }
    catch (error) {
        console.error('assistant stream error', error);
        try {
            res.end();
        }
        catch { }
    }
});
// Assistant chat (SSE via GET for EventSource)
app.get('/api/assistant/stream', async (req, res) => {
    try {
        const question = req.query.question || '';
        if (!question) {
            return res.status(400).json({ error: 'question is required' });
        }
        await streamAssistant(question, req, res);
    }
    catch (error) {
        console.error('assistant stream error (GET)', error);
        try {
            res.end();
        }
        catch { }
    }
});
app.listen(port, () => {
    console.log(`AI News backend listening on http://localhost:${port}`);
});
