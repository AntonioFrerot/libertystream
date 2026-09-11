"use client";

import { useMemo } from "react";
import {
  getStakeMultiplierAccent,
  getStakeMultiplierColor,
  getStakeMultiplierTextColor,
  getWheelLayout,
  type WheelRisk,
  type WheelSegmentCount,
} from "@/lib/casino/wheel/config";
import type { WheelSegment } from "@/components/wheel/FortuneWheel";

export function buildWheelSegments(
  risk: WheelRisk,
  count: WheelSegmentCount,
): WheelSegment[] {
  const multipliers = getWheelLayout(risk, count);
  const max = Math.max(...multipliers);
  return multipliers.map((multiplier, index) => ({
    index,
    multiplier,
    color: getStakeMultiplierColor(multiplier, max),
    accent: getStakeMultiplierAccent(multiplier),
    textColor: getStakeMultiplierTextColor(multiplier),
  }));
}

export function useWheelSegments(risk: WheelRisk, count: WheelSegmentCount) {
  const segments = useMemo(() => buildWheelSegments(risk, count), [risk, count]);
  const multipliers = useMemo(
    () => segments.map((segment) => segment.multiplier),
    [segments],
  );

  return { segments, multipliers };
}
