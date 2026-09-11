import type { WalletBalances } from "@/lib/wallet/types";

const LIBERTY_GRANT_AMOUNT = 500;

function libertyGrantKey(kind: string, userId: string) {
  return `libertystream-grant-liberty-${kind}-${userId}`;
}

export function isAntonioAccount(username: string): boolean {
  return username.toLowerCase() === "antonio";
}

export function isDemoAccount(userId: string): boolean {
  return userId === "demo-1";
}

function applyOneTimeLibertyGrant(
  userId: string,
  kind: string,
  balances: WalletBalances
): WalletBalances {
  if (typeof window === "undefined") return balances;
  const key = libertyGrantKey(kind, userId);
  if (localStorage.getItem(key)) return balances;

  localStorage.setItem(key, "1");
  return { ...balances, liberty: LIBERTY_GRANT_AMOUNT };
}

/** Crédits uniques de 500 LibertyCoins (comptes antonio et démo). */
export function applyLibertyGrants(
  userId: string,
  username: string,
  balances: WalletBalances
): WalletBalances {
  let next = balances;
  if (isAntonioAccount(username)) {
    next = applyOneTimeLibertyGrant(userId, "antonio", next);
  }
  if (isDemoAccount(userId)) {
    next = applyOneTimeLibertyGrant(userId, "demo", next);
  }
  return next;
}
