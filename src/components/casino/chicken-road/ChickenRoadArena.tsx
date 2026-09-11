"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DIFFICULTY_CONFIG, formatChickenRoadMultiplier, formatLaneMultiplier, getLaneMultipliers } from "@/lib/casino/chicken-road/config";
import { getMaxFollowAnchorX, getScrollExtentWidth, getTrackOffset, CR2_VICTORY_ROLL_MS } from "@/lib/casino/chicken-road/scrollTrack";
import {
  chickenAnchor,
  finishArrivalGoldWidth,
  layoutCssVars,
  previewTrophyAnchor,
  trackWidth as computeTrackWidth,
  victoryCelebrationAnchor,
} from "@/lib/casino/chicken-road/layout";
import { getCrashHitDelayMs, crashCarHitProgress, crashCarHitTop } from "@/lib/casino/chicken-road/crash";
import { getTrafficTiming } from "@/lib/casino/chicken-road/traffic";
import { useChickenRoadLayout } from "@/lib/casino/chicken-road/useChickenRoadLayout";
import type { ChickenRoadState } from "@/lib/casino/chicken-road/types";
import { ChickenCharacter, ChickenSquashed } from "@/components/casino/chicken-road/ChickenCharacter";
import {
  getTrafficCarVariant,
  Lamppost,
  ManholeCover,
  RoadBush,
  RoadCar,
  VictoryFinishArrival,
  VictoryTrophy,
} from "@/components/casino/chicken-road/ChickenRoadAssets";

interface ChickenRoadArenaProps {
  gameState: ChickenRoadState;
  animating: boolean;
  crashAnimating: boolean;
  returningHome?: boolean;
  celebrationPhase?: "none" | "rolling" | "dancing";
  onCrashImpact?: () => void;
}

