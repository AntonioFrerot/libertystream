"use client";

import { useState } from "react";
import { getToken, type CryptoId } from "@/lib/wallet/types";
import { getCryptoIconCdnUrl, getCryptoIconUrl } from "@/lib/wallet/icons";

const SIZES = { sm: 20, md: 28 } as const;

export function CryptoIcon({ id, size = "sm" }: { id: CryptoId; size?: keyof typeof SIZES }) {
  const token = getToken(id);
  const dim = SIZES[size];
  const [src, setSrc] = useState(getCryptoIconUrl(id));

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={token.symbol}
      width={dim}
      height={dim}
      className="rounded-full flex-shrink-0 object-cover bg-transparent"
      loading="lazy"
      onError={() => {
        if (id === "ltc") return;
        if (src !== getCryptoIconCdnUrl(id)) setSrc(getCryptoIconCdnUrl(id));
      }}
    />
  );
}
