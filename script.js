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

// ---------- Multi-phrase typing animation (only present on index.html) ----------

const typingTextEl = document.getElementById('typingText');
const typingGhostEl = document.getElementById('typingGhost');

if (typingTextEl && typingGhostEl) {
  const phrases = [
    'Computer Science Student',
    'Model United Nations Delegate',
    'Debating Society Leader',
    'Community Volunteer'
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
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    formNote.textContent = `Thanks ${name || 'there'}, your message has been noted. I will get back to you soon.`;
    contactForm.reset();
  });
}

// ---------- Scroll-reveal animation for content sections ----------

const revealTargets = document.querySelectorAll('.reveal');

if (revealTargets.length && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
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

  function openChatbot() {
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