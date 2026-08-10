"use strict";
/* =========================================================
   CODEUTSAVA 10.0 — SPACE MISSION
   Main JavaScript — Complete Rewrite
   ========================================================= */

/* =========================================================
   1. GLOBAL STARFIELD CANVAS
   ========================================================= */
(function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, stars = [], shoots = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeStar() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * 0.7 + 0.3,
      aDir: Math.random() > 0.5 ? 1 : -1,
      aSpeed: Math.random() * 0.004 + 0.002,
      clr: Math.random() > 0.85
        ? `hsl(${Math.random() > 0.5 ? 200 : 270},100%,90%)`
        : "#ffffff"
    };
  }

  function makeShoot() {
    const ang = Math.PI / 6 + (Math.random() * Math.PI) / 5;
    return {
      x: Math.random() * W, y: Math.random() * H * 0.5,
      len: 80 + Math.random() * 120, speed: 8 + Math.random() * 10,
      dx: Math.cos(ang), dy: Math.sin(ang),
      life: 0, maxLife: 40 + Math.random() * 30
    };
  }

  resize();
  stars = Array.from({ length: 260 }, makeStar);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a += s.aSpeed * s.aDir;
      if (s.a >= 1 || s.a <= 0.2) s.aDir *= -1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.clr; ctx.globalAlpha = s.a; ctx.fill();
    });

    shoots = shoots.filter(sh => sh.life < sh.maxLife);
    shoots.forEach(sh => {
      sh.life++; sh.x += sh.dx * sh.speed; sh.y += sh.dy * sh.speed;
      const fade = 1 - sh.life / sh.maxLife;
      const g = ctx.createLinearGradient(sh.x - sh.dx * sh.len, sh.y - sh.dy * sh.len, sh.x, sh.y);
      g.addColorStop(0, "rgba(0,212,255,0)");
      g.addColorStop(0.6, `rgba(0,212,255,${0.6 * fade})`);
      g.addColorStop(1, `rgba(255,255,255,${fade})`);
      ctx.beginPath();
      ctx.moveTo(sh.x - sh.dx * sh.len, sh.y - sh.dy * sh.len);
      ctx.lineTo(sh.x, sh.y);
      ctx.strokeStyle = g; ctx.lineWidth = 2 * fade; ctx.globalAlpha = 1; ctx.stroke();
    });

    if (Math.random() < 0.004) shoots.push(makeShoot());
    requestAnimationFrame(draw);
  }

  draw();
  window.addEventListener("resize", () => { resize(); stars = Array.from({ length: 260 }, makeStar); });
})();


/* =========================================================
   2. ENTER SCREEN — Canvas nebula + Enter button logic
   ========================================================= */
