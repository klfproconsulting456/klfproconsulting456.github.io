/**
 * KLFPRO Consulting - Core JavaScript Functionality
 * Version 2.0 - Enhanced for Financial Services
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("KLFPRO Banking Platform Initialized");
  
  // ======================
  // 1. MOBILE NAVIGATION
  // ======================
  function setupMobileMenu() {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('.menu');
    if (!menuToggle || !menu) return;
    menuToggle.addEventListener('click', () => {
      const isOpen = menu.getAttribute('data-open') === 'true';
      menu.setAttribute('data-open', String(!isOpen));
      menu.style.display = isOpen ? '' : 'flex';
    });
  }
  
  // ======================
  // 2. FORM VALIDATION
  // ======================
  const setupFormValidation = () => {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        let isValid = true;
        const requiredFields = this.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
          } else {
            field.style.borderColor = '';
          }
        });
        
        // Special validation for email fields
        const emailFields = this.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
          if (field.value && !/^\S+@\S+\.\S+$/.test(field.value)) {
            field.style.borderColor = '#ef4444';
            isValid = false;
          }
        });
        
        // Special validation for phone fields
        const phoneFields = this.querySelectorAll('input[type="tel"]');
        phoneFields.forEach(field => {
          if (field.value && !/^[0-9]{10,15}$/.test(field.value)) {
            field.style.borderColor = '#ef4444';
            isValid = false;
          }
        });
        
        if (!isValid) {
          e.preventDefault();
          console.log("Form validation failed");
          // In production, show user-friendly error messages
        } else {
          console.log("Form validation passed - ready for submission");
          // Here you would typically add AJAX submission logic
        }
      });
    });
  };

  // ======================
  // 3. ANALYTICS & TRACKING
  // ======================
  const trackAnalyticsEvents = () => {
    // Track all external links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      if (!link.href.includes(window.location.hostname)) {
        link.addEventListener('click', function() {
          console.log(`Outbound link clicked: ${this.href}`);
          // ga('send', 'event', 'Outbound Link', 'click', this.href);
        });
      }
    });
    
    // Track CTA conversions
    document.querySelectorAll('.cta, .btn.primary').forEach(button => {
      button.addEventListener('click', function() {
        const ctaText = this.textContent.trim();
        const ctaType = this.classList.contains('primary') ? 'Primary' : 'Secondary';
        
        console.log(`CTA clicked: ${ctaText} (${ctaType})`);
        // ga('send', 'event', 'CTA', 'click', ctaText);
        
        // Special tracking for loan applications
        if (this.closest('#loan-application') || this.href.includes('apply')) {
          console.log("Loan application started");
          // ga('send', 'event', 'Conversion', 'Loan Application Start', 'Apply Now');
        }
      });
    });
    
    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function() {
        const formName = this.id || 'Unknown Form';
        console.log(`Form submitted: ${formName}`);
        // ga('send', 'event', 'Form', 'submit', formName);
      });
    });
  };

  // ======================
  // 4. LOAN CALCULATORS
  // ======================
  const initLoanCalculators = () => {
    // Placeholder for EMI calculator functionality
    const emiCalculator = document.querySelector('.emi-calculator');
    if (emiCalculator) {
      console.log("EMI calculator detected - would initialize here");
      // Implementation would go here
    }
  };

  // ======================
  // 5. CRM INTEGRATION
  // ======================
  const setupCRMIntegration = () => {
    // Placeholder for CRM dashboard functionality
    if (document.querySelector('.crm-dashboard')) {
      console.log("CRM dashboard detected - would initialize here");
      
      // Example: Click handlers for lead rows
      document.querySelectorAll('.lead-table tbody tr').forEach(row => {
        row.addEventListener('click', function() {
          console.log(`Viewing lead details for: ${this.cells[0].textContent}`);
          // In production, this would open a detailed view modal
        });
      });
    }
  };

  // ======================
  // 6. SMOOTH SCROLLING
  // ======================
  const setupSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, this.getAttribute('href'));
          }
        }
      });
    });
  };

  // ======================
  // 7. INITIALIZATION
  // ======================
  const init = () => {
    setupMobileMenu();
    setupFormValidation();
    trackAnalyticsEvents();
    initLoanCalculators();
    setupCRMIntegration();
    setupSmoothScrolling();
    initAssistantWidget();
    initNewsWidget();
    
    // Dynamic copyright year
    const yearElement = document.querySelector('.copyright-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  };
  
  init();
});

// ======================
// 8. PERFORMANCE OBSERVER
// ======================
if ('PerformanceObserver' in window) {
  const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`[Performance] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
    }
  });
  perfObserver.observe({ entryTypes: ['measure', 'resource'] });
}

// ======================
// 9. AI ASSISTANT WIDGET
// ======================
function initAssistantWidget() {
  ensureWidgetStyles();
  // Avoid duplicate init
  if (document.getElementById('assistant-fab')) return;

  const fab = document.createElement('button');
  fab.id = 'assistant-fab';
  fab.className = 'assistant-fab';
  fab.setAttribute('aria-label', 'Open AI Assistant');
  fab.innerHTML = '💬';

  const panel = document.createElement('div');
  panel.id = 'assistant-panel';
  panel.className = 'assistant-panel hidden';
  panel.innerHTML = `
    <div class="assistant-header">
      <div class="assistant-title">AI Home Loan Assistant</div>
      <button class="assistant-close" aria-label="Close">✕</button>
    </div>
    <div id="assistant-messages" class="assistant-messages"></div>
    <form id="assistant-form" class="assistant-form" autocomplete="off">
      <input id="assistant-input" type="text" placeholder="Ask about home loans, rates, eligibility…" required />
      <button class="assistant-send" type="submit">Send</button>
    </form>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const messagesEl = panel.querySelector('#assistant-messages');
  const formEl = panel.querySelector('#assistant-form');
  const inputEl = panel.querySelector('#assistant-input');
  const closeEl = panel.querySelector('.assistant-close');

  const chatHistory = [
    {
      role: 'system',
      content:
        'You are an expert Indian home loan assistant. Be concise, accurate, and actionable. Prefer RBI/SEBI, bank circulars, and mainstream financial media. If unsure, say so. Offer general guidance, not legal/financial advice.',
    },
  ];

  function appendMessage(role, text) {
    const row = document.createElement('div');
    row.className = `assistant-msg ${role}`;
    row.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function streamAsk(userText) {
    appendMessage('user', userText);
    const assistantRow = document.createElement('div');
    assistantRow.className = 'assistant-msg assistant';
    const assistantBubble = document.createElement('div');
    assistantBubble.className = 'bubble';
    assistantBubble.textContent = '';
    assistantRow.appendChild(assistantBubble);
    messagesEl.appendChild(assistantRow);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    const payload = { messages: [...chatHistory, { role: 'user', content: userText }] };
    let fullText = '';

    try {
      const response = await fetch('/api/ask/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) throw new Error('stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split(/\n\n/);
        buffer = lines.pop() || '';
        for (const line of lines) {
          const dataMatch = line.match(/^data:\s*(.*)$/m);
          if (!dataMatch) continue;
          const json = safeParseJson(dataMatch[1]);
          if (!json) continue;
          if (json.type === 'content') {
            fullText += json.content;
            assistantBubble.textContent = fullText;
            messagesEl.scrollTop = messagesEl.scrollHeight;
          } else if (json.type === 'done') {
            chatHistory.push({ role: 'user', content: userText });
            chatHistory.push({ role: 'assistant', content: fullText });
          }
        }
      }
    } catch (err) {
      // Fallback to non-streaming
      try {
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        fullText = data.content || 'Sorry, I could not process that right now.';
        assistantBubble.textContent = fullText;
        chatHistory.push({ role: 'user', content: userText });
        chatHistory.push({ role: 'assistant', content: fullText });
      } catch (e2) {
        assistantBubble.textContent = 'Assistant is unavailable. Please try again later.';
      }
    }
  }

  function safeParseJson(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  fab.addEventListener('click', () => {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      inputEl.focus();
      if (!messagesEl.dataset.intro) {
        appendMessage('assistant', 'Hi! Ask me about Indian home loans, eligibility, interest rates, subsidies (PMAY), balance transfer, and latest RBI/bank updates.');
        messagesEl.dataset.intro = '1';
      }
    }
  });
  closeEl.addEventListener('click', () => panel.classList.add('hidden'));

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    streamAsk(text);
  });
}

// ======================
// 10. LIVE NEWS WIDGET
// ======================
function initNewsWidget() {
  ensureWidgetStyles();
  if (document.getElementById('news-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'news-widget';
  widget.className = 'news-widget';
  widget.innerHTML = `
    <div class="news-header">
      <div class="news-title">Home Loan News (India)</div>
      <button class="news-collapse" aria-label="Hide">▾</button>
    </div>
    <div class="news-list" id="news-list"></div>
  `;
  document.body.appendChild(widget);

  const listEl = widget.querySelector('#news-list');
  const toggleEl = widget.querySelector('.news-collapse');
  toggleEl.addEventListener('click', () => widget.classList.toggle('collapsed'));

  function renderItem(item) {
    const el = document.createElement('a');
    el.className = 'klf-news-item';
    el.href = item.link || '#';
    el.target = '_blank';
    const date = new Date(item.published || Date.now());
    const dateStr = isNaN(date.getTime()) ? '' : date.toLocaleString();
    el.innerHTML = `
      <div class="title">${escapeHtml(item.title || 'Untitled')}</div>
      <div class="meta">${escapeHtml(new URL(item.source || item.link || '', window.location.href).hostname || '')}${dateStr ? ' • ' + dateStr : ''}</div>
    `;
    return el;
  }

  // Load initial items
  fetch('/api/news?limit=30')
    .then((r) => r.json())
    .then((data) => {
      (data.items || []).forEach((it) => listEl.appendChild(renderItem(it)));
    })
    .catch(() => {/* ignore */});

  // Stream new items
  try {
    const ev = new EventSource('/api/news/stream');
    ev.onmessage = (e) => {
      try {
        const item = JSON.parse(e.data);
        const el = renderItem(item);
        listEl.prepend(el);
        // Trim list
        while (listEl.children.length > 50) listEl.removeChild(listEl.lastChild);
      } catch {}
    };
  } catch {}
}

