"use client";

const SIZES = { sm: 20, md: 26 } as const;

export function LibertyCoinIcon({ size = "sm" }: { size?: keyof typeof SIZES }) {
  const dim = SIZES[size];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/currency/liberty-coin.png"
      alt=""
      width={dim}
      height={dim}
      className="flex-shrink-0 object-contain"
      loading="lazy"
    />
  );
}
