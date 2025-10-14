const RSSParser = require('rss-parser');
const fetch = require('node-fetch');
const logger = require('../logger');

const parser = new RSSParser({ timeout: 15000 });

async function fetchFeed(url) {
  try {
    // Try RSS/Atom first
    return await parser.parseURL(url);
  } catch (rssErr) {
    logger.debug({ url, rssErr: rssErr.message }, 'RSS parse failed, trying JSON');
    // Some sources may offer JSON endpoints; fetch raw
    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json;
  }
}

function normalizeEntries(feed, source) {
  if (!feed) return [];

  // RSS/Atom normalized shape
  if (feed.items && Array.isArray(feed.items)) {
    return feed.items.map((it) => ({
      source,
      title: it.title || it.headline || 'Untitled',
      link: it.link || it.url || it.guid || '',
      summary: it.contentSnippet || it.summary || it.content || '',
      published: it.isoDate || it.pubDate || it.published || new Date().toISOString(),
      categories: it.categories || [],
    }));
  }

  // Try common JSON shapes
  if (Array.isArray(feed)) {
    return feed.map((it) => ({
      source,
      title: it.title || 'Untitled',
      link: it.link || it.url || '',
      summary: it.description || it.summary || '',
      published: it.published || it.date || new Date().toISOString(),
      categories: it.categories || [],
    }));
  }

  if (feed.articles && Array.isArray(feed.articles)) {
    return feed.articles.map((it) => ({
      source,
      title: it.title || 'Untitled',
      link: it.link || it.url || '',
      summary: it.description || it.summary || '',
      published: it.publishedAt || it.published || new Date().toISOString(),
      categories: it.category ? [it.category] : [],
    }));
  }

  return [];
}

async function fetchAllFeeds(urls) {
  const results = await Promise.allSettled(urls.map((u) => fetchFeed(u)));
  const items = [];
  results.forEach((res, idx) => {
    const source = urls[idx];
    if (res.status === 'fulfilled') {
      const normalized = normalizeEntries(res.value, source);
      items.push(...normalized);
    } else {
      logger.warn({ source, err: res.reason?.message }, 'Feed fetch failed');
    }
  });
  return items;
}

module.exports = { fetchAllFeeds };
