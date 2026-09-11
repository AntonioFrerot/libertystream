"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { buildBallAnimation } from "@/lib/casino/plinko/motion";
import { computePlinkoLayout } from "@/lib/casino/plinko/layout";
import { formatMultiplier, type PlinkoRows } from "@/lib/casino/plinko/multipliers";

export interface PlinkoActiveBall {
  id: string;
  path: number[];
  spawnOffset: number;
}

interface PlinkoBoardProps {
  rows: PlinkoRows;
  multipliers: number[];
  activeBalls: PlinkoActiveBall[];
  highlightBuckets: number[];
}

const MOBILE_BOARD_QUERY = "(max-width: 899px)";
const MOBILE_PLAYFIELD_SCALE = 0.924;
/** Marge de sécurité PC pour éviter que les buckets soient coupés en bas */
const DESKTOP_FIT_INSET = 10;
const BALL_HUES = [0, 28, 56, 84, 112, 140, 168, 196, 224, 252];

function ballHue(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % BALL_HUES.length;
  }
  return BALL_HUES[hash];
}

function bucketTone(mult: number, max: number): string {
  const ratio = mult / max;
  if (ratio >= 0.5) return "plinko-bucket-hot";
  if (ratio >= 0.15) return "plinko-bucket-mid";
  if (mult >= 1) return "plinko-bucket-warm";
  return "plinko-bucket-low";
}

