"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { CardDealVariant } from "@/lib/casino/blackjack/motion";
import { gameSounds, type GameSoundId } from "@/lib/casino/sounds/gameSounds";

const SOUND_CHANGE_EVENT = "game-sound-change";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(SOUND_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(SOUND_CHANGE_EVENT, onStoreChange);
}

function getVolumeSnapshot(): number {
  return gameSounds.getVolume();
}

function notifySoundChange(): void {
  window.dispatchEvent(new Event(SOUND_CHANGE_EVENT));
}

export function useGameSounds() {
  const volume = useSyncExternalStore(subscribe, getVolumeSnapshot, () => 0.72);

  const play = useCallback((id: GameSoundId) => {
    gameSounds.play(id);
  }, []);

  const playForDealVariant = useCallback((variant: CardDealVariant) => {
    gameSounds.playForDealVariant(variant);
  }, []);

  const playWin = useCallback(() => {
    gameSounds.playWin();
  }, []);

  const playLose = useCallback(() => {
    gameSounds.playLose();
  }, []);

  const playVictoryDance = useCallback(() => {
    gameSounds.playVictoryDance();
  }, []);

  const stopVictoryDance = useCallback(() => {
    gameSounds.stopVictoryDance();
  }, []);

  const setVolume = useCallback((value: number) => {
    gameSounds.setVolume(value);
    notifySoundChange();
  }, []);

  return {
    volume,
    play,
    playWin,
    playLose,
    playVictoryDance,
    stopVictoryDance,
    playForDealVariant,
    setVolume,
  };
}
