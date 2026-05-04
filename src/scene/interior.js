// ─────────────────────────────────────────
//  THE LIBRARY — scene/interior.js
//  Isometric interior — loaded from Library.glb.
//  Procedural fallback geometry removed; lights,
//  dust motes, and candleLight kept (main.js animates them).
// ─────────────────────────────────────────

const intGroup = new THREE.Group();
intGroup.visible = false;

// ── Large base plane — fills iso view, no black void ──
const bigFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshStandardMaterial({ color: 0x100c08, roughness: 1.0 })
);
bigFloor.rotation.x = -Math.PI / 2;
bigFloor.position.set(0, -0.12, 0);
intGroup.add(bigFloor);

// ── GLB model ──
const loader = new THREE.GLTFLoader();
loader.load(
  '/public/assets/models/Library.glb',
  gltf => {
    const model = gltf.scene;

    // Ensure shadows and consistent material rendering
    model.traverse(node => {
      if (node.isMesh) {
        node.castShadow    = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material.envMapIntensity = 0.6;
        }
      }
    });

    intGroup.add(model);
  },
  undefined,
  err => console.error('Library.glb failed to load:', err)
);

// ── Candle light (animated in main.js) ──
const candleLight = new THREE.PointLight(0xffaa33, 2.2, 5.5);
candleLight.position.set(0, 1.05, 0);
intGroup.add(candleLight);

// ── Window spotlight ──
const winSpot = new THREE.SpotLight(0xffe0a0, 2.5, 22, Math.PI * 0.11, 0.6);
winSpot.position.set(-6.5, 6.5, -3.5);
winSpot.target.position.set(1, 0, 2);
intGroup.add(winSpot);
intGroup.add(winSpot.target);

// ── Ambient + ceiling light ──
intGroup.add(new THREE.AmbientLight(0x3a1c08, 1.4));
const ceilLight = new THREE.PointLight(0xffaa44, 1.2, 22);
ceilLight.position.set(0, 6.5, 0);
intGroup.add(ceilLight);

// ── Dust motes ──
const DUST   = 220;
const dustGeo = new THREE.BufferGeometry();
const dp      = new Float32Array(DUST * 3);
const dv      = new Float32Array(DUST * 3);

for (let i = 0; i < DUST; i++) {
  dp[i * 3]     = (Math.random() - 0.5) * 13;
  dp[i * 3 + 1] = Math.random() * 6.5;
  dp[i * 3 + 2] = (Math.random() - 0.5) * 11;
  dv[i * 3]     = (Math.random() - 0.5) * 0.003;
  dv[i * 3 + 1] = 0.002 + Math.random() * 0.004;
  dv[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
}

dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
intGroup.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
  color: 0xffcc88, size: 0.038, transparent: true, opacity: 0.48, sizeAttenuation: true,
})));
