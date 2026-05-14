document.addEventListener('DOMContentLoaded', () => {
    // ─── Navigation Toggle (Mobile) ───
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const toggleIcon = navToggle.querySelector('i');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if (navLinks.classList.contains('active')) {
            toggleIcon.classList.replace('ph-list', 'ph-x');
        } else {
            toggleIcon.classList.replace('ph-x', 'ph-list');
        }
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            toggleIcon.classList.replace('ph-x', 'ph-list');
        });
    });

    // ─── Navbar Scroll Effect ───
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    });

    // ─── Profile Photo Handling ───
    const profilePhoto = document.getElementById('profilePhoto');
    const photoPlaceholder = document.getElementById('photoPlaceholder');

    if (profilePhoto) {
        profilePhoto.addEventListener('load', () => {
            photoPlaceholder.style.display = 'none';
            profilePhoto.style.display = 'block';
        });

        profilePhoto.addEventListener('error', () => {
            profilePhoto.style.display = 'none';
            photoPlaceholder.style.display = 'flex';
        });

        // If image not loaded yet
        if (!profilePhoto.complete) {
            profilePhoto.style.display = 'none';
        } else if (profilePhoto.naturalWidth === 0) {
            profilePhoto.style.display = 'none';
            photoPlaceholder.style.display = 'flex';
        } else {
            photoPlaceholder.style.display = 'none';
        }
    }

    // ─── Scroll Animations ───
    const animateElements = document.querySelectorAll(
        '.section-heading, .about-content, .research-card, .pub-item, ' +
        '.project-card, .timeline-item, .skill-category, .contact-content'
    );

    animateElements.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    });

    animateElements.forEach(el => observer.observe(el));

    // ─── Active Nav Link Highlighting ───
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${id}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
});
