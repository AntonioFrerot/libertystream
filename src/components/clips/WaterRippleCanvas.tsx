"use client";

import { useEffect, useRef } from "react";

interface WaterRippleCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function WaterRippleCanvas({ containerRef }: WaterRippleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    buffer1: Float32Array;
    buffer2: Float32Array;
    width: number;
    height: number;
    lastX: number;
    lastY: number;
    lastTime: number;
    tick: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d", { alpha: false });
    if (!offCtx) return;

    const damping = 0.994;
    const resolution = 4;
    const visualIntensity = 0.32;

    // LibertyStream palette
    const COL = {
      bg: { r: 30, g: 26, b: 40 },       // #1e1a28 kick-bg
      surface: { r: 42, g: 36, b: 56 },  // #2a2438 kick-surface
      accent: { r: 181, g: 123, b: 255 }, // #b57bff kick-green
      purple: { r: 168, g: 85, b: 247 },  // neon-purple
      lavender: { r: 196, g: 181, b: 253 }, // neon-cyan / lavender
    };
    let simFrame = 0;

    const initBuffers = (w: number, h: number) => {
      const simW = Math.max(32, Math.floor(w / resolution));
      const simH = Math.max(64, Math.floor(h / resolution));
      offscreen.width = simW;
      offscreen.height = simH;
      stateRef.current = {
        buffer1: new Float32Array(simW * simH),
        buffer2: new Float32Array(simW * simH),
        width: simW,
        height: simH,
        lastX: -1,
        lastY: -1,
        lastTime: 0,
        tick: 0,
      };
    };

    const resize = () => {
      const { width: w, height: h } = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initBuffers(w, h);
    };

    const disturb = (x: number, y: number, strength: number) => {
      const state = stateRef.current;
      if (!state || container.clientWidth === 0) return;
      const { buffer1, width, height } = state;
      const px = Math.floor((x / container.clientWidth) * width);
      const py = Math.floor((y / container.clientHeight) * height);
      const radius = 2;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const sx = px + dx;
          const sy = py + dy;
          if (sx <= 1 || sy <= 1 || sx >= width - 2 || sy >= height - 2) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;
          const i = sy * width + sx;
          buffer1[i] -= strength * 0.45 * (1 - dist / (radius + 0.5));
        }
      }
    };

    const simulate = () => {
      simFrame += 1;
      if (simFrame % 2 !== 0) return;

      const state = stateRef.current;
      if (!state) return;
      const { buffer1, buffer2, width, height } = state;

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const i = y * width + x;
          buffer2[i] =
            ((buffer1[i - 1] + buffer1[i + 1] + buffer1[i - width] + buffer1[i + width]) / 2 -
              buffer2[i]) *
            damping;
        }
      }

      const tmp = state.buffer1;
      state.buffer1 = state.buffer2;
      state.buffer2 = tmp;

      state.tick += 1;
      if (state.tick % 220 === 0) {
        disturb(
          (0.2 + Math.random() * 0.6) * container.clientWidth,
          (0.15 + Math.random() * 0.7) * container.clientHeight,
          6 + Math.random() * 6
        );
      }
    };

    const render = () => {
      const state = stateRef.current;
      if (!state) return;
      const { buffer1, width, height } = state;

      const imageData = offCtx.createImageData(width, height);
      const data = imageData.data;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = y * width + x;
          const wave = buffer1[i];
          const top = buffer1[i - width] ?? 0;
          const bottom = buffer1[i + width] ?? 0;
          const left = buffer1[i - 1] ?? 0;
          const right = buffer1[i + 1] ?? 0;

          const dx = left - right;
          const dy = top - bottom;
          const depth = y / height;
          const nx = x / width;

          // Base — dégradé kick-bg → kick-surface
          let r = COL.bg.r + (COL.surface.r - COL.bg.r) * depth;
          let g = COL.bg.g + (COL.surface.g - COL.bg.g) * depth;
          let b = COL.bg.b + (COL.surface.b - COL.bg.b) * depth;

          // Lueur violette douce (comme le mesh du site)
          const topGlow = Math.max(0, 1 - depth * 1.35) * 0.07;
          const edgeGlow = (1 - Math.abs(nx - 0.5) * 1.6) * 0.04;
          r += (COL.purple.r * topGlow + COL.accent.r * edgeGlow);
          g += (COL.purple.g * topGlow + COL.accent.g * edgeGlow);
          b += (COL.purple.b * topGlow + COL.accent.b * edgeGlow);

          // Ondulation — reflets violet/lavande (pas bleu eau)
          const ripple = visualIntensity * 0.022;
          r += (wave * 0.35 + dx * 1.1) * ripple;
          g += (wave * 0.18 + dy * 0.7) * ripple;
          b += (wave * 0.55 + (dx + dy) * 0.9) * ripple;

          // Specular accent kick-green
          const slope = dx * dx + dy * dy;
          const spec = Math.min(1, slope * 0.0018) * visualIntensity;
          r += spec * COL.lavender.r * 0.14;
          g += spec * COL.lavender.g * 0.12;
          b += spec * COL.accent.b * 0.18;

          const idx = i * 4;
          data[idx] = Math.min(255, Math.max(0, r));
          data[idx + 1] = Math.min(255, Math.max(0, g));
          data[idx + 2] = Math.min(255, Math.max(0, b));
          data[idx + 3] = 255;
        }
      }

      offCtx.putImageData(imageData, 0, 0);

      const displayW = container.clientWidth;
      const displayH = container.clientHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(offscreen, 0, 0, displayW, displayH);
    };

    let frameId = 0;
    const loop = () => {
      simulate();
      render();
      frameId = requestAnimationFrame(loop);
    };

    let lastDisturb = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const state = stateRef.current;
      if (!state) return;

      const now = performance.now();
      if (now - lastDisturb < 48) return;

      let strength = 35;

      if (state.lastX >= 0) {
        const vx = x - state.lastX;
        const vy = y - state.lastY;
        const dist = Math.sqrt(vx * vx + vy * vy);
        if (dist < 3) return;
        const dt = Math.max(1, now - state.lastTime);
        const speed = dist / dt;
        strength = Math.min(95, 22 + speed * 420);
      }

      disturb(x, y, strength);
      lastDisturb = now;
      state.lastX = x;
      state.lastY = y;
      state.lastTime = now;
    };

    const onPointerEnter = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      disturb(e.clientX - rect.left, e.clientY - rect.top, 55);
      if (stateRef.current) {
        stateRef.current.lastX = -1;
        stateRef.current.lastY = -1;
      }
    };

    const onPointerLeave = () => {
      if (stateRef.current) {
        stateRef.current.lastX = -1;
        stateRef.current.lastY = -1;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      disturb(e.clientX - rect.left, e.clientY - rect.top, 120);
    };

    resize();
    loop();

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerenter", onPointerEnter);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerdown", onPointerDown);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  );
}
