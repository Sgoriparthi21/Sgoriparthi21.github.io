// =============================================
// MINIMALIST BOLD PORTFOLIO - MAIN JS
// STANDARDIZED VERSION - Compatible with aesthetic-portfolio JSON structure
// =============================================

// Data loading functions
async function loadJSON(file) {
    try {
        const response = await fetch(`data/${file}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${file}.json:`, error);
        return null;
    }
}

// Initialize site
async function initSite() {
    await Promise.all([
        loadSiteConfig(),
        loadNavigation(),
        loadHero(),
        loadAbout(),
        loadExperience(),
        loadSkills(),
        loadProjects(),
        loadEducation(),
        loadContact(),
        loadFooter()
    ]);

    initMobileNav();
    initEnhancements();
}

// Scroll progress, nav state, active links and reveal-on-scroll
function initEnhancements() {
    const nav = document.getElementById('nav');
    const progress = document.getElementById('scroll-progress');
    const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!('IntersectionObserver' in window)) return;

    const links = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = document.querySelectorAll(
        '.section-header, .about-text, .stat-item, .work-item, .skill-category, .project-item, .contact-item'
    );
    targets.forEach(el => {
        const siblings = [...el.parentElement.children];
        el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
        el.classList.add('reveal');
    });
    document.documentElement.classList.add('js-reveal');

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => revealObserver.observe(el));
}

// Load site configuration
async function loadSiteConfig() {
    const config = await loadJSON('site-config');
    if (config) {
        document.getElementById('site-title').textContent = config.title || 'Portfolio';
        document.getElementById('site-description').content = config.description || 'Professional Portfolio';
    }
}

// Load navigation
async function loadNavigation() {
    const nav = await loadJSON('navigation');
    if (nav) {
        const logo = document.getElementById('nav-logo');
        if (logo) logo.textContent = nav.logo || 'Portfolio';

        const menu = document.getElementById('nav-menu');
        if (menu && nav.items) {
            menu.innerHTML = nav.items.map(item => `
                <li><a href="${item.href}">${item.text}</a></li>
            `).join('');
        }
    }
}

// Load hero section (STANDARDIZED)
async function loadHero() {
    const hero = await loadJSON('hero');
    if (hero) {
        // Support both old and new structure
        const greeting = hero.greeting || hero.label || '';
        const name = hero.name || '';
        const title = hero.title || '';
        const summary = hero.summary || hero.subtitle || '';

        const label = document.getElementById('hero-label');
        if (label) label.textContent = greeting;

        const titleEl = document.getElementById('hero-title');
        if (titleEl) {
            const words = (name || title).trim().split(' ');
            const last = words.pop();
            titleEl.innerHTML = `${words.join(' ')} <span class="grad-text">${last}</span>`;
        }

        const subtitle = document.getElementById('hero-subtitle');
        if (subtitle) subtitle.textContent = title && name ? title : summary;

        // Handle CTA - support both structures
        const cta = document.getElementById('hero-cta');
        if (cta) {
            let buttons = [];
            if (hero.cta && hero.cta.buttons) {
                // New structure: { buttons: [...] }
                buttons = hero.cta.buttons;
            } else if (Array.isArray(hero.cta)) {
                // Old structure: [...]
                buttons = hero.cta;
            }

            if (buttons.length > 0) {
                cta.innerHTML = buttons.map(button => `
                    <a href="${button.href}" class="btn ${button.type === 'primary' ? 'btn-primary' : 'btn-secondary'}">
                        ${button.text}
                    </a>
                `).join('');
            }
        }

        const image = document.getElementById('hero-image');
        if (image && hero.image) {
            image.innerHTML = `<img src="${hero.image}" alt="${name || title}">`;
        }

        const roles = document.getElementById('hero-roles');
        if (roles && hero.roles && hero.roles.length > 0) {
            roles.innerHTML = `${hero.rolesPrefix || ''} <span class="typed">${hero.roles[0]}</span><span class="caret"></span>`;
            startTyping(roles.querySelector('.typed'), hero.roles);
        }

        const social = document.getElementById('hero-social');
        if (social && hero.socialLinks) {
            social.innerHTML = hero.socialLinks.map(link => `
                <a href="${link.url}" aria-label="${link.platform}" title="${link.platform}"${link.url.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>
                    ${SOCIAL_ICONS[link.icon] || link.platform}
                </a>
            `).join('');
        }

        const chips = document.getElementById('hero-chips');
        if (chips && hero.chips) {
            chips.innerHTML = hero.chips.slice(0, 4).map((chip, i) => `
                <span class="hero-chip c${i + 1}"><i></i>${chip}</span>
            `).join('');
        }

        const status = document.getElementById('hero-status');
        if (status && hero.status) {
            document.getElementById('hero-status-text').textContent = hero.status;
            status.hidden = false;
        }
    }
}

const SOCIAL_ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg>'
};

