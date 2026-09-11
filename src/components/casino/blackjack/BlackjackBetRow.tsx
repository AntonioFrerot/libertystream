"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { BetAmountInput } from "@/components/casino/BetAmountInput";
import { MaxBetButton } from "@/components/casino/MaxBetButton";
import { Modal } from "@/components/ui/Modal";
import { LibertyCoinIcon } from "@/components/wallet/LibertyCoinIcon";

interface BlackjackBetRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showMax?: boolean;
  onHalf: () => void;
  onDouble: () => void;
  onMax?: () => void;
  infoTitle?: string;
  infoBody?: string;
  infoBtnClass?: string;
  startWithZero?: boolean;
}

function BetLabel({
  label,
  withColon = false,
  infoTitle,
  infoBody,
  infoBtnClass,
  onInfoClick,
}: {
  label: string;
  withColon?: boolean;
  infoTitle?: string;
  infoBody?: string;
  infoBtnClass?: string;
  onInfoClick?: () => void;
}) {
  return (
    <span className="blackjack-bet-label-row">
      <span className="blackjack-bet-label-text">
        {label}
        {withColon ? " :" : ""}
      </span>
      {infoTitle && infoBody && onInfoClick && (
        <button
          type="button"
          className={`blackjack-bet-info-btn${infoBtnClass ? ` ${infoBtnClass}` : ""}`}
          onClick={onInfoClick}
          aria-label={infoTitle}
        >
          <Info className="blackjack-bet-info-icon" aria-hidden />
        </button>
      )}
    </span>
  );
}

export function BlackjackBetRow({
  label,
  value,
  onChange,
  disabled = false,
  showMax = false,
  onHalf,
  onDouble,
  onMax,
  infoTitle,
  infoBody,
  infoBtnClass,
  startWithZero = false,
}: BlackjackBetRowProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const infoLines = infoBody
    ?.split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <>
      <div className="plinko-stake-bet plinko-panel-full">
        <span className="plinko-stake-bet-heading">
          <BetLabel
            label={label}
            infoTitle={infoTitle}
            infoBody={infoBody}
            infoBtnClass={infoBtnClass}
            onInfoClick={infoTitle && infoBody ? () => setInfoOpen(true) : undefined}
          />
        </span>
        <div className="plinko-stake-bet-controls">
          <div className="plinko-stake-bet-input">
            <span className="plinko-stake-bet-label">
              <BetLabel
                label={label}
                withColon
                infoTitle={infoTitle}
                infoBody={infoBody}
                infoBtnClass={infoBtnClass}
                onInfoClick={infoTitle && infoBody ? () => setInfoOpen(true) : undefined}
              />
            </span>
            <span className="plinko-stake-bet-icon">
              <LibertyCoinIcon size="sm" />
            </span>
            <BetAmountInput
              value={value}
              onChange={onChange}
              disabled={disabled}
              startWithZero={startWithZero}
            />
          </div>
          <div className="plinko-stake-bet-quick">
            <button type="button" onClick={onHalf} disabled={disabled}>
              ½
            </button>
            <button type="button" onClick={onDouble} disabled={disabled}>
              2×
            </button>
            {showMax && onMax && <MaxBetButton onConfirm={onMax} disabled={disabled} />}
          </div>
        </div>
      </div>

      {infoTitle && infoBody && (
        <Modal open={infoOpen} onClose={() => setInfoOpen(false)} title={infoTitle}>
          <ul className="game-rules-list">
            {infoLines?.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  );
}
