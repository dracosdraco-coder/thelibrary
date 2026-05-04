// ─────────────────────────────────────────
//  THE LIBRARY — scene/interior.js
//  Isometric interior — loaded from Library.glb.
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

    model.traverse(node => {
      if (node.isMesh) {
        node.castShadow    = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material.envMapIntensity = 0.4;
          // Force double-sided in case Blender export has flipped normals
          node.material.side = THREE.DoubleSide;
        }
      }
    });

    // Auto-fit: scale model to fill the iso view, floor at y=0, centered at origin
    const box    = new THREE.Box3().setFromObject(model);
    const size   = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale  = 14 / maxDim;       // target ~14 units wide — fits ISO_HALF:11 with margin

    model.scale.setScalar(scale);

    // Recompute after scaling
    const box2    = new THREE.Box3().setFromObject(model);
    const center2 = box2.getCenter(new THREE.Vector3());
    model.position.x = -center2.x;
    model.position.z = -center2.z;
    model.position.y = -box2.min.y;   // sit on the floor

    intGroup.add(model);
    console.log('Library.glb loaded — size:', size, 'scale applied:', scale.toFixed(3));
  },
  undefined,
  err => console.error('Library.glb failed to load:', err)
);

// ── Candle light (animated in main.js) ──
const candleLight = new THREE.PointLight(0xffaa33, 2.2, 12);
candleLight.position.set(0, 1.5, 0);
intGroup.add(candleLight);

// ── Isometric fill light — ensures GLB is visible from camera angle ──
const isoFill = new THREE.DirectionalLight(0xffd8a0, 1.8);
isoFill.position.set(38, 38, 38);   // same direction as orthoCam
isoFill.target.position.set(0, 0, 0);
intGroup.add(isoFill);
intGroup.add(isoFill.target);

// ── Window spotlight ──
const winSpot = new THREE.SpotLight(0xffe0a0, 2.5, 22, Math.PI * 0.11, 0.6);
winSpot.position.set(-6.5, 6.5, -3.5);
winSpot.target.position.set(1, 0, 2);
intGroup.add(winSpot);
intGroup.add(winSpot.target);

// ── Ambient + ceiling ──
intGroup.add(new THREE.AmbientLight(0xffa060, 1.2));
const ceilLight = new THREE.PointLight(0xffaa44, 1.8, 28);
ceilLight.position.set(0, 6.5, 0);
intGroup.add(ceilLight);

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
