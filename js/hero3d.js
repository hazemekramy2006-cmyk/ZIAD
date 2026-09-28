/* ============================================================
   hero3d.js â€” virtual film studio: cinema camera, lens, reel,
   floating frames, film strip, dust + cursor-driven lighting.
   ============================================================ */
import * as THREE from 'three';

const RED = 0xe5241b;

/* ---------- procedural textures ---------- */
function filmStripTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 160;
  const x = c.getContext('2d');
  x.fillStyle = '#07070a'; x.fillRect(0, 0, c.width, c.height);

  const frames = ['#1b2a4a', '#2a1330', '#101d1a', '#3a2410', '#101018', '#2b1a2e'];
  const fw = (c.width - 40) / 6;
  for (let i = 0; i < 6; i++) {
    const px = 20 + i * fw;
    const g = x.createLinearGradient(px, 34, px + fw, 126);
    g.addColorStop(0, frames[i]);
    g.addColorStop(0.6, '#0a0a10');
    g.addColorStop(1, frames[(i + 2) % 6]);
    x.fillStyle = g;
    x.fillRect(px + 3, 36, fw - 6, 88);
    x.strokeStyle = 'rgba(255,255,255,.16)';
    x.lineWidth = 2;
    x.strokeRect(px + 3, 36, fw - 6, 88);
  }
  x.fillStyle = 'rgba(255,255,255,.82)';
  for (let px = 14; px < c.width; px += 46) {
    const rr = (px2, py, w2, h2) => {
      x.beginPath();
      if (x.roundRect) x.roundRect(px2, py, w2, h2, 4);
      else x.rect(px2, py, w2, h2);
      x.fill();
    };
    rr(px, 8, 24, 16);
    rr(px, c.height - 24, 24, 16);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  t.anisotropy = 4;
  return t;
}

function screenTexture(hue) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 512, 320);
  g.addColorStop(0, hue[0]); g.addColorStop(0.55, hue[1]); g.addColorStop(1, '#07070c');
  x.fillStyle = g; x.fillRect(0, 0, 512, 320);
  x.globalCompositeOperation = 'lighter';
  const rg = x.createRadialGradient(340, 110, 10, 340, 110, 260);
  rg.addColorStop(0, 'rgba(255,180,120,.5)'); rg.addColorStop(1, 'rgba(255,120,80,0)');
  x.fillStyle = rg; x.fillRect(0, 0, 512, 320);
  x.globalCompositeOperation = 'source-over';
  x.fillStyle = 'rgba(0,0,0,.5)';
  for (let y = 0; y < 320; y += 4) x.fillRect(0, y, 512, 1);
  for (let i = 0; i < 2400; i++) {
    const v = Math.random() * 255 | 0;
    x.fillStyle = `rgba(${v},${v},${v},.05)`;
    x.fillRect(Math.random() * 512, Math.random() * 320, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function studioEnvTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#07070a'; x.fillRect(0, 0, 1024, 512);
  const blob = (cx, cy, r, col) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  };
  blob(760, 150, 320, 'rgba(220,232,255,.95)');
  blob(200, 300, 300, 'rgba(229,36,27,.85)');
  blob(500, 430, 260, 'rgba(70,110,190,.5)');
  blob(980, 400, 180, 'rgba(255,190,120,.4)');
  x.fillStyle = 'rgba(255,255,255,.05)';
  for (let i = 0; i < 8; i++) x.fillRect(i * 128, 0, 4, 512);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------- helpers ---------- */
function roundedBox(w, h, d, r = 0.1) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: d, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035,
    bevelSegments: 3, curveSegments: 10
  });
  g.center();
  return g;
}

