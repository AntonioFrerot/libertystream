import type { CardDealVariant } from "@/lib/casino/blackjack/motion";
import { playSharedOutcomeSound } from "@/lib/casino/sounds/outcomeSounds";

export type GameSoundId =
  | "bet"
  | "deal"
  | "dealHidden"
  | "hit"
  | "flip"
  | "win"
  | "lose"
  | "plinkoDrop"
  | "plinkoLand"
  | "wheelSpin"
  | "wheelStop";

const VOLUME_STORAGE_KEY = "libertystream-game-volume";
const LEGACY_VOLUME_KEY = "libertystream-blackjack-volume";
const MAX_MASTER_GAIN = 0.48;
const DEFAULT_VOLUME = 0.72;

function jitter(base: number, spread = 0.06): number {
  return base * (1 + (Math.random() - 0.5) * spread);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function readStoredVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  try {
    const raw =
      localStorage.getItem(VOLUME_STORAGE_KEY) ?? localStorage.getItem(LEGACY_VOLUME_KEY);
    if (raw == null) return DEFAULT_VOLUME;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? clamp01(parsed) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

class GameSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private volume = DEFAULT_VOLUME;
  private frictionNoise: AudioBuffer | null = null;
  private victoryDanceTimer: ReturnType<typeof setInterval> | null = null;
  private victoryDanceRunning = false;
  private victoryDanceStep = 0;

  constructor() {
    if (typeof window === "undefined") return;
    this.volume = readStoredVolume();
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(volume: number): void {
    this.volume = clamp01(volume);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(VOLUME_STORAGE_KEY, String(this.volume));
      } catch {
        /* ignore */
      }
    }
    this.applyMasterGain();
  }

  private applyMasterGain(): void {
    if (!this.masterGain) return;
    this.masterGain.gain.value = this.volume * MAX_MASTER_GAIN;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -26;
      this.compressor.knee.value = 24;
      this.compressor.ratio.value = 2.2;
      this.compressor.attack.value = 0.006;
      this.compressor.release.value = 0.16;

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
      this.applyMasterGain();
    }

    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }

    return this.ctx;
  }

  private getFrictionNoise(ctx: AudioContext, durationSec = 0.35): AudioBuffer {
    if (this.frictionNoise && this.frictionNoise.sampleRate === ctx.sampleRate) {
      return this.frictionNoise;
    }

    const length = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 2.8;
    }

    this.frictionNoise = buffer;
    return buffer;
  }

  playWin(): void {
    this.play("win");
  }

  playLose(): void {
    this.play("lose");
  }

  playVictoryDance(): void {
    if (this.victoryDanceRunning) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.volume <= 0) return;

    this.victoryDanceRunning = true;
    this.victoryDanceStep = 0;

    const bpm = 98;
    const beatSec = 60 / bpm;

    const playBar = () => {
      if (!this.victoryDanceRunning || !this.ctx || !this.masterGain) return;

      const audioCtx = this.ctx;
      const t = audioCtx.currentTime + 0.03;
      const beat = this.victoryDanceStep % 4;
      const bar = Math.floor(this.victoryDanceStep / 4);

      if (beat === 0 || beat === 2) {
        this.playDanceKick(audioCtx, t);
        this.playDanceBass(audioCtx, t, beat === 0 ? 55 : 62);
      }

      if (beat === 1 || beat === 3) {
        this.playDanceSnare(audioCtx, t);
      }

      this.playDanceHat(audioCtx, t);
      this.playDanceHat(audioCtx, t + beatSec * 0.5, true);

      if (beat === 0 && bar % 2 === 0) {
        this.playDanceStab(audioCtx, t + beatSec * 0.02);
      }

      this.victoryDanceStep += 1;
    };

    playBar();
    this.victoryDanceTimer = setInterval(playBar, beatSec * 1000);
  }

  stopVictoryDance(): void {
    this.victoryDanceRunning = false;
    this.victoryDanceStep = 0;
    if (this.victoryDanceTimer) {
      clearInterval(this.victoryDanceTimer);
      this.victoryDanceTimer = null;
    }
  }

  play(id: GameSoundId): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.volume <= 0) return;

    switch (id) {
      case "bet":
        this.playBet(ctx);
        break;
      case "deal":
        this.playCard(ctx, { intensity: 1, muffled: false, short: false });
        break;
      case "dealHidden":
        this.playCard(ctx, { intensity: 0.78, muffled: true, short: false });
        break;
      case "hit":
        this.playCard(ctx, { intensity: 0.68, muffled: false, short: true });
        break;
      case "flip":
        this.playFlip(ctx);
        break;
      case "win":
        playSharedOutcomeSound(ctx, this.masterGain!, "win");
        break;
      case "lose":
        playSharedOutcomeSound(ctx, this.masterGain!, "lose");
        break;
      case "plinkoDrop":
        this.playPlinkoDrop(ctx);
        break;
      case "plinkoLand":
        this.playPlinkoLand(ctx);
        break;
      case "wheelSpin":
        this.playWheelSpin(ctx);
        break;
      case "wheelStop":
        this.playWheelStop(ctx);
        break;
    }
  }

  playForDealVariant(variant: CardDealVariant): void {
    switch (variant) {
      case "deal-dealer-down":
        this.play("dealHidden");
        break;
      case "hit-player":
      case "hit-dealer":
        this.play("hit");
        break;
      default:
        this.play("deal");
    }
  }

  private playBet(ctx: AudioContext): void {
    const dest = this.masterGain!;
    const t = ctx.currentTime;

    [0, 0.032].forEach((offset, index) => {
      const start = t + offset;
      const body = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      body.type = "sine";
      body.frequency.setValueAtTime(jitter(index === 0 ? 880 : 720, 0.04), start);
      body.frequency.exponentialRampToValueAtTime(380, start + 0.02);
      bodyGain.gain.setValueAtTime(0.0001, start);
      bodyGain.gain.linearRampToValueAtTime(0.038, start + 0.003);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.04);
      body.connect(bodyGain).connect(dest);
      body.start(start);
      body.stop(start + 0.045);
    });
  }

  private playCard(
    ctx: AudioContext,
    opts: { intensity: number; muffled: boolean; short: boolean },
  ): void {
    const dest = this.masterGain!;
    const t = ctx.currentTime;
    const vol = opts.intensity;
    const rubDur = opts.short ? 0.078 : 0.118;

    this.cardRub(
      ctx,
      dest,
      t,
      rubDur,
      vol * (opts.muffled ? 0.09 : 0.11),
      opts.muffled ? 420 : 520,
      opts.muffled ? 1180 : 1680,
      opts.muffled ? 0.28 : 0.38,
    );

    this.cardRub(
      ctx,
      dest,
      t + 0.012,
      rubDur * 0.85,
      vol * 0.045,
      jitter(920, 0.08),
      jitter(2100, 0.1),
      0.22,
    );

    if (!opts.muffled) {
      this.cardRub(ctx, dest, t + 0.004, rubDur * 1.05, vol * 0.028, 180, 640, 0.55);
    }

    const landStart = t + (opts.short ? 0.042 : 0.062);
    const land = ctx.createOscillator();
    const landGain = ctx.createGain();
    const landFilter = ctx.createBiquadFilter();
    landFilter.type = "lowpass";
    landFilter.frequency.value = 280;

    land.type = "sine";
    land.frequency.setValueAtTime(jitter(88, 0.04), landStart);
    land.frequency.exponentialRampToValueAtTime(58, landStart + 0.09);
    landGain.gain.setValueAtTime(0.0001, landStart);
    landGain.gain.linearRampToValueAtTime(vol * 0.055, landStart + 0.008);
    landGain.gain.exponentialRampToValueAtTime(0.0001, landStart + 0.11);

    land.connect(landFilter).connect(landGain).connect(dest);
    land.start(landStart);
    land.stop(landStart + 0.12);
  }

  private playFlip(ctx: AudioContext): void {
    const dest = this.masterGain!;
    const t = ctx.currentTime;

    this.cardRub(ctx, dest, t, 0.14, 0.095, 680, 2400, 0.32);
    this.cardRub(ctx, dest, t + 0.018, 0.1, 0.048, 320, 980, 0.48);

    const settle = t + 0.1;
    const land = ctx.createOscillator();
    const landGain = ctx.createGain();
    land.type = "sine";
    land.frequency.setValueAtTime(jitter(120, 0.03), settle);
    land.frequency.exponentialRampToValueAtTime(72, settle + 0.07);
    landGain.gain.setValueAtTime(0.0001, settle);
    landGain.gain.linearRampToValueAtTime(0.028, settle + 0.006);
    landGain.gain.exponentialRampToValueAtTime(0.0001, settle + 0.09);
    land.connect(landGain).connect(dest);
    land.start(settle);
    land.stop(settle + 0.1);
  }

  private playPlinkoDrop(ctx: AudioContext): void {
    const dest = this.masterGain!;
    const t = ctx.currentTime;

    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.type = "sine";
    pop.frequency.setValueAtTime(jitter(520, 0.06), t);
    pop.frequency.exponentialRampToValueAtTime(240, t + 0.06);
    popGain.gain.setValueAtTime(0.0001, t);
    popGain.gain.linearRampToValueAtTime(0.034, t + 0.004);
    popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    pop.connect(popGain).connect(dest);
    pop.start(t);
    pop.stop(t + 0.075);

    this.cardRub(ctx, dest, t + 0.008, 0.09, 0.042, 880, 2200, 0.26);
  }

  private playPlinkoLand(ctx: AudioContext): void {
    const dest = this.masterGain!;
    const t = ctx.currentTime;

    const land = ctx.createOscillator();
    const landGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    land.type = "sine";
    land.frequency.setValueAtTime(jitter(210, 0.05), t);
    land.frequency.exponentialRampToValueAtTime(130, t + 0.08);
    landGain.gain.setValueAtTime(0.0001, t);
    landGain.gain.linearRampToValueAtTime(0.04, t + 0.006);
    landGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    land.connect(filter).connect(landGain).connect(dest);
    land.start(t);
    land.stop(t + 0.11);

    this.cardRub(ctx, dest, t, 0.05, 0.022, 1200, 2800, 0.2);
  }

  private playWheelSpin(ctx: AudioContext): void {
    const dest = this.masterGain!;
    const t = ctx.currentTime;

    this.cardRub(ctx, dest, t, 0.22, 0.055, 280, 920, 0.42);

    const whoosh = ctx.createOscillator();
    const whooshGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 320;
    filter.Q.value = 0.6;
    whoosh.type = "sine";
    whoosh.frequency.setValueAtTime(180, t);
    whoosh.frequency.exponentialRampToValueAtTime(420, t + 0.35);
    whooshGain.gain.setValueAtTime(0.0001, t);
    whooshGain.gain.linearRampToValueAtTime(0.028, t + 0.04);
    whooshGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    whoosh.connect(filter).connect(whooshGain).connect(dest);
    whoosh.start(t);
    whoosh.stop(t + 0.4);
  }

  private playWheelStop(ctx: AudioContext): void {
    const dest = this.masterGain!;
    const t = ctx.currentTime;

    const tick = ctx.createOscillator();
    const tickGain = ctx.createGain();
    tick.type = "triangle";
    tick.frequency.setValueAtTime(jitter(680, 0.04), t);
    tick.frequency.exponentialRampToValueAtTime(420, t + 0.04);
    tickGain.gain.setValueAtTime(0.0001, t);
    tickGain.gain.linearRampToValueAtTime(0.036, t + 0.003);
    tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    tick.connect(tickGain).connect(dest);
    tick.start(t);
    tick.stop(t + 0.065);
  }

  private playDanceKick(ctx: AudioContext, start: number): void {
    const dest = this.masterGain!;
    const kick = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kick.type = "sine";
    kick.frequency.setValueAtTime(150, start);
    kick.frequency.exponentialRampToValueAtTime(42, start + 0.12);
    kickGain.gain.setValueAtTime(0.0001, start);
    kickGain.gain.linearRampToValueAtTime(0.11, start + 0.004);
    kickGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    kick.connect(kickGain).connect(dest);
    kick.start(start);
    kick.stop(start + 0.2);
  }

  private playDanceSnare(ctx: AudioContext, start: number): void {
    const dest = this.masterGain!;
    this.cardRub(ctx, dest, start, 0.07, 0.075, 680, 2400, 0.35);

    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = "triangle";
    snap.frequency.setValueAtTime(220, start);
    snap.frequency.exponentialRampToValueAtTime(140, start + 0.05);
    snapGain.gain.setValueAtTime(0.0001, start);
    snapGain.gain.linearRampToValueAtTime(0.042, start + 0.003);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
    snap.connect(snapGain).connect(dest);
    snap.start(start);
    snap.stop(start + 0.085);
  }

  private playDanceHat(ctx: AudioContext, start: number, accent = false): void {
    const dest = this.masterGain!;
    this.cardRub(
      ctx,
      dest,
      start,
      accent ? 0.028 : 0.022,
      accent ? 0.022 : 0.014,
      accent ? 9200 : 7600,
      accent ? 14000 : 11800,
      0.9,
    );
  }

  private playDanceBass(ctx: AudioContext, start: number, freq: number): void {
    const dest = this.masterGain!;
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 280;
    bass.type = "square";
    bass.frequency.setValueAtTime(freq, start);
    bassGain.gain.setValueAtTime(0.0001, start);
    bassGain.gain.linearRampToValueAtTime(0.034, start + 0.012);
    bassGain.gain.setValueAtTime(0.028, start + 0.08);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    bass.connect(filter).connect(bassGain).connect(dest);
    bass.start(start);
    bass.stop(start + 0.24);
  }

  private playDanceStab(ctx: AudioContext, start: number): void {
    const dest = this.masterGain!;
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      const stab = ctx.createOscillator();
      const stabGain = ctx.createGain();
      const offset = index * 0.004;
      stab.type = "sawtooth";
      stab.frequency.setValueAtTime(freq, start + offset);
      stabGain.gain.setValueAtTime(0.0001, start + offset);
      stabGain.gain.linearRampToValueAtTime(0.012, start + offset + 0.006);
      stabGain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.14);
      stab.connect(stabGain).connect(dest);
      stab.start(start + offset);
      stab.stop(start + offset + 0.16);
    });
  }

  private cardRub(
    ctx: AudioContext,
    dest: AudioNode,
    start: number,
    duration: number,
    volume: number,
    freqFrom: number,
    freqTo: number,
    q: number,
  ): void {
    const source = ctx.createBufferSource();
    source.buffer = this.getFrictionNoise(ctx, Math.max(duration, 0.08));
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = q;
    filter.frequency.setValueAtTime(freqFrom, start);
    filter.frequency.exponentialRampToValueAtTime(Math.max(90, freqTo), start + duration * 0.88);

    const gain = ctx.createGain();
    const attack = Math.min(0.018, duration * 0.22);
    const sustainEnd = start + duration * 0.55;
    const releaseEnd = start + duration;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + attack);
    gain.gain.linearRampToValueAtTime(volume * 0.82, sustainEnd);
    gain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

    source.connect(filter).connect(gain).connect(dest);
    source.start(start);
    source.stop(releaseEnd + 0.015);
  }
}

export const gameSounds = new GameSoundEngine();