(function initEnterScreen() {
  const enterCanvas = document.getElementById("enter-canvas");
  if (!enterCanvas) return;
  const ctx = enterCanvas.getContext("2d");

  // Size the canvas
  function sizeCanvas() {
    enterCanvas.width  = window.innerWidth;
    enterCanvas.height = window.innerHeight;
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  // Nebula particles
  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * enterCanvas.width,
    y: Math.random() * enterCanvas.height,
    r: Math.random() * 1.5 + 0.3,
    speed: Math.random() * 0.25 + 0.05,
    clr: Math.random() > 0.5
      ? `rgba(0,212,255,${Math.random() * 0.4 + 0.15})`
      : `rgba(123,92,255,${Math.random() * 0.4 + 0.15})`
  }));

  function drawEnterCanvas() {
    ctx.clearRect(0, 0, enterCanvas.width, enterCanvas.height);
    const cx = enterCanvas.width / 2;
    const cy = enterCanvas.height / 2;

    // Nebula glows
    [[0, 212, 255, 0.045], [123, 92, 255, 0.035], [255, 107, 53, 0.02]].forEach(([r, g, b, a], i) => {
      const ox = (i - 1) * 250, oy = (i % 2 === 0 ? 1 : -1) * 80;
      const grad = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, 550);
      grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, enterCanvas.width, enterCanvas.height);
    });

    // Particles drift upward
    particles.forEach(p => {
      p.y -= p.speed;
      if (p.y < 0) { p.y = enterCanvas.height; p.x = Math.random() * enterCanvas.width; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.clr; ctx.globalAlpha = 1; ctx.fill();
    });

    requestAnimationFrame(drawEnterCanvas);
  }
  drawEnterCanvas();


  /* ---- Enter Button click ---- */
  const enterBtn     = document.getElementById("enter-btn");
  const enterScreen  = document.getElementById("enter-screen");
  const enterOverlay = document.getElementById("enter-overlay");
  const mainSite     = document.getElementById("main-site");
  const rocketEls    = document.querySelectorAll(".e-rocket");
  const orbits       = document.querySelectorAll(".sat-orbit");

  if (!enterBtn) return;

  enterBtn.addEventListener("click", () => {
    enterBtn.disabled = true;

    // 1. Satellites spin fast
    orbits.forEach(o => {
      o.style.animationDuration = "2s";
    });

    // 2. Rockets launch
    rocketEls.forEach(r => {
      r.style.transition = "transform 1.4s cubic-bezier(0.2,0,0.6,1), opacity 0.8s ease";
      r.style.transform  = "translateY(-120vh) rotate(0deg)";
      r.style.opacity    = "0";
    });

    // 3. Flash & fade
    setTimeout(() => {
      enterOverlay.classList.add("active");
    }, 900);

    // 4. Show main site, hide enter screen
    setTimeout(() => {
      enterScreen.classList.add("hidden");
      mainSite.classList.remove("hidden");
      document.body.classList.add("no-scroll");
      startIntroSequence();
    }, 1700);
  });
})();


/* =========================================================
   3. INTRO SCREEN SEQUENCE
   ========================================================= */
function startIntroSequence() {
  const introCanvas = document.getElementById("intro-canvas");
  if (introCanvas) {
    const ctx = introCanvas.getContext("2d");
    introCanvas.width  = window.innerWidth;
    introCanvas.height = window.innerHeight;

    const cx = introCanvas.width / 2, cy = introCanvas.height / 2;
    [[0,212,255,0.04],[123,92,255,0.03]].forEach(([r,g,b,a], i) => {
      const ox = (i - 0.5) * 280;
      const grad = ctx.createRadialGradient(cx+ox, cy, 0, cx+ox, cy, 500);
      grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, introCanvas.width, introCanvas.height);
    });
  }

  const ilw  = document.getElementById("ilw");
  const itw  = document.getElementById("itw");
  const itag = document.getElementById("itag");
  const lseq = document.getElementById("launch-sequence");
  const sbar = document.getElementById("seq-bar");
  const ssts = document.getElementById("seq-status");
  const rwrap= document.getElementById("rocket-wrap");
  const flame= document.getElementById("rocket-flame");
  const iovl = document.getElementById("intro-overlay");

  const msgs = ["SYSTEMS CHECK...","FUEL SYSTEMS: OK","NAVIGATION: READY","CREW: STANDING BY","LAUNCH PROTOCOL: ARMED","T-MINUS ZERO..."];

  setTimeout(() => ilw  && ilw.classList.add("vis"),  200);
  setTimeout(() => itw  && itw.classList.add("vis"),  500);
  setTimeout(() => itag && itag.classList.add("vis"),  800);
  setTimeout(() => {
    lseq && lseq.classList.add("vis");
    animateBar();
  }, 1100);

  function animateBar() {
    let start = null, dur = 3200, idx = 0;
    function step(ts) {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / dur, 1);
      if (sbar) sbar.style.width = prog * 100 + "%";
      const newIdx = Math.floor(prog * msgs.length);
      if (newIdx !== idx && newIdx < msgs.length) {
        idx = newIdx;
        if (ssts) ssts.textContent = msgs[idx];
      }
      if (prog < 1) requestAnimationFrame(step);
      else {
        if (ssts) ssts.textContent = "LAUNCH INITIATED 🚀";
        setTimeout(launchRocket, 400);
      }
    }
    requestAnimationFrame(step);
  }

  function launchRocket() {
    if (rwrap) rwrap.style.bottom = "60px";
    if (flame) flame.classList.add("active");
    setTimeout(() => rwrap && rwrap.classList.add("launched"), 600);
    setTimeout(() => iovl && iovl.classList.add("active"), 1200);
    setTimeout(() => {
      const introScreen = document.getElementById("intro-screen");
      if (introScreen) introScreen.classList.add("hidden");
      document.body.classList.remove("no-scroll");
      triggerHeroAnimations();
    }, 2000);
  }
}


