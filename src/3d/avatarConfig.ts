export const AVATAR_CONFIG = {
  // Position on arrival platform — offset so visitor walks past
  position: { x: -1.5, y: 0, z: 0 },
  // Facing toward the gallery (positive Z)
  rotation: 0,
  // Scale (may need adjusting per scan)
  scale: 1.0,
  // No verified portrait is configured. The old bundled avatar.splat contains
  // a LEGO object demo, and avatar.glb does not exist. Keep both opt-in paths
  // empty until an actual portrait has been supplied and visually checked.
  meshPath: null as string | null,
  splatPath: null as string | null,
  // Splat-specific adjustments (scans often need repositioning)
  splatOffset: { x: 0, y: 0, z: 0 },
  splatScale: 1.0,
}
