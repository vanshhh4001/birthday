/* =========================================================
   Tangled-Inspired Cinematic Birthday Experience
   FILE: assets/js/app.js
   ---------------------------------------------------------
   Edit window.BIRTHDAY_CONFIG in index.html to customize:
   - name
   - subtitle
   - memories[]
   - finalLetter
   - hiddenMessages[]
   - audio file path in the <audio> tag
   ========================================================= */

(() => {
  const config = window.BIRTHDAY_CONFIG || {};
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;
  const lanternDensity = isMobile ? 12 : 20;
  const sparkDensity = isMobile ? 26 : 50;

  gsap.registerPlugin(ScrollTrigger);

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const rand = (min, max) => Math.random() * (max - min) + min;
  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
  const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const placeholderImage = (label = 'Photo') => {
    const safeText = encodeURIComponent(label);
    return `data:image/svg+xml;charset=UTF-8,
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 1200'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stop-color='%232f1148'/>
            <stop offset='55%' stop-color='%236c3a98'/>
            <stop offset='100%' stop-color='%23f2b24a'/>
          </linearGradient>
        </defs>
        <rect width='900' height='1200' fill='url(%23g)'/>
        <circle cx='450' cy='330' r='140' fill='rgba(255,255,255,0.12)'/>
        <text x='50%' y='55%' text-anchor='middle' fill='%23fff6e8' font-size='72' font-family='Georgia, serif'>${safeText}</text>
        <text x='50%' y='64%' text-anchor='middle' fill='rgba(255,246,232,0.72)' font-size='30' font-family='Arial'>Replace with your memory photo</text>
      </svg>`;
  };

  const setTextContentFromConfig = () => {
    const map = {
      '[data-config="name"]': config.name || '[ADD NAME]',
      '[data-config="name2"]': config.name || '[ADD NAME]',
      '[data-config="name3"]': config.name || '[ADD NAME]',
      '[data-config="subtitle"]': config.subtitle || '[ADD SUBTITLE]'
    };

    Object.entries(map).forEach(([selector, value]) => {
      $$(selector).forEach(node => { node.textContent = value; });
    });
  };

  const fadeAudio = (audio, target, duration = 1.4) => {
    if (!audio) return;
    gsap.to(audio, {
      volume: clamp(target, 0, 1),
      duration,
      ease: 'power2.out'
    });
  };

  const spawnBurst = (x, y, count = 10) => {
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.className = 'cursor-burst';
      document.body.appendChild(spark);
      gsap.set(spark, { x, y, scale: rand(0.7, 1.2) });
      gsap.to(spark, {
        x: x + rand(-50, 50),
        y: y + rand(-50, 50),
        opacity: 0,
        scale: 0,
        duration: rand(0.5, 0.95),
        ease: 'power2.out',
        onComplete: () => spark.remove()
      });
    }
  };

  const showMiniMessage = (message) => {
    const mini = $('#miniMessage');
    if (!mini) return;
    mini.textContent = message;
    mini.classList.add('show');
    clearTimeout(showMiniMessage.timer);
    showMiniMessage.timer = setTimeout(() => {
      mini.classList.remove('show');
    }, 2800);
  };

  // ---------------------------------------------------------
  // LOADER
  // ---------------------------------------------------------
  const buildLoaderAtmosphere = () => {
    createLanterns($('#loaderLanterns'), 12, { minSize: 16, maxSize: 34, upward: true, scene: 'loader' });
    createSpecks($('#loaderParticles'), 26, 'firefly');
  };

  const initLoader = () => {
    const loader = $('#loader');
    if (!loader) return;

    const minimumTime = 3600;
    const start = performance.now();

    const done = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, minimumTime - elapsed);
      setTimeout(() => {
        loader.classList.remove('active');
        document.body.classList.remove('nav-locked');
      }, remaining);
    };

    document.body.classList.add('nav-locked');
    window.addEventListener('load', done, { once: true });
    setTimeout(done, minimumTime + 1000);
  };

  // ---------------------------------------------------------
  // LENIS SMOOTH SCROLL
  // ---------------------------------------------------------
  let lenis;
  const initLenis = () => {
    if (isReducedMotion) return;
    lenis = new Lenis({
      duration: 1.15,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      touchMultiplier: 1.15,
      infinite: false
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
  };

  // ---------------------------------------------------------
  // CURSOR EFFECTS
  // ---------------------------------------------------------
  const initCursor = () => {
    if (isTouch || isReducedMotion) return;

    const dot = $('#cursorDot');
    const glow = $('#cursorGlow');
    const trail = $('#cursorTrail');
    if (!dot || !glow || !trail) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const glowPos = { ...pos };
    const trailPos = { ...pos };

    window.addEventListener('pointermove', (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      gsap.set(dot, { x: pos.x, y: pos.y });
      gsap.to(glowPos, { x: pos.x, y: pos.y, duration: 0.28, ease: 'power3.out', onUpdate: () => gsap.set(glow, { x: glowPos.x, y: glowPos.y }) });
      gsap.to(trailPos, { x: pos.x, y: pos.y, duration: 0.42, ease: 'power3.out', onUpdate: () => gsap.set(trail, { x: trailPos.x, y: trailPos.y }) });
    }, { passive: true });

    window.addEventListener('pointerdown', (e) => spawnBurst(e.clientX, e.clientY, 12));

    $$('button, .memory-card, .lantern, .hidden-star, a, input').forEach((node) => {
      node.addEventListener('mouseenter', () => {
        gsap.to(glow, { scale: 1.25, duration: 0.25, ease: 'power2.out' });
        gsap.to(trail, { scale: 1.4, borderColor: 'rgba(255,240,205,0.42)', duration: 0.25, ease: 'power2.out' });
      });
      node.addEventListener('mouseleave', () => {
        gsap.to([glow, trail], { scale: 1, duration: 0.25, ease: 'power2.out' });
        gsap.to(trail, { borderColor: 'rgba(255,245,225,0.22)', duration: 0.25, ease: 'power2.out' });
      });
    });
  };

  // ---------------------------------------------------------
  // GLOBAL PARTICLE CANVAS
  // ---------------------------------------------------------
  const initParticleCanvas = () => {
    if (isReducedMotion) return;

    const canvas = $('#particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth * devicePixelRatio;
    let height = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const particles = Array.from({ length: isMobile ? 22 : 40 }, () => ({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      size: rand(1.2, 3.6),
      vx: rand(-0.08, 0.08),
      vy: rand(-0.18, -0.04),
      alpha: rand(0.2, 0.9),
      pulse: rand(0.004, 0.014)
    }));

    const resize = () => {
      width = canvas.width = window.innerWidth * devicePixelRatio;
      height = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.pulse;
        if (p.alpha > 0.95 || p.alpha < 0.2) p.pulse *= -1;
        if (p.y < -20) p.y = window.innerHeight + 20;
        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 20) p.x = -20;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 8);
        g.addColorStop(0, `rgba(255, 244, 210, ${p.alpha})`);
        g.addColorStop(0.4, `rgba(255, 205, 110, ${p.alpha * 0.42})`);
        g.addColorStop(1, 'rgba(255, 205, 110, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    draw();
  };

  // ---------------------------------------------------------
  // PROCEDURAL SCENE BUILDERS
  // ---------------------------------------------------------
  function createLanterns(container, count = 16, options = {}) {
    if (!container) return;
    const {
      minSize = 20,
      maxSize = 48,
      upward = true,
      scene = 'hero'
    } = options;

    for (let i = 0; i < count; i++) {
      const lantern = document.createElement('button');
      lantern.type = 'button';
      lantern.className = 'lantern';
      lantern.setAttribute('aria-label', 'Hidden lantern message');
      lantern.style.setProperty('--left', `${rand(4, 96)}%`);
      lantern.style.setProperty('--top', `${rand(scene === 'loader' ? 60 : 50, 95)}%`);
      lantern.style.setProperty('--size', `${rand(minSize, maxSize)}px`);
      lantern.style.setProperty('--opacity', rand(0.4, 1));
      lantern.style.setProperty('--duration', `${rand(14, 26)}s`);
      lantern.style.setProperty('--delay', `${rand(-22, 0)}s`);
      lantern.style.setProperty('--xShift', `${rand(-80, 80)}px`);
      lantern.style.background = 'transparent';
      lantern.style.border = '0';
      lantern.style.padding = '0';
      if (!upward) lantern.style.animationDirection = 'reverse';

      lantern.addEventListener('click', () => {
        showMiniMessage(sample(config.hiddenMessages || ['A tiny lantern glows for you.']));
        const rect = lantern.getBoundingClientRect();
        spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
      });

      container.appendChild(lantern);
    }
  }

  function createSpecks(container, count = 18, type = 'firefly') {
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = type;
      dot.style.setProperty('--left', `${rand(0, 100)}%`);
      dot.style.setProperty('--top', `${rand(0, 100)}%`);
      dot.style.setProperty('--size', `${rand(type === 'star' ? 1 : 2, type === 'star' ? 4 : 6)}px`);
      dot.style.setProperty('--duration', `${rand(1.8, 5.2)}s`);
      dot.style.setProperty('--delay', `${rand(-3.8, 0)}s`);
      if (type === 'hidden-star') {
        dot.tabIndex = 0;
        dot.addEventListener('click', () => showMiniMessage('A hidden little wish just for you ✨'));
      }
      container.appendChild(dot);
    }
  }

  function createClouds(container, count = 7) {
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const cloud = document.createElement('span');
      cloud.className = 'cloud';
      cloud.style.setProperty('--left', `${rand(-6, 80)}%`);
      cloud.style.setProperty('--top', `${rand(4, 38)}%`);
      cloud.style.setProperty('--width', `${rand(160, 360)}px`);
      cloud.style.setProperty('--opacity', rand(0.16, 0.52));
      cloud.style.setProperty('--duration', `${rand(16, 28)}s`);
      container.appendChild(cloud);
    }
  }

  const buildAtmosphere = () => {
    createClouds($('#heroClouds'), isMobile ? 5 : 8);
    createSpecks($('#heroStars'), isMobile ? 34 : 62, 'star');
    createSpecks($('#heroFireflies'), isMobile ? 16 : 28, 'firefly');
    createLanterns($('#heroLanterns'), lanternDensity, { minSize: 16, maxSize: 42, scene: 'hero' });
    createLanterns($('#towerLanterns'), isMobile ? 8 : 14, { minSize: 18, maxSize: 34, scene: 'tower' });
    createLanterns($('#bottomLanterns'), isMobile ? 10 : 20, { minSize: 20, maxSize: 44, scene: 'bottom' });
    createLanterns($('#endingLanterns'), isMobile ? 30 : 80, { minSize: 12, maxSize: 34, scene: 'ending' });
    createLanterns($('#letterLanterns'), isMobile ? 12 : 24, { minSize: 16, maxSize: 32, scene: 'letter' });
    createSpecks($('#endingSparkles'), isMobile ? 24 : 42, 'firefly');

    const bottom = $('#bottomGrove');
    const ending = $('#endingScene');
    if (bottom) createSpecks(bottom, isMobile ? 10 : 18, 'hidden-star');
    if (ending) createSpecks(ending, isMobile ? 14 : 24, 'star');
  };

  // ---------------------------------------------------------
  // MEMORY CARDS ATTACHED TO HAIR PATH
  // ---------------------------------------------------------
  const initMemoryCards = () => {
    const wrap = $('#memoryCards');
    const path = $('#hairPath');
    if (!wrap || !path) return;

    const memories = (config.memories || []).slice(0, 7);
    const points = [0.12, 0.22, 0.35, 0.48, 0.61, 0.74, 0.86];

    memories.forEach((memory, index) => {
      const pointAt = path.getPointAtLength(path.getTotalLength() * points[index % points.length]);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'memory-card';
      card.style.left = `${pointAt.x}px`;
      card.style.top = `${pointAt.y}px`;
      card.dataset.index = String(index);

      const imgSrc = memory.image || placeholderImage(memory.title || `Memory ${index + 1}`);
      card.innerHTML = `
        <div class="memory-card__image">
          <img src="${imgSrc}" alt="${memory.title || `Memory ${index + 1}`}" loading="lazy" />
        </div>
        <div class="memory-card__body">
          <div class="memory-card__title">${memory.title || `Memory ${index + 1}`}</div>
          <p class="memory-card__desc">${memory.message || '[ADD MESSAGE]'}</p>
        </div>
      `;

      const img = $('img', card);
      img.addEventListener('error', () => {
        img.src = placeholderImage(memory.title || `Memory ${index + 1}`);
      });

      card.addEventListener('click', () => openMemoryModal(memory, img.src));
      wrap.appendChild(card);

      const baseRotation = index % 2 === 0 ? -6 : 6;
      const xOffset = index % 2 === 0 ? -card.offsetWidth * 1.05 : card.offsetWidth * 0.1;
      const yOffset = -card.offsetHeight * 0.5;

      gsap.set(card, {
        x: xOffset,
        y: yOffset,
        rotate: baseRotation,
        transformOrigin: '50% 0%'
      });

      gsap.to(card, {
        y: yOffset + rand(-10, 10),
        rotate: baseRotation + (index % 2 === 0 ? -1 : 1) * rand(2, 5),
        duration: rand(2.8, 4.2),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.from(card, {
        opacity: 0,
        scale: 0.85,
        y: yOffset + 60,
        duration: 1.1,
        delay: index * 0.12,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%'
        }
      });
    });

    createHairSparkStream();
  };

  const createHairSparkStream = () => {
    const wrap = $('#sparkStream');
    const path = $('#hairPath');
    if (!wrap || !path) return;

    const total = path.getTotalLength();
    for (let i = 0; i < sparkDensity; i++) {
      const spark = document.createElement('span');
      spark.className = 'stream-spark';
      wrap.appendChild(spark);

      const progress = rand(0, 1);
      const point = path.getPointAtLength(total * progress);
      gsap.set(spark, { x: point.x, y: point.y, scale: rand(0.7, 1.3), opacity: rand(0.35, 1) });

      gsap.to(spark, {
        motionPath: false,
        duration: rand(4, 9),
        repeat: -1,
        delay: rand(-8, 0),
        ease: 'none',
        onUpdate: function() {
          const local = (progress + ((this.time() % this.duration()) / this.duration())) % 1;
          const p = path.getPointAtLength(total * local);
          gsap.set(spark, { x: p.x, y: p.y });
        }
      });
    }
  };

  // ---------------------------------------------------------
  // MODALS
  // ---------------------------------------------------------
  const memoryModal = $('#memoryModal');
  const openMemoryModal = (memory, imageSrc) => {
    if (!memoryModal) return;
    $('#memoryModalTitle').textContent = memory.title || 'Memory';
    $('#memoryModalMessage').textContent = memory.message || '[ADD MESSAGE]';
    const image = $('#memoryModalImage');
    image.src = imageSrc || placeholderImage(memory.title || 'Memory');
    image.onerror = () => { image.src = placeholderImage(memory.title || 'Memory'); };
    memoryModal.classList.add('active');
    memoryModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-locked');
    gsap.fromTo('.memory-modal__card', { y: 40, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.65, ease: 'power3.out' });
  };

  const closeMemoryModal = () => {
    if (!memoryModal) return;
    memoryModal.classList.remove('active');
    memoryModal.setAttribute('aria-hidden', 'true');
    if (!$('#letterOverlay').classList.contains('active')) {
      document.body.classList.remove('nav-locked');
    }
  };

  const initMemoryModal = () => {
    $('#closeMemoryModal')?.addEventListener('click', closeMemoryModal);
    $('.memory-modal__backdrop')?.addEventListener('click', closeMemoryModal);
  };

  const letterOverlay = $('#letterOverlay');
  let letterTyped = false;
  const typeLetter = () => {
    if (letterTyped) return;
    const target = $('#typedLetter');
    if (!target) return;
    target.textContent = '';
    const text = config.finalLetter || `Dear ${config.name || '[ADD NAME]'},\n\n[ADD LETTER]`;
    let index = 0;
    letterTyped = true;

    const tick = () => {
      target.textContent = text.slice(0, index);
      index += 1;
      if (index <= text.length) {
        setTimeout(tick, text[index - 1] === '\n' ? 130 : 24);
      }
    };
    tick();
  };

  const openLetterOverlay = () => {
    if (!letterOverlay) return;
    letterOverlay.classList.add('active');
    letterOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-locked');
    typeLetter();
    spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 18);
  };

  const closeLetterOverlay = () => {
    if (!letterOverlay) return;
    letterOverlay.classList.remove('active');
    letterOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-locked');
  };

  const initLetterOverlay = () => {
    $('#openLetterBtn')?.addEventListener('click', openLetterOverlay);
    $('#closeLetterBtn')?.addEventListener('click', closeLetterOverlay);
    $('.letter-overlay__backdrop')?.addEventListener('click', closeLetterOverlay);
    $('#finishJourneyBtn')?.addEventListener('click', () => {
      closeLetterOverlay();
      const ending = $('#endingScene');
      if (lenis) {
        lenis.scrollTo(ending, { offset: -20, duration: 1.7, easing: t => 1 - Math.pow(1 - t, 3) });
      } else {
        ending?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  // ---------------------------------------------------------
  // MUSIC CONTROLS
  // ---------------------------------------------------------
  const initMusic = () => {
    const audio = $('#bgMusic');
    const toggle = $('#musicToggle');
    const range = $('#volumeRange');
    if (!audio || !toggle || !range) return;

    audio.volume = Number(range.value || 0.45);
    let started = false;

    const startMusic = async () => {
      if (started) return;
      started = true;
      try {
        await audio.play();
        audio.volume = 0;
        fadeAudio(audio, Number(range.value || 0.45), 2.2);
        toggle.classList.add('is-playing');
      } catch (err) {
        started = false;
      }
    };

    window.addEventListener('pointerdown', startMusic, { once: true });

    toggle.addEventListener('click', async () => {
      if (audio.paused) {
        try {
          await audio.play();
          fadeAudio(audio, Number(range.value || 0.45), 1.1);
          toggle.classList.add('is-playing');
        } catch (err) {
          // ignore autoplay edge case
        }
      } else {
        fadeAudio(audio, 0, 0.8);
        setTimeout(() => {
          audio.pause();
          toggle.classList.remove('is-playing');
          audio.volume = Number(range.value || 0.45);
        }, 850);
      }
    });

    range.addEventListener('input', () => {
      audio.volume = Number(range.value);
    });
  };

  // ---------------------------------------------------------
  // HERO / CAMERA / SCROLL ANIMATIONS
  // ---------------------------------------------------------
  const initAnimations = () => {
    gsap.from('.hero__title', { y: 80, opacity: 0, duration: 1.3, ease: 'power3.out', delay: 0.1 });
    gsap.from('.hero__subtitle', { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.35 });
    gsap.from('.hero__actions', { y: 28, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.48 });

    gsap.to('.hero__content', {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('#heroLanterns', {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('.hero__reflection', {
      scaleY: 1.16,
      opacity: 0.7,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.from('.tower', {
      y: 130,
      scale: 0.92,
      opacity: 0,
      duration: 1.3,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#towerIntro',
        start: 'top 75%'
      }
    });

    gsap.to('.tower', {
      yPercent: -8,
      scrollTrigger: {
        trigger: '#towerIntro',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('#hairGlowPath', {
      strokeDasharray: 120,
      strokeDashoffset: -220,
      repeat: -1,
      duration: 4.5,
      ease: 'none'
    });

    const memoryJourney = $('#memoryJourney');
    if (memoryJourney) {
      gsap.to('.memory-journey__bg-layer--back', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: memoryJourney,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      });

      gsap.to('.memory-journey__bg-layer--front', {
        yPercent: -24,
        ease: 'none',
        scrollTrigger: {
          trigger: memoryJourney,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      });

      gsap.to('#memoryCards', {
        yPercent: -5,
        ease: 'none',
        scrollTrigger: {
          trigger: memoryJourney,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      });
    }

    gsap.from('#bottomGrove .content-shell', {
      opacity: 0,
      y: 50,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#bottomGrove',
        start: 'top 72%'
      }
    });

    gsap.from('#endingScene .content-shell', {
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#endingScene',
        start: 'top 70%'
      }
    });
  };

  const initCameraTransitionButton = () => {
    const btn = $('#visitTowerBtn');
    const tower = $('#towerIntro');
    const audio = $('#bgMusic');
    if (!btn || !tower) return;

    btn.addEventListener('click', () => {
      spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
      if (audio && !audio.paused) fadeAudio(audio, clamp(audio.volume + 0.08, 0, 1), 1.5);

      gsap.timeline()
        .to('#hero .hero__content', { scale: 0.92, opacity: 0.6, duration: 0.8, ease: 'power2.inOut' }, 0)
        .to('#heroLanterns .lantern', { y: -60, scale: 1.08, stagger: 0.02, duration: 1.2, ease: 'power2.out' }, 0)
        .to('.hero__mist', { scale: 1.16, opacity: 1, duration: 1.2, ease: 'power2.inOut' }, 0)
        .to('.hero__sky-gradient', { filter: 'brightness(1.1) saturate(1.08)', duration: 1.15, ease: 'power2.inOut' }, 0);

      if (lenis) {
        lenis.scrollTo(tower, {
          offset: 0,
          duration: 2.2,
          easing: (t) => 1 - Math.pow(1 - t, 3)
        });
      } else {
        tower.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  // ---------------------------------------------------------
  // SECRET INTERACTIONS
  // ---------------------------------------------------------
  const initSecretInteractions = () => {
    $$('.hidden-star').forEach((star) => {
      gsap.to(star, {
        scale: rand(0.8, 1.4),
        duration: rand(1.8, 2.8),
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMemoryModal();
        closeLetterOverlay();
      }
    });
  };

  // ---------------------------------------------------------
  // ACCESSIBILITY / FALLBACKS
  // ---------------------------------------------------------
  const initFallbacks = () => {
    const imgs = $$('img');
    imgs.forEach((img) => {
      img.addEventListener('error', () => {
        if (!img.src.startsWith('data:image/svg+xml')) {
          img.src = placeholderImage(img.alt || 'Photo');
        }
      });
    });
  };

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------
  const init = () => {
    setTextContentFromConfig();
    buildLoaderAtmosphere();
    initLoader();
    initLenis();
    initCursor();
    initParticleCanvas();
    buildAtmosphere();
    initMemoryCards();
    initMemoryModal();
    initLetterOverlay();
    initMusic();
    initAnimations();
    initCameraTransitionButton();
    initSecretInteractions();
    initFallbacks();
  };

  init();
})();
// ===== EXTRA CUSTOMIZATION HELPER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.memory-card').forEach((card, i) => {
      const tag = document.createElement('div');
      tag.style.position = 'absolute';
      tag.style.top = '-12px';
      tag.style.right = '-8px';
      tag.style.padding = '6px 10px';
      tag.style.borderRadius = '999px';
      tag.style.fontSize = '10px';
      tag.style.letterSpacing = '1px';
      tag.style.background = 'rgba(255,210,120,.9)';
      tag.style.color = '#1a1026';
      tag.style.fontWeight = '700';
      tag.style.boxShadow = '0 8px 20px rgba(0,0,0,.35)';
      tag.innerHTML = 'PHOTO ' + (i + 1);
      card.appendChild(tag);
    });
  }, 2500);
});
