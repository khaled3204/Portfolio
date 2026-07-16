// =============================================
// 0. Entrance Screen (Spline intro)
// The "Enter Portfolio" button is a 3D object inside
// the Spline scene itself (not HTML). Spline fires a
// 'mouseDown' event with e.target.name set to the
// clicked object's name, so we reveal the site when
// that object is clicked.
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    const entranceScreen = document.getElementById('entranceScreen');
    const entranceViewer = document.getElementById('entranceViewer');
    const siteContent = document.getElementById('siteContent');

    if (entranceScreen && entranceViewer && siteContent) {
        // Lock scrolling until the user enters
        document.documentElement.style.overflow = 'hidden';

        function revealSite() {
            entranceScreen.classList.add('entrance-fade-out');
            siteContent.classList.remove('site-hidden');
            document.documentElement.style.overflow = '';

            // Remove the entrance screen from the DOM after the fade
            // so the (heavier) 3D viewer stops rendering in the background
            setTimeout(function () {
                entranceScreen.remove();
            }, 500);
        }

        entranceViewer.addEventListener('load', function () {
            entranceViewer.addEventListener('mouseDown', function (e) {
                // Log the clicked object's name once so you can confirm
                // it matches the button inside your Spline scene, then
                // tighten the condition below if needed, e.g.:
                // if (e.target.name === 'Enter Portfolio') { ... }
                console.log('Spline object clicked:', e.target && e.target.name);

                const name = (e.target && e.target.name || '').toLowerCase();
                if (name.includes('enter') || name.includes('button')) {
                    revealSite();
                }
            });
        });
    }
});

