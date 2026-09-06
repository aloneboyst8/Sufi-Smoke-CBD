const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const policyModal = document.querySelector('#policyModal');
const faqModal = document.querySelector('#faqModal');
const faqModalList = document.querySelector('.faq-modal-list');
const reviewSlider = document.querySelector('#reviewSlider');

document.documentElement.classList.add('js-enabled');
window.requestAnimationFrame(() => document.body.classList.add('page-ready'));

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries, observer) => {
	entries.forEach((entry) => {
		if (!entry.isIntersecting) return;
		entry.target.classList.add('is-visible');
		observer.unobserve(entry.target);
	});
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }) : null;

document.querySelectorAll('.section-heading, .product-card, .benefit-list > div, .review-card, .faq-header-side, .policy-strip, .site-footer .footer-col').forEach((element, index) => {
	element.classList.add('scroll-reveal');
	element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
	revealObserver?.observe(element);
});

function setModalState(modal, isOpen) {
	if (!modal) return;
	modal.classList.toggle('is-open', isOpen);
	modal.setAttribute('aria-hidden', String(!isOpen));
	document.body.style.overflow = isOpen ? 'hidden' : '';
}

function openPolicyModal() { setModalState(policyModal, true); }
function closePolicyModal() { setModalState(policyModal, false); }

function openFaqModal() {
	if (faqModalList && !faqModalList.children.length) {
		document.querySelectorAll('.faq-list details').forEach((item) => {
			const clone = item.cloneNode(true);
			clone.classList.add('faq-item');
			faqModalList.appendChild(clone);
		});
	}
	setModalState(faqModal, true);
}

function closeFaqModal() { setModalState(faqModal, false); }

function moveFooterSlide(direction) {
	const slider = document.querySelector('#storeFooterSlider');
	if (!slider) return;
	const card = slider.querySelector('.footer-slide-card');
	const gap = Number.parseFloat(getComputedStyle(slider).gap) || 20;
	const distance = card ? card.getBoundingClientRect().width + gap : slider.clientWidth * 0.85;
	slider.scrollBy({ left: direction * distance, behavior: 'smooth' });
}

function moveReviewSlide(direction) {
	if (!reviewSlider) return;
	const cards = [...reviewSlider.querySelectorAll('.review-card')];
	if (!cards.length) return;
	const current = Number(reviewSlider.dataset.activeReview || 0);
	const next = Math.max(0, Math.min(cards.length - 1, current + direction));
	reviewSlider.dataset.activeReview = String(next);
	cards[next].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
}

// The page's existing inline controls need these functions on window.
Object.assign(window, { openPolicyModal, closePolicyModal, openFaqModal, closeFaqModal, moveFooterSlide, moveReviewSlide });

[policyModal, faqModal].forEach((modal) => {
	modal?.addEventListener('click', (event) => {
		if (event.target === modal) setModalState(modal, false);
	});
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		closePolicyModal();
		closeFaqModal();
	}
});

if (menuToggle && navMenu) {
	menuToggle.addEventListener('click', () => {
		const isOpen = navMenu.classList.toggle('is-open');
		menuToggle.setAttribute('aria-expanded', String(isOpen));
		menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
	});

	navMenu.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', () => {
			navMenu.classList.remove('is-open');
			menuToggle.setAttribute('aria-expanded', 'false');
			menuToggle.setAttribute('aria-label', 'Open navigation menu');
		});
	});
}

