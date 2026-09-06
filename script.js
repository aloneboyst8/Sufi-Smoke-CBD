const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const policyModal = document.querySelector('#policyModal');
const faqModal = document.querySelector('#faqModal');
const faqModalList = document.querySelector('.faq-modal-list');
const reviewSlider = document.querySelector('#reviewSlider');

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
