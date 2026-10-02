// ---------- Dark mode toggle with saved preference ----------

const THEME_KEY = 'portfolio-theme';
const root = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');

function applyTheme(theme) {
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    toggleBtn.textContent = '☀️';
  } else {
    root.removeAttribute('data-theme');
    toggleBtn.textContent = '🌙';
  }
}

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function toggleTheme() {
  const isDark = root.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
}

applyTheme(getPreferredTheme());
toggleBtn.addEventListener('click', toggleTheme);

// ---------- Weather widget (Faisalabad) ----------

const weatherWidget = document.getElementById('weatherWidget');

if (weatherWidget) {
  const weatherIconEl = document.getElementById('weatherIcon');
  const weatherTempEl = document.getElementById('weatherTemp');
  const weatherDescEl = document.getElementById('weatherDesc');

  // Open-Meteo: free, no API key needed. Faisalabad = 31.4504, 73.1350
  const WEATHER_URL =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=31.4504&longitude=73.1350' +
    '&current=temperature_2m,weather_code' +
    '&timezone=Asia%2FKarachi';

  const WEATHER_REFRESH_MS = 5 * 1000; // refresh every 5 seconds

  // Maps WMO weather codes from Open-Meteo to an emoji and a label
  function describeWeather(code) {
    if (code === 0) return ['☀️', 'Clear'];
    if (code === 1) return ['🌤️', 'Mostly clear'];
    if (code === 2) return ['⛅', 'Partly cloudy'];
    if (code === 3) return ['☁️', 'Overcast'];
    if (code === 45 || code === 48) return ['🌫️', 'Fog'];
    if (code >= 51 && code <= 57) return ['🌦️', 'Drizzle'];
    if (code >= 61 && code <= 67) return ['🌧️', 'Rain'];
    if (code >= 71 && code <= 77) return ['❄️', 'Snow'];
    if (code >= 80 && code <= 82) return ['🌧️', 'Showers'];
    if (code >= 95) return ['⛈️', 'Thunderstorm'];
    return ['🌡️', 'Weather'];
  }

  async function loadWeather() {
    try {
      const response = await fetch(WEATHER_URL);
      if (!response.ok) throw new Error('Weather request failed');

      const data = await response.json();
      const temp = data?.current?.temperature_2m;
      const code = data?.current?.weather_code;

      if (typeof temp !== 'number') throw new Error('No temperature returned');

      const [icon, label] = describeWeather(code);
      weatherIconEl.textContent = icon;
      weatherTempEl.textContent = `${Math.round(temp)}°C`;
      weatherDescEl.textContent = label;
    } catch (err) {
      weatherIconEl.textContent = '🌡️';
      weatherTempEl.textContent = '--°C';
      weatherDescEl.textContent = 'Unavailable';
    }
  }

  loadWeather();
  setInterval(loadWeather, WEATHER_REFRESH_MS);
}

// ---------- Multi-phrase typing animation (only present on index.html) ----------

const typingTextEl = document.getElementById('typingText');
const typingGhostEl = document.getElementById('typingGhost');

if (typingTextEl && typingGhostEl) {
  const phrases = [
    'School Head Boy',
    'Computer Science Student',
    'Model United Nations Delegate',
    'Debating Society Leader',
    'Community Volunteer',
    'AI-Assisted Web Developer'
  ];

  // Reserve layout space for the longest phrase up front, so the
  // typing/backspacing animation never causes the page to reflow.
  const longestPhrase = phrases.reduce((a, b) => (b.length > a.length ? b : a), '');
  typingGhostEl.textContent = longestPhrase;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    typingTextEl.textContent = phrases[0];
  } else {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const TYPING_SPEED = 70;
    const DELETING_SPEED = 40;
    const PAUSE_AFTER_TYPED = 1400;
    const PAUSE_AFTER_DELETED = 400;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        typingTextEl.textContent = currentPhrase.slice(0, charIndex);
        if (charIndex === currentPhrase.length) {
          deleting = true;
          setTimeout(typeLoop, PAUSE_AFTER_TYPED);
          return;
        }
        setTimeout(typeLoop, TYPING_SPEED);
      } else {
        charIndex--;
        typingTextEl.textContent = currentPhrase.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(typeLoop, PAUSE_AFTER_DELETED);
          return;
        }
        setTimeout(typeLoop, DELETING_SPEED);
      }
    }

    typeLoop();
  }
}

