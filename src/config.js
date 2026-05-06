// ─────────────────────────────────────────
//  THE LIBRARY — config.js
//  All tunable values live here.
//  Tweak these without touching scene logic.
// ─────────────────────────────────────────

const CONFIG = {

  // ── Scroll / input ──
  WHEEL_SPEED: 0.00028,   // how much each wheel tick advances progress
  LERP_SPEED:  0.055,     // camera smoothing — lower = floatier, higher = snappier
  P_SWITCH:    0.58,      // progress threshold: walk-up ends, iso interior begins (0–1)

  // ── Exterior camera (walk-up phase) ──
  CAM_START_Z: 28,        // starting Z distance from arch
  CAM_END_Z:   1.2,       // Z when you reach the door
  CAM_HEIGHT:  1.72,      // eye height (metres)
  CAM_FOV_FAR: 64,        // FOV when far from door
  CAM_FOV_NEAR: 48,       // FOV when at door (tighter = more immersive)
  BOB_FREQ:    5.6,        // head-bob frequency
  BOB_MAX:     0.07,       // max head-bob amplitude

  // ── Isometric camera ──
  ISO_DIST:    38,         // distance from origin on each axis (equal = true iso)
  ISO_HALF:    3,          // ortho frustum half-size — controls zoom level
  ISO_TARGET:  { x: 0, y: 1.5, z: 0 }, // where the iso camera looks
  ISO_FLOAT_AMP:   0.25,   // subtle up/down float amplitude
  ISO_FLOAT_FREQ:  0.38,   // float frequency

  // ── Room dimensions ──
  ROOM_W: 16,
  ROOM_D: 14,
  ROOM_H: 7,

  // ── Lighting ──
  CANDLE_BASE:  2.0,
  CANDLE_FLICKER_1: 0.35,
  CANDLE_FLICKER_2: 0.12,

  // ── Node colours ──
  NODE_COLOR: 0xc8873a,
  NODE_EMISSIVE_MIN: 0.6,
  NODE_EMISSIVE_MAX: 1.5,
  NODE_PULSE_FREQ: 1.7,

  // ── Scene background colours ──
  BG_EXTERIOR: 0x0a0705,
  BG_INTERIOR: 0x100c08,

};
