/* ==========================================================================
   SUFI SMOKE & CBD - INTERACTIVE CONTROLS & AI CHATBOT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !expanded);
      navMenu.style.display = expanded ? 'none' : 'flex';
      navMenu.style.flexDirection = 'column';
      navMenu.style.position = 'absolute';
      navMenu.style.top = '70px';
      navMenu.style.left = '0';
      navMenu.style.width = '100%';
      navMenu.style.background = '#E8F3ED';
      navMenu.style.padding = '20px';
      navMenu.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
    });
  }

  // Reviews Slider Control
  window.moveReviewSlide = function(direction) {
    const slider = document.getElementById('reviewSlider');
    if (slider) {
      const scrollAmount = 360 * direction;
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // FAQ Modal Handling
  window.openFaqModal = function() {
    const modal = document.getElementById('faqModal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      
      // Populate full FAQ list in modal if empty
      const modalList = modal.querySelector('.faq-modal-list');
      const originalFaqs = document.querySelectorAll('.faq-list details');
      if (modalList && modalList.children.length === 0) {
        originalFaqs.forEach(faq => {
          const clone = faq.cloneNode(true);
          modalList.appendChild(clone);
        });
      }
    }
  };

  window.closeFaqModal = function() {
    const modal = document.getElementById('faqModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  // Policy Modal Handling
  window.openPolicyModal = function() {
    const modal = document.getElementById('policyModal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  };

  window.closePolicyModal = function() {
    const modal = document.getElementById('policyModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    const faqModal = document.getElementById('faqModal');
    const policyModal = document.getElementById('policyModal');
    if (e.target === faqModal) closeFaqModal();
    if (e.target === policyModal) closePolicyModal();
  });

  // ==========================================
  // SUFI AI ASSISTANT WIDGET & THEME TOGGLE
  // ==========================================
  const chatLauncher = document.querySelector('.sufi-chat-launcher');
  const chatPanel = document.getElementById('sufi-chat-panel');
  const chatClose = document.querySelector('.sufi-chat-close');
  const themeToggleBtn = document.querySelector('.sufi-theme-toggle');
  const chatForm = document.querySelector('.sufi-chat-form');
  const chatInput = document.getElementById('sufi-chat-input');
  const chatMessages = document.querySelector('.sufi-chat-messages');
  const quickReplyBtns = document.querySelectorAll('.sufi-quick-replies button');

  // Default Chat Mode setup (Starts in Dark Mode matching the sleek cosmic design or Light Mode based on preference)
  let currentChatTheme = 'dark-mode';
  chatPanel.classList.add(currentChatTheme);

  // Toggle Assistant Window
  if (chatLauncher && chatPanel) {
    chatLauncher.addEventListener('click', () => {
      const isOpen = chatPanel.classList.contains('active');
      if (isOpen) {
        chatPanel.classList.remove('active');
        chatLauncher.setAttribute('aria-expanded', 'false');
        chatPanel.setAttribute('aria-hidden', 'true');
      } else {
        chatPanel.classList.add('active');
        chatLauncher.setAttribute('aria-expanded', 'true');
        chatPanel.setAttribute('aria-hidden', 'false');
        if (chatMessages.children.length === 0) {
          appendMessage("Welcome to Sufi Smoke & CBD. I can help with products, lab testing, and choosing the right ritual.", 'ai-msg');
        }
      }
    });
  }

  if (chatClose) {
    chatClose.addEventListener('click', () => {
      chatPanel.classList.remove('active');
      chatLauncher.setAttribute('aria-expanded', 'false');
      chatPanel.setAttribute('aria-hidden', 'true');
    });
  }

  // Theme Toggle Button (Switches between Dark and White/Light mode instantly with clear contrast)
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      if (chatPanel.classList.contains('dark-mode')) {
        chatPanel.classList.remove('dark-mode');
        chatPanel.classList.add('light-mode');
        currentChatTheme = 'light-mode';
      } else {
        chatPanel.classList.remove('light-mode');
        chatPanel.classList.add('dark-mode');
        currentChatTheme = 'dark-mode';
      }
    });
  }

  // Append Message Helper
  function appendMessage(text, senderClass) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('sufi-msg', senderClass);
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Handle Quick Replies
  quickReplyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.getAttribute('data-message');
      appendMessage(question, 'user-msg');
      processAiResponse(question);
    });
  });

  // Handle Form Submission
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      appendMessage(text, 'user-msg');
      chatInput.value = '';
      processAiResponse(text);
    });
  }

  // Simulated Intelligent Assistant Response Engine
  function processAiResponse(query) {
    const q = query.toLowerCase();
    let reply = "Thanks for reaching out! You can explore our trending lab-tested CBD oils, edibles, and accessories directly on the site, or message us on WhatsApp at +923101700551.";

    if (q.includes('beginner') || q.includes('start')) {
      reply = "For beginners, we recommend starting with our low-potency Daily Wellness CBD Oils or measured Gummies. Begin with the smallest serving on the label to see how your body responds.";
    } else if (q.includes('choose') || q.includes('right product')) {
      reply = "To choose the right product, consider your goal: oils for steady daily wellness, edibles for convenient calm, or botanical vapes for on-the-go relaxation.";
    } else if (q.includes('lab') || q.includes('tested') || q.includes('analysis')) {
      reply = "Yes! All our products are backed by third-party laboratory reports ensuring purity, quality, and accurate labeling.";
    } else if (q.includes('shipping') || q.includes('delivery')) {
      reply = "We offer secure, discreet delivery on all orders. Tracking details are provided once your package is dispatched.";
    }

    setTimeout(() => {
      appendMessage(reply, 'ai-msg');
    }, 600);
  }
});