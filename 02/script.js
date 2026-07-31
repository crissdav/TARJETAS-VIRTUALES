/* =========================================================
   XV AÑOS · "A LAS DOCE CAMPANADAS" — script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1) CONFIGURACIÓN — EDITA ESTOS VALORES
     --------------------------------------------------------- */

  // Fecha y hora del evento (formato: 'AAAA-MM-DDTHH:MM:SS')
  const EVENT_DATE = new Date('2026-08-21T19:00:00');

  // Número de WhatsApp que recibirá las confirmaciones (con código de país, sin + ni espacios)
  const WHATSAPP_NUMBER = '51917845115';

  // Nombre de la quinceañera (para el mensaje de WhatsApp)
  const QUINCEANERA_NAME = 'Vianca Gabriela';


  /* ---------------------------------------------------------
     2) POLVO MÁGICO — partículas flotantes
     --------------------------------------------------------- */
  const dustContainer = document.getElementById('magicDust');
  const DUST_COLORS = ['#C9D6E8', '#B0D4E8', '#7EC8E3', '#DCE6F0'];
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
    const WORD_COLORS = ['#D2A94F', '#5FB4DC', '#1B3A6B', '#B9CCE4', '#E4CC8F'];
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

    // Humo
    const smokeCount = 28;
    for (let i = 0; i < smokeCount; i++) {
      const p = document.createElement('div');
      p.className = 'smoke-particle';
      const size = 70 + Math.random() * 140;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${(i / smokeCount) * 100 + Math.random() * 8 - 4}%`;
      p.style.animationDelay = `${Math.random() * 0.6}s`;
      p.style.animationDuration = `${2.8 + Math.random() * 1.8}s`;
      overlay.appendChild(p);
    }

    // Brillo (partículas doradas/plateadas que explotan con el humo)
    const sparkleCount = 40;
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

    // Manecillas del reloj: giran suavemente según el tiempo restante (efecto decorativo)
    const minuteAngle = (mins / 60) * 360;
    const hourAngle = (hours / 24) * 360;
    if (minHand) minHand.setAttribute('transform', `rotate(${minuteAngle} 100 100)`);
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

});
