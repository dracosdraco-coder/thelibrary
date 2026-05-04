// ─────────────────────────────────────────
//  THE LIBRARY — scene/nodes.js
//  Interactive amber hotspots in the iso room.
//  Add / remove nodes here as the site grows.
// ─────────────────────────────────────────

// ── Node definitions ──
//  pos:   [x, y, z] in world space
//  label: tooltip text shown on hover
//  href:  (optional) URL to navigate to on click
const NODE_DATA = [
  { pos: [-5.2, 5.0, -5.8], label: 'Collections',  href: '#collections'  },
  { pos: [ 5.2, 5.0, -5.8], label: 'Reading Room',  href: '#reading-room' },
  { pos: [ 0,   0.88,  1.0], label: 'The Table',    href: '#table'        },
  { pos: [-7.5, 4.6, -1.2], label: 'Archives',      href: '#archives'     },
  { pos: [ 7.5, 4.6, -1.2], label: 'Gallery',       href: '#gallery'      },
];

const nodeObjects = []; // meshes checked by raycaster

NODE_DATA.forEach((nd, i) => {
  // Sphere
  const nodeMat = new THREE.MeshStandardMaterial({
    color:            CONFIG.NODE_COLOR,
    emissive:         CONFIG.NODE_COLOR,
    emissiveIntensity: 1.2,
    roughness:        0.3,
    metalness:        0.5,
  });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), nodeMat);
  sphere.position.set(...nd.pos);
  sphere.userData = { label: nd.label, href: nd.href, idx: i };
  intGroup.add(sphere);
  nodeObjects.push(sphere);

  // Orbit ring
  const ringMat = new THREE.MeshStandardMaterial({
    color:            CONFIG.NODE_COLOR,
    emissive:         CONFIG.NODE_COLOR,
    emissiveIntensity: 0.5,
    transparent:      true,
    opacity:          0.55,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.013, 8, 32), ringMat);
  ring.position.set(...nd.pos);
  ring.userData = { isRing: true };
  intGroup.add(ring);

  // Point light at node
  const nLight = new THREE.PointLight(CONFIG.NODE_COLOR, 0.75, 2.2);
  nLight.position.set(...nd.pos);
  intGroup.add(nLight);
});

// ── Click handler ──
window.addEventListener('click', () => {
  if (typeof activeCamera === 'undefined') return;
  raycaster.setFromCamera(mouse2D, activeCamera);
  const hits = raycaster.intersectObjects(nodeObjects);
  if (hits.length > 0 && hits[0].object.userData.href) {
    // TODO: trigger scene transition or navigate
    console.log('Node clicked:', hits[0].object.userData.label);
    // window.location.href = hits[0].object.userData.href;
  }
});
