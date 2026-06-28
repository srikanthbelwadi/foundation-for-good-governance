/**
 * Foundation for Good Governance USA Inc. — script.js
 * Handles: navigation, scroll animations, donation widget, 
 * modal dialog, form validation, and card number formatting.
 */

'use strict';

// ─── Utilities ───────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── Navigation ──────────────────────────────────────────────
const nav = $('#site-nav');
const navToggle = $('#nav-toggle');
const navLinks = $('#nav-links');

// Glassmorphic scroll effect
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });
nav.classList.toggle('scrolled', window.scrollY > 40);

// Mobile menu toggle
navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a nav link is clicked
navLinks?.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    navLinks.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
});

// ─── Scroll-Reveal Animation ─────────────────────────────────
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

$$('.reveal').forEach(el => revealObserver.observe(el));

// ─── Donation Amount Widget ───────────────────────────────────
const amountBtns = $$('.amount-btn');
const customAmountInput = $('#custom-amount');
let selectedAmount = 25; // default

function setActiveAmount(amount) {
  selectedAmount = amount;
  amountBtns.forEach(btn => {
    const isActive = Number(btn.dataset.amount) === amount;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

amountBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const amount = Number(btn.dataset.amount);
    setActiveAmount(amount);
    customAmountInput.value = '';
  });
});

customAmountInput?.addEventListener('input', () => {
  const val = parseFloat(customAmountInput.value);
  if (val > 0) {
    selectedAmount = val;
    amountBtns.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
  }
});

// Format amount for display
function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
}

// ─── Donation Modal Dialog ────────────────────────────────────
const dialog = $('#donate-dialog');
const dialogAmountDisplay = $('#dialog-amount-display');
const formStep = $('#checkout-form-step');
const successStep = $('#checkout-success-step');
const checkoutForm = $('#checkout-form');

function openDonateDialog() {
  const amount = parseFloat(customAmountInput?.value) || selectedAmount || 25;
  selectedAmount = amount;
  if (dialogAmountDisplay) {
    dialogAmountDisplay.textContent = formatAmount(amount);
  }
  // Reset to form step
  successStep?.classList.remove('visible');
  formStep.style.display = 'block';
  checkoutForm?.reset();
  dialog?.showModal();
}

function closeDonateDialog() {
  dialog?.close();
}

// Open triggers
$('#open-checkout-btn')?.addEventListener('click', openDonateDialog);
$('#hero-donate-btn')?.addEventListener('click', openDonateDialog);
$('#nav-donate-btn')?.addEventListener('click', openDonateDialog);

// Close button
$('#dialog-close-btn')?.addEventListener('click', closeDonateDialog);
$('#dialog-cancel-btn')?.addEventListener('click', closeDonateDialog);
$('#close-success-btn')?.addEventListener('click', closeDonateDialog);

// Light-dismiss: click on backdrop
dialog?.addEventListener('click', e => {
  const rect = dialog.getBoundingClientRect();
  const clickedOutside = (
    e.clientX < rect.left || e.clientX > rect.right ||
    e.clientY < rect.top  || e.clientY > rect.bottom
  );
  if (clickedOutside) closeDonateDialog();
});

// Confirm donation — simulate processing
$('#confirm-donate-btn')?.addEventListener('click', () => {
  const inputs = $$('input[required]', checkoutForm);
  let allValid = true;

  inputs.forEach(input => {
    if (!input.checkValidity()) {
      input.setAttribute('aria-invalid', 'true');
      allValid = false;
    } else {
      input.removeAttribute('aria-invalid');
    }
  });

  if (!allValid) {
    // Trigger native validation display
    checkoutForm.reportValidity();
    return;
  }

  // Simulate brief processing
  const confirmBtn = $('#confirm-donate-btn');
  confirmBtn.textContent = 'Processing…';
  confirmBtn.disabled = true;

  setTimeout(() => {
    formStep.style.display = 'none';
    successStep.classList.add('visible');
    confirmBtn.textContent = '❤ Confirm Donation';
    confirmBtn.disabled = false;
  }, 1200);
});

// ─── Credit Card Number Formatting ───────────────────────────
$('#cc-number')?.addEventListener('input', e => {
  let val = e.target.value.replace(/\D/g, '').substring(0, 16);
  e.target.value = val.replace(/(.{4})/g, '$1 ').trim();
});

