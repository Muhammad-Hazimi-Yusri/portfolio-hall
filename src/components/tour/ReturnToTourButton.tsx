type ReturnToTourButtonProps = {
  onReturn: () => void
}

export function ReturnToTourButton({ onReturn }: ReturnToTourButtonProps) {
  return (
    <button
      onClick={onReturn}
      className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg
                  border border-hall-accent/40 bg-hall-surface/80 backdrop-blur-sm
                  text-hall-accent hover:bg-hall-accent/10
                  font-['Space_Grotesk',sans-serif] text-sm font-semibold`}
    >
      ← Return to portfolio
    </button>
  )
}
