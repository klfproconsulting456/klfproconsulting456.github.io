import Parser from 'rss-parser';
const parser = new Parser();
const SOURCES = [
    { name: 'ECONOMIC TIMES', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
    { name: 'MINT', url: 'https://www.livemint.com/rss/money' },
    { name: 'BUSINESS STANDARD', url: 'https://www.business-standard.com/rss/finance-103.rss' },
    { name: 'REUTERS INDIA', url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best' },
];
const loanKeywords = [
    'housing loan', 'home loan', 'mortgage', 'property loan', 'rbi', 'reserve bank of india', 'repo rate', 'emi', 'housing finance', 'home finance', 'pmay', 'affordable housing', 'cibil', 'credit score', 'real estate', 'property', 'monetary policy', 'interest rate', 'sbi', 'hdfc', 'icici', 'axis bank', 'kotak', 'pnb', 'bank of baroda'
];
function isRelevantIndianLoanNews(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    let score = 0;
    for (const k of loanKeywords) {
        if (text.includes(k))
            score += 1;
    }
    return score >= 2;
}
function importanceScore(title, description, pubDate) {
    const text = `${title} ${description}`.toLowerCase();
    let score = 0;
    if (text.includes('rbi'))
        score += 8;
    if (text.includes('interest rate'))
        score += 6;
    if (text.includes('home loan') || text.includes('housing loan'))
        score += 6;
    if (text.includes('sbi') || text.includes('hdfc') || text.includes('icici'))
        score += 4;
    if (text.includes('real estate') || text.includes('property'))
        score += 3;
    try {
        if (pubDate) {
            const diffHrs = (Date.now() - new Date(pubDate).getTime()) / 3_600_000;
            if (diffHrs < 1)
                score += 6;
            else if (diffHrs < 6)
                score += 4;
            else if (diffHrs < 24)
                score += 2;
        }
    }
    catch { }
    return score;
}
function formatRelativeTime(isoLike) {
    try {
        if (!isoLike)
            return 'Recently';
        const t = new Date(isoLike);
        const diffM = Math.floor((Date.now() - t.getTime()) / 60000);
        if (diffM < 5)
            return 'Just now';
        if (diffM < 60)
            return `${diffM}m ago`;
        const diffH = Math.floor(diffM / 60);
        if (diffH < 24)
            return `${diffH}h ago`;
        return t.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    catch {
        return 'Recently';
    }
}
export async function getLoanNews() {
    const results = [];
    const feeds = await Promise.allSettled(SOURCES.map(s => parser.parseURL(s.url)));
    for (let i = 0; i < feeds.length; i++) {
        const s = SOURCES[i];
        const r = feeds[i];
        if (r.status === 'fulfilled') {
            const feed = r.value;
            for (const item of feed.items.slice(0, 30)) {
                const title = item.title || '';
                const desc = item.contentSnippet || item.content || '';
                const link = item.link || '#';
                const pubDate = item.isoDate || item.pubDate;
                if (isRelevantIndianLoanNews(title, desc)) {
                    results.push({
                        category: s.name,
                        text: title.length > 90 ? `${title.slice(0, 87)}...` : title,
                        time: formatRelativeTime(pubDate),
                        source: s.name,
                        url: link,
                        importance: importanceScore(title, desc, pubDate)
                    });
                }
            }
        }
    }
    return results
        .filter((v, idx, arr) => arr.findIndex(x => x.text === v.text) === idx)
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 24);
}
export async function streamLoanNewsSSE(_req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    res.write(`event: ready\n`);
    res.write(`data: {"ok":true}\n\n`);
    async function push() {
        try {
            const items = await getLoanNews();
            res.write(`event: items\n`);
            res.write(`data: ${JSON.stringify({ items })}\n\n`);
        }
        catch (error) {
            res.write(`event: error\n`);
            res.write(`data: ${JSON.stringify({ error: error?.message || 'failed' })}\n\n`);
        }
    }
    // initial send and interval
    push();
    const id = setInterval(push, 60_000);
    res.on('close', () => clearInterval(id));
}
