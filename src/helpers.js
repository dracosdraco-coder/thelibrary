// ─────────────────────────────────────────
//  THE LIBRARY — config.js  (append: shared helpers)
//  mkMat is used by exterior.js, interior.js, nodes.js
//  so it must be defined before those files load.
// ─────────────────────────────────────────

// Shorthand MeshStandardMaterial factory
function mkMat(color, rough = 0.9, metal = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}
