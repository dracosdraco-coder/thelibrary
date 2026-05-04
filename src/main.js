// ─────────────────────────────────────────
//  THE LIBRARY — main.js
//  Renderer, cameras, animate loop.
//  All scene groups (extGroup, intGroup) and
//  input state (progress, mx, my) are globals
//  set up by the files loaded before this one.
// ─────────────────────────────────────────

// ── Renderer ──
const canvas   = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled  = true;
renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
renderer.toneMapping        = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.setSize(window.innerWidth, window.innerHeight);

// ── Scene ──
const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.BG_EXTERIOR);
scene.fog        = new THREE.FogExp2(CONFIG.BG_EXTERIOR, 0.022);

// Add groups to scene
scene.add(extGroup);
scene.add(intGroup);

// ── Cameras ──
const perspCam = new THREE.PerspectiveCamera(
  CONFIG.CAM_FOV_FAR,
  window.innerWidth / window.innerHeight,
  0.1,
  180
);
perspCam.position.set(0, CONFIG.CAM_HEIGHT, CONFIG.CAM_START_Z);

const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 180);

let activeCamera = perspCam;

// ── Ortho camera setup ──
function updateOrthoCam() {
  const a    = window.innerWidth / window.innerHeight;
  const half = a >= 1 ? CONFIG.ISO_HALF : CONFIG.ISO_HALF / a;
  orthoCam.left   = -half * a;
  orthoCam.right  =  half * a;
  orthoCam.top    =  half;
  orthoCam.bottom = -half;
  const { x, y, z } = CONFIG.ISO_TARGET;
  orthoCam.position.set(CONFIG.ISO_DIST, CONFIG.ISO_DIST, CONFIG.ISO_DIST);
  orthoCam.lookAt(x, y, z);
  orthoCam.updateProjectionMatrix();
}
updateOrthoCam();

// ── Exterior lighting ──
scene.add(new THREE.AmbientLight(0x18120a, 0.9));
const moonLight = new THREE.DirectionalLight(0x8899cc, 0.35);
moonLight.position.set(-10, 20, 10);
scene.add(moonLight);

// ── Raycaster (shared with nodes.js) ──
const raycaster = new THREE.Raycaster();
const mouse2D   = new THREE.Vector2();

