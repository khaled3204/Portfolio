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

    // Contact form handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
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