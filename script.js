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
    // =============================================
    const navLinks = document.querySelectorAll('.nav-links a');
    const contactIcon = document.querySelector('.contact-icon');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
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
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;

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
                    // Success - show nice message
                    alert('✅ Message sent successfully! I\'ll get back to you soon.');
                    contactForm.reset();
                } else {
                    // Handle different error cases
                    let errorMessage = '❌ Failed to send message. ';
                    if (result.error) {
                        errorMessage += result.error;
                    } else {
                        errorMessage += 'Please try again later.';
                    }
                    alert(errorMessage);
                    console.error('Server error:', result);
                }
            } catch (error) {
                // Network or other errors
                let errorMessage = '❌ Network error. ';
                if (error.message) {
                    errorMessage += error.message;
                } else {
                    errorMessage += 'Please check your connection and try again.';
                }
                alert(errorMessage);
                console.error('Network error:', error);
            } finally {
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
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

    // If the modal doesn't exist, log a warning and stop
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

    // Attach click event to Discord link
    if (discordLink) {
        discordLink.addEventListener('click', openModal);
    } else {
        console.warn('Discord link #discordLiveLink not found.');
    }

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Click overlay to close
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // "contact me" link – closes modal and scrolls to contact section
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

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
})();

// =============================================
// 4. ADDITIONAL: Form validation helper
// =============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Add real-time validation to the contact form
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const emailInput = document.getElementById('email');
        const nameInput = document.getElementById('name');
        const messageInput = document.getElementById('message');
        const submitBtn = contactForm.querySelector('.submit-btn');

        function validateForm() {
            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            let isValid = true;

            // Validate name
            if (name.length < 2) {
                isValid = false;
                if (nameInput) nameInput.style.borderColor = '#ff4444';
            } else {
                if (nameInput) nameInput.style.borderColor = '#4CAF50';
            }

            // Validate email
            if (!validateEmail(email)) {
                isValid = false;
                if (emailInput) emailInput.style.borderColor = '#ff4444';
            } else {
                if (emailInput) emailInput.style.borderColor = '#4CAF50';
            }

            // Validate message
            if (message.length < 10) {
                isValid = false;
                if (messageInput) messageInput.style.borderColor = '#ff4444';
            } else {
                if (messageInput) messageInput.style.borderColor = '#4CAF50';
            }

            if (submitBtn) {
                submitBtn.disabled = !isValid;
                submitBtn.style.opacity = isValid ? '1' : '0.5';
                submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
            }

            return isValid;
        }

        // Add input event listeners for real-time validation
        if (nameInput) nameInput.addEventListener('input', validateForm);
        if (emailInput) emailInput.addEventListener('input', validateForm);
        if (messageInput) messageInput.addEventListener('input', validateForm);

        // Initial validation
        validateForm();
    }
});

// =============================================
// 5. ADDITIONAL: Smooth scroll for all anchor links
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    // Add smooth scroll to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// =============================================
// 6. ADDITIONAL: Console warning for missing API
// =============================================
console.log('🚀 Portfolio website loaded successfully!');
console.log('💡 Contact form will send messages to /api/contact');
console.log('📧 Make sure you have set up EMAIL_USER and EMAIL_PASS in Vercel environment variables');