/* ============================================================ */
export function createHero(canvas, { reduced = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
    });
  } catch (e) {
    canvas.style.display = 'none';
    return null;
  }

  const isMobile = matchMedia('(max-width: 900px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070708, 0.042);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  camera.position.set(0, 0.2, 9.2);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(studioEnvTexture()).texture;
  scene.environment = env;

  /* ---------- materials ---------- */
  const M = {
    body: new THREE.MeshStandardMaterial({ color: 0x14141a, metalness: 0.72, roughness: 0.42 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x0a0a0d, metalness: 0.55, roughness: 0.55 }),
    lens: new THREE.MeshStandardMaterial({ color: 0x0b0b0f, metalness: 0.95, roughness: 0.2 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x9fa3ad, metalness: 1, roughness: 0.26 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x0a1420, metalness: 1, roughness: 0.06, envMapIntensity: 2.4
    }),
    red: new THREE.MeshStandardMaterial({
      color: RED, metalness: 0.5, roughness: 0.3,
      emissive: 0x520a06, emissiveIntensity: 0.75
    }),
    accent: new THREE.MeshStandardMaterial({ color: 0xd8d4cc, metalness: 0.8, roughness: 0.35 }),
    strip: null
  };

  const rig = new THREE.Group();
  scene.add(rig);

  /* ---------- cinema camera ---------- */
  const cam = new THREE.Group();
  rig.add(cam);

  const body = new THREE.Mesh(roundedBox(2.7, 1.7, 1.7, 0.2), M.body);
  cam.add(body);

  // side detail panels
  const panel = new THREE.Mesh(roundedBox(0.1, 1.1, 1.2, 0.05), M.dark);
  panel.position.set(-1.4, 0.05, 0); cam.add(panel);
  const port = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 24), M.steel);
  port.rotation.z = Math.PI / 2; port.position.set(-1.48, 0.4, 0.3); cam.add(port);
  const port2 = port.clone(); port2.position.set(-1.48, -0.1, 0.3); cam.add(port2);

  // top handle
  const handle = new THREE.Mesh(roundedBox(1.7, 0.17, 0.5, 0.07), M.body);
  handle.position.set(0.05, 1.14, 0); cam.add(handle);
  [-0.6, 0.7].forEach(px => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.36, 16), M.steel);
    post.position.set(px, 0.94, 0); cam.add(post);
  });

  // rec light
  const rec = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 18), M.red);
  rec.position.set(-1.05, 0.72, 0.72); cam.add(rec);

  // viewfinder
  const vf = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.23, 0.9, 24), M.dark);
  vf.rotation.z = Math.PI / 2; vf.position.set(-1.75, 0.6, -0.35); cam.add(vf);
  const vfEye = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 20), M.steel);
  vfEye.rotation.z = Math.PI / 2; vfEye.position.set(-2.24, 0.6, -0.35); cam.add(vfEye);

  /* ---------- lens ---------- */
  const lens = new THREE.Group();
  lens.position.set(0.55, -0.05, 0.85);
  cam.add(lens);

  const barrel = (r1, r2, len, z, mat) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, len, 40, 1, false), mat);
    m.rotation.x = Math.PI / 2; m.position.z = z; lens.add(m); return m;
  };
  barrel(0.6, 0.64, 0.34, 0.17, M.steel);
  barrel(0.72, 0.7, 1.0, 0.84, M.lens);
  barrel(0.76, 0.76, 0.16, 1.15, M.steel);   // focus ring
  barrel(0.7, 0.74, 0.7, 1.62, M.lens);
  barrel(0.76, 0.74, 0.14, 1.98, M.steel);   // iris ring
  barrel(0.66, 0.7, 0.5, 2.24, M.lens);
  barrel(0.72, 0.72, 0.1, 2.52, M.steel);    // front ring

  // knurling on rings
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2;
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.16), M.dark);
    tooth.position.set(Math.cos(a) * 0.77, Math.sin(a) * 0.77, 1.15);
    tooth.rotation.z = a; lens.add(tooth);
  }

  // front glass
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.6, 48), M.glass);
  glass.position.z = 2.58; lens.add(glass);
  const glassIn = new THREE.Mesh(new THREE.CircleGeometry(0.4, 48),
    new THREE.MeshStandardMaterial({
      color: 0x061018, metalness: 1, roughness: 0.05,
      emissive: 0x2a0603, emissiveIntensity: 1.2
    }));
  glassIn.position.z = 2.56; lens.add(glassIn);
  const flareDot = new THREE.Mesh(new THREE.CircleGeometry(0.11, 32),
    new THREE.MeshBasicMaterial({ color: 0xff5a44, transparent: true, opacity: 0.75 }));
  flareDot.position.z = 2.575; lens.add(flareDot);

  // matte box flag
  const flag = new THREE.Mesh(roundedBox(1.5, 0.06, 0.9, 0.02), M.dark);
  flag.position.set(0.5, 0.86, 2.6); flag.rotation.x = -0.32; cam.add(flag);
  const flagArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 10), M.steel);
  flagArm.position.set(1.2, 0.6, 2.4); cam.add(flagArm);

  // follow focus knob
  const ff = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 28), M.accent);
  ff.rotation.z = Math.PI / 2; ff.position.set(-1.0, -0.1, 1.5); lens.add(ff);
  const ffArm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.1), M.dark);
  ffArm.position.set(-0.7, -0.1, 1.5); lens.add(ffArm);

  /* ---------- film reel ---------- */
  const reel = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.075, 14, 72), M.steel);
  reel.add(rim);
  const rimIn = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.035, 12, 64), M.accent);
  reel.add(rimIn);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 28), M.steel);
  hub.rotation.x = Math.PI / 2; reel.add(hub);
  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.15, 0.05), M.steel);
    spoke.rotation.z = (i / 3) * Math.PI;
    reel.add(spoke);
    const cut = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.055, 10, 40), M.accent);
    cut.position.set(Math.cos((i / 3) * Math.PI * 2 + 1) * 0.6,
      Math.sin((i / 3) * Math.PI * 2 + 1) * 0.6, 0);
    reel.add(cut);
  }
  const reelBack = new THREE.Mesh(new THREE.CircleGeometry(1.2, 64),
    new THREE.MeshStandardMaterial({
      color: 0x0a0a0e, metalness: 0.6, roughness: 0.4,
      transparent: true, opacity: 0.55, side: THREE.DoubleSide
    }));
  reelBack.position.z = -0.03; reel.add(reelBack);
  reel.position.set(-3.5, 1.85, -1.6);
  reel.rotation.set(0.18, 0.42, 0);
  rig.add(reel);

  /* ---------- film strip ---------- */
  const stripMat = new THREE.MeshStandardMaterial({
    map: filmStripTexture(), side: THREE.DoubleSide,
    metalness: 0.25, roughness: 0.62, transparent: true, opacity: 0.95
  });
  M.strip = stripMat;
  const stripGeo = new THREE.PlaneGeometry(22, 2.3, 80, 1);
  const pos = stripGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, Math.sin(x * 0.34) * 0.9 + Math.cos(x * 0.13) * 0.5);
    pos.setY(i, pos.getY(i) + Math.sin(x * 0.2) * 0.35);
  }
  stripGeo.computeVertexNormals();
  const strip = new THREE.Mesh(stripGeo, stripMat);
  strip.position.set(0, -3.0, -4.6);
  strip.rotation.set(-0.34, 0, 0.06);
  rig.add(strip);

  /* ---------- floating screens ---------- */
  const screens = new THREE.Group();
  const screenDefs = [
    { p: [3.9, 1.75, -2.6], r: -0.34, s: 1.5, c: ['#1a2b4d', '#3a1330'] },
    { p: [-4.3, -1.1, -2.2], r: 0.3, s: 1.15, c: ['#2a1330', '#101d1a'] },
    { p: [4.6, -1.5, -3.4], r: 0.22, s: 0.95, c: ['#101d1a', '#3a2410'] }
  ];
  screenDefs.forEach((d, i) => {
    const g = new THREE.Group();
    const panelM = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1),
      new THREE.MeshBasicMaterial({ map: screenTexture(d.c), transparent: true, opacity: 0.92 })
    );
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.72, 1.12, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x111116, metalness: 0.8, roughness: 0.35 }));
    frame.position.z = -0.04;
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.4),
      new THREE.MeshBasicMaterial({
        map: glowTexture(), transparent: true, opacity: 0.14,
        blending: THREE.AdditiveBlending, depthWrite: false, color: i === 1 ? 0xe5241b : 0x88aaff
      }));
    halo.position.z = -0.2;
    g.add(halo, frame, panelM);
    g.position.set(...d.p);
    g.rotation.y = d.r;
    g.scale.setScalar(d.s);
    g.userData.seed = i * 2.3;
    screens.add(g);
  });
  rig.add(screens);

  /* ---------- lens element rings (abstract) ---------- */
  const rings = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5 + i * 0.5, 0.03, 10, 96),
      new THREE.MeshStandardMaterial({
        color: 0xcfd6e6, metalness: 1, roughness: 0.18,
        transparent: true, opacity: 0.4 - i * 0.12
      }));
    ring.rotation.x = Math.PI / 2.4;
    ring.rotation.y = i * 0.5;
    ring.userData.seed = i * 1.7;
    rings.add(ring);
  }
  rings.position.set(-1.4, 0.4, -2.4);
  rig.add(rings);

  /* ---------- backdrop light pool ---------- */
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(26, 16),
    new THREE.MeshBasicMaterial({
      map: glowTexture(), transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false, color: 0x2a1030
    }));
  pool.position.set(0, 0, -8);
  rig.add(pool);

  /* ---------- dust ---------- */
  const dustCount = isMobile ? 110 : 220;
  const dustGeo = new THREE.BufferGeometry();
  const dp = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dp[i * 3] = (Math.random() - 0.5) * 16;
    dp[i * 3 + 1] = (Math.random() - 0.5) * 9;
    dp[i * 3 + 2] = (Math.random() - 0.5) * 9 - 1;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.055, map: glowTexture(), transparent: true, opacity: 0.55,
    depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd9c0
  }));
  scene.add(dust);

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight(0x4a5a78, 0x08080c, 0.55);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xdfe8ff, 2.6);
  key.position.set(5, 7, 6); scene.add(key);

  const redLight = new THREE.PointLight(RED, 70, 34, 2);
  redLight.position.set(-5.5, 1.5, 3.4); scene.add(redLight);

  const fill = new THREE.PointLight(0x4d7cff, 26, 34, 2);
  fill.position.set(5.5, -2.6, 3); scene.add(fill);

  const rimL = new THREE.SpotLight(0xffffff, 40, 30, 0.7, 0.6, 1.6);
  rimL.position.set(-3, 5, -5); scene.add(rimL);

  /* ---------- layout ---------- */
  const base = { x: 1.7, y: 0.5, scale: 1 };
  function layout() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    const wide = w / h >= 1.25;
    base.x = wide ? 1.7 : 0;
    base.y = wide ? 0.5 : 1.55;
    base.scale = wide ? Math.min(1.12, 0.78 + (w / h) * 0.16) : 0.62;
    rig.scale.setScalar(base.scale);
  }
  layout();

  /* ---------- interaction ---------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    const w = innerWidth, h = innerHeight;
    mouse.tx = (e.clientX / w) * 2 - 1;
    mouse.ty = (e.clientY / h) * 2 - 1;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let scrollP = 0;
  let visible = true;
  const clock = new THREE.Clock();
  let raf = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    mouse.x += (mouse.tx - mouse.x) * 0.055;
    mouse.y += (mouse.ty - mouse.y) * 0.055;

    // rig reacts to cursor â€” virtual studio feel
    rig.position.x = base.x + mouse.x * 0.42 + Math.sin(t * 0.34) * 0.06;
    rig.position.y = base.y - mouse.y * 0.3 + Math.sin(t * 0.5) * 0.07 - scrollP * 2.2;
    rig.rotation.y = -0.42 + mouse.x * 0.3 + scrollP * 1.25;
    rig.rotation.x = 0.06 + mouse.y * 0.16 + scrollP * 0.34;
    rig.rotation.z = mouse.x * 0.03;

    // lens breathing + slow pan of the camera head
    lens.rotation.z = Math.sin(t * 0.22) * 0.05;
    flareDot.material.opacity = 0.5 + Math.abs(Math.sin(t * 0.8)) * 0.35;
    rec.material.emissiveIntensity = (Math.sin(t * 3) > 0 ? 1.6 : 0.35);

    // reel
    reel.rotation.z -= dt * 0.42;
    reel.position.y = 1.85 + Math.sin(t * 0.6) * 0.14;

    // screens drift
    screens.children.forEach((g, i) => {
      g.position.y += Math.sin(t * 0.5 + g.userData.seed) * 0.0016;
      g.rotation.y += Math.sin(t * 0.3 + i) * 0.0006;
    });
    rings.rotation.z += dt * 0.12;
    rings.children.forEach((r, i) => { r.rotation.z = Math.sin(t * 0.4 + i) * 0.3; });

    // strip motion (scroll-linked)
    stripMat.map.offset.x = (t * 0.018 + scrollP * 0.9) % 1;
    strip.position.y = -3.0 - scrollP * 1.4;

    // dust
    dust.rotation.y = t * 0.02;
    dust.position.y = Math.sin(t * 0.2) * 0.2;

    // lighting follows cursor
    redLight.position.x = -5.5 + mouse.x * 7;
    redLight.position.y = 1.5 - mouse.y * 4.5;
    redLight.intensity = 62 + Math.abs(mouse.x) * 38;
    fill.position.x = 5.5 - mouse.x * 3;
    key.intensity = 2.6 + mouse.x * 0.5;
    hemi.intensity = 0.55 + (1 - Math.abs(mouse.y)) * 0.18;

    // camera micro-parallax + breathing
    camera.position.x = mouse.x * 0.55;
    camera.position.y = 0.2 - mouse.y * 0.34 + scrollP * 0.9;
    camera.position.z = 9.2 + Math.sin(t * 0.4) * 0.07 - scrollP * 0.7;
    camera.lookAt(base.x * 0.4, base.y * 0.5 - scrollP * 1.1, 0);

    renderer.toneMappingExposure = 1.08 - scrollP * 0.42;
    renderer.render(scene, camera);
  }

  if (reduced) {
    renderer.render(scene, camera);
    const still = setInterval(() => renderer.render(scene, camera), 400);
    return {
      setScroll: () => {}, setVisible: () => {}, dispose: () => clearInterval(still),
      resize: layout
    };
  }
  frame();

  addEventListener('resize', layout);

  return {
    setScroll(p) { scrollP = Math.max(0, Math.min(1, p)); },
    setVisible(v) { visible = v; },
    resize: layout,
    dispose() {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      removeEventListener('resize', layout);
      renderer.dispose();
      pmrem.dispose();
      env.dispose();
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const ms = Array.isArray(o.material) ? o.material : [o.material];
          ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        }
      });
    }
  };
}