/* The assistant keeps the n8n Chat Trigger contract isolated from page controls. */
(() => {
	const root = document.querySelector('#sufi-chatbot');
	if (!root) return;
	const endpoint = 'https://siddhubilal.app.n8n.cloud/webhook/36506c70-6a6f-42cf-b982-53b83669a2d6/chat';
	const launcher = root.querySelector('.sufi-chat-launcher');
	const panel = root.querySelector('.sufi-chat-panel');
	const closeButton = root.querySelector('.sufi-chat-close');
	const themeButton = root.querySelector('.sufi-theme-toggle');
	const messages = root.querySelector('.sufi-chat-messages');
	const status = root.querySelector('.sufi-chat-status');
	const form = root.querySelector('.sufi-chat-form');
	const input = root.querySelector('#sufi-chat-input');
	const sendButton = root.querySelector('.sufi-send-button');
	const themeKey = 'sufi-chat-theme';
	const sessionKey = 'sufi-chat-session';
	let isSending = false;
	let theme = localStorage.getItem(themeKey) || 'auto';
	let sessionId = sessionStorage.getItem(sessionKey);
	if (!sessionId) { sessionId = crypto.randomUUID ? crypto.randomUUID() : `sufi-${Date.now()}-${Math.random().toString(16).slice(2)}`; sessionStorage.setItem(sessionKey, sessionId); }

	const escapeText = (value) => String(value ?? '').trim();
	const scrollToLatest = () => { messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' }); };
	function addMessage(text, type) {
		const item = document.createElement('div');
		item.className = `sufi-message ${type}`;
		const bubble = document.createElement('div');
		bubble.className = 'sufi-bubble';
		bubble.textContent = escapeText(text);
		item.appendChild(bubble); messages.appendChild(item); scrollToLatest();
	}
	function setTyping(show) {
		const existing = messages.querySelector('.sufi-typing');
		if (show && !existing) {
			const item = document.createElement('div'); item.className = 'sufi-message ai sufi-typing';
			item.innerHTML = '<span></span><span></span><span></span>'; messages.appendChild(item); scrollToLatest();
		} else if (!show && existing) existing.remove();
	}
	function responseText(payload) {
		if (typeof payload === 'string') return payload;
		if (Array.isArray(payload)) return responseText(payload[0]);
		const candidates = [payload?.output, payload?.text, payload?.message, payload?.response, payload?.data?.output, payload?.data?.text, payload?.json?.output, payload?.json?.text];
		const result = candidates.find((value) => typeof value === 'string' && value.trim());
		return result || '';
	}
	function setTheme() {
		const dark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
		root.classList.toggle('sufi-chatbot-dark', dark);
		themeButton.setAttribute('aria-label', `Theme: ${theme}. Click to change`);
	}
	function openChat() {
		root.classList.add('is-open'); launcher.setAttribute('aria-expanded', 'true'); panel.setAttribute('aria-hidden', 'false');
		if (!messages.children.length) addMessage('Welcome to Sufi Smoke & CBD. I can help with products, lab testing, and choosing the right ritual.', 'ai');
		setTimeout(() => input.focus(), 180);
	}
	function closeChat() { root.classList.remove('is-open'); launcher.setAttribute('aria-expanded', 'false'); panel.setAttribute('aria-hidden', 'true'); launcher.focus(); }
	async function sendMessage(text) {
		const message = escapeText(text);
		if (!message || isSending) return;
		isSending = true; status.textContent = ''; sendButton.disabled = true; addMessage(message, 'user'); setTyping(true);
		try {
			const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ action: 'sendMessage', sessionId, chatInput: message }) });
			if (!response.ok) throw new Error(`Chat service responded with ${response.status}.`);
			const payload = await response.json();
			const reply = responseText(payload);
			if (!reply) throw new Error('The chat service returned an empty response.');
			addMessage(reply, 'ai');
		} catch (error) {
			status.textContent = 'Connection issue. Please try again, or contact us on WhatsApp.';
			console.error('Sufi AI chat error:', error);
		} finally { setTyping(false); isSending = false; sendButton.disabled = false; input.focus(); }
	}
	launcher.addEventListener('click', openChat); closeButton.addEventListener('click', closeChat);
	form.addEventListener('submit', (event) => { event.preventDefault(); const message = input.value; input.value = ''; input.style.height = 'auto'; sendMessage(message); });
	input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 92)}px`; });
	input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
	root.querySelectorAll('.sufi-quick-replies button').forEach((button) => button.addEventListener('click', () => { input.value = button.dataset.message || ''; form.requestSubmit(); }));
	themeButton.addEventListener('click', () => { theme = theme === 'auto' ? 'dark' : theme === 'dark' ? 'light' : 'auto'; localStorage.setItem(themeKey, theme); setTheme(); });
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', setTheme);
	document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && root.classList.contains('is-open')) closeChat(); });
	setTheme();
})();