// =============================================
// 1. Skills Slider
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    const slider = document.getElementById('skillsSlider');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;
    const totalSlides = document.querySelectorAll('.skill-slide').length;

    if (!slider || !prevBtn || !nextBtn) return;

    slider.style.display = 'flex';
    slider.style.flexDirection = 'row';
    slider.style.transition = 'transform 0.4s ease-in-out';

    function updateSlider() {
        const translateValue = -currentIndex * 100;
        slider.style.transform = `translateX(${translateValue}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
        });
    });

    updateSlider();

    // Certificate Show More / Show Less
    const toggleCertsBtn = document.getElementById('toggleCertsBtn');
    const certsGrid = document.getElementById('certsGrid');

    if (toggleCertsBtn && certsGrid) {
        toggleCertsBtn.addEventListener('click', () => {
            const isExpanded = certsGrid.classList.toggle('expanded');
            toggleCertsBtn.textContent = isExpanded ? 'Show Less' : 'Show More';
        });
    }

    // =============================================
    // 2. NAVIGATION - Smooth scroll to sections
    //    (FIX: only intercept hash links, not external/PDF links)
    // =============================================
    const navLinks = document.querySelectorAll('.nav-links a');
    const contactIcon = document.querySelector('.contact-icon');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only handle internal links that start with '#'
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
            // For any other link (like the Resume PDF), do nothing – let the default behavior happen
        });
    });

    if (contactIcon) {
        contactIcon.addEventListener('click', function () {
            const contactSection = document.getElementById('contact-section');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // =============================================
    // 3. CONTACT FORM - Send to Vercel API
    // =============================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };

            // Get the submit button for loading state
            const submitBtn = contactForm.querySelector('.submit-btn');
            const btnText = document.getElementById('btnText');
            const formFeedback = document.getElementById('formFeedback');

            // Show loading state
            if (btnText) btnText.textContent = 'Sending...';
            submitBtn.disabled = true;
            if (formFeedback) {
                formFeedback.textContent = '';
                formFeedback.className = 'form-feedback';
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    if (formFeedback) {
                        formFeedback.textContent = '✅ Message sent successfully! I\'ll get back to you soon.';
                        formFeedback.className = 'form-feedback feedback-success';
                    }
                    contactForm.reset();
                    // Reset field hints back to their default helper text
                    if (typeof resetFieldHints === 'function') resetFieldHints();
                } else {
                    const errorMessage = result.error
                        ? result.error
                        : 'Please try again later.';
                    if (formFeedback) {
                        formFeedback.textContent = `❌ Failed to send message. ${errorMessage}`;
                        formFeedback.className = 'form-feedback feedback-error';
                    }
                    console.error('Server error:', result);
                }
            } catch (error) {
                const errorMessage = error.message
                    ? error.message
                    : 'Please check your connection and try again.';
                if (formFeedback) {
                    formFeedback.textContent = `❌ Network error. ${errorMessage}`;
                    formFeedback.className = 'form-feedback feedback-error';
                }
                console.error('Network error:', error);
            } finally {
                // Restore button
                if (btnText) btnText.textContent = 'Send Message';
                // Re-run validation to correctly set disabled state again
                if (typeof validateForm === 'function') validateForm();
            }
        });
    }
});

// =============================================
// ACCESS DENIED MODAL (Discord Bot)
// =============================================
(function () {
    const modal = document.getElementById('accessModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const contactLink = document.getElementById('modalContactLink');
    const discordLink = document.getElementById('discordLiveLink');

    if (!modal) {
        console.warn('Modal element #accessModal not found.');
        return;
    }

    function openModal(e) {
        if (e) e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (discordLink) {
        discordLink.addEventListener('click', openModal);
    } else {
        console.warn('Discord link #discordLiveLink not found.');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    if (contactLink) {
        contactLink.addEventListener('click', function (e) {
            e.preventDefault();
            closeModal();
            const contactSection = document.getElementById('contact-section');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
})();

// =============================================
// 4. Form Validation Helper + live hint messages
// =============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

let resetFieldHints; // exposed to the submit handler above
let validateForm;    // exposed to the submit handler above

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const submitBtn = contactForm.querySelector('.submit-btn');
        const formFeedback = document.getElementById('formFeedback');

        const nameHint = document.getElementById('nameHint');
        const emailHint = document.getElementById('emailHint');
        const messageHint = document.getElementById('messageHint');

        const MIN_NAME_LENGTH = 2;
        const MIN_MESSAGE_LENGTH = 10;

        const defaultHints = {
            name: `At least ${MIN_NAME_LENGTH} characters.`,
            email: 'e.g. name@example.com',
            message: `At least ${MIN_MESSAGE_LENGTH} characters — tell me a bit about what you need.`
        };

        // Track whether the user has actually interacted with each field,
        // so we don't show red errors before they've even started typing.
        const touched = { name: false, email: false, message: false };

        function setHint(hintEl, inputEl, message, state) {
            // state: 'default' | 'error' | 'success'
            if (!hintEl) return;
            hintEl.textContent = message;
            hintEl.classList.remove('hint-error', 'hint-success');
            if (state === 'error') hintEl.classList.add('hint-error');
            if (state === 'success') hintEl.classList.add('hint-success');

            if (inputEl) {
                inputEl.classList.remove('field-invalid', 'field-valid');
                if (state === 'error') inputEl.classList.add('field-invalid');
                if (state === 'success') inputEl.classList.add('field-valid');
            }
        }

        resetFieldHints = function () {
            touched.name = false;
            touched.email = false;
            touched.message = false;
            setHint(nameHint, nameInput, defaultHints.name, 'default');
            setHint(emailHint, emailInput, defaultHints.email, 'default');
            setHint(messageHint, messageInput, defaultHints.message, 'default');
            if (formFeedback) {
                formFeedback.textContent = '';
                formFeedback.className = 'form-feedback';
            }
        };

        validateForm = function () {
            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            let isValid = true;
            const missing = [];

            // Name
            if (name.length === 0) {
                isValid = false;
                if (touched.name) {
                    setHint(nameHint, nameInput, 'Please enter your name.', 'error');
                } else {
                    setHint(nameHint, nameInput, defaultHints.name, 'default');
                }
                missing.push('your name');
            } else if (name.length < MIN_NAME_LENGTH) {
                isValid = false;
                setHint(nameHint, nameInput, `Name needs at least ${MIN_NAME_LENGTH} characters (${name.length}/${MIN_NAME_LENGTH}).`, 'error');
                missing.push(`a name with ${MIN_NAME_LENGTH}+ characters`);
            } else {
                setHint(nameHint, nameInput, 'Looks good!', 'success');
            }

            // Email
            if (email.length === 0) {
                isValid = false;
                if (touched.email) {
                    setHint(emailHint, emailInput, 'Please enter your email.', 'error');
                } else {
                    setHint(emailHint, emailInput, defaultHints.email, 'default');
                }
                missing.push('your email');
            } else if (!validateEmail(email)) {
                isValid = false;
                setHint(emailHint, emailInput, 'That doesn\'t look like a valid email (e.g. name@example.com).', 'error');
                missing.push('a valid email address');
            } else {
                setHint(emailHint, emailInput, 'Looks good!', 'success');
            }

            // Message
            if (message.length === 0) {
                isValid = false;
                if (touched.message) {
                    setHint(messageHint, messageInput, 'Please write a message.', 'error');
                } else {
                    setHint(messageHint, messageInput, defaultHints.message, 'default');
                }
                missing.push('a message');
            } else if (message.length < MIN_MESSAGE_LENGTH) {
                isValid = false;
                setHint(messageHint, messageInput, `Message needs at least ${MIN_MESSAGE_LENGTH} characters (${message.length}/${MIN_MESSAGE_LENGTH}).`, 'error');
                missing.push(`a message with ${MIN_MESSAGE_LENGTH}+ characters`);
            } else {
                setHint(messageHint, messageInput, 'Looks good!', 'success');
            }

            if (submitBtn) {
                submitBtn.disabled = !isValid;
                submitBtn.style.opacity = isValid ? '1' : '0.5';
                submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
            }

            // Overall feedback line — only nag the user once they've started
            // interacting with the form, so it isn't red before they type anything.
            const hasStartedTyping = touched.name || touched.email || touched.message;
            if (formFeedback) {
                if (isValid) {
                    formFeedback.textContent = '';
                    formFeedback.className = 'form-feedback';
                } else if (hasStartedTyping) {
                    formFeedback.textContent = `Still need: ${missing.join(', ')}.`;
                    formFeedback.className = 'form-feedback feedback-info';
                }
            }

            return isValid;
        };

        // Initialize hints with default helper text
        resetFieldHints();

        if (nameInput) {
            nameInput.addEventListener('input', () => { touched.name = true; validateForm(); });
            nameInput.addEventListener('blur', () => { touched.name = true; validateForm(); });
        }
        if (emailInput) {
            emailInput.addEventListener('input', () => { touched.email = true; validateForm(); });
            emailInput.addEventListener('blur', () => { touched.email = true; validateForm(); });
        }
        if (messageInput) {
            messageInput.addEventListener('input', () => { touched.message = true; validateForm(); });
            messageInput.addEventListener('blur', () => { touched.message = true; validateForm(); });
        }

        // Initial disabled state (form is empty, so disabled, but no red errors yet)
        validateForm();
    }
});

// =============================================
// 5. Stacking Project Cards
//    Gives each .project-card an increasing `top` offset and z-index
//    via CSS custom properties, so cards stack on top of one another
//    as the user scrolls, leaving a "tip" of each previous card visible.
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    const NAVBAR_HEIGHT = 112;
    const BASE_GAP = 18;      // space below navbar before the first card sticks
    const STACK_OFFSET = 42;  // how much of each previous card's "tip" stays visible

    function applyStackOffsets() {
        // On narrow screens the CSS switches cards to position: static,
        // so the offsets don't matter there — but we still set them safely.
        cards.forEach((card, index) => {
            const top = NAVBAR_HEIGHT + BASE_GAP + index * STACK_OFFSET;
            card.style.setProperty('--stack-top', `${top}px`);
            card.style.setProperty('--stack-z', `${index + 1}`);
        });
    }

    applyStackOffsets();
    window.addEventListener('resize', applyStackOffsets);
});

// =============================================
// 6. Theme Toggle (Light / Dark / Auto)
// =============================================
(function () {
    const THEME_KEY = 'theme-preference';
    const root = document.documentElement;

    const toggleBtn = document.getElementById('themeToggleBtn');
    const menu = document.getElementById('themeMenu');
    const options = document.querySelectorAll('.theme-option');

    const iconLight = document.getElementById('themeIconLight');
    const iconDark = document.getElementById('themeIconDark');
    const iconAuto = document.getElementById('themeIconAuto');

    if (!toggleBtn || !menu) return;

    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function applyTheme(preference) {
        const resolved = preference === 'auto' ? getSystemTheme() : preference;
        root.setAttribute('data-theme', resolved);

        [iconLight, iconDark, iconAuto].forEach(icon => {
            if (icon) icon.style.display = 'none';
        });
        if (preference === 'light' && iconLight) iconLight.style.display = 'block';
        else if (preference === 'dark' && iconDark) iconDark.style.display = 'block';
        else if (iconAuto) iconAuto.style.display = 'block';

        options.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.themeChoice === preference);
        });

        toggleBtn.setAttribute('aria-expanded', menu.classList.contains('active') ? 'true' : 'false');
    }

    function setPreference(pref) {
        localStorage.setItem(THEME_KEY, pref);
        applyTheme(pref);
    }

    // Apply saved (or default "dark") preference on load
    const stored = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(stored);

    toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        menu.classList.toggle('active');
        toggleBtn.setAttribute('aria-expanded', menu.classList.contains('active') ? 'true' : 'false');
    });

    document.addEventListener('click', function () {
        menu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
    });

    menu.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    options.forEach(opt => {
        opt.addEventListener('click', function () {
            setPreference(opt.dataset.themeChoice);
            menu.classList.remove('active');
        });
    });

    // If the user's preference is "auto", keep it in sync with OS changes
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemChange = function () {
        const current = localStorage.getItem(THEME_KEY) || 'dark';
        if (current === 'auto') applyTheme('auto');
    };
    if (mql.addEventListener) {
        mql.addEventListener('change', handleSystemChange);
    } else if (mql.addListener) {
        // Safari fallback
        mql.addListener(handleSystemChange);
    }
})();

console.log('🚀 Portfolio website loaded successfully!');
console.log('💡 Contact form will send messages to /api/contact');
console.log('📧 Make sure you have set up EMAIL_USER and EMAIL_PASS in Vercel environment variables');