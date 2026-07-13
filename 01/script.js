// ====== CONFIG ======
const CONFIG = {
  whatsappNumber: '51947510682',
  eventName: 'XV Años de Miriam Jireh',
  eventDate: new Date('2026-08-22T19:00:00')
};

// ====== ENVELOPE ======
function openEnvelope() {
  const envelope = document.getElementById('envelope');
  const splash = document.getElementById('splash');
  const wrapper = document.getElementById('envelopeWrapper');
  const photoReveal = document.getElementById('photoReveal');
  envelope.classList.remove('floating');
  envelope.classList.add('opening');
  envelope.style.pointerEvents = 'none';
  wrapper.classList.add('opened');

  for (let i = 0; i < 12; i++) {
    const spark = document.createElement('div');
    spark.style.cssText = `
      position: fixed; top: 50%; left: 50%; width: 4px; height: 4px;
      background: #c9a86c; border-radius: 50%; pointer-events: none; z-index: 99999;
    `;
    const angle = (i / 12) * Math.PI * 2;
    const dist = 60 + Math.random() * 80;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    spark.style.transition = `all ${0.5 + Math.random() * 0.3}s ease-out`;
    spark.style.opacity = '1';
    document.body.appendChild(spark);
    requestAnimationFrame(() => {
      spark.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
      spark.style.opacity = '0';
    });
    setTimeout(() => spark.remove(), 1000);
  }

  // Splash hides, photo reveal appears
  setTimeout(() => {
    splash.classList.add('hidden');
    photoReveal.classList.add('active');
  }, 1000);

  // Photo reveal shows for 2.5s then fades
  setTimeout(() => {
    photoReveal.classList.add('exit');
  }, 3500);

  // Wrapper fades out
  setTimeout(() => {
    wrapper.style.opacity = '0';
    wrapper.style.transition = 'opacity 0.8s ease';
  }, 2000);

  // Everything gone, show hero
  setTimeout(() => {
    wrapper.style.display = 'none';
    photoReveal.style.display = 'none';
    document.body.style.overflow = 'auto';
    triggerHeroAnimations();
  }, 4500);
}

// ====== HERO ANIMATIONS ======
function triggerHeroAnimations() {
  setTimeout(() => {
    ['heroFrame','heroPre','heroTitle','heroSub','heroBadge'].forEach(id => {
      document.getElementById(id).classList.add('animate');
    });
  }, 200);
}

// ====== FLOATING LETTERS ======
function createFloatingLetters() {
  const container = document.getElementById('floatingLetters');
  const words = ['Amor','Belleza','Felicidad','Sueños','Elegancia','Gracia','Familia','Dulzura','Luz','XV'];
  const colors = ['var(--rose)','var(--periwinkle)','var(--lavender)','var(--rose-quartz)','var(--gold-light)'];

  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'float-letter';
    el.textContent = words[Math.floor(Math.random() * words.length)];
    el.style.left = Math.random() * 90 + '%';
    el.style.fontSize = (14 + Math.random() * 22) + 'px';
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (14 + Math.random() * 18) + 's';
    el.style.animationDelay = (Math.random() * 20) + 's';
    container.appendChild(el);
  }
}

// ====== FLOATING HEARTS & STARS ======
function createFloatingHearts() {
  const container = document.getElementById('particles');
  const symbols = ['♥','✦','❋','✿','♡','✧','❀','✽','❋','♡'];
  const colors = ['#f7cac9','#e8b4b8','#d4c5e2','#fce4e6','#c9a84c','#b8a0cc','#e8d48b'];

  for (let i = 0; i < 35; i++) {
    const el = document.createElement('div');
    el.className = 'floating-heart';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = (12 + Math.random() * 24) + 'px';
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (10 + Math.random() * 25) + 's';
    el.style.animationDelay = (Math.random() * 20) + 's';
    container.appendChild(el);
  }
}

// ====== SPARKLES ON IMAGES ======
function createSparklesOnImages() {
  document.querySelectorAll('.hero-frame, .rsvp-photo, .about-photo, .detail-photo, .map-container').forEach(el => {
    el.addEventListener('mouseenter', () => {
      for (let i = 0; i < 10; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-effect';
        sparkle.innerHTML = ['✦','✧','❋','✿'][Math.floor(Math.random() * 4)];
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = (Math.random() * 0.6) + 's';
        sparkle.style.fontSize = (10 + Math.random() * 12) + 'px';
        el.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1200);
      }
    });
  });
}

// ====== PARALLAX SCROLL ======
function setupParallax() {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    document.querySelectorAll('.hero-frame').forEach(el => {
      el.style.transform = `translateY(${scrollY * 0.15}px)`;
    });
    document.querySelectorAll('.section-divider').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.style.transform = `scaleX(${1 + Math.sin(scrollY * 0.005) * 0.1})`;
      }
    });
  });
}

// ====== STAGGERED ITINERARY ANIMATION ======
function setupItineraryStagger() {
  const items = document.querySelectorAll('.itinerary-item');
  items.forEach((item, i) => {
    item.style.transitionDelay = (i * 0.15) + 's';
  });
}

