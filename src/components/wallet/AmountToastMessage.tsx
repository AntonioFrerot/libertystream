"use client";

import type { ReactNode } from "react";
import { LibertyCoinIcon } from "@/components/wallet/LibertyCoinIcon";

/** Toast gain/perte : insère l'icône LibertyCoin à la place de {amount}. */
export function amountToastMessage(
  template: string,
  values: Record<string, string>,
): ReactNode {
  const amount = values.amount;
  const amountToken = "{amount}";

  if (!amount || !template.includes(amountToken)) {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  }

  const before = template
    .slice(0, template.indexOf(amountToken))
    .replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  const after = template
    .slice(template.indexOf(amountToken) + amountToken.length)
    .replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");

  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      {before}
      <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
        <LibertyCoinIcon size="sm" />
        {amount}
      </span>
      {after}
    </span>
  );
}
