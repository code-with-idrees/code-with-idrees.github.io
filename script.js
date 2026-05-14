document.addEventListener('DOMContentLoaded', () => {
    const html = document.documentElement;

    // ─── Theme Toggle ───
    const themeBtn = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme');
    if (saved) html.setAttribute('data-theme', saved);
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }

    // ─── Neural Network Canvas ───
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let nodes = [];
        const NODE_COUNT = 75;
        const LINK_DIST = 140;
        let mouse = { x: -500, y: -500 };

        function colors() {
            const dark = html.getAttribute('data-theme') !== 'light';
            return {
                node: dark ? [52, 211, 153] : [5, 150, 105],
                link: dark ? [52, 211, 153] : [5, 150, 105],
                pulse: dark ? [251, 191, 36] : [217, 119, 6]
            };
        }

        function resize() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);
        canvas.addEventListener('mousemove', e => {
            const r = canvas.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
        });
        canvas.addEventListener('mouseleave', () => { mouse.x = -500; mouse.y = -500; });

        class Node {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.r = Math.random() * 2 + 0.8;
                this.baseA = Math.random() * 0.4 + 0.15;
                this.a = this.baseA;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }
            update(t) {
                const dx = mouse.x - this.x, dy = mouse.y - this.y;
                const md = Math.sqrt(dx * dx + dy * dy);
                if (md < 160) {
                    this.a = Math.min(1, this.baseA + 0.5 * (1 - md / 160));
                    this.vx += dx * 0.0001;
                    this.vy += dy * 0.0001;
                } else {
                    this.a += (this.baseA - this.a) * 0.04;
                }
                // Subtle pulse
                this.a += Math.sin(t * 0.002 + this.pulsePhase) * 0.03;
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.998;
                this.vy *= 0.998;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                const c = colors().node;
                ctx.beginPath();
                ctx.rect(this.x - this.r, this.y - this.r, this.r * 2.5, this.r * 2.5); // Square tensor blocks
                ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, this.a)})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < NODE_COUNT; i++) nodes.push(new Node());

        // Data pulse particles flowing along edges
        let pulses = [];
        class Pulse {
            constructor(a, b) {
                this.a = a; this.b = b;
                this.t = 0; this.speed = 0.008 + Math.random() * 0.012;
            }
            update() { this.t += this.speed; return this.t < 1; }
            draw() {
                const c = colors().pulse;
                const x = this.a.x + (this.b.x - this.a.x) * this.t;
                const y = this.a.y + (this.b.y - this.a.y) * this.t;
                ctx.beginPath();
                ctx.arc(x, y, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.7 * (1 - this.t)})`;
                ctx.fill();
            }
        }

        let lastPulse = 0;
        function animate(t) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const c = colors().link;

            nodes.forEach(n => { n.update(t); n.draw(); });

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < LINK_DIST) {
                        const op = 0.07 * (1 - d / LINK_DIST);
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${op})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Spawn pulses periodically
            if (t - lastPulse > 300) {
                lastPulse = t;
                const i = Math.floor(Math.random() * nodes.length);
                let closest = -1, closestD = Infinity;
                for (let j = 0; j < nodes.length; j++) {
                    if (j === i) continue;
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < LINK_DIST && d < closestD) { closestD = d; closest = j; }
                }
                if (closest >= 0) pulses.push(new Pulse(nodes[i], nodes[closest]));
            }

            pulses = pulses.filter(p => { const alive = p.update(); p.draw(); return alive; });
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // ─── Typewriter ───
    const typeEl = document.getElementById('typewriter');
    if (typeEl) {
        const phrases = [
            'AI Systems Researcher',
            'High-Performance Computing',
            'Generative AI Architect',
            'Multi-Agent Networks',
            'Computational Linguistics'
        ];
        let pi = 0, ci = 0, del = false;
        function type() {
            const cur = phrases[pi];
            typeEl.textContent = del ? cur.substring(0, ci--) : cur.substring(0, ci++);
            if (!del && ci > cur.length) { setTimeout(() => { del = true; type(); }, 2200); return; }
            if (del && ci < 0) { del = false; pi = (pi + 1) % phrases.length; ci = 0; }
            setTimeout(type, del ? 35 : 70);
        }
        type();
    }

    // ─── Nav Toggle ───
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        const icon = navToggle.querySelector('i');
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            icon.classList.toggle('ph-list'); icon.classList.toggle('ph-x');
        });
        navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
            navLinks.classList.remove('active');
            icon.classList.add('ph-list'); icon.classList.remove('ph-x');
        }));
    }

    // ─── Navbar Scroll ───
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 30));

    // ─── Photo ───
    const photo = document.getElementById('profilePhoto');
    const ph = document.getElementById('photoPlaceholder');
    if (photo) {
        photo.addEventListener('load', () => { ph.style.display = 'none'; photo.style.display = 'block'; });
        photo.addEventListener('error', () => { photo.style.display = 'none'; ph.style.display = 'flex'; });
        if (!photo.complete) photo.style.display = 'none';
        else if (photo.naturalWidth === 0) { photo.style.display = 'none'; ph.style.display = 'flex'; }
        else ph.style.display = 'none';
    }

    // ─── Counters ───
    let countersDone = false;
    const counters = document.querySelectorAll('.stat-number');
    function animateCounters() {
        if (countersDone) return;
        counters.forEach(el => {
            const target = +el.dataset.target;
            const start = performance.now();
            (function tick(now) {
                const p = Math.min((now - start) / 1800, 1);
                el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * target);
                if (p < 1) requestAnimationFrame(tick);
            })(start);
        });
        countersDone = true;
    }
    const statsObs = new IntersectionObserver(e => e.forEach(x => { if (x.isIntersecting) animateCounters(); }), { threshold: 0.5 });
    const sb = document.querySelector('.stats-banner');
    if (sb) statsObs.observe(sb);

    // ─── Skill Bars ───
    document.querySelectorAll('.skill-bar').forEach(b => {
        b.style.setProperty('--bar-width', b.dataset.level + '%');
    });
    const skillObs = new IntersectionObserver(e => e.forEach(x => {
        if (x.isIntersecting) x.target.classList.add('animated');
    }), { threshold: 0.3 });
    document.querySelectorAll('.skill-bar').forEach(b => skillObs.observe(b));

    // ─── Scroll Reveal ───
    const revealObs = new IntersectionObserver(e => e.forEach(x => {
        if (x.isIntersecting) x.target.classList.add('visible');
    }), { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    // ─── Active Nav ───
    const sections = document.querySelectorAll('section[id]');
    const navAs = document.querySelectorAll('.nav-links a');
    function updateNav() {
        const y = window.scrollY + 120;
        sections.forEach(s => {
            if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
                navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + s.id));
            }
        });
    }
    window.addEventListener('scroll', updateNav);
    updateNav();

    // ─── 3D Card Tilt ───
    document.querySelectorAll('.research-card, .project-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `translateY(-5px) perspective(600px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
});
