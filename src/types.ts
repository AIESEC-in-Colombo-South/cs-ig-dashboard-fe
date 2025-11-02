
export type Scope = "overall" | "daily";
export type EntityKey = "KDU" | "SLTC" | "Horizon";

export interface EntityStats {
  entity: EntityKey;
  applications: number;
  signups: number;
  approvals: number;
}

export interface Weights {
  applications: number;
  signups: number;
  approvals: number;
}

export interface DailyPoint {
  date: string;
  applications: number;
  signups: number;
  approvals: number;
}

export interface EntityDailySeries {
  entity: EntityKey;
  days: DailyPoint[];
}

// Represents the shape of the separate metric endpoints (applications, signups, approvals)
export interface EntityMetric {
  entity: EntityKey;
  value: number;
}
