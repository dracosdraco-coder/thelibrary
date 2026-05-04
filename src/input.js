// ─────────────────────────────────────────
//  THE LIBRARY — input.js
//  Wheel / touch scroll + cursor tracking.
//  Populates global: targetProgress, progress, mx, my
// ─────────────────────────────────────────

// ── Scroll progress state ──
let targetProgress = 0;
let progress       = 0;

// ── Mouse position (screen px) ──
let mx = window.innerWidth  / 2;
let my = window.innerHeight / 2;

// ── Wheel input ──
window.addEventListener('wheel', e => {
  e.preventDefault();
  targetProgress += e.deltaY * CONFIG.WHEEL_SPEED;
  targetProgress  = Math.max(0, Math.min(1, targetProgress));
}, { passive: false });

// ── Touch input ──
let lastTouchY = null;

window.addEventListener('touchstart', e => {
  lastTouchY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener('touchmove', e => {
  e.preventDefault();
  if (lastTouchY === null) return;
  const dy = lastTouchY - e.touches[0].clientY;
  targetProgress += dy * CONFIG.WHEEL_SPEED * 2;
  targetProgress  = Math.max(0, Math.min(1, targetProgress));
  lastTouchY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener('touchend', () => { lastTouchY = null; });

// ── Mouse tracking ──
document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

// ── Custom cursor ──
const cursorDot  = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let rx = mx, ry = my;

document.addEventListener('mousemove', e => {
  cursorDot.style.left = e.clientX + 'px';
  cursorDot.style.top  = e.clientY + 'px';
});

(function tickCursor() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(tickCursor);
})();

// ── Cursor ring sizing helpers (called from nodes.js) ──
function setCursorLarge() {
  cursorRing.style.width  = '46px';
  cursorRing.style.height = '46px';
}

function setCursorNormal() {
  cursorRing.style.width  = '30px';
  cursorRing.style.height = '30px';
}
