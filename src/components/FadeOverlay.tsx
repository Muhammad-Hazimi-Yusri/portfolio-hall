type FadeOverlayProps = {
  visible: boolean
}

export function FadeOverlay({ visible }: FadeOverlayProps) {
  return (
    <div
      className={`fixed inset-0 bg-black z-40 pointer-events-none transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}
