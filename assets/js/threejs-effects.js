"use strict";
/* =========================================================
   CODEUTSAVA 10.0 — THREE.JS EFFECTS
   1. Spiral Galaxy Background
   2. 3D Hero Planet
   3. Cursor Trail
   4. Lenis Smooth Scroll
   ========================================================= */

/* =========================================================
   1. SPIRAL GALAXY BACKGROUND
   ========================================================= */
(function initGalaxy() {
  const canvas = document.getElementById("galaxy-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 3, 6);
  camera.lookAt(0, 0, 0);

  /* ---- Galaxy geometry ---- */
  const COUNT  = 80000;
  const RADIUS = 6;
  const BRANCHES = 3;
  const SPIN = 1.2;
  const RANDOMNESS = 0.22;
  const POWER = 3.2;
  const colorInner = new THREE.Color("#ff6b35");
  const colorOuter = new THREE.Color("#1b4fd8");

  const positions  = new Float32Array(COUNT * 3);
  const colors     = new Float32Array(COUNT * 3);
  const sizes      = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const i3     = i * 3;
    const r      = Math.random() * RADIUS;
    const spin   = r * SPIN;
    const branch = (i % BRANCHES) / BRANCHES * Math.PI * 2;

    const rnd = (v) => Math.pow(Math.random(), POWER) * (Math.random() < 0.5 ? 1 : -1) * v * r;

    positions[i3]     = Math.cos(branch + spin) * r + rnd(RANDOMNESS);
    positions[i3 + 1] = rnd(RANDOMNESS) * 0.4;
    positions[i3 + 2] = Math.sin(branch + spin) * r + rnd(RANDOMNESS);

    const mixed = new THREE.Color().lerpColors(colorInner, colorOuter, r / RADIUS);
    colors[i3]     = mixed.r;
    colors[i3 + 1] = mixed.g;
    colors[i3 + 2] = mixed.b;
    sizes[i]       = Math.random() * 2 + 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aSize",    new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent:  true,
    depthWrite:   false,
    blending:     THREE.AdditiveBlending,
    vertexShader: `
      attribute float aSize;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float str = pow(1.0 - d * 2.0, 2.0);
        gl_FragColor = vec4(vColor, str * 0.85);
      }
    `,
  });

  const galaxy = new THREE.Points(geo, mat);
  scene.add(galaxy);

  let mouseX = 0, mouseY = 0;
  document.addEventListener("mousemove", e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    galaxy.rotation.y = t * 0.06;
    camera.position.x += (mouseX * 0.6  - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.4 - camera.position.y + 3) * 0.02;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  })();
})();


/* =========================================================
   2. 3D HERO PLANET
   ========================================================= */