// Inject minimal scoped styles for assistant/news widgets to avoid global CSS conflicts
function ensureWidgetStyles() {
  if (document.getElementById('klf-widgets-style')) return;
  const style = document.createElement('style');
  style.id = 'klf-widgets-style';
  style.textContent = `
  .assistant-fab { position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px; border-radius: 999px; border: none; background: linear-gradient(135deg,#22d3ee,#a78bfa); color: #001b1f; font-size: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.25); cursor: pointer; z-index: 1000; }
  .assistant-panel { position: fixed; bottom: 90px; right: 20px; width: min(420px,92vw); height: 60vh; background: #0f172a; color: #e5e7eb; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden; z-index: 1000; }
  .assistant-panel.hidden { display: none; }
  .assistant-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); }
  .assistant-title { font-weight: 700; }
  .assistant-close { background: transparent; border: none; color: inherit; font-size: 18px; cursor: pointer; }
  .assistant-messages { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 10px; overflow: auto; }
  .assistant-msg .bubble { display: inline-block; padding: 10px 12px; border-radius: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); }
  .assistant-msg.user { align-self: flex-end; }
  .assistant-msg.user .bubble { background: linear-gradient(135deg,#22d3ee,#a78bfa); color: #001b1f; border: none; }
  .assistant-form { display: flex; gap: 8px; padding: 10px; border-top: 1px solid rgba(255,255,255,0.08); }
  .assistant-form input { flex: 1; padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: inherit; }
  .assistant-send { padding: 10px 14px; border-radius: 12px; border: none; font-weight: 700; background: linear-gradient(135deg,#22d3ee,#a78bfa); color: #001b1f; cursor: pointer; }
  .news-widget { position: fixed; bottom: 20px; left: 20px; width: min(480px,92vw); max-height: 40vh; background: #0f172a; color: #e5e7eb; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); overflow: hidden; z-index: 900; }
  .news-widget.collapsed .news-list { display: none; }
  .news-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .news-title { font-weight: 700; }
  .news-collapse { background: transparent; border: none; color: inherit; cursor: pointer; }
  .news-list { overflow: auto; max-height: calc(40vh - 44px); display: grid; gap: 8px; padding: 10px; }
  .klf-news-item { display: block; padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: inherit; }
  .klf-news-item .title { font-weight: 600; }
  .klf-news-item .meta { font-size: 12px; color: #94a3b8; margin-top: 4px; }
  `;
  document.head.appendChild(style);
}