// ─────────────────────────────────────────
//  THE LIBRARY — scene/interior.js
// ─────────────────────────────────────────

const intGroup = new THREE.Group();
intGroup.visible = false;

// MeshBasicMaterial — unaffected by lights, stays dark
const bigFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshBasicMaterial({ color: 0x0d0a07 })
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

    model.traverse(node => {
      if (node.isMesh) {
        node.castShadow    = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material.side = THREE.DoubleSide;
        }
      }
    });

    // Rotate so the open interior faces the iso camera at (38,38,38)
    model.rotation.y = Math.PI;

    // Auto-fit using horizontal footprint only (ignore ceiling height for scale)
    const box    = new THREE.Box3().setFromObject(model);
    const size   = box.getSize(new THREE.Vector3());
    const maxH   = Math.max(size.x, size.z);
    const scale  = 16 / maxH;

    model.scale.setScalar(scale);

    // Re-center after scale
    const box2    = new THREE.Box3().setFromObject(model);
    const center2 = box2.getCenter(new THREE.Vector3());
    model.position.x = -center2.x;
    model.position.z = -center2.z;
    model.position.y = -box2.min.y;

    intGroup.add(model);
    console.log('Library.glb — size:', size, '  scale:', scale.toFixed(3));
  },
  undefined,
  err => console.error('Library.glb failed:', err)
);

// ── Candle light (animated in main.js) ──
const candleLight = new THREE.PointLight(0xffaa33, 2.2, 12);
candleLight.position.set(0, 1.5, 0);
intGroup.add(candleLight);

// ── Warm ceiling fill ──
const ceilLight = new THREE.PointLight(0xffaa44, 2.0, 30);
ceilLight.position.set(0, 8, 0);
intGroup.add(ceilLight);

// ── Subtle iso-angle directional so walls facing the camera are lit ──
const isoFill = new THREE.DirectionalLight(0xffc88a, 0.6);
isoFill.position.set(38, 38, 38);
isoFill.target.position.set(0, 0, 0);
intGroup.add(isoFill);
intGroup.add(isoFill.target);

// ── Ambient ──
intGroup.add(new THREE.AmbientLight(0x6a3a1a, 1.5));

// ── Dust motes ──
const DUST    = 220;
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
