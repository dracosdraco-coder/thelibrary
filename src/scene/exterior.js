// ─────────────────────────────────────────
//  THE LIBRARY — scene/exterior.js
//  Everything visible during the walk-up:
//  arch, door, path, flanking walls, lanterns, fog particles.
//
//  TODO: Replace arch geometry with loaded .glb model:
//    loader.load('public/assets/models/arch.glb', gltf => {
//      extGroup.add(gltf.scene);
//    });
// ─────────────────────────────────────────

const extGroup = new THREE.Group();

// ── Shared exterior materials ──
const stoneMat = mkMat(0x28201a, 0.95);
const archMat  = mkMat(0x3a2c1c, 0.88);
const woodMat  = mkMat(0x5a3a1a, 0.82);

// ── Ground ──
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  mkMat(0x0d0a07, 1.0)
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
extGroup.add(ground);

// Stone path leading to door
const path = new THREE.Mesh(
  new THREE.PlaneGeometry(3.6, 38),
  mkMat(0x1c1610, 0.98)
);
path.rotation.x = -Math.PI / 2;
path.position.set(0, 0, 13);
extGroup.add(path);

// ── Arch ──
function buildArch() {
  const g   = new THREE.Group();
  const W2  = 1.65;   // half-width of opening
  const H   = 5.4;    // height to spring of arch
  const D   = 0.55;   // depth
  const PW  = 0.52;   // pillar width

  // Left & right pillars
  const pillarGeo = new THREE.BoxGeometry(PW, H, D);
  [-1, 1].forEach(side => {
    const p = new THREE.Mesh(pillarGeo, archMat);
    p.position.set(side * (W2 + PW / 2), H / 2, 0);
    p.castShadow = true;
    g.add(p);
  });

  // Curved arch
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(W2, 0.26, 8, 40, Math.PI),
    archMat
  );
  torus.position.set(0, H, 0);
  torus.rotation.z = Math.PI;
  g.add(torus);

  // Flanking wall sections
  const wallGeo = new THREE.BoxGeometry(7, 8, 0.45);
  [-1, 1].forEach(side => {
    const w = new THREE.Mesh(wallGeo, stoneMat);
    w.position.set(side * (W2 + PW + 3.5 + 0.22), 4, 0);
    g.add(w);
  });

  // Lintel
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry((W2 + PW) * 2 + 0.1, 0.28, D),
    stoneMat
  );
  lintel.position.set(0, H + 0.14, 0);
  g.add(lintel);

  // Door panel
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(W2 * 2 - 0.1, H - 0.12, 0.07),
    mkMat(0x0d0905, 0.97)
  );
  door.position.set(0, H / 2 - 0.06, 0.12);
  g.add(door);

  // Door handle
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.38, 8),
    mkMat(0xb8892e, 0.28, 0.85)
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0.52, H * 0.42, 0.22);
  g.add(handle);

  // Keystone
  const keystone = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.46, D + 0.04),
    mkMat(0x4a3828, 0.82)
  );
  keystone.position.set(0, H + 0.08, 0);
  g.add(keystone);

  // Lanterns
  function makeLantern(x, y, z) {
    const lg = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.28, 0.18),
      mkMat(0x2a2018, 0.6, 0.45)
    );
    lg.add(body);
    const light = new THREE.PointLight(0xffad4a, 1.6, 5.5);
    lg.add(light);
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.18),
      new THREE.MeshStandardMaterial({
        color: 0xffad4a, emissive: 0xffad4a,
        emissiveIntensity: 2.5, transparent: true, opacity: 0.9,
      })
    );
    lg.add(glow);
    lg.position.set(x, y, z);
    return lg;
  }

  g.add(makeLantern(-(W2 + PW / 2), H + 0.45, 0.35));
  g.add(makeLantern(  W2 + PW / 2,  H + 0.45, 0.35));

  return g;
}

extGroup.add(buildArch());

// ── Exterior fog particles ──
const fogGeo = new THREE.BufferGeometry();
const fogPos = new Float32Array(180 * 3);
for (let i = 0; i < 180; i++) {
  fogPos[i * 3]     = (Math.random() - 0.5) * 22;
  fogPos[i * 3 + 1] = Math.random() * 3.5;
  fogPos[i * 3 + 2] = (Math.random() - 0.5) * 32 + 5;
}
fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPos, 3));
extGroup.add(new THREE.Points(fogGeo, new THREE.PointsMaterial({
  color: 0x334455, size: 0.14, transparent: true, opacity: 0.14, sizeAttenuation: true,
})));