// ---------- Contact form (only present on contact.html) ----------

const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (contactForm) {
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
  const THANK_YOU_MS = 4000; // how long the form stays hidden
  const thankYou = document.getElementById('thankYou');
  const thankYouTitle = document.getElementById('thankYouTitle');
  let thankYouTimer = null;

  // Hides the form, shows the thank-you note, then brings the form back
  function showThankYou(name) {
    thankYouTitle.textContent = name ? `Thank you, ${name}!` : 'Thank you!';
    contactForm.classList.add('is-hidden');
    thankYou.classList.add('is-visible');
    formNote.textContent = '';

    clearTimeout(thankYouTimer);
    thankYouTimer = setTimeout(() => {
      thankYou.classList.remove('is-visible');
      contactForm.classList.remove('is-hidden');
    }, THANK_YOU_MS);
  }

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const formData = new FormData(contactForm);

    // Safety check: the access key still needs to be added in contact.html
    if (formData.get('access_key') === 'YOUR_ACCESS_KEY_HERE') {
      formNote.textContent = 'The contact form is not set up yet. Please add your Web3Forms access key.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formNote.textContent = '';

    try {
      const response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Message could not be sent.');
      }

      contactForm.reset();
      showThankYou(name);
    } catch (err) {
      formNote.textContent = 'Sorry, your message could not be sent. Please try again in a moment.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

// ---------- Scroll-reveal animation for content sections ----------

// Which elements reveal on scroll (on every page), and with which animation.
// type: 'up' | 'left' | 'zoom' | 'fade'. stagger: items that enter together
// appear one after another instead of all at once.
const REVEAL_RULES = [
  { selector: '.page-lead', type: 'up' },
  { selector: '.hero', type: 'up' },
  { selector: '.stats-bar .stat-card', type: 'zoom', stagger: true },
  { selector: '.content-section', type: 'up' },
  { selector: '.achievement-item, .activity-item', type: 'left', stagger: true },
  { selector: 'footer', type: 'fade' }
];

const revealTargets = [];

REVEAL_RULES.forEach((rule) => {
  document.querySelectorAll(rule.selector).forEach((el) => {
    el.classList.add('reveal');
    el.dataset.reveal = rule.type;
    if (rule.stagger) el.dataset.stagger = '1';
    revealTargets.push(el);
  });
});

if (revealTargets.length && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    let order = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      if (el.dataset.stagger) {
        el.style.setProperty('--reveal-delay', `${Math.min(order, 5) * 90}ms`);
        order++;
      }

      el.classList.add('is-visible');
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}

// ---------- Animated stat counters (only present on index.html) ----------

const statNumbers = document.querySelectorAll('.stat-number');

function animateCount(el) {
  const target = parseInt(el.dataset.target, 10) || 0;
  const duration = 900;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    el.textContent = value + (el.dataset.suffix || '');
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target + (el.dataset.suffix || '');
    }
  }
  requestAnimationFrame(step);
}

if (statNumbers.length && 'IntersectionObserver' in window) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statNumbers.forEach((el) => statObserver.observe(el));
}

// ---------- Back to top button ----------

const backToTop = document.getElementById('backToTop');

if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---------- AI Chatbot Widget ----------

const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotTypingIndicator = document.getElementById('chatbotTypingIndicator');
const chatbotForm = document.getElementById('chatbotForm');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');

