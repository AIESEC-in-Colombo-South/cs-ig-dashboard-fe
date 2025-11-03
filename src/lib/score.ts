
import type { EntityStats, Weights } from "@/types";
export const DEFAULT_WEIGHTS: Weights = { applications: 10, signups: 5, approvals: 30 };
export function computeScore(row: EntityStats, w: Weights) {
  return row.applications * w.applications + row.signups * w.signups + row.approvals * w.approvals;
}
