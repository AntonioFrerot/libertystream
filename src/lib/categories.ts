import { categories, type CategoryId } from "./data";

export function isValidCategory(id: string | null): id is CategoryId {
  if (!id) return false;
  return categories.some((c) => c.id === id);
}

export function parseCategoryParam(value: string | null): CategoryId | "all" {
  if (!value || value === "all") return "all";
  return isValidCategory(value) ? value : "all";
}
