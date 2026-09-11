"use client";

import { useEffect, useState } from "react";
import {
  DESKTOP_CHICKEN_ROAD_LAYOUT,
  MOBILE_CHICKEN_ROAD_LAYOUT,
  type ChickenRoadLayout,
} from "./layout";

const DESKTOP_MQ = "(min-width: 900px)";

function pickLayout(): ChickenRoadLayout {
  if (typeof window === "undefined") return DESKTOP_CHICKEN_ROAD_LAYOUT;
  return window.matchMedia(DESKTOP_MQ).matches
    ? DESKTOP_CHICKEN_ROAD_LAYOUT
    : MOBILE_CHICKEN_ROAD_LAYOUT;
}

export function useChickenRoadLayout(): ChickenRoadLayout {
  const [layout, setLayout] = useState<ChickenRoadLayout>(DESKTOP_CHICKEN_ROAD_LAYOUT);

  useEffect(() => {
    setLayout(pickLayout());
    const mq = window.matchMedia(DESKTOP_MQ);
    const onChange = () => setLayout(pickLayout());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return layout;
}
