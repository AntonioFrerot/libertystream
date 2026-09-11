export function getTrafficTiming(lane: number): { duration: number; delay: number } {
  const duration = 2.5 + (lane % 4) * 0.4;
  const delay = -((lane * 1.17 + (lane % 3) * 0.65) % (duration + 0.8));
  return { duration, delay };
}