(function initPlanet() {
  const canvas = document.getElementById("planet-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const W = canvas.parentElement.clientWidth  || 440;
  const H = canvas.parentElement.clientHeight || 440;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 0, 4.5);

  /* Planet body with shader */
  const sphereGeo = new THREE.SphereGeometry(1.4, 64, 64);
  const sphereMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:     { value: 0 },
      uColor1:   { value: new THREE.Color("#0d2b4a") },
      uColor2:   { value: new THREE.Color("#051525") },
      uColor3:   { value: new THREE.Color("#00d4ff") },
      uLightDir: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1, uColor2, uColor3, uLightDir;
      varying vec3 vNormal;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){
        vec2 i=floor(p); vec2 f=fract(p);
        float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
        vec2 u=f*f*(3.0-2.0*f);
        return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
      }
      void main(){
        float n = noise(vUv*6.0+uTime*0.05)*0.6 + noise(vUv*12.0-uTime*0.03)*0.4;
        vec3 col = mix(uColor1, uColor2, n);
        float streak = smoothstep(0.45,0.55,noise(vUv*vec2(4.0,20.0)+uTime*0.02));
        col = mix(col, uColor3*0.18, streak*0.6);
        float diff = max(dot(vNormal, uLightDir), 0.0);
        col *= (0.25 + 0.75*diff);
        vec3 refl = reflect(-uLightDir, vNormal);
        float spec = pow(max(dot(refl,vec3(0,0,1)),0.0),32.0);
        col += uColor3 * spec * 0.25;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const planet = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(planet);

  /* Atmosphere glow */
  const atmoMat = new THREE.ShaderMaterial({
    transparent: true, side: THREE.BackSide, depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uGlow: { value: new THREE.Color("#00d4ff") } },
    vertexShader: `
      varying vec3 vNormal;
      void main(){
        vNormal=normalize(normalMatrix*normal);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uGlow; varying vec3 vNormal;
      void main(){
        float f=pow(1.0-abs(dot(vNormal,vec3(0,0,1))),3.0);
        gl_FragColor=vec4(uGlow,f*0.55);
      }
    `,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 32), atmoMat));

  /* Rings */
  [
    { inner:1.75, outer:2.2,  color:"#00d4ff", opacity:0.35 },
    { inner:2.3,  outer:2.65, color:"#7b5cff", opacity:0.20 },
  ].forEach(({ inner, outer, color, opacity }) => {
    const rMesh = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, 96),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color), transparent: true,
        opacity, side: THREE.DoubleSide, depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    rMesh.rotation.x = -Math.PI / 2.5;
    scene.add(rMesh);
  });

  /* Orbiting particles */
  const N   = 120;
  const oGeo = new THREE.BufferGeometry();
  const oPos = new Float32Array(N * 3);
  const angs = Array.from({length:N}, ()=>Math.random()*Math.PI*2);
  const rads = Array.from({length:N}, ()=>2.0+Math.random()*0.8);
  const oys  = Array.from({length:N}, ()=>(Math.random()-0.5)*0.4);
  for (let i=0; i<N; i++) {
    oPos[i*3]   = Math.cos(angs[i])*rads[i];
    oPos[i*3+1] = oys[i];
    oPos[i*3+2] = Math.sin(angs[i])*rads[i];
  }
  oGeo.setAttribute("position", new THREE.BufferAttribute(oPos, 3));
  const orbiting = new THREE.Points(oGeo, new THREE.PointsMaterial({
    color:0x00d4ff, size:0.04, transparent:true,
    opacity:0.8, blending:THREE.AdditiveBlending, depthWrite:false,
  }));
  scene.add(orbiting);

  scene.add(new THREE.AmbientLight(0xffffff, 0.08));
  const sun = new THREE.DirectionalLight(0x66ddff, 1.6);
  sun.position.set(5, 3, 5);
  scene.add(sun);

  let mx=0, my=0;
  document.addEventListener("mousemove", e=>{
    mx=(e.clientX/window.innerWidth-0.5)*2;
    my=(e.clientY/window.innerHeight-0.5)*2;
  });

  window.addEventListener("resize", ()=>{
    const pw = canvas.parentElement.clientWidth  || 440;
    const ph = canvas.parentElement.clientHeight || 440;
    renderer.setSize(pw, ph);
    camera.aspect = pw/ph;
    camera.updateProjectionMatrix();
  });

  const clock = new THREE.Clock();
  (function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    planet.rotation.y = t*0.12;
    sphereMat.uniforms.uTime.value = t;
    for (let i=0; i<N; i++){
      angs[i] += 0.0008 + i*0.000005;
      oGeo.attributes.position.array[i*3]   = Math.cos(angs[i])*rads[i];
      oGeo.attributes.position.array[i*3+2] = Math.sin(angs[i])*rads[i];
    }
    oGeo.attributes.position.needsUpdate = true;
    planet.rotation.x += (my*0.05 - planet.rotation.x)*0.04;
    camera.position.x  += (mx*0.2  - camera.position.x)*0.04;
    renderer.render(scene, camera);
  })();
})();


/* =========================================================
   3. CURSOR PARTICLE TRAIL
   ========================================================= */
(function initCursorTrail(){
  const canvas = document.getElementById("cursor-trail");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize(){
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const particles = [];

  document.addEventListener("mousemove", e=>{
    const count = Math.floor(Math.random()*2)+1;
    for (let i=0; i<count; i++){
      const hue = Math.random()>0.6 ? 195 : (Math.random()>0.5 ? 260 : 20);
      particles.push({
        x: e.clientX+(Math.random()-0.5)*6,
        y: e.clientY+(Math.random()-0.5)*6,
        r: Math.random()*3+1,
        vx: (Math.random()-0.5)*1.2,
        vy: (Math.random()-0.5)*1.2-0.4,
        alpha: 0.85,
        hue,
      });
    }
  });

  (function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let i=particles.length-1; i>=0; i--){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.04;
      p.alpha -= 0.028; p.r *= 0.97;
      if (p.alpha<=0 || p.r<0.1){ particles.splice(i,1); continue; }
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2);
      g.addColorStop(0, `hsla(${p.hue},100%,70%,${p.alpha})`);
      g.addColorStop(1, `hsla(${p.hue},100%,70%,0)`);
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = g;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  })();
})();


/* =========================================================
   4. LENIS SMOOTH SCROLL
   ========================================================= */
(function initLenis(){
  if (typeof Lenis === "undefined") return;
  const lenis = new Lenis({
    duration: 1.3,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)),
    smoothWheel: true,
  });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  if (typeof ScrollTrigger !== "undefined"){
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time*1000));
    gsap.ticker.lagSmoothing(0);
  }
})();
