export const AVATAR_CONFIG = {
  // Position on arrival platform — offset so visitor walks past
  position: { x: -1.5, y: 0, z: 0 },
  // Facing toward the gallery (positive Z)
  rotation: 0,
  // Scale (may need adjusting per scan)
  scale: 1.0,
  // Asset paths (relative to public/)
  meshPath: './assets/avatar/avatar.glb',
  splatPath: './assets/avatar/avatar.splat',
  // Splat-specific adjustments (scans often need repositioning)
  splatOffset: { x: 0, y: 0, z: 0 },
  splatScale: 1.0,
}
