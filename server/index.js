require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const logger = require('./logger');
const NewsStore = require('./newsStore');
const { fetchAllFeeds } = require('./rss/aggregator');
const { streamCompletion } = require('./ai/assistant');

const { OpenAI } = require('openai');

const app = express();
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

const newsStore = new NewsStore({
  maxItems: 500,
  persistPath: process.env.PERSIST_NEWS === 'true' ? (process.env.NEWS_PERSIST_PATH || path.join(__dirname, '..', 'data', 'news.json')) : null,
});

// Periodic feed polling
const FEED_INTERVAL_MS = 1000 * 60 * 5; // 5 minutes
const feedUrls = (process.env.NEWS_FEEDS || '').split(',').map((s) => s.trim()).filter(Boolean);

async function pollFeedsOnce() {
  if (feedUrls.length === 0) return;
  logger.info({ count: feedUrls.length }, 'Polling news feeds');
  try {
    const items = await fetchAllFeeds(feedUrls);
    items.forEach((item) => {
      const { created, item: saved } = newsStore.upsert(item);
      if (created) broadcastNewItem(saved);
    });
    logger.info({ items: items.length, store: newsStore.items.length }, 'Feed poll complete');
  } catch (err) {
    logger.error({ err }, 'Feed poll failed');
  }
}

setInterval(pollFeedsOnce, FEED_INTERVAL_MS).unref();
// Initial warm
pollFeedsOnce();

// SSE clients
const sseClients = new Set();
function broadcastNewItem(item) {
  const payload = `data: ${JSON.stringify(item)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/news', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  res.json({ items: newsStore.list(limit) });
});

app.get('/api/news/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

// AI chat endpoint (streaming via SSE)
app.post('/api/ask/stream', async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  await streamCompletion({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    openAI,
    res,
  });
});

// Non-streaming ask (optional)
app.post('/api/ask', async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages array required' });

  try {
    const openAI = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
    const completion = await openAI.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.3,
    });
    res.json(completion.choices?.[0]?.message || { role: 'assistant', content: '' });
  } catch (err) {
    logger.error({ err }, 'AI non-streaming request failed');
    res.status(500).json({ error: 'AI request failed' });
  }
});

// Serve static site
app.use('/', express.static(path.join(__dirname, '..')));

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);
});