/* =========================================================
   4. HERO ANIMATIONS
   ========================================================= */
function triggerHeroAnimations() {
  const items = [
    { sel: ".hero-mission-tag",    delay: 100 },
    { sel: "#hero-line1",          delay: 200 },
    { sel: "#hero-line2",          delay: 360 },
    { sel: "#hero-line3",          delay: 520 },
    { sel: ".hero-event-name",     delay: 660 },
    { sel: ".hero-subtitle",       delay: 760 },
    { sel: ".countdown-container", delay: 860 },
    { sel: ".hero-actions",        delay: 960 },
    { sel: ".hero-stats",          delay: 1100 },
  ];
  items.forEach(({ sel, delay }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    setTimeout(() => el.classList.add("animated"), delay);
  });
}


/* =========================================================
   5. NAVBAR
   ========================================================= */
(function initNavbar() {
  const navbar    = document.getElementById("navbar");
  const hamburger = document.getElementById("nav-hamburger");
  const navLinks  = document.getElementById("nav-links");
  const links     = document.querySelectorAll(".nav-link");
  const sections  = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", () => {
    navbar && (window.scrollY > 60
      ? navbar.classList.add("scrolled")
      : navbar.classList.remove("scrolled"));
  }, { passive: true });

  hamburger && hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks && navLinks.classList.toggle("open");
  });

  links.forEach(l => l.addEventListener("click", () => {
    hamburger && hamburger.classList.remove("open");
    navLinks  && navLinks.classList.remove("open");
  }));

  window.addEventListener("scroll", () => {
    const y = window.scrollY + 120;
    sections.forEach(sec => {
      if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
        links.forEach(l => {
          l.classList.toggle("active", l.dataset.section === sec.id);
        });
      }
    });
  }, { passive: true });
})();


/* =========================================================
   6. COUNTDOWN TIMER
   ========================================================= */
(function initCountdown() {
  const target = new Date("2026-11-06T08:00:00").getTime();
  const els = {
    d: document.getElementById("cd-days"),
    h: document.getElementById("cd-hours"),
    m: document.getElementById("cd-mins"),
    s: document.getElementById("cd-secs"),
  };
  const pad = n => String(n).padStart(2, "0");

  function flip(el, val) {
    if (!el || el.textContent === val) return;
    el.style.transform = "translateY(-6px)"; el.style.opacity = "0.4";
    setTimeout(() => {
      el.textContent = val;
      el.style.transition = "all 0.25s ease";
      el.style.transform = ""; el.style.opacity = "";
    }, 120);
    setTimeout(() => { el.style.transition = ""; }, 350);
  }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { Object.values(els).forEach(e => e && (e.textContent = "00")); return; }
    flip(els.d, pad(Math.floor(diff / 86400000)));
    flip(els.h, pad(Math.floor((diff % 86400000) / 3600000)));
    flip(els.m, pad(Math.floor((diff % 3600000) / 60000)));
    flip(els.s, pad(Math.floor((diff % 60000) / 1000)));
  }
  tick(); setInterval(tick, 1000);
})();


