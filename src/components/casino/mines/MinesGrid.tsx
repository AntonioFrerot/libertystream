"use client";

import { MINES_GRID_SIZE } from "@/lib/casino/mines/config";
import { isMineAt } from "@/lib/casino/mines/engine";
import type { MinesState, MinesTileStatus } from "@/lib/casino/mines/types";

interface MinesGridProps {
  gameState: MinesState;
  onReveal: (index: number) => void;
  controlsLocked: boolean;
  labels: {
    gem: string;
    mine: string;
  };
}

function tileStatus(state: MinesState, index: number): MinesTileStatus {
  if (!state.revealedTiles.includes(index)) return "hidden";
  if (isMineAt(state, index)) return "mine";
  return "gem";
}

export function MinesGrid({ gameState, onReveal, controlsLocked, labels }: MinesGridProps) {
  const showAllMines =
    gameState.phase === "finished" && gameState.roundOutcome === "lost";
  const inRound = gameState.phase === "playing";

  return (
    <div className="mines-grid-wrap">
      <div className="mines-grid" role="grid" aria-label="Grille Mines">
        {Array.from({ length: MINES_GRID_SIZE }, (_, index) => {
          const status = tileStatus(gameState, index);
          const isHiddenMine = showAllMines && isMineAt(gameState, index) && status === "hidden";
          const display = isHiddenMine ? "mine" : status;
          const canClick = inRound && !controlsLocked && status === "hidden";

          return (
            <button
              key={index}
              type="button"
              className={`mines-tile mines-tile-${display}${
                canClick ? " mines-tile-clickable" : ""
              }${isHiddenMine ? " mines-tile-revealed-loss" : ""}`}
              disabled={!canClick}
              onClick={() => onReveal(index)}
              aria-label={
                display === "gem"
                  ? labels.gem
                  : display === "mine"
                    ? labels.mine
                    : `Case ${index + 1}`
              }
            >
              {display === "gem" && <span className="mines-gem" aria-hidden />}
              {display === "mine" && <span className="mines-bomb" aria-hidden>💣</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