function startTyping(el, words) {
    if (!el || words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let index = 0;
    let chars = words[0].length;
    let deleting = true;
    const tick = () => {
        const word = words[index];
        chars += deleting ? -1 : 1;
        el.textContent = word.slice(0, chars);
        let delay = deleting ? 40 : 80;
        if (!deleting && chars === word.length) {
            deleting = true;
            delay = 2200;
        } else if (deleting && chars === 0) {
            deleting = false;
            index = (index + 1) % words.length;
            delay = 300;
        }
        setTimeout(tick, delay);
    };
    setTimeout(tick, 2600);
}

// Load about section
async function loadAbout() {
    const about = await loadJSON('about');
    if (about) {
        const title = document.getElementById('about-title');
        if (title) title.textContent = about.title || 'About';

        const description = document.getElementById('about-description');
        if (description && about.description) {
            description.innerHTML = Array.isArray(about.description)
                ? about.description.map(p => `<p>${p}</p>`).join('')
                : `<p>${about.description}</p>`;
        }

        const stats = document.getElementById('about-stats');
        if (stats && about.stats) {
            stats.innerHTML = about.stats.map(stat => `
                <div class="stat-item">
                    <div class="stat-number">${stat.number}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('');
        }
    }
}

// Load work experience (STANDARDIZED)
async function loadExperience() {
    const experience = await loadJSON('experience');
    if (experience) {
        const sectionTitle = document.getElementById('work-title');
        if (sectionTitle) sectionTitle.textContent = experience.sectionTitle || 'Experience';

        const list = document.getElementById('work-list');
        const experiences = experience.experiences || experience.items || []; // Support both

        if (list && experiences.length > 0) {
            list.innerHTML = experiences.map(item => `
                <div class="work-item">
                    <div class="work-period">
                        ${item.logo ? `<img class="work-logo" src="${item.logo}" alt="${item.company || ''} logo">` : ''}
                        ${item.period || ''}
                    </div>
                    <div class="work-details">
                        <h3 class="work-title">${item.title || item.position || ''}</h3>
                        <div class="work-company">${item.company || ''}</div>
                        <p class="work-description">${item.description || ''}</p>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Load education section
async function loadEducation() {
    const education = await loadJSON('education');
    if (education) {
        const title = document.getElementById('education-title');
        if (title) title.textContent = education.sectionTitle || 'Education';

        const list = document.getElementById('education-list');
        const degrees = education.education || [];
        if (list) {
            list.innerHTML = degrees.map(item => `
                <div class="work-item">
                    <div class="work-period">
                        ${item.logo ? `<img class="work-logo" src="${item.logo}" alt="${item.institution || ''} logo">` : ''}
                        ${item.period || ''}
                    </div>
                    <div class="work-details">
                        <h3 class="work-title">${item.degree || ''}</h3>
                        <div class="work-company">${item.institution || ''}</div>
                        ${item.description ? `<p class="work-description">${item.description}</p>` : ''}
                    </div>
                </div>
            `).join('');
        }

        const certTitle = document.getElementById('certifications-title');
        if (certTitle) certTitle.textContent = education.certificationsTitle || 'Certifications';

        const certList = document.getElementById('certifications-list');
        const certifications = education.certifications || [];
        if (certList) {
            certList.innerHTML = certifications.map(cert => `
                <div class="skill-category">
                    <h3>${cert.name}</h3>
                    <ul class="skill-list">
                        <li>${cert.issuer || 'Professional Certification'}</li>
                    </ul>
                </div>
            `).join('');
        }
    }
}

// Load skills
async function loadSkills() {
    const skills = await loadJSON('skills');
    if (skills) {
        const title = document.getElementById('skills-title');
        if (title) title.textContent = skills.title || 'Skills';

        const list = document.getElementById('skills-list');
        if (list && skills.categories) {
            list.innerHTML = skills.categories.map(category => `
                <div class="skill-category">
                    <h3>${category.name}</h3>
                    <ul class="skill-list">
                        ${category.skills.map(skill => `<li>${skill}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }
    }
}

// Load projects
async function loadProjects() {
    const projects = await loadJSON('projects');
    if (projects) {
        const title = document.getElementById('projects-title');
        if (title) title.textContent = projects.title || 'Projects';

        const list = document.getElementById('projects-list');
        if (list && projects.items) {
            list.innerHTML = projects.items.map(project => `
                <div class="project-item">
                    <div class="project-image">
                        ${project.image ? `<img src="${project.image}" alt="${project.title}">` : ''}
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.title}</h3>
                        <p class="project-description">${project.description}</p>
                        ${project.tags ? `
                            <div class="project-tags">
                                ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${project.link ? `
                            <a href="${project.link}" class="project-link" target="_blank">
                                View Project →
                            </a>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }
    }
}

// Load contact section
async function loadContact() {
    const contact = await loadJSON('contact');
    if (contact) {
        const title = document.getElementById('contact-title');
        if (title) title.textContent = contact.title || 'Contact';

        const description = document.getElementById('contact-description');
        if (description) description.textContent = contact.description || '';

        const info = document.getElementById('contact-info');
        if (info && contact.methods) {
            info.innerHTML = contact.methods.map(method => `
                <div class="contact-item">
                    <div class="contact-label">${method.label}</div>
                    <div class="contact-value">
                        ${method.link ? `<a href="${method.link}">${method.value}</a>` : method.value}
                    </div>
                </div>
            `).join('');
        }
    }
}

// Load footer
async function loadFooter() {
    const footer = await loadJSON('footer');
    if (footer) {
        const text = document.getElementById('footer-text');
        if (text) text.textContent = footer.text || '';

        const social = document.getElementById('footer-social');
        if (social && footer.social) {
            social.innerHTML = footer.social.map(link => `
                <a href="${link.url}" class="social-link" target="_blank">${link.name}</a>
            `).join('');
        }
    }
}

// Mobile navigation toggle
function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
            });
        });
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSite);
} else {
    initSite();
}
