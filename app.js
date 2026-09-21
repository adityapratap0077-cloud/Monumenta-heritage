/* ============================================================
   MONUMENTA HERITAGE — Application JavaScript
   Three.js WebGL | GSAP ScrollTrigger | Micro-interactions
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // UTILITY: Detect reduced motion preference
  // ============================================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

  // ============================================================
  // 1. THREE.JS — WebGL Hero Particle Scene
  // ============================================================
  function initHeroScene() {
    const container = document.getElementById('heroCanvas');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // --- Particle System: Restoration "Dust" ---
    const particleCount = isMobile ? 1500 : 4000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    // Golden color palette
    const goldColors = [
      new THREE.Color(0xc9a96e),
      new THREE.Color(0xd4b87a),
      new THREE.Color(0xb8944f),
      new THREE.Color(0xe8d0a0),
      new THREE.Color(0x9a7a3c),
      new THREE.Color(0xf5e6c8)
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Distribute in a large sphere with concentration toward center
      const radius = Math.pow(Math.random(), 0.5) * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6; // Flatten Y
      positions[i3 + 2] = radius * Math.cos(phi) * 0.8;

      // Assign golden colors
      const color = goldColors[Math.floor(Math.random() * goldColors.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 0.5;

      // Slow drift velocities
      velocities[i3] = (Math.random() - 0.5) * 0.003;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.002 + 0.001;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uScroll: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uScroll;

        void main() {
          vColor = color;

          vec3 pos = position;
          pos.x += sin(uTime * 0.3 + position.y * 0.1) * 0.5;
          pos.y += cos(uTime * 0.2 + position.x * 0.1) * 0.3;
          pos.z += sin(uTime * 0.15 + position.z * 0.05) * 0.4;

          // Scroll effect: particles drift upward
          pos.y += uScroll * 15.0;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          // Distance-based alpha
          float dist = length(pos.xy) / 40.0;
          vAlpha = smoothstep(1.0, 0.2, dist) * (0.3 + 0.7 * (1.0 - uScroll));
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;

          float glow = smoothstep(0.5, 0.0, d);
          float core = smoothstep(0.2, 0.0, d);

          vec3 finalColor = vColor * glow + vColor * 1.5 * core;
          float alpha = glow * vAlpha * 0.8;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- Floating geometric hints (architectural lines) ---
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xc9a96e,
      transparent: true,
      opacity: 0.08
    });

    for (let i = 0; i < 8; i++) {
      const lineGeo = new THREE.BufferGeometry();
      const y = (Math.random() - 0.5) * 20;
      const x = (Math.random() - 0.5) * 30;
      const len = Math.random() * 8 + 4;
      const vertical = Math.random() > 0.5;

      const points = vertical
        ? [new THREE.Vector3(x, y, -5), new THREE.Vector3(x, y + len, -5)]
        : [new THREE.Vector3(x, y, -5), new THREE.Vector3(x + len, y, -5)];

      lineGeo.setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMaterial);
      scene.add(line);
    }

    // --- Mouse tracking ---
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // --- Scroll tracking for hero ---
    let scrollProgress = 0;

    // --- Animation loop ---
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      material.uniforms.uTime.value = time;
      material.uniforms.uScroll.value = scrollProgress;

      // Gentle camera sway with mouse
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // Slow rotation
      particles.rotation.y = time * 0.02;
      particles.rotation.x = Math.sin(time * 0.1) * 0.05;

      renderer.render(scene, camera);
    }

    if (!prefersReducedMotion) {
      animate();
    } else {
      // Render once for static view
      renderer.render(scene, camera);
    }

    // --- Resize handler ---
    function onResize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener('resize', onResize, { passive: true });

    // Expose scroll updater
    return {
      updateScroll: (progress) => { scrollProgress = Math.min(progress, 1); }
    };
  }

  // ============================================================
  // 2. GSAP SCROLL ANIMATIONS
  // ============================================================
  function initScrollAnimations(heroScene) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // --- Hero scroll progress (fades WebGL scene) ---
    if (heroScene) {
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          heroScene.updateScroll(self.progress);
        }
      });
    }

    // --- Heritage Stories: Word-by-word highlight ---
    const heritageText = document.getElementById('heritageText');
    if (heritageText) {
      // Split text into word spans
      const words = heritageText.textContent.trim().split(/\s+/);
      heritageText.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');

      const wordSpans = heritageText.querySelectorAll('.word');

      ScrollTrigger.create({
        trigger: '#heritageContainer',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalWords = wordSpans.length;
          const highlightEnd = Math.floor(progress * totalWords);

          wordSpans.forEach((word, i) => {
            if (i < highlightEnd) {
              word.classList.add('highlighted');
            } else {
              word.classList.remove('highlighted');
            }
          });
        }
      });

      // Heritage background parallax
      const heritageBg = document.getElementById('heritageBg');
      if (heritageBg) {
        gsap.to(heritageBg, {
          y: '-20%',
          scrollTrigger: {
            trigger: '#heritageContainer',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        });
      }
    }

    // --- Case Studies: Horizontal scroll ---
    const casesTrack = document.getElementById('casesTrack');
    const casesPinWrapper = document.getElementById('casesPinWrapper');
    if (casesTrack && casesPinWrapper && window.innerWidth > 768) {
      // Wait a tick for layout to settle
      requestAnimationFrame(() => {
        const trackWidth = casesTrack.scrollWidth;
        const viewportWidth = window.innerWidth;
        const scrollDistance = trackWidth - viewportWidth;

        if (scrollDistance > 0) {
          gsap.to(casesTrack, {
            x: () => -scrollDistance,
            ease: 'none',
            scrollTrigger: {
              trigger: casesPinWrapper,
              start: 'top top',
              end: () => `+=${scrollDistance * 1.2}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            }
          });

          // Per-card entrance animation (fade + scale)
          const cards = casesTrack.querySelectorAll('.case-card');
          cards.forEach((card, i) => {
            gsap.fromTo(card, {
              opacity: 0.4,
              scale: 0.92,
            }, {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              scrollTrigger: {
                trigger: card,
                containerAnimation: gsap.getById && undefined, // linked to main scroll
                start: 'left 90%',
                end: 'left 50%',
                scrub: true,
                horizontal: true,
              }
            });
          });
        }
      });
    }

    // --- Parallax for About image ---
    const aboutImage = document.querySelector('.about__image-wrapper');
    if (aboutImage) {
      gsap.fromTo(aboutImage, {
        y: 60,
      }, {
        y: -40,
        scrollTrigger: {
          trigger: '.about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
    }

    // --- CTA glow pulse on scroll ---
    const ctaGlow = document.querySelector('.cta__bg-glow');
    if (ctaGlow) {
      gsap.fromTo(ctaGlow, {
        scale: 0.5,
        opacity: 0,
      }, {
        scale: 1.2,
        opacity: 1,
        scrollTrigger: {
          trigger: '.cta',
          start: 'top 80%',
          end: 'center center',
          scrub: true,
        }
      });
    }

    // --- Gold divider lines animate in ---
    document.querySelectorAll('.gold-line').forEach(line => {
      gsap.fromTo(line, {
        scaleX: 0,
      }, {
        scaleX: 1,
        scrollTrigger: {
          trigger: line,
          start: 'top 90%',
          end: 'top 60%',
          scrub: true,
        }
      });
    });
  }

  // ============================================================
  // 3. INTERSECTION OBSERVER — Scroll Reveals
  // ============================================================
  function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if (prefersReducedMotion) {
      reveals.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  }

  // ============================================================
  // 4. NEUMORPHISM PROGRESS BARS — Scroll-triggered fill
  // ============================================================
  function initProgressBars() {
    const progressBars = document.querySelectorAll('.neu-progress-fill');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetWidth = entry.target.getAttribute('data-width');
          if (targetWidth) {
            setTimeout(() => {
              entry.target.style.width = targetWidth + '%';
            }, 300);
          }
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    progressBars.forEach(bar => observer.observe(bar));
  }

  // ============================================================
  // 5. BEFORE/AFTER CONFIGURATOR — Drag Slider
  // ============================================================
  function initConfigurator() {
    const wrapper = document.getElementById('configuratorSlider');
    const afterPanel = document.getElementById('afterPanel');
    const sliderLine = document.getElementById('sliderLine');
    if (!wrapper || !afterPanel || !sliderLine) return;

    let isDragging = false;

    function updateSlider(clientX) {
      const rect = wrapper.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const percent = (x / rect.width) * 100;

      afterPanel.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      sliderLine.style.left = percent + '%';
    }

    function onPointerDown(e) {
      isDragging = true;
      wrapper.style.cursor = 'col-resize';
      updateSlider(e.clientX || e.touches[0].clientX);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      updateSlider(e.clientX || e.touches[0].clientX);
    }

    function onPointerUp() {
      isDragging = false;
      wrapper.style.cursor = 'col-resize';
    }

    wrapper.addEventListener('mousedown', onPointerDown);
    wrapper.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (isDragging) {
        onPointerMove(e.touches[0]);
      }
    }, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
  }

  // ============================================================
  // 6. NAVBAR — Scroll state & mobile toggle
  // ============================================================
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll state
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScrollY = scrollY;
    }, { passive: true });

    // Mobile toggle
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const isActive = navLinks.classList.contains('active');
        mobileToggle.setAttribute('aria-expanded', isActive);
      });

      // Close on link click
      navLinks.querySelectorAll('.navbar__link').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          const navHeight = navbar.offsetHeight + 20;
          const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      });
    });
  }

  // ============================================================
  // 7. MICRO-INTERACTIONS
  // ============================================================
  function initMicroInteractions() {
    if (prefersReducedMotion) return;

    // --- Magnetic hover on buttons ---
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });

    // --- Stat counter animation ---
    const stats = document.querySelectorAll('.stat-item__number');
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => statObserver.observe(stat));

    // --- Glass card tilt effect ---
    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // --- Navbar logo icon glow on hover ---
    const logoIcon = document.querySelector('.navbar__logo-icon');
    if (logoIcon) {
      logoIcon.addEventListener('mouseenter', () => {
        logoIcon.style.boxShadow = '0 0 20px rgba(201, 169, 110, 0.5)';
      });
      logoIcon.addEventListener('mouseleave', () => {
        logoIcon.style.boxShadow = '';
      });
    }
  }

  // --- Counter animation helper ---
  function animateCounter(element) {
    const text = element.textContent.trim();
    const match = text.match(/^([\d,]+)/);
    if (!match) return;

    const targetNum = parseInt(match[1].replace(/,/g, ''), 10);
    const suffix = text.replace(match[1], '');
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
      const current = Math.round(targetNum * eased);

      element.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ============================================================
  // 8. AI PLANNER FORM — Fake submission feedback
  // ============================================================
  function initPlannerForm() {
    const form = document.getElementById('plannerForm');
    if (!form) return;

    const submitBtn = form.querySelector('.planner__submit');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Animate button
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="animation: spin 1s linear infinite;">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" opacity="0.3"/>
          <path d="M12 2a10 10 0 019.95 9H20a8 8 0 00-8-8V2z"/>
        </svg>
        Analyzing Heritage Data...
      `;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';

      setTimeout(() => {
        submitBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          Analysis Complete — Plan Ready
        `;
        submitBtn.style.opacity = '1';
        submitBtn.style.background = 'linear-gradient(135deg, #2a6e3a, #1a5e2a)';

        setTimeout(() => {
          submitBtn.innerHTML = originalHTML;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
        }, 3000);
      }, 2500);
    });
  }

  // ============================================================
  // SPIN ANIMATION (inline for form button)
  // ============================================================
  const spinStyle = document.createElement('style');
  spinStyle.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinStyle);

  // ============================================================
  // 9. HERITAGE BG GRADIENT ANIMATION
  // ============================================================
  function initHeritageBg() {
    const bg = document.getElementById('heritageBg');
    if (!bg) return;

    const gradients = [
      'linear-gradient(135deg, #2a1f12 0%, #3a2e1e 50%, #1a140c 100%)',
      'linear-gradient(135deg, #1e2a1f 0%, #2e3a2e 50%, #0c1a14 100%)',
      'linear-gradient(135deg, #1f1e2a 0%, #2e2d3a 50%, #0c0b1a 100%)',
      'linear-gradient(135deg, #2a1f1e 0%, #3a2e2d 50%, #1a0c0b 100%)',
    ];

    let currentGradient = 0;
    bg.style.background = gradients[0];

    setInterval(() => {
      currentGradient = (currentGradient + 1) % gradients.length;
      bg.style.background = gradients[currentGradient];
      bg.style.transition = 'background 3s ease';
    }, 5000);
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================
  function init() {
    const heroScene = initHeroScene();
    initNavbar();
    initScrollReveals();
    initProgressBars();
    initConfigurator();
    initMicroInteractions();
    initScrollAnimations(heroScene);
    initPlannerForm();
    initHeritageBg();
  }

  // Wait for DOM + fonts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
