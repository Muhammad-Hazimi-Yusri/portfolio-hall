type ReturnToTourButtonProps = {
  onReturn: () => void
}

export function ReturnToTourButton({ onReturn }: ReturnToTourButtonProps) {
  return (
    <button
      onClick={onReturn}
      className="walk-return"
      aria-keyshortcuts="Escape"
    >
      ← Return to portfolio <kbd aria-hidden="true">Esc</kbd>
    </button>
  )
}