/* =========================================================
   7. SCROLL ANIMATIONS — IntersectionObserver
   ========================================================= */
(function initScrollAnim() {
  // About cards, guideline cards, faq items
  const items = document.querySelectorAll(".about-card, .guideline-card, .faq-item");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || "0");
        setTimeout(() => e.target.classList.add("animated"), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  items.forEach(i => obs.observe(i));

  // Timeline rows
  const rows = document.querySelectorAll(".tl-row");
  const rowObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        rowObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  rows.forEach(r => rowObs.observe(r));
})();


/* =========================================================
   8. FAQ ACCORDION
   ========================================================= */
(function initFAQ() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach(item => {
    const btn = item.querySelector(".faq-question");
    btn && btn.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      items.forEach(i => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
})();


/* =========================================================
   9. GUIDELINE CARD MOUSE PARALLAX
   ========================================================= */
(function initCardParallax() {
  document.querySelectorAll(".guideline-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      card.style.setProperty("--my", ((e.clientY - r.top)  / r.height * 100) + "%");
    });
  });
})();


/* =========================================================
   10. SMOOTH SCROLL
   ========================================================= */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const hash = a.getAttribute("href");
      if (!hash || hash === "#") return;
      try {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
        }
      } catch (_) { /* invalid selector — ignore */ }
    });
  });
})();


/* =========================================================
   11. HERO PLANET PARALLAX
   ========================================================= */
(function initPlanetParallax() {
  const planet = document.querySelector(".hero-planet-wrap");
  if (!planet) return;
  window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.08;
    planet.style.transform = `translateY(calc(-50% + ${offset}px))`;
  }, { passive: true });
})();


/* =========================================================
   12. HERO TEXT SCRAMBLE (Fixed — no multiple intervals)
   ========================================================= */
(function initScramble() {
  const wrap = document.querySelector(".hero-event-name");
  if (!wrap) return;
  const code = wrap.querySelector(".event-code");
  if (!code) return;
  const original = code.textContent;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let timer = null;

  wrap.addEventListener("mouseenter", () => {
    if (timer) { clearInterval(timer); timer = null; }
    let iter = 0;
    timer = setInterval(() => {
      code.textContent = original.split("").map((c, i) =>
        i < iter ? original[i] : chars[Math.floor(Math.random() * chars.length)]
      ).join("");
      iter += 0.5;
      if (iter >= original.length) {
        clearInterval(timer); timer = null; code.textContent = original;
      }
    }, 40);
  });

  wrap.addEventListener("mouseleave", () => {
    if (timer) { clearInterval(timer); timer = null; }
    code.textContent = original;
  });
})();


/* =========================================================
   13. CURSOR GLOW
   ========================================================= */
(function initCursorGlow() {
  if (window.matchMedia("(pointer:coarse)").matches) return;
  const g = document.createElement("div");
  Object.assign(g.style, {
    position:"fixed", width:"300px", height:"300px", borderRadius:"50%",
    background:"radial-gradient(circle,rgba(0,212,255,0.04) 0%,transparent 70%)",
    pointerEvents:"none", zIndex:"9997", transform:"translate(-50%,-50%)",
    transition:"opacity 0.3s ease", opacity:"0"
  });
  document.body.appendChild(g);
  let mx=-500, my=-500, gx=-500, gy=-500;
  window.addEventListener("mousemove", e => { mx=e.clientX; my=e.clientY; g.style.opacity="1"; });
  window.addEventListener("mouseleave", () => g.style.opacity="0");
  (function loop() {
    gx += (mx-gx)*0.08; gy += (my-gy)*0.08;
    g.style.left=gx+"px"; g.style.top=gy+"px";
    requestAnimationFrame(loop);
  })();
})();


/* =========================================================
   14. STATS COUNTER
   ========================================================= */
