"use client";

import { LibertyCoinIcon } from "@/components/wallet/LibertyCoinIcon";

interface LibertyAmountValueProps {
  amount: string;
  className?: string;
  negative?: boolean;
}

export function LibertyAmountValue({ amount, className = "", negative = false }: LibertyAmountValueProps) {
  return (
    <strong className={`liberty-amount-value${className ? ` ${className}` : ""}`}>
      <LibertyCoinIcon size="sm" />
      <span>{negative ? `-${amount}` : amount}</span>
    </strong>
  );
}
