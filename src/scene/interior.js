// ─────────────────────────────────────────
//  THE LIBRARY — scene/interior.js
// ─────────────────────────────────────────

const intGroup = new THREE.Group();
intGroup.visible = false;

// Dark base — unlit, same tone as background
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

    // Pass 1 — hide large flat Blender scene planes (teal diamond, bounding-box inflaters)
    model.traverse(node => {
      if (!node.isMesh) return;
      const b = new THREE.Box3().setFromObject(node);
      const s = b.getSize(new THREE.Vector3());
      if (s.y < 0.8 && s.x > 8 && s.z > 8) {
        node.visible = false;
        return;
      }
      node.castShadow    = true;
      node.receiveShadow = true;
      if (node.material) node.material.side = THREE.DoubleSide;
    });

    model.rotation.y = Math.PI;

    // Bounding box from VISIBLE meshes only.
    // Box3.setFromObject() includes hidden children — compute manually.
    const visBox = new THREE.Box3();
    model.traverse(node => {
      if (node.isMesh && node.visible) visBox.expandByObject(node);
    });

    const size  = visBox.getSize(new THREE.Vector3());
    const maxH  = Math.max(size.x, size.z);
    const scale = (CONFIG.ISO_HALF * 2.8) / maxH;

    model.scale.setScalar(scale);

    // Re-center using visible-only box after scaling
    const visBox2 = new THREE.Box3();
    model.traverse(node => {
      if (node.isMesh && node.visible) visBox2.expandByObject(node);
    });
    const c2 = visBox2.getCenter(new THREE.Vector3());
    model.position.x = -c2.x;
    model.position.z = -c2.z;
    model.position.y = -visBox2.min.y;

    intGroup.add(model);
    console.log('Library.glb — visible size:', size, '  scale:', scale.toFixed(3));
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

// ── Directional from iso camera direction ──
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