if (chatbotToggle && chatbotWindow && chatbotForm) {

  const CHATBOT_SYSTEM_PROMPT =
    'You are a helpful assistant for this portfolio website. Keep answers concise and friendly, under 3 sentences.';

  // Holds the running conversation in Gemini's format:
  // { role: 'user' | 'model', parts: [{ text: '...' }] }
  const chatbotHistory = [];

  // ----- Popup greeting (only exists in index.html) -----
  const chatbotPopup = document.getElementById('chatbotPopup');
  const chatbotPopupText = document.getElementById('chatbotPopupText');
  const chatbotPopupClose = document.getElementById('chatbotPopupClose');

  const POPUP_SEEN_KEY = 'chatbot-popup-seen';
  const POPUP_DELAY_MS = 3000;      // wait before showing
  const POPUP_VISIBLE_MS = 12000;   // auto-hide after this long
  let popupShowTimer = null;
  let popupHideTimer = null;

  function hideChatbotPopup() {
    clearTimeout(popupShowTimer);
    clearTimeout(popupHideTimer);
    if (chatbotPopup) chatbotPopup.classList.remove('is-visible');
  }

  function showChatbotPopup() {
    if (!chatbotPopup || chatbotWindow.classList.contains('is-open')) return;
    chatbotPopup.classList.add('is-visible');
    try { sessionStorage.setItem(POPUP_SEEN_KEY, '1'); } catch (e) { /* storage unavailable */ }
    popupHideTimer = setTimeout(hideChatbotPopup, POPUP_VISIBLE_MS);
  }

  if (chatbotPopup) {
    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(POPUP_SEEN_KEY) === '1'; } catch (e) { /* ignore */ }

    // Show once per browser session so it doesn't nag on every reload
    if (!alreadySeen) {
      popupShowTimer = setTimeout(showChatbotPopup, POPUP_DELAY_MS);
    }

    chatbotPopupClose.addEventListener('click', hideChatbotPopup);
    chatbotPopupText.addEventListener('click', () => {
      hideChatbotPopup();
      openChatbot();
    });
  }

  function openChatbot() {
    hideChatbotPopup();
    chatbotWindow.classList.add('is-open');
    chatbotInput.focus();
  }

  function closeChatbot() {
    chatbotWindow.classList.remove('is-open');
  }

  function toggleChatbot() {
    if (chatbotWindow.classList.contains('is-open')) {
      closeChatbot();
    } else {
      openChatbot();
    }
  }

  function appendMessage(text, type) {
    // type: 'bot' | 'user' | 'error'
    const bubble = document.createElement('div');
    bubble.className = `chatbot-message chatbot-message-${type}`;
    bubble.textContent = text;
    chatbotMessages.appendChild(bubble);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return bubble;
  }

  function showTyping() {
    chatbotTypingIndicator.style.display = 'flex';
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function hideTyping() {
    chatbotTypingIndicator.style.display = 'none';
  }

  function setInputEnabled(enabled) {
    chatbotInput.disabled = !enabled;
    chatbotSend.disabled = !enabled;
  }

  async function sendChatbotMessage(userText) {
    chatbotHistory.push({ role: 'user', parts: [{ text: userText }] });

    setInputEnabled(false);
    showTyping();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: CHATBOT_SYSTEM_PROMPT,
          contents: chatbotHistory
        })
      });

      // Read as text first, then parse, so an empty or malformed
      // response body doesn't throw an uncaught JSON error.
      const rawText = await response.text();
      let data = null;

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (parseErr) {
          throw new Error('Received an invalid response from the server.');
        }
      }

      if (!response.ok || !data) {
        throw new Error('The assistant is unavailable right now.');
      }

      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!replyText) {
        throw new Error('No reply was returned by the assistant.');
      }

      chatbotHistory.push({ role: 'model', parts: [{ text: replyText }] });
      hideTyping();
      appendMessage(replyText, 'bot');

    } catch (err) {
      hideTyping();
      appendMessage(
        'Sorry, something went wrong reaching the assistant. Please try again in a moment.',
        'error'
      );
      // Remove the unanswered user turn so a retry doesn't duplicate it.
      chatbotHistory.pop();
    } finally {
      setInputEnabled(true);
      chatbotInput.focus();
    }
  }

  chatbotToggle.addEventListener('click', toggleChatbot);
  chatbotClose.addEventListener('click', closeChatbot);

  chatbotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatbotInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    chatbotInput.value = '';
    sendChatbotMessage(text);
  });
}