// ====== PETALS ======
function createPetals() {
  const container = document.getElementById('particles');
  const petalColors = ['#f7cac9','#e8b4b8','#d4c5e2','#fce4e6','#ece4f4','#f0c4c8'];
  for (let i = 0; i < 35; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    const size = 10 + Math.random() * 18;
    const color = petalColors[Math.floor(Math.random() * petalColors.length)];
    petal.innerHTML = `<svg viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="5" ry="9" fill="${color}" opacity="0.7"/></svg>`;
    petal.style.width = size + 'px';
    petal.style.height = size * 1.6 + 'px';
    petal.style.left = Math.random() * 100 + '%';
    petal.style.animationDuration = (8 + Math.random() * 18) + 's';
    petal.style.animationDelay = (Math.random() * 18) + 's';
    container.appendChild(petal);
  }
}

// ====== SCROLL REVEAL ======
function setupScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        entry.target.style.opacity = '1';
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el => observer.observe(el));

  // Gallery stagger animation
  const galleryObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -10px 0px' });

  document.querySelectorAll('.gallery-stagger').forEach(el => galleryObserver.observe(el));
}

// ====== COUNTDOWN ======
function updateCountdown() {
  const diff = CONFIG.eventDate - new Date();
  if (diff <= 0) return;
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  document.getElementById('cd-days').textContent = String(d).padStart(2,'0');
  document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
  document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
  document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
}

// ====== SPLASH FLOATING FLOWERS ======
function createSplashFlowers() {
  const container = document.getElementById('splashFlowers');
  if (!container) return;
  const flowers = ['🌸','🌺','🌷','🌻','🌹','💐','🏵️','🪷'];
  const sizes = [20, 24, 28, 32, 36, 40];

  for (let i = 0; i < 25; i++) {
    const el = document.createElement('div');
    el.className = 'splash-flower';
    el.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = sizes[Math.floor(Math.random() * sizes.length)] + 'px';
    el.style.animationDuration = (8 + Math.random() * 12) + 's';
    el.style.animationDelay = (Math.random() * 10) + 's';
    el.style.filter = `drop-shadow(0 2px 8px rgba(0,0,0,0.15))`;
    container.appendChild(el);
  }
}

// ====== WHATSAPP ======
function sendWhatsApp() {
  const name = document.getElementById('guestName').value.trim();
  const companion = document.getElementById('guestCompanion').value.trim();
  if (!name) { showToast('Por favor ingresa tu nombre'); return; }

  let msg = `¡Hola! Soy *${name}* y confirmo mi asistencia a ${CONFIG.eventName}. 🎀`;
  msg += companion
    ? `\nMi acompañante es: *${companion}*.`
    : `\nAsistiré solo(a).`;
  msg += `\n📌 Pase válido para 2 personas.`;

  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  showToast('Abriendo WhatsApp...');
}

// ====== TOAST ======
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ====== MUSIC PLAYER ======
function setupMusicPlayer() {
  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('musicBtn');
  const icon = document.getElementById('musicIcon');
  const bar = document.getElementById('musicBar');

  if (!audio || !btn) return;

  let playing = false;
  let started = false;

  // Load the audio source via JS for better compatibility
  audio.src = 'Indila - Love Story (Lyrics).mp3';
  audio.load();

  function doPlay() {
    audio.play().then(() => {
      icon.textContent = '⏸';
      playing = true;
      started = true;
    }).catch((err) => {
      console.warn('Play failed:', err);
      // Retry once after a short delay
      setTimeout(() => {
        audio.play().then(() => {
          icon.textContent = '⏸';
          playing = true;
          started = true;
        }).catch(() => {
          icon.textContent = '▶';
          showToast('Toca de nuevo para escuchar la música');
        });
      }, 300);
    });
  }

  function doPause() {
    audio.pause();
    icon.textContent = '▶';
    playing = false;
  }

  // Use both click and touchstart for maximum compatibility
  function handleInteract(e) {
    e.preventDefault();
    e.stopPropagation();
    if (playing) {
      doPause();
    } else {
      doPlay();
    }
  }

  btn.addEventListener('click', handleInteract, { passive: false });
  btn.addEventListener('touchstart', handleInteract, { passive: false });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration && isFinite(audio.duration)) {
      bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }
  });

  audio.addEventListener('ended', () => {
    icon.textContent = '▶';
    playing = false;
  });

  audio.addEventListener('error', (e) => {
    console.warn('Audio error:', e);
    icon.textContent = '▶';
    showToast('Error cargando la música');
  });

  audio.addEventListener('loadeddata', () => {
    console.log('Audio loaded successfully');
  });

  audio.addEventListener('canplaythrough', () => {
    console.log('Audio ready to play');
  });
}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.overflow = 'hidden';
  createSplashFlowers();
  createFloatingLetters();
  createPetals();
  createFloatingHearts();
  setupScrollReveal();
  setupParallax();
  setupItineraryStagger();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  setTimeout(createSparklesOnImages, 1500);
  setupMusicPlayer();
  setTimeout(() => {
    const env = document.getElementById('envelope');
    if (env) env.classList.add('floating');
  }, 1600);
});
