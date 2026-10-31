"use client";

interface MaxBetButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
}

export function MaxBetButton({ onConfirm, disabled = false }: MaxBetButtonProps) {
  return (
    <button type="button" disabled={disabled} onClick={onConfirm}>
      Max
    </button>
  );
}
