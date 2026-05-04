// ─────────────────────────────────────────
//  THE LIBRARY — scene/interior.js
// ─────────────────────────────────────────

const intGroup = new THREE.Group();
intGroup.visible = false;

// Dark base — same tone as BG_INTERIOR, unlit
const bigFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshBasicMaterial({ color: 0x0d0a07 })
);
bigFloor.rotation.x = -Math.PI / 2;
bigFloor.position.set(0, -0.02, 0);
intGroup.add(bigFloor);

// ── GLB model ──
const loader = new THREE.GLTFLoader();
loader.load(
  '/public/assets/models/Library.glb',
  gltf => {
    const model = gltf.scene;

    // Pass 1 — strip large flat planes that were part of the Blender scene
    // (floor/ground planes inflate the bounding box and appear as the teal diamond)
    model.traverse(node => {
      if (node.isMesh) {
        const b = new THREE.Box3().setFromObject(node);
        const s = b.getSize(new THREE.Vector3());
        // Large flat plane: very thin vertically, wide in both horizontal axes
        if (s.y < 0.4 && s.x > 4 && s.z > 4) {
          node.visible = false;
          return;
        }
        node.castShadow    = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material.side = THREE.DoubleSide;
        }
      }
    });

    // Rotate so the open interior faces the iso camera at (38, 38, 38)
    model.rotation.y = Math.PI;

    // Auto-fit: scale so the model fills the ISO frame
    // target = ISO_HALF × 2.6 gives ~90% fill of vertical frustum
    const box    = new THREE.Box3().setFromObject(model);
    const size   = box.getSize(new THREE.Vector3());
    const maxH   = Math.max(size.x, size.z);
    const target = CONFIG.ISO_HALF * 2.6;
    const scale  = target / maxH;

    model.scale.setScalar(scale);

    // Re-center after scale, sit on floor
    const box2    = new THREE.Box3().setFromObject(model);
    const center2 = box2.getCenter(new THREE.Vector3());
    model.position.x = -center2.x;
    model.position.z = -center2.z;
    model.position.y = -box2.min.y;

    intGroup.add(model);
    console.log('Library.glb — original size:', size, '  scale applied:', scale.toFixed(3));
  },
  undefined,
  err => console.error('Library.glb failed:', err)
);

// ── Candle light (animated in main.js) ──
const candleLight = new THREE.PointLight(0xffaa33, 2.2, 14);
candleLight.position.set(0, 2, 0);
intGroup.add(candleLight);

// ── Ceiling fill ──
const ceilLight = new THREE.PointLight(0xffaa44, 2.2, 32);
ceilLight.position.set(0, 9, 0);
intGroup.add(ceilLight);

// ── Directional from iso camera direction so faces are lit ──
const isoFill = new THREE.DirectionalLight(0xffc88a, 0.55);
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
  dp[i * 3 + 1] = Math.random() * 7;
  dp[i * 3 + 2] = (Math.random() - 0.5) * 11;
  dv[i * 3]     = (Math.random() - 0.5) * 0.003;
  dv[i * 3 + 1] = 0.002 + Math.random() * 0.004;
  dv[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
}

dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
intGroup.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
  color: 0xffcc88, size: 0.038, transparent: true, opacity: 0.48, sizeAttenuation: true,
})));