export function ChickenRoadArena({
  gameState,
  animating,
  crashAnimating,
  returningHome = false,
  celebrationPhase = "none",
  onCrashImpact,
}: ChickenRoadArenaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(gameState.currentStep);
  const prevCelebrationPhaseRef = useRef(celebrationPhase);
  const layout = useChickenRoadLayout();
  const { maxSteps } = DIFFICULTY_CONFIG[gameState.difficulty];
  const totalTrackWidth = useMemo(
    () => computeTrackWidth(maxSteps, layout),
    [maxSteps, layout],
  );

  const [crashSquashed, setCrashSquashed] = useState(false);
  const [trackOffset, setTrackOffset] = useState(0);
  const [scrollExtentWidth, setScrollExtentWidth] = useState(totalTrackWidth);
  const [trackSliding, setTrackSliding] = useState(false);
  const [carPhase, setCarPhase] = useState(0);
  const onCrashImpactRef = useRef(onCrashImpact);
  onCrashImpactRef.current = onCrashImpact;

  const laneMultipliers = useMemo(
    () => getLaneMultipliers(gameState.difficulty),
    [gameState.difficulty],
  );
  const crashCarKeyframes = useMemo(() => {
    const hitPct = Math.round(crashCarHitProgress(layout) * 1000) / 10;
    const pausePct = Math.min(hitPct + 4, 99);
    const startTop = Math.round(-54 * layout.scale);
    const endTop = layout.trackHeight + Math.round(8 * layout.scale);
    const hitTop = crashCarHitTop(layout);
    return `
      @keyframes cr2-car-crash-run {
        0% { top: ${startTop}px; }
        ${hitPct}% { top: ${hitTop}px; }
        ${pausePct}% { top: ${hitTop + Math.round(2 * layout.scale)}px; }
        100% { top: ${endTop}px; }
      }
    `;
  }, [layout]);

  const isBetting = gameState.phase === "betting";
  const isSquashed =
    crashSquashed ||
    (gameState.roundOutcome === "lost" &&
      gameState.phase === "finished" &&
      !crashAnimating &&
      !animating);
  const isDead = isSquashed;
  const crashWaiting = crashAnimating && !crashSquashed;
  const showStepBadge = gameState.phase === "playing" && gameState.currentStep > 0;
  const onSidewalk = gameState.currentStep <= 0;
  const nearFinishGoal =
    gameState.phase === "playing" && gameState.currentStep >= Math.max(1, maxSteps - 2);

  const anchor = chickenAnchor(gameState.currentStep, layout);
  const scrollPadWidth = Math.max(0, scrollExtentWidth - totalTrackWidth);
  const arrivalGoldWidth = finishArrivalGoldWidth(layout, scrollPadWidth);
  const victoryAnchor = useMemo(
    () => victoryCelebrationAnchor(maxSteps, layout),
    [maxSteps, layout],
  );
  const trophyPreviewAnchor = useMemo(
    () => previewTrophyAnchor(maxSteps, layout),
    [maxSteps, layout],
  );
  const isCelebrating = celebrationPhase === "rolling" || celebrationPhase === "dancing";
  const arrivalCelebrated = isCelebrating || gameState.currentStep >= maxSteps;
  const trophyPreviewMode =
    nearFinishGoal && gameState.currentStep < maxSteps && !isDead && !crashWaiting;
  const showTrophyOnChicken = arrivalCelebrated && !isDead && !crashWaiting;
  const showWinMultiplier =
    arrivalCelebrated &&
    (gameState.roundOutcome === "won" ||
      isCelebrating ||
      (gameState.phase === "playing" && gameState.currentStep >= maxSteps));
  const chickenPos = isCelebrating ? victoryAnchor : anchor;
  const chickenLane = gameState.currentStep;

  useEffect(() => {
    if (!crashAnimating) {
      setCrashSquashed(false);
      return;
    }

    const hitTimer = window.setTimeout(() => {
      setCrashSquashed(true);
      onCrashImpactRef.current?.();
    }, getCrashHitDelayMs(layout));

    return () => window.clearTimeout(hitTimer);
  }, [crashAnimating, layout]);

  useEffect(() => {
    if (!crashAnimating) return;
    setCarPhase((p) => p + 1);
  }, [crashAnimating, gameState.currentStep]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const viewportWidth = el.clientWidth;
    const anchorX = chickenPos.x;
    const maxAnchorX = getMaxFollowAnchorX(maxSteps, layout, totalTrackWidth);
    const extent = getScrollExtentWidth(totalTrackWidth, viewportWidth, maxAnchorX);
    setScrollExtentWidth(extent);

    const offset = getTrackOffset(viewportWidth, anchorX, totalTrackWidth, extent);
    const stepChanged = prevStepRef.current !== gameState.currentStep;
    const celebrationStarted =
      prevCelebrationPhaseRef.current !== "rolling" && celebrationPhase === "rolling";
    prevStepRef.current = gameState.currentStep;
    prevCelebrationPhaseRef.current = celebrationPhase;

    if (gameState.phase === "betting") {
      prevStepRef.current = 0;
      prevCelebrationPhaseRef.current = "none";
      setTrackSliding(false);
      setTrackOffset(0);
      setScrollExtentWidth(totalTrackWidth);
      return;
    }

    if ((stepChanged && (animating || crashAnimating)) || celebrationStarted) {
      setTrackSliding(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTrackOffset(offset);
        });
      });
      return;
    }

    if (!animating && !crashAnimating && celebrationPhase !== "rolling") {
      setTrackSliding(false);
      setTrackOffset(offset);
    }
  }, [
    gameState.currentStep,
    gameState.phase,
    animating,
    crashAnimating,
    celebrationPhase,
    chickenPos.x,
    totalTrackWidth,
    maxSteps,
    layout,
  ]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const syncExtentOnResize = () => {
      if (animating || crashAnimating || trackSliding) return;

      const viewportWidth = el.clientWidth;
      const anchorX = chickenPos.x;
      const maxAnchorX = getMaxFollowAnchorX(maxSteps, layout, totalTrackWidth);
      const extent = getScrollExtentWidth(totalTrackWidth, viewportWidth, maxAnchorX);
      setScrollExtentWidth(extent);
      setTrackOffset(getTrackOffset(viewportWidth, anchorX, totalTrackWidth, extent));
    };

    const observer = new ResizeObserver(syncExtentOnResize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    animating,
    crashAnimating,
    trackSliding,
    celebrationPhase,
    gameState.currentStep,
    gameState.phase,
    chickenPos.x,
    totalTrackWidth,
    maxSteps,
    layout,
  ]);

  useEffect(() => {
    if (!trackSliding) return;
    const ms = celebrationPhase === "rolling" ? CR2_VICTORY_ROLL_MS : 680;
    const timer = window.setTimeout(() => setTrackSliding(false), ms);
    return () => window.clearTimeout(timer);
  }, [trackSliding, trackOffset, celebrationPhase]);

  return (
    <div className="chicken-road-table-wrap plinko-board-wrap">
      <style>{crashCarKeyframes}</style>
      <div className="cr2-arena">
      <div className="cr2-road-frame">
        <div className="cr2-road-scroll" ref={scrollRef}>
          <div
            className={`cr2-road-track${trackSliding ? " cr2-road-track-sliding" : ""}${
              celebrationPhase === "rolling" ? " cr2-road-track-victory-slide" : ""
            }`}
            style={{
              width: scrollExtentWidth,
              transform: `translateX(-${trackOffset}px)`,
              ...layoutCssVars(layout),
            }}
          >
            <div className="cr2-sidewalk" style={{ width: layout.sidewalkWidth }}>
              <div className="cr2-sidewalk-tiles" aria-hidden />
              <RoadBush />
              <Lamppost />
            </div>

            {laneMultipliers.map((mult, index) => {
              const lane = index + 1;
              const passed = !isBetting && lane < gameState.currentStep;
              const current = !isBetting && lane === gameState.currentStep;
              const isCrashLane =
                gameState.roundOutcome === "lost" && lane === gameState.currentStep;
              const showGameplayCar = crashAnimating && current;
              const showTrafficCar = !showGameplayCar && lane !== chickenLane;
              const { duration: trafficDuration, delay: trafficDelay } = getTrafficTiming(lane);

              return (
                <div
                  key={lane}
                  className={`cr2-lane${passed ? " cr2-lane-passed" : ""}${
                    current ? " cr2-lane-current" : ""
                  }${isCrashLane ? " cr2-lane-crash" : ""}${
                    isCrashLane && crashSquashed ? " cr2-lane-crash-impact" : ""
                  }`}
                  style={{ width: layout.laneWidth }}
                >
                  <div className="cr2-lane-line" aria-hidden />

                  {passed && <div className="cr2-lane-barrier" aria-hidden />}

                  <ManholeCover
                    multiplier={formatLaneMultiplier(mult)}
                    passed={passed || (current && gameState.currentStep > 0)}
                    current={current}
                    laneId={lane}
                  />

                  {showGameplayCar && (
                    <div
                      key={`car-${lane}-${carPhase}`}
                      className={`cr2-car-lane${crashAnimating ? " cr2-car-crash" : ""}`}
                    >
                      <RoadCar variant={lane} />
                    </div>
                  )}

                  {showTrafficCar && (
                    <div
                      key={`traffic-${lane}`}
                      className="cr2-car-ambient"
                      style={{
                        ["--cr2-traffic-duration" as string]: `${trafficDuration}s`,
                        ["--cr2-traffic-delay" as string]: `${trafficDelay.toFixed(2)}s`,
                      }}
                    >
                      <RoadCar variant={getTrafficCarVariant(lane)} />
                    </div>
                  )}
                </div>
              );
            })}

            <div
              className={`cr2-finish-arrival${nearFinishGoal || isCelebrating ? " cr2-finish-arrival-near" : ""}${
                gameState.currentStep >= maxSteps || isCelebrating ? " cr2-finish-arrival-reached" : ""
              }`}
              style={{ width: arrivalGoldWidth }}
            >
              <div className="cr2-finish-checker" aria-hidden />

              <div
                className="cr2-finish-zone"
                style={{
                  width: arrivalGoldWidth,
                  ...layoutCssVars(layout, scrollPadWidth),
                }}
              >
                <div className="cr2-finish-zone-tiles" aria-hidden />
                <VictoryFinishArrival
                  nearGoal={nearFinishGoal}
                  dancing={celebrationPhase === "dancing"}
                  multiplierLabel={formatChickenRoadMultiplier(gameState.cumulativeMultiplier)}
                  showMultiplier={showWinMultiplier}
                  showCelebrationUi={arrivalCelebrated}
                  uiScale={layout.scale}
                />
              </div>
            </div>

            {trophyPreviewMode && (
              <div
                className="cr2-trophy-preview"
                style={{
                  left: trophyPreviewAnchor.x,
                  top: trophyPreviewAnchor.centerY,
                }}
                aria-hidden
              >
                <VictoryTrophy className="cr2-victory-trophy cr2-victory-trophy-preview" />
              </div>
            )}

            <div
              className={`cr2-chicken${onSidewalk && !isCelebrating ? " cr2-chicken-sidewalk" : " cr2-chicken-on-manhole"}${
                isDead ? " cr2-chicken-dead" : ""
              }${crashWaiting ? " cr2-chicken-crash-wait" : ""}${
                animating && !returningHome ? " cr2-chicken-jump" : ""
              }${returningHome ? " cr2-chicken-return" : ""}${
                celebrationPhase === "rolling" ? " cr2-chicken-victory-roll" : ""
              }${celebrationPhase === "dancing" ? " cr2-chicken-victory-dance" : ""}${
                !animating && !isDead && !crashWaiting && !isCelebrating ? " cr2-chicken-idle" : ""
              }`}
              style={{
                left: chickenPos.x,
                top: isDead ? layout.trackHeight / 2 : chickenPos.centerY,
                width: isDead ? layout.manholeSize : layout.chickenWidth,
                height: isDead ? layout.manholeSize : undefined,
              }}
              aria-label="Poulet"
            >
              {showStepBadge && !isDead && !crashWaiting && !isCelebrating && (
                <span className="cr2-chicken-badge">
                  {formatChickenRoadMultiplier(gameState.cumulativeMultiplier)}
                </span>
              )}
              <div className="cr2-chicken-sprite">
                {isDead ? (
                  <ChickenSquashed className="cr2-chicken-svg" />
                ) : (
                  <ChickenCharacter />
                )}
              </div>
              {showTrophyOnChicken && (
                <VictoryTrophy className="cr2-victory-trophy" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
