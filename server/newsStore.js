const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

class NewsStore {
  constructor(options = {}) {
    this.items = [];
    this.maxItems = options.maxItems || 500;
    this.persistPath = options.persistPath || null;

    if (this.persistPath && fs.existsSync(this.persistPath)) {
      try {
        const raw = fs.readFileSync(this.persistPath, 'utf8');
        this.items = JSON.parse(raw);
      } catch (err) {
        logger.warn({ err }, 'Failed to read persisted news; continuing fresh');
      }
    }
  }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  upsert(article) {
    const identity = this._hash(
      `${article.title || ''}|${article.link || ''}|${article.published || ''}`
    );

    const existingIndex = this.items.findIndex((a) => a.id === identity);
    const item = { id: identity, ...article };

    if (existingIndex >= 0) {
      this.items[existingIndex] = { ...this.items[existingIndex], ...item };
      return { updated: true, item: this.items[existingIndex] };
    }

    this.items.unshift(item);
    if (this.items.length > this.maxItems) this.items.pop();
    this._persist();
    return { created: true, item };
  }

  list(limit = 50) {
    return this.items.slice(0, limit);
  }

  _persist() {
    if (!this.persistPath) return;
    try {
      fs.mkdirSync(path.dirname(this.persistPath), { recursive: true });
      fs.writeFileSync(this.persistPath, JSON.stringify(this.items, null, 2));
    } catch (err) {
      logger.warn({ err }, 'Failed to persist news to disk');
    }
  }
}

module.exports = NewsStore;
