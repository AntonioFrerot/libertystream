/** Sons gain / perte partagés par tous les jeux (blackjack, plinko, hilo, roue). */
export function playSharedWinSound(ctx: AudioContext, dest: AudioNode): void {
  const t = ctx.currentTime;
  [659.25, 783.99].forEach((freq, index) => {
    const start = t + index * 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2000;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.048, start + 0.022);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
    osc.connect(filter).connect(gain).connect(dest);
    osc.start(start);
    osc.stop(start + 0.48);
  });
}

export function playSharedLoseSound(ctx: AudioContext, dest: AudioNode): void {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(108, t + 0.18);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.026, t + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  osc.connect(filter).connect(gain).connect(dest);
  osc.start(t);
  osc.stop(t + 0.22);
}

export type GameOutcomeSound = "win" | "lose";

export function playSharedOutcomeSound(
  ctx: AudioContext,
  dest: AudioNode,
  outcome: GameOutcomeSound,
): void {
  if (outcome === "win") {
    playSharedWinSound(ctx, dest);
    return;
  }
  playSharedLoseSound(ctx, dest);
}
