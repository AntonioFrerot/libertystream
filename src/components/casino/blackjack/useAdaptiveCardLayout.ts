"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

const CARD_BASE_W = 76;
const DESKTOP_TWO_HAND_MAX_W = 92;
const CARD_OVERLAP = 0.56;
const DESKTOP_MQ = "(min-width: 900px)";

function stackWidthFactor(cardCount: number): number {
  if (cardCount <= 1) return 1;
  return 1 + (cardCount - 1) * (1 - CARD_OVERLAP);
}

function minCardWidth(handCount: number): number {
  if (handCount >= 4) return 44;
  if (handCount >= 3) return 50;
  return 54;
}

function maxCardWidth(handCount: number, isDesktop: boolean): number {
  if (handCount === 2 && isDesktop) return DESKTOP_TWO_HAND_MAX_W;
  return CARD_BASE_W;
}

function readPx(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function computeAdaptiveCardWidth(
  containerWidth: number,
  handCount: number,
  maxCardsInHand: number,
  gapPx: number,
  containerPaddingX: number,
  handRowPaddingX: number,
  isDesktop = false,
): number {
  if (handCount <= 1 || containerWidth <= 0) return CARD_BASE_W;

  const cardsInStack = Math.max(maxCardsInHand, 2);
  const available = containerWidth - containerPaddingX;
  const slotWidth = (available - gapPx * Math.max(handCount - 1, 0)) / handCount;
  const innerSlot = Math.max(0, slotWidth - handRowPaddingX);
  const computed = Math.floor(innerSlot / stackWidthFactor(cardsInStack));
  const maxW = maxCardWidth(handCount, isDesktop);

  return Math.max(minCardWidth(handCount), Math.min(maxW, computed));
}

export function useAdaptiveCardLayout(
  containerRef: RefObject<HTMLElement | null>,
  handCount: number,
  cardCounts: number[],
  enabled: boolean,
): number | null {
  const [cardWidth, setCardWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!enabled) {
      setCardWidth(null);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      if (handCount >= 2 && window.matchMedia("(max-width: 899px)").matches) {
        setCardWidth(null);
        return;
      }

      const isDesktop = window.matchMedia(DESKTOP_MQ).matches;
      const styles = getComputedStyle(el);
      const gap = readPx(styles.columnGap) || readPx(styles.gap);
      const paddingX = readPx(styles.paddingLeft) + readPx(styles.paddingRight);

      const handRow = el.querySelector<HTMLElement>(".blackjack-hand-row");
      const handRowStyles = handRow ? getComputedStyle(handRow) : null;
      const handRowPaddingX = handRowStyles
        ? readPx(handRowStyles.paddingLeft) + readPx(handRowStyles.paddingRight)
        : 20;

      const slotWidth =
        handRow?.clientWidth ??
        (el.clientWidth - paddingX - gap * Math.max(handCount - 1, 0)) / handCount;

      const maxCards = Math.max(2, ...cardCounts, 0);
      const cardsInStack = Math.max(maxCards, 2);
      const innerSlot = Math.max(0, slotWidth - handRowPaddingX);
      const computed = Math.floor(innerSlot / stackWidthFactor(cardsInStack));
      const minW = minCardWidth(handCount);
      const maxW = maxCardWidth(handCount, isDesktop);
      const width = Math.max(minW, Math.min(maxW, computed));
      setCardWidth(width);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    const mobileMq = window.matchMedia("(max-width: 899px)");
    const desktopMq = window.matchMedia(DESKTOP_MQ);
    const onViewportChange = () => measure();
    window.addEventListener("resize", measure);
    mobileMq.addEventListener("change", onViewportChange);
    desktopMq.addEventListener("change", onViewportChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      mobileMq.removeEventListener("change", onViewportChange);
      desktopMq.removeEventListener("change", onViewportChange);
    };
  }, [containerRef, handCount, enabled, cardCounts.join(",")]);

  return cardWidth;
}
