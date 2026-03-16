type TransitionOverlayProps = {
  visible: boolean
}

export function TransitionOverlay({ visible }: TransitionOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black transition-opacity duration-500"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    />
  )
}
