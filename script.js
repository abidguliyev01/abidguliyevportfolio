const burgerMenu = document.querySelector('.burger-menu');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-list a');

// Toggle menu
burgerMenu.addEventListener('click', () => {
    burgerMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        burgerMenu.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Slider drag functionality
const slider = document.querySelector('.tech-slider');
let isDragging = false;
let startX;
let startY;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID;
let currentX;
let currentY;

function touchStart(event) {
    startX = getPositionX(event);
    startY = getPositionY(event);
    isDragging = true;
    currentX = startX;
    currentY = startY;
    
    slider.style.cursor = 'grabbing';
    cancelAnimationFrame(animationID);
}

// Footer big text: bottom-up animation
function setupFooterBigAnimation() {
    const el = document.querySelector('.footer-copyright');
    if (!el) return;
    el.classList.add('footer-big');

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (el.dataset.bigdone === 'true') {
                    obs.unobserve(el);
                    return;
                }
                el.dataset.bigdone = 'true';
                el.classList.add('footer-big-in');
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(el);
}

function touchMove(event) {
    if (!isDragging) return;
    
    currentX = getPositionX(event);
    currentY = getPositionY(event);
    
    const deltaX = Math.abs(currentX - startX);
    const deltaY = Math.abs(currentY - startY);
    
    // Only allow horizontal scrolling, prevent vertical
    if (deltaX > deltaY) {
        event.preventDefault();
        slider.scrollLeft -= (currentX - startX) * 1.5;
        startX = currentX;
    }
}

function touchEnd() {
    isDragging = false;
    slider.style.cursor = 'grab';
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function getPositionY(event) {
    return event.type.includes('mouse') ? event.pageY : event.touches[0].clientY;
}

// Mouse events
slider.addEventListener('mousedown', touchStart);
slider.addEventListener('mousemove', touchMove);
slider.addEventListener('mouseup', touchEnd);
slider.addEventListener('mouseleave', touchEnd);

// Touch events
slider.addEventListener('touchstart', touchStart);
slider.addEventListener('touchmove', touchMove);
slider.addEventListener('touchend', touchEnd);

// Typewriter on-appear animations for headers
function typeText(el, text, speed = 40) {
    let i = 0;
    el.textContent = '';
    function tick() {
        if (i <= text.length) {
            el.textContent = text.slice(0, i);
            i++;
            requestAnimationFrame(() => setTimeout(tick, speed));
        } else {
            el.classList.remove('typing');
        }
    }
    tick();
}

function setupTypewriterOnView() {
    const targets = [
        ...document.querySelectorAll('.hero-headline'),
        ...document.querySelectorAll('.section-headline'),
    ];

    // Initialize: cache full text and clear visible text to prevent flash
    targets.forEach(el => {
        if (!el.dataset.fulltext) {
            el.dataset.fulltext = el.textContent.trim();
            el.textContent = '';
        }
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (el.dataset.typed === 'true') {
                    obs.unobserve(el);
                    return;
                }
                const full = el.dataset.fulltext || el.textContent.trim();
                el.dataset.typed = 'true';
                el.classList.add('typing');
                typeText(el, full, 30);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    targets.forEach(el => {
        observer.observe(el);
    });
}

// Cinematic reveal animations for various elements
function setupRevealOnView() {
    const selectors = [
        '.profile-image-container',
        '.hero-text',
        '.hero-graphic',
        '.features-grid > *',
        '.tech-card',
        '.course-card',
        '.project-card',
        '.education-card',
    ];

    const targets = selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));

    // Initialize: add base class and compute stagger delays
    targets.forEach(el => {
        if (!el.classList.contains('reveal')) {
            el.classList.add('reveal');
        }
        if (!el.style.transitionDelay) {
            const siblings = Array.from(el.parentElement ? el.parentElement.children : []);
            const idx = Math.max(0, siblings.indexOf(el));
            const delay = Math.min(6, idx) * 80; // up to ~480ms within a row/grid
            el.style.transitionDelay = delay + 'ms';
        }
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (el.dataset.revealed === 'true') {
                    obs.unobserve(el);
                    return;
                }
                el.dataset.revealed = 'true';
                el.classList.add('in-view');
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    targets.forEach(el => observer.observe(el));
}

// Responsive hero layout: move profile next to brain on tablet
function handleHeroLayout() {
    const heroGraphic = document.querySelector('.hero-graphic');
    const profileContainer = document.querySelector('.profile-image-container');
    const heroRight = document.querySelector('.hero-right');
    
    if (!heroGraphic || !profileContainer || !heroRight) return;
    
    const isTablet = window.matchMedia('(max-width: 768px)').matches;
    
    if (isTablet) {
        // Move profile to be next to brain
        if (!heroGraphic.contains(profileContainer)) {
            heroGraphic.appendChild(profileContainer);
        }
    } else {
        // Restore profile to hero-right
        if (!heroRight.contains(profileContainer)) {
            heroRight.insertBefore(profileContainer, heroRight.firstChild);
        }
    }
}

// Run after DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupTypewriterOnView();
        setupRevealOnView();
        setupFooterBigAnimation();
        handleHeroLayout();
        window.addEventListener('resize', handleHeroLayout);
    });
} else {
    setupTypewriterOnView();
    setupRevealOnView();
    setupFooterBigAnimation();
    handleHeroLayout();
    window.addEventListener('resize', handleHeroLayout);
}