export function PlinkoBoard({ rows, multipliers, activeBalls, highlightBuckets }: PlinkoBoardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ width: 560, height: 480 });
  const [isMobileBoard, setIsMobileBoard] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_BOARD_QUERY).matches
  );
  const [hitPegs, setHitPegs] = useState<Set<number>>(() => new Set());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animationCacheRef = useRef(new Map<string, NonNullable<ReturnType<typeof buildBallAnimation>>>());
  const pegTimersByBallRef = useRef(new Map<string, ReturnType<typeof setTimeout>[]>());

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BOARD_QUERY);
    const update = () => setIsMobileBoard(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const update = () => {
      const mobile = window.matchMedia(MOBILE_BOARD_QUERY).matches;
      if (mobile) {
        setBoardSize({
          width: node.clientWidth,
          height: node.clientHeight,
        });
        return;
      }

      const styles = getComputedStyle(node);
      const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      setBoardSize({
        width: Math.max(0, node.clientWidth - padX),
        height: Math.max(0, node.clientHeight - padY),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const layoutHeight = isMobileBoard
    ? boardSize.height
    : Math.max(0, boardSize.height - DESKTOP_FIT_INSET);

  const layout = useMemo(
    () =>
      computePlinkoLayout(
        rows,
        boardSize.width,
        isMobileBoard ? boardSize.height : layoutHeight,
        true,
        isMobileBoard ? MOBILE_PLAYFIELD_SCALE : 1,
        isMobileBoard
          ? { constrainByHeight: false, heightPadding: 4 }
          : { constrainByHeight: true, heightPadding: 10 }
      ),
    [rows, boardSize.width, boardSize.height, layoutHeight, isMobileBoard]
  );

  const ballAnimations = useMemo(() => {
    const activeIds = new Set(activeBalls.map((ball) => ball.id));

    for (const ballId of animationCacheRef.current.keys()) {
      if (!activeIds.has(ballId)) {
        animationCacheRef.current.delete(ballId);
      }
    }

    return activeBalls
      .map((ball) => {
        if (ball.path.length !== rows) return null;

        let animation = animationCacheRef.current.get(ball.id);
        if (!animation) {
          const built = buildBallAnimation(ball.path, layout, rows);
          if (built) {
            animation = built;
            animationCacheRef.current.set(ball.id, built);
          }
        }

        return animation ? { ball, animation } : null;
      })
      .filter((entry): entry is { ball: PlinkoActiveBall; animation: NonNullable<ReturnType<typeof buildBallAnimation>> } =>
        entry !== null
      );
  }, [activeBalls, layout, rows]);

  const maxMult = Math.max(...multipliers);
  const bucketFont = isMobileBoard
    ? Math.max(6, Math.min(11, Math.floor(layout.pinGap / 3.2)))
    : Math.max(7, Math.min(10, Math.floor(layout.pinGap / 3.8)));
  const ballSize = layout.pegSize + 3;

  const fitHeight = isMobileBoard ? boardSize.height : layoutHeight;
  const fitScale = Math.min(
    1,
    boardSize.width / Math.max(layout.playfieldWidth, 1),
    fitHeight / Math.max(layout.playfieldHeight, 1)
  );
  const scaledWidth = layout.playfieldWidth * fitScale;
  const scaledHeight = layout.playfieldHeight * fitScale;

  useEffect(() => {
    const activeIds = new Set(ballAnimations.map(({ ball }) => ball.id));

    ballAnimations.forEach(({ ball, animation }) => {
      if (pegTimersByBallRef.current.has(ball.id)) return;

      const ballTimers: ReturnType<typeof setTimeout>[] = [];
      const impactKeyframes = animation.pegHits.map((_, row) => 2 + row * 3);
      const durationMs = animation.duration * 1000;

      animation.pegHits.forEach((pegIdx, i) => {
        const t = animation.times[impactKeyframes[i]] ?? (i + 1) / animation.pegHits.length;
        const timer = setTimeout(() => {
          setHitPegs((prev) => new Set(prev).add(pegIdx));
          const clearTimer = setTimeout(() => {
            setHitPegs((prev) => {
              const next = new Set(prev);
              next.delete(pegIdx);
              return next;
            });
          }, 220);
          ballTimers.push(clearTimer);
          timersRef.current.push(clearTimer);
        }, t * durationMs);
        ballTimers.push(timer);
        timersRef.current.push(timer);
      });

      pegTimersByBallRef.current.set(ball.id, ballTimers);
    });

    for (const [ballId, ballTimers] of pegTimersByBallRef.current) {
      if (activeIds.has(ballId)) continue;
      ballTimers.forEach(clearTimeout);
      pegTimersByBallRef.current.delete(ballId);
    }

    if (ballAnimations.length === 0) {
      pegTimersByBallRef.current.forEach((ballTimers) => ballTimers.forEach(clearTimeout));
      pegTimersByBallRef.current.clear();
      setHitPegs(new Set());
    }
  }, [ballAnimations]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      pegTimersByBallRef.current.forEach((ballTimers) => ballTimers.forEach(clearTimeout));
      pegTimersByBallRef.current.clear();
      animationCacheRef.current.clear();
    };
  }, []);

  const boardStyle = {
    width: layout.playfieldWidth,
    height: layout.playfieldHeight,
    transform: fitScale < 1 ? `scale(${fitScale})` : undefined,
    transformOrigin: "0 0",
  } as const;

  const playfield = (
    <div className="plinko-playfield">
      {layout.pegs.map((peg, i) => (
        <span
          key={i}
          className={`plinko-peg ${hitPegs.has(i) ? "plinko-peg-hit" : ""}`}
          style={{
            width: layout.pegSize,
            height: layout.pegSize,
            left: peg.x - layout.pegSize / 2,
            top: peg.y - layout.pegSize / 2,
          }}
        />
      ))}

      {multipliers.map((mult, i) => {
        const slot = layout.buckets[i];
        if (!slot) return null;

        return (
          <div
            key={i}
            className={`plinko-bucket ${bucketTone(mult, maxMult)} ${
              highlightBuckets.includes(i) ? "plinko-bucket-active" : ""
            }`}
            style={{
              left: slot.x - slot.width / 2,
              top: slot.y,
              width: slot.width,
              height: slot.height,
              fontSize: bucketFont,
            }}
            title={formatMultiplier(mult)}
          >
            {formatMultiplier(mult)}
          </div>
        );
      })}

      {ballAnimations.map(({ ball, animation }) => (
        <motion.div
          key={ball.id}
          className="plinko-ball"
          style={{
            width: ballSize,
            height: ballSize,
            left: layout.ballOriginX + ball.spawnOffset,
            top: layout.ballOriginY,
            marginLeft: -ballSize / 2,
            filter: `hue-rotate(${ballHue(ball.id)}deg)`,
          }}
          initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
          animate={{
            x: animation.xPath,
            y: animation.yPath,
            scale: animation.scalePath,
            rotate: animation.rotatePath,
          }}
          transition={{
            duration: animation.duration,
            times: animation.times,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );

  return (
    <div ref={wrapRef} className="plinko-board-wrap">
      {isMobileBoard ? (
        <div
          className="plinko-board-scaler"
          style={{
            width: scaledWidth,
            height: scaledHeight,
          }}
        >
          <div className="plinko-board" style={boardStyle}>
            {playfield}
          </div>
        </div>
      ) : (
        <div
          className="plinko-board-scaler plinko-board-scaler-desktop"
          style={{
            width: scaledWidth,
            height: scaledHeight,
          }}
        >
          <div className="plinko-board plinko-board-desktop" style={boardStyle}>
            {playfield}
          </div>
        </div>
      )}
    </div>
  );
}