(function initStats() {
  const map = {"24+":24,"500+":500,"₹1L+":1,"10+":10};
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, fin = el.textContent, dur = 1400, t0 = performance.now();
      (function count(ts) {
        const p = Math.min((ts-t0)/dur, 1), ea = 1-Math.pow(1-p,3);
        if (fin==="24+")     el.textContent = Math.floor(ea*24)+"+";
        else if(fin==="500+")el.textContent = Math.floor(ea*500)+"+";
        else if(fin==="₹1L+")el.textContent = "₹"+Math.floor(ea*1)+"L+";
        else if(fin==="10+") el.textContent = Math.floor(ea*10)+"+";
        if (p<1) requestAnimationFrame(count);
        else el.textContent = fin;
      })(performance.now());
      obs.unobserve(el);
    });
  }, { threshold:0.5 });
  document.querySelectorAll(".stat-num").forEach(el => obs.observe(el));
})();


/* =========================================================
   15. TIMELINE ROCKET SCROLL TRACKER
   ========================================================= */
(function initTimelineRocket() {
  const rocketEl  = document.getElementById("timeline-rocket");
  const wrapEl    = document.getElementById("timeline-wrap");
  const progress  = document.getElementById("tl-line-progress");
  const nodes     = Array.from(document.querySelectorAll(".tl-node-inner"));
  if (!rocketEl || !wrapEl) return;

  let isVisible = false;
  let ticking   = false;

  const visObs = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    rocketEl.style.opacity = isVisible ? "1" : "0";
  }, { threshold: 0.05 });
  visObs.observe(wrapEl);

  function update() {
    if (!isVisible) return;
    const wr = wrapEl.getBoundingClientRect();
    const viewH = window.innerHeight;
    // progress 0→1 as center of screen sweeps through the wrap
    const prog = Math.max(0, Math.min(1, (-wr.top + viewH * 0.42) / (wr.height)));
    const targetY = prog * wr.height;

    // Move rocket
    rocketEl.style.top = targetY + "px";

    // Animate line fill
    if (progress) progress.style.height = (prog * 100) + "%";

    // Highlight nearest node
    nodes.forEach(node => {
      const nr = node.getBoundingClientRect();
      const nodeY = nr.top - wr.top + nr.height / 2;
      const dist  = Math.abs(targetY - nodeY);
      if (dist < 55) {
        node.classList.add("node-active");
      } else {
        node.classList.remove("node-active");
      }
    });
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  // Initial position
  update();
})();


/* =========================================================
   16. GSAP ENHANCEMENTS
   ========================================================= */
(function initGSAP() {
  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".section-title").forEach(el => {
    if (typeof ScrollTrigger === "undefined") return;
    gsap.fromTo(el, { opacity:0, y:40 }, {
      opacity:1, y:0, duration:1, ease:"power3.out",
      scrollTrigger:{ trigger:el, start:"top 88%", once:true }
    });
  });

  gsap.utils.toArray(".section-tag").forEach(el => {
    if (typeof ScrollTrigger === "undefined") return;
    gsap.fromTo(el, { opacity:0, x:-30 }, {
      opacity:1, x:0, duration:0.7, ease:"power2.out",
      scrollTrigger:{ trigger:el, start:"top 92%", once:true }
    });
  });

  const panel = document.querySelector(".about-mission-panel");
  if (panel && typeof ScrollTrigger !== "undefined") {
    gsap.fromTo(panel, { opacity:0, y:50 }, {
      opacity:1, y:0, duration:1, ease:"power3.out",
      scrollTrigger:{ trigger:panel, start:"top 82%", once:true }
    });
  }

  const regContent = document.querySelector(".register-content");
  if (regContent && typeof ScrollTrigger !== "undefined") {
    gsap.fromTo(regContent, { opacity:0, scale:0.94 }, {
      opacity:1, scale:1, duration:1, ease:"back.out(1.2)",
      scrollTrigger:{ trigger:regContent, start:"top 82%", once:true }
    });
  }
})();