// Expiry MM/YY formatting
$('#cc-expiry')?.addEventListener('input', e => {
  let val = e.target.value.replace(/\D/g, '').substring(0, 4);
  if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
  e.target.value = val;
});

// CVV — digits only
$('#cc-cvv')?.addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
});

// ─── Contact Form ─────────────────────────────────────────────
const contactForm = $('#contact-form');
const formSuccessMsg = $('#form-success-msg');

// Sync aria-invalid on blur and input
function syncAriaInvalid(input) {
  if (!input.checkValidity()) {
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.removeAttribute('aria-invalid');
  }
}

contactForm?.addEventListener('blur', e => {
  if (e.target.matches('input[required], textarea[required]')) {
    syncAriaInvalid(e.target);
  }
}, true);

contactForm?.addEventListener('input', e => {
  if (e.target.matches('input[required], textarea[required]') && e.target.hasAttribute('aria-invalid')) {
    syncAriaInvalid(e.target);
  }
});

contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  const inputs = $$('input[required], textarea[required]', contactForm);
  let allValid = true;

  inputs.forEach(input => {
    syncAriaInvalid(input);
    if (!input.checkValidity()) allValid = false;
  });

  if (!allValid) return;

  // Build mailto link with form data (org email kept hidden from DOM inspection)
  const recipient = contactForm.dataset.recipient;
  const fname = $('#contact-fname')?.value || '';
  const lname = $('#contact-lname')?.value || '';
  const email = $('#contact-email')?.value || '';
  const subject = encodeURIComponent($('#contact-subject')?.value || 'Website Inquiry');
  const body = encodeURIComponent(
    `Name: ${fname} ${lname}\nEmail: ${email}\n\nMessage:\n${$('#contact-message')?.value || ''}`
  );

  // Open mailto — works without a backend
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

  // Show success state
  contactForm.style.display = 'none';
  formSuccessMsg?.classList.add('visible');
});

// ─── Smooth Active Nav Link Highlighting ─────────────────────
const sections = $$('section[id]');
const navLinkEls = $$('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinkEls.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ─── Polyfill: :user-invalid fallback for older browsers ─────
const UserInvalidFallback = (() => {
  const dirtyState = new WeakMap();

  const updateState = input => {
    const isValid = input.checkValidity();
    input.classList.toggle('user-invalid-fallback', !isValid);
    if (!isValid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  const handleEvent = event => {
    const input = event.target;
    if (!input.checkValidity) return;
    if (event.type === 'reset') {
      (input.elements || []).forEach(ctrl => {
        dirtyState.delete(ctrl);
        ctrl.classList.remove('user-invalid-fallback');
        ctrl.removeAttribute('aria-invalid');
      });
      return;
    }
    if (event.type === 'input' || event.type === 'change') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasInteracted = true;
      dirtyState.set(input, state);
      if (state.hasBlurred) updateState(input);
    } else if (event.type === 'blur') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasBlurred = true;
      dirtyState.set(input, state);
      if (state.hasInteracted) updateState(input);
    }
  };

  const init = (root = document) => {
    if (CSS.supports('selector(:user-invalid)')) return;
    root.addEventListener('blur', handleEvent, true);
    root.addEventListener('input', handleEvent);
    root.addEventListener('change', handleEvent);
    root.addEventListener('reset', handleEvent, true);
  };

  return { init };
})();

UserInvalidFallback.init();

// ─── Zelle Tag Copy to Clipboard ─────────────────────────────
const zelleVal = document.querySelector('.zelle-val');
if (zelleVal) {
  zelleVal.style.cursor = 'pointer';
  zelleVal.title = 'Click to copy Zelle tag';
  zelleVal.addEventListener('click', () => {
    navigator.clipboard.writeText('PAY-FFGG').then(() => {
      const orig = zelleVal.textContent;
      zelleVal.textContent = '✓ Copied!';
      zelleVal.style.color = 'hsl(145,65%,35%)';
      setTimeout(() => {
        zelleVal.textContent = orig;
        zelleVal.style.color = '';
      }, 1800);
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = 'PAY-FFGG';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  });
}
