
import type { EntityStats, Weights } from "@/types";
export const DEFAULT_WEIGHTS: Weights = { applications: 0.4, signups: 0.3, approvals: 0.3 };
export function computeScore(row: EntityStats, w: Weights) {
  return row.applications * w.applications + row.signups * w.signups + row.approvals * w.approvals;
}
