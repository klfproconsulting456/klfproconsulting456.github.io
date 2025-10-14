# Real-time AI Home Loan News Assistant (India)

Run a Node backend that serves the static site, streams real-time India home-loan news via SSE, and provides an AI assistant for Q&A.

## Setup

1. Copy environment template and fill values:
```
cp .env.example .env
# Set OPENAI_API_KEY (and optionally OPENAI_BASE_URL, OPENAI_MODEL)
```

2. Install deps and start:
```
npm install
npm run dev
```

Open http://localhost:8080 and look for the chat bubble (bottom-right) and the news panel (bottom-left).

## Endpoints
- GET `/api/news?limit=50` – latest items
- GET `/api/news/stream` – Server-Sent Events stream of new items
- POST `/api/ask` – non-streaming chat completion
- POST `/api/ask/stream` – SSE streaming chat completion

## Notes
- Edit NEWS_FEEDS in `.env` to change/expand sources (RBI, ET BFSI, etc.)
- News is deduped and stored to `data/news.json` when `PERSIST_NEWS=true`.
# KLFPRO Consulting – Website Layout (Static Scaffold)

Generated: 2025-08-14 04:29 IST

## Structure
- `index.html` – Home
- `pages/services.html` – Services
- `pages/loans.html` – Loans
- `pages/partners.html` – Bank Partners
- `pages/crm.html` – CRM portal placeholder (wire up later)
- `pages/about.html` – About
- `pages/careers.html` – Careers
- `pages/contact.html` – Contact
- `pages/apply.html` – Apply form
- `pages/policy.html` – Privacy Policy
- `pages/terms.html` – Terms & Conditions
- `css/style.css` – theme & layout
- `js/main.js` – scripts
- `assets/logo.svg` – placeholder logo

## How to run
Open `index.html` in your browser, or serve the folder with any static server.

## Next steps
- Replace dummy text with real content & addresses
- Swap the hero illustration and add partner logos
- Connect CRM page to your backend auth & dashboards