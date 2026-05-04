// ─────────────────────────────────────────
//  THE LIBRARY — scene/interior.js
//  The isometric library room: walls, bookshelves,
//  reading chairs, table, lighting, dust motes.
//
//  TODO: Replace box geometry with Blender .glb:
//    loader.load('public/assets/models/library.glb', gltf => {
//      intGroup.add(gltf.scene);
//    });
// ─────────────────────────────────────────

const intGroup = new THREE.Group();
intGroup.visible = false;

const { ROOM_W: RW, ROOM_D: RD, ROOM_H: RH } = CONFIG;

// ── Materials ──
const floorMat = mkMat(0x18120a, 0.96);
const wallMat  = mkMat(0x1c1610, 1.0);
const woodMat  = mkMat(0x5a3a1a, 0.82);

const bookMats = [
  mkMat(0x8b2a2a), mkMat(0x2a478b),
  mkMat(0x2a6b3a), mkMat(0x8b7a2a),
  mkMat(0x6b2a6b), mkMat(0x4a3a2a),
];

// ── Large base plane — fills iso view, no black void ──
const bigFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshStandardMaterial({ color: 0x100c08, roughness: 1.0 })
);
bigFloor.rotation.x = -Math.PI / 2;
bigFloor.position.set(0, -0.12, 0);
intGroup.add(bigFloor);

// ── Room shell ──
[
  { geo: new THREE.BoxGeometry(RW, 0.2, RD),  pos: [0, -0.1,   0],      mat: floorMat },
  { geo: new THREE.BoxGeometry(RW, RH, 0.2),  pos: [0, RH/2, -RD/2],   mat: wallMat  },
  { geo: new THREE.BoxGeometry(0.2, RH, RD),  pos: [-RW/2, RH/2, 0],   mat: wallMat  },
  { geo: new THREE.BoxGeometry(0.2, RH, RD),  pos: [ RW/2, RH/2, 0],   mat: wallMat  },
  { geo: new THREE.BoxGeometry(RW, 0.2, RD),  pos: [0, RH, 0],          mat: wallMat  },
].forEach(({ geo, pos, mat }) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  m.receiveShadow = true;
  intGroup.add(m);
});

// Rug
const rug = new THREE.Mesh(
  new THREE.BoxGeometry(6.5, 0.04, 5.5),
  mkMat(0x5c1e1e, 1.0)
);
rug.position.set(0, 0.04, 1);
intGroup.add(rug);

// ── Bookshelves ──
function makeShelf(x, y, z, rotY = 0) {
  const sg = new THREE.Group();

  // Back panel
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.6, 0.08), mkMat(0x3a2010, 0.9));
  back.position.z = -0.17;
  sg.add(back);

  // Side panels
  [-1.55, 1.55].forEach(sx => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.6, 0.38), woodMat);
    side.position.x = sx;
    sg.add(side);
  });

  // Shelves + books
  for (let s = 0; s < 4; s++) {
    const shelfY = -1.85 + s * 1.12;
    const shelf  = new THREE.Mesh(new THREE.BoxGeometry(3.08, 0.06, 0.36), woodMat);
    shelf.position.set(0, shelfY, 0);
    sg.add(shelf);

    let bx = -1.42;
    while (bx < 1.35) {
      const bw   = 0.075 + Math.random() * 0.095;
      const bh   = 0.68  + Math.random() * 0.38;
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(bw, bh, 0.27),
        bookMats[Math.floor(Math.random() * bookMats.length)]
      );
      book.position.set(bx + bw / 2, shelfY + bh / 2 + 0.03, 0.02);
      if (Math.random() > 0.82) book.rotation.z = (Math.random() - 0.5) * 0.18;
      sg.add(book);
      bx += bw + 0.004 + Math.random() * 0.018;
    }
  }

  // Top surface
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 0.38), woodMat);
  top.position.set(0, 2.33, 0);
  sg.add(top);

  sg.position.set(x, y, z);
  sg.rotation.y = rotY;
  intGroup.add(sg);
}

makeShelf(-5.2, 2.3,  -5.8);
makeShelf(-1.7, 2.3,  -6.7);
makeShelf( 1.7, 2.3,  -6.7);
makeShelf( 5.2, 2.3,  -5.8);
makeShelf(-7.5, 2.3,  -1.2,  Math.PI / 2);
makeShelf(-7.5, 2.3,   3.2,  Math.PI / 2);
makeShelf( 7.5, 2.3,  -1.2, -Math.PI / 2);

// ── Reading chairs ──
function makeChair(x, z, rotY) {
  const cg = new THREE.Group();
  const cm = mkMat(0x6b1e1e, 0.96);
  const lm = mkMat(0x3a200e, 0.82);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 0.92), cm);
  seat.position.set(0, 0.5, 0);
  cg.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.25, 0.14), cm);
  back.position.set(0, 1.22, -0.39);
  cg.add(back);

  [-0.5, 0.5].forEach(ax => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.55, 0.88), cm);
    arm.position.set(ax, 0.88, -0.02);
    cg.add(arm);
  });

  [[-0.4, -0.36], [0.4, -0.36], [-0.4, 0.36], [0.4, 0.36]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.5, 0.075), lm);
    leg.position.set(lx, 0.25, lz);
    cg.add(leg);
  });

  cg.position.set(x, 0, z);
  cg.rotation.y = rotY;
  intGroup.add(cg);
}

makeChair(-1.6, 1.5,  Math.PI * 0.12);
makeChair( 1.6, 1.5, -Math.PI * 0.12);

// ── Table ──
const table = new THREE.Mesh(
  new THREE.CylinderGeometry(0.82, 0.82, 0.065, 32),
  mkMat(0x4a2e12, 0.72)
);
table.position.set(0, 0.73, 1.0);
intGroup.add(table);

const tableLeg = new THREE.Mesh(
  new THREE.CylinderGeometry(0.048, 0.075, 0.72, 8),
  woodMat
);
tableLeg.position.set(0, 0.36, 1.0);
intGroup.add(tableLeg);

// ── Candle ──
const candle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.038, 0.038, 0.24, 8),
  mkMat(0xf0e8d0, 0.9)
);
candle.position.set(0.22, 0.875, 1.0);
intGroup.add(candle);

// candleLight is referenced in main.js animate loop for flickering
const candleLight = new THREE.PointLight(0xffaa33, 2.2, 5.5);
candleLight.position.set(0.22, 1.05, 1.0);
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
const DUST = 220;
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
