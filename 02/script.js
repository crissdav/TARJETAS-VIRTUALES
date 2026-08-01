/* =========================================================
   XV AÑOS · "A LAS DOCE CAMPANADAS" — script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1) CONFIGURACIÓN — EDITA ESTOS VALORES
     --------------------------------------------------------- */

  // Fecha y hora del evento en HORA DE PERÚ (UTC-5, sin horario de verano)
  // 19:00 Lima = 00:00 UTC del día siguiente
  const EVENT_DATE = new Date(Date.UTC(2026, 7, 21, 24, 0, 0));

  // Número de WhatsApp que recibirá las confirmaciones (con código de país, sin + ni espacios)
  const WHATSAPP_NUMBER = '51917845115';

  // Nombre de la quinceañera (para el mensaje de WhatsApp)
  const QUINCEANERA_NAME = 'Vianca Gabriela';


  /* ---------------------------------------------------------
     2) POLVO MÁGICO — partículas flotantes
     --------------------------------------------------------- */
  const dustContainer = document.getElementById('magicDust');
  const DUST_COLORS = ['#E6C36B', '#A9D0EF', '#7CB6E4', '#F3E0A7'];
  const DUST_COUNT = window.innerWidth < 600 ? 16 : 28;

  for (let i = 0; i < DUST_COUNT; i++) {
    const dust = document.createElement('div');
    dust.className = 'dust';
    const size = 2 + Math.random() * 3;
    dust.style.width = `${size}px`;
    dust.style.height = `${size}px`;
    dust.style.left = `${Math.random() * 100}vw`;
    dust.style.background = DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)];
    dust.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
    dust.style.animationDuration = `${10 + Math.random() * 12}s`;
    dust.style.animationDelay = `${Math.random() * 14}s`;
    dust.style.boxShadow = `0 0 6px currentColor`;
    dustContainer.appendChild(dust);
  }

  /* ---------------------------------------------------------
     2.1) LLUVIA DE PALABRAS — palabras mágicas cayendo
     --------------------------------------------------------- */
  const wordContainer = document.getElementById('wordRain');
  if (wordContainer) {
    const WORDS = ['Sueña','Magia','Baila','Cree','Brilla','Amor','Sueño','Felicidad','Esperanza','Elegancia','Cuento','Ilusión','Estrella','Eternidad','Princesa','Carroza'];
    const WORD_COLORS = ['#E6C36B', '#A9D0EF', '#F3E0A7', '#BFD4EC', '#7CB6E4'];
    const WORD_COUNT = window.innerWidth < 600 ? 10 : 16;

    for (let i = 0; i < WORD_COUNT; i++) {
      const word = document.createElement('span');
      word.className = 'word';
      word.textContent = WORDS[Math.floor(Math.random() * WORDS.length)];
      const size = 12 + Math.random() * 14;
      word.style.fontSize = `${size}px`;
      word.style.left = `${Math.random() * 100}%`;
      word.style.color = WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)];
      word.style.setProperty('--wdrift', `${(Math.random() - 0.5) * 90}px`);
      word.style.animationDuration = `${16 + Math.random() * 14}s`;
      word.style.animationDelay = `${Math.random() * 20}s`;
      word.style.opacity = '.11';
      wordContainer.appendChild(word);
    }
  }


  /* ---------------------------------------------------------
     2.2) ESTRELLAS TITILANTES — capa fija
     --------------------------------------------------------- */
  const twinkleLayer = document.getElementById('twinkleLayer');
  if (twinkleLayer) {
    const T_COLORS = ['#F3E0A7', '#E6C36B', '#FFFFFF', '#A9D0EF'];
    const T_COUNT = window.innerWidth < 600 ? 18 : 32;
    for (let i = 0; i < T_COUNT; i++) {
      const s = document.createElement('span');
      s.className = 'twinkle-star';
      const size = 2 + Math.random() * 3;
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.color = T_COLORS[Math.floor(Math.random() * T_COLORS.length)];
      s.style.background = s.style.color;
      s.style.animationDuration = `${2 + Math.random() * 4}s`;
      s.style.animationDelay = `${Math.random() * 5}s`;
      twinkleLayer.appendChild(s);
    }
  }

  /* ---------------------------------------------------------
     2.3) ORNAMENTOS DORADOS — figuras flotando
     --------------------------------------------------------- */
  const ornLayer = document.getElementById('ornLayer');
  if (ornLayer) {
    const GLYPHS = ['✦', '✧', '❖', '✾', '✶'];
    const O_COUNT = window.innerWidth < 600 ? 8 : 14;
    for (let i = 0; i < O_COUNT; i++) {
      const o = document.createElement('span');
      o.className = 'orn';
      o.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      o.style.left = `${Math.random() * 100}%`;
      o.style.top = `${Math.random() * 100}%`;
      o.style.fontSize = `${12 + Math.random() * 16}px`;
      o.style.color = Math.random() < 0.6 ? '#E6C36B' : '#F3E0A7';
      o.style.setProperty('--orx', `${(Math.random() - 0.5) * 40}px`);
      o.style.animationDuration = `${8 + Math.random() * 10}s`;
      o.style.animationDelay = `${Math.random() * 8}s`;
      ornLayer.appendChild(o);
    }
  }

  /* estrellas del splash */
  const starsContainer = document.getElementById('splashStars');
  if (starsContainer) {
    for (let i = 0; i < 40; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 70}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      starsContainer.appendChild(star);
    }
  }

  /* ---------------------------------------------------------
     3) SPLASH → SOBRE
     --------------------------------------------------------- */
  const splash = document.getElementById('splash');
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const btnOpenSplash = document.getElementById('btnOpenSplash');
  const envelope = document.getElementById('envelope');

  btnOpenSplash.addEventListener('click', () => {
    triggerSmoke();
    splash.classList.add('is-hidden');
    envelopeWrapper.classList.add('is-active');
    dustContainer.classList.add('is-active');
  });

  function triggerSmoke() {
    const overlay = document.getElementById('smokeOverlay');
    if (!overlay) return;
    overlay.innerHTML = '';

    // Humo de colores (blanco, celeste, azul) que surge de distintos lados
    const isMobile = window.innerWidth < 600;
    const smokeCount = isMobile ? 16 : 36;
    const SMOKE_COLORS = [
      ['rgba(255,255,255,0.95)', 'rgba(200,220,240,0.7)'],
      ['rgba(214,229,245,0.95)', 'rgba(191,212,236,0.7)'],
      ['rgba(169,208,239,0.92)', 'rgba(124,182,228,0.65)'],
      ['rgba(43,78,168,0.88)', 'rgba(21,44,102,0.6)']
    ];
    const SIDES = ['bottom', 'left', 'right', 'top'];
    for (let i = 0; i < smokeCount; i++) {
      const p = document.createElement('div');
      p.className = 'smoke-particle';
      const size = isMobile ? 50 + Math.random() * 80 : 70 + Math.random() * 140;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      const side = SIDES[Math.floor(Math.random() * SIDES.length)];
      const colors = SMOKE_COLORS[Math.floor(Math.random() * SMOKE_COLORS.length)];
      p.style.setProperty('--smoke-a', colors[0]);
      p.style.setProperty('--smoke-b', colors[1]);
      p.style.setProperty('--sc', `${3 + Math.random() * 3}`);
      if (side === 'bottom') {
        p.style.bottom = '0';
        p.style.left = `${(i / smokeCount) * 100 + Math.random() * 8 - 4}%`;
        p.style.setProperty('--ty', `-${90 + Math.random() * 60}vh`);
        p.style.setProperty('--tx', `${(Math.random() - 0.5) * 60}px`);
      } else if (side === 'left') {
        p.style.left = '0';
        p.style.top = `${(i / smokeCount) * 100 + Math.random() * 8 - 4}%`;
        p.style.setProperty('--tx', `${80 + Math.random() * 60}vw`);
        p.style.setProperty('--ty', `${(Math.random() - 0.5) * 80}px`);
      } else if (side === 'right') {
        p.style.right = '0';
        p.style.top = `${(i / smokeCount) * 100 + Math.random() * 8 - 4}%`;
        p.style.setProperty('--tx', `-${80 + Math.random() * 60}vw`);
        p.style.setProperty('--ty', `${(Math.random() - 0.5) * 80}px`);
      } else {
        p.style.top = '0';
        p.style.left = `${(i / smokeCount) * 100 + Math.random() * 8 - 4}%`;
        p.style.setProperty('--ty', `${90 + Math.random() * 60}vh`);
        p.style.setProperty('--tx', `${(Math.random() - 0.5) * 60}px`);
      }
      p.style.animationDelay = `${Math.random() * 0.6}s`;
      p.style.animationDuration = `${2.8 + Math.random() * 1.8}s`;
      overlay.appendChild(p);
    }

    // Brillo (partículas doradas/plateadas que explotan con el humo)
    const sparkleCount = isMobile ? 16 : 40;
    for (let i = 0; i < sparkleCount; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      const size = 4 + Math.random() * 8;
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.setProperty('--sx', `${(Math.random() - 0.5) * 120}px`);
      s.style.setProperty('--sy', `${-(40 + Math.random() * 120)}px`);
      s.style.animationDelay = `${Math.random() * 0.8}s`;
      s.style.animationDuration = `${0.8 + Math.random() * 1}s`;
      overlay.appendChild(s);
    }

    overlay.classList.add('is-active');
    setTimeout(() => overlay.classList.remove('is-active'), 4500);
  }

  envelope.addEventListener('click', () => {
    if (envelope.classList.contains('is-open')) return;
    envelope.classList.add('is-open');

    setTimeout(() => {
      envelopeWrapper.classList.add('is-hidden');
      document.body.style.overflow = 'auto';
      document.getElementById('hero').scrollIntoView({ behavior: 'instant' in window ? 'instant' : 'auto' });
    }, 1300);
  });

  // Evita el scroll de fondo mientras se muestra el splash/sobre
  document.body.style.overflow = 'hidden';

  /* ---------------------------------------------------------
     4) COUNTDOWN + MANECILLAS DEL RELOJ MÁGICO
     --------------------------------------------------------- */
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMins = document.getElementById('cdMins');
  const cdSecs = document.getElementById('cdSecs');
  const countdownNote = document.querySelector('.countdown-note');
  const hourHand = document.getElementById('watchHourHand');
  const minHand = document.getElementById('watchMinHand');

  function pad(n) { return String(n).padStart(2, '0'); }

  function peruTime() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    const get = (t) => parseInt(parts.find((p) => p.type === t).value, 10);
    let h = get('hour');
    if (h === 24) h = 0;
    return { h, m: get('minute'), s: get('second') };
  }

  function tick(el) {
    el.parentElement.classList.add('tick');
    setTimeout(() => el.parentElement.classList.remove('tick'), 300);
  }

  let lastSecs = null;

  function updateCountdown() {
    const now = new Date();
    const diff = EVENT_DATE - now;

    if (diff <= 0) {
      cdDays.textContent = '00';
      cdHours.textContent = '00';
      cdMins.textContent = '00';
      cdSecs.textContent = '00';
      if (countdownNote) countdownNote.textContent = '¡La medianoche ha llegado — feliz celebración! ✨';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    cdDays.textContent = pad(days);
    cdHours.textContent = pad(hours);
    cdMins.textContent = pad(mins);
    if (secs !== lastSecs) {
      cdSecs.textContent = pad(secs);
      tick(cdSecs);
      lastSecs = secs;
    }

    // Manecillas del reloj: muestran la hora actual de Perú (America/Lima, UTC-5)
    const t = peruTime();
    const minAngle = t.m * 6 + t.s / 10;
    const hourAngle = (t.h % 12) * 30 + t.m / 2;
    if (minHand) minHand.setAttribute('transform', `rotate(${minAngle} 100 100)`);
    if (hourHand) hourHand.setAttribute('transform', `rotate(${hourAngle} 100 100)`);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------------------------------------------------------
     5) SCROLL REVEAL
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));

  /* ---------------------------------------------------------
     6) RSVP → WHATSAPP
     --------------------------------------------------------- */
  const btnWhatsapp = document.getElementById('btnWhatsapp');
  const toast = document.getElementById('toast');

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  btnWhatsapp.addEventListener('click', () => {
    const name = document.getElementById('guestName').value.trim();
    const companion = document.getElementById('guestCompanion').value.trim();

    if (!name) {
      showToast('Por favor escribe tu nombre para confirmar 👠');
      document.getElementById('guestName').focus();
      return;
    }

    let message = `¡Hola! Confirmo mi asistencia a los XV años de ${QUINCEANERA_NAME}.\nNombre: ${name}`;
    if (companion) message += `\nAcompañante: ${companion}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });

  /* ---------------------------------------------------------
     7) MÚSICA DE FONDO
     --------------------------------------------------------- */
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        musicToggle.classList.add('is-playing');
        musicToggle.setAttribute('aria-label', 'Pausar música');
      }).catch(() => {
        showToast('Agrega el archivo de audio en la carpeta para activar la música 🎵');
      });
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('is-playing');
      musicToggle.setAttribute('aria-label', 'Reproducir música');
    }
  });

  /* ---------------------------------------------------------
     8) PALETA DE COLORES RESERVADOS — clic para saber el nombre
     --------------------------------------------------------- */
  const swatches = document.querySelectorAll('.dc-swatch');
  const paletteLabel = document.getElementById('dcPaletteLabel');
  const defaultPaletteLabel = 'Estos tonos están reservados para la XV';
  if (swatches.length && paletteLabel) {
    swatches.forEach((sw) => {
      sw.addEventListener('click', (e) => {
        e.stopPropagation();
        swatches.forEach((s) => s.classList.remove('is-selected'));
        sw.classList.add('is-selected');
        paletteLabel.textContent = `Color reservado: ${sw.dataset.color}`;
      });
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dc-swatch-item')) {
        swatches.forEach((s) => s.classList.remove('is-selected'));
        paletteLabel.textContent = defaultPaletteLabel;
      }
    });
  }

  /* ---------------------------------------------------------
     LETRAS ANIMADAS — divide cada texto en letras que flotan
     --------------------------------------------------------- */
  document.querySelectorAll('[data-letters]').forEach((el) => {
    if (el.dataset.lettersDone === '1') return;
    el.dataset.lettersDone = '1';
    const text = el.textContent;
    el.textContent = '';
    const frag = document.createDocumentFragment();
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'ltr';
      span.style.setProperty('--i', i);
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      frag.appendChild(span);
    });
    el.appendChild(frag);
  });

});