document.addEventListener('mousemove', e => {
  mouse2D.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  mouse2D.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ── UI refs ──
const wordmark    = document.getElementById('wordmark');
const nav         = document.getElementById('nav');
const scrollHint  = document.getElementById('scroll-hint');
const progressBar = document.getElementById('progress-bar');
const phaseLabel  = document.getElementById('phase-label');
const tooltip     = document.getElementById('tooltip');
const instructions= document.getElementById('instructions');

// ── Helpers ──
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ── Clock / state ──
const clock = new THREE.Clock();
let t        = 0;
let bobTime  = 0;
let prevTargetProgress = 0;

// ─────────────────────────────────────────
//  ANIMATE LOOP
// ─────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  t += delta;

  // Single unified lerp — consistent feel throughout
  progress += (targetProgress - progress) * CONFIG.LERP_SPEED;

  // Raw wheel velocity (for head bob amplitude)
  const rawVel = targetProgress - prevTargetProgress;
  prevTargetProgress = targetProgress;

  // Progress bar
  progressBar.style.width = (progress * 100) + '%';

  // ── Candle flicker ──
  candleLight.intensity =
    CONFIG.CANDLE_BASE +
    Math.sin(t * 8.1)  * CONFIG.CANDLE_FLICKER_1 +
    Math.sin(t * 14.7) * CONFIG.CANDLE_FLICKER_2;

  // ── Node pulse ──
  nodeObjects.forEach((n, i) => {
    const pulse = 1.0 + Math.sin(t * CONFIG.NODE_PULSE_FREQ + i * 1.3) * 0.45;
    n.material.emissiveIntensity = pulse;
    n.scale.setScalar(0.88 + Math.sin(t * CONFIG.NODE_PULSE_FREQ + i * 1.3) * 0.13);
  });

  // ── Dust mote animation ──
  const dpa = dustGeo.attributes.position.array;
  for (let i = 0; i < DUST; i++) {
    dpa[i*3]     += dv[i*3];
    dpa[i*3 + 1] += dv[i*3 + 1];
    dpa[i*3 + 2] += dv[i*3 + 2];
    if (dpa[i*3 + 1] > 6.8) dpa[i*3 + 1] = 0.1;
    if (Math.abs(dpa[i*3])     > 7.2) dv[i*3]     *= -1;
    if (Math.abs(dpa[i*3 + 2]) > 6.2) dv[i*3 + 2] *= -1;
  }
  dustGeo.attributes.position.needsUpdate = true;

  // ── Smoothstep the global progress for easing ──
  const sp  = progress;
  const spS = sp * sp * (3 - 2 * sp);

  // ════════════════════════════════════════
  //  PHASE 1 — Walk up to the door
  // ════════════════════════════════════════
  if (sp < CONFIG.P_SWITCH) {
    const switchS = CONFIG.P_SWITCH * CONFIG.P_SWITCH * (3 - 2 * CONFIG.P_SWITCH);
    const t0      = clamp(spS / switchS, 0, 1);

    const camZ   = lerp(CONFIG.CAM_START_Z, CONFIG.CAM_END_Z, t0);
    bobTime     += delta;
    const bobAmp = clamp(Math.abs(rawVel) * 22, 0, CONFIG.BOB_MAX);
    const bobY   = Math.sin(bobTime * CONFIG.BOB_FREQ) * bobAmp;
    const bobX   = Math.sin(bobTime * CONFIG.BOB_FREQ * 0.5) * bobAmp * 0.25;

    perspCam.position.set(bobX, CONFIG.CAM_HEIGHT + bobY, camZ);
    perspCam.lookAt(0, lerp(2.0, 3.5, t0), 0);
    perspCam.fov = lerp(CONFIG.CAM_FOV_FAR, CONFIG.CAM_FOV_NEAR, t0);
    perspCam.updateProjectionMatrix();

    activeCamera        = perspCam;
    extGroup.visible    = true;
    intGroup.visible    = false;
    scene.background.setHex(CONFIG.BG_EXTERIOR);
    if (!scene.fog) scene.fog = new THREE.FogExp2(CONFIG.BG_EXTERIOR, 0.022);

    scrollHint.style.opacity    = sp < 0.025 ? '1' : '0';
    instructions.style.opacity  = sp < 0.03  ? '1' : '0';
    wordmark.style.opacity      = '0';
    nav.style.opacity           = '0';
    phaseLabel.style.opacity    = sp > 0.05 ? '0.5' : '0';
    phaseLabel.textContent      = 'approaching the library';
    tooltip.style.opacity       = '0';

  // ════════════════════════════════════════
  //  PHASE 2 — Isometric interior
  // ════════════════════════════════════════
  } else {
    const t1  = clamp((sp - CONFIG.P_SWITCH) / (1 - CONFIG.P_SWITCH), 0, 1);
    const t1s = t1 * t1 * (3 - 2 * t1);

    extGroup.visible = t1 < 0.22;
    intGroup.visible = true;
    activeCamera     = orthoCam;
    scene.background.setHex(CONFIG.BG_INTERIOR);
    scene.fog        = null;

    // Gentle float
    const floatY = Math.sin(t * CONFIG.ISO_FLOAT_FREQ) * CONFIG.ISO_FLOAT_AMP;
    const { x, y, z } = CONFIG.ISO_TARGET;
    orthoCam.position.set(CONFIG.ISO_DIST, CONFIG.ISO_DIST + floatY, CONFIG.ISO_DIST);
    orthoCam.lookAt(x, y, z);

    const uiFade             = Math.min(t1s * 3, 1).toFixed(3);
    wordmark.style.opacity   = uiFade;
    nav.style.opacity        = uiFade;
    scrollHint.style.opacity = '0';
    instructions.style.opacity = '0';
    phaseLabel.style.opacity = '0.5';
    phaseLabel.textContent   = 'the library';

    // Node hover
    raycaster.setFromCamera(mouse2D, orthoCam);
    const hits = raycaster.intersectObjects(nodeObjects);
    if (hits.length > 0 && !hits[0].object.userData.isRing) {
      tooltip.style.opacity  = '1';
      tooltip.style.left     = (mx + 18) + 'px';
      tooltip.style.top      = (my - 8)  + 'px';
      tooltip.textContent    = hits[0].object.userData.label;
      setCursorLarge();
    } else {
      tooltip.style.opacity = '0';
      setCursorNormal();
    }
  }

  renderer.render(scene, activeCamera);
}

animate();

// ─────────────────────────────────────────
//  RESIZE
// ─────────────────────────────────────────
window.addEventListener('resize', () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  renderer.setSize(W, H);
  perspCam.aspect = W / H;
  perspCam.updateProjectionMatrix();
  updateOrthoCam();
});
