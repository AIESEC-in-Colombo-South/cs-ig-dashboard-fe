
import type { Scope, EntityKey, EntityStats, EntityDailySeries, DailyPoint, EntityMetric } from "@/types";
import { ENTITY_KEYS } from "@/constants/entities";

function seededRandom(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => ((h = (h + 0x6d2b79f5) | 0), ((h ^ (h >>> 15)) >>> 0) / 4294967296);
}

// Emulates API latency to mimic production behavior.
async function simulateLatency(ms = 420) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

const ENTITIES: EntityKey[] = ENTITY_KEYS;

function buildMetric(scope: Scope, metric: "applications" | "signups" | "approvals", entity: EntityKey, dayKey: string): number {
  const baseMap = {
    applications: scope === "overall" ? 105 : 14,
    signups: scope === "overall" ? 86 : 10,
    approvals: scope === "overall" ? 62 : 6,
  } as const;
  const spread = scope === "overall" ? 38 : 6;
  const rnd = seededRandom(`${scope}:${metric}:${entity}:${dayKey}`);
  return Math.max(0, Math.round(baseMap[metric] + (rnd() - 0.5) * 2 * spread));
}

export async function fetchApplications(scope: Scope): Promise<EntityMetric[]> {
  // TODO: Replace with GET /applications once the backend is ready.
  await simulateLatency();
  const now = new Date();
  const dayKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  return ENTITIES.map((entity) => ({ entity, value: buildMetric(scope, "applications", entity, dayKey) }));
}

export async function fetchSignups(scope: Scope): Promise<EntityMetric[]> {
  // TODO: Replace with GET /signups once the backend is ready.
  await simulateLatency();
  const now = new Date();
  const dayKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  return ENTITIES.map((entity) => ({ entity, value: buildMetric(scope, "signups", entity, dayKey) }));
}

export async function fetchApprovals(scope: Scope): Promise<EntityMetric[]> {
  // TODO: Replace with GET /approvals once the backend is ready.
  await simulateLatency();
  const now = new Date();
  const dayKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
  return ENTITIES.map((entity) => ({ entity, value: buildMetric(scope, "approvals", entity, dayKey) }));
}

export async function fetchEntitySnapshot(scope: Scope): Promise<EntityStats[]> {
  // TODO: Replace with real aggregated endpoint or keep Promise.all with production services.
  const [apps, signups, approvals] = await Promise.all([
    fetchApplications(scope),
    fetchSignups(scope),
    fetchApprovals(scope),
  ]);

  const map = new Map<EntityKey, EntityStats>();
  const ensure = (entity: EntityKey) => {
    if (!map.has(entity)) {
      map.set(entity, { entity, applications: 0, signups: 0, approvals: 0 });
    }
    return map.get(entity)!;
  };

  apps.forEach(({ entity, value }) => { ensure(entity).applications = value; });
  signups.forEach(({ entity, value }) => { ensure(entity).signups = value; });
  approvals.forEach(({ entity, value }) => { ensure(entity).approvals = value; });

  return ENTITIES.map((entity) => ensure(entity));
}

function startOfWeek(date: Date) {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = result.getUTCDay();
  const diff = (day + 6) % 7; // convert Sunday=0 to Monday=0
  result.setUTCDate(result.getUTCDate() - diff);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export async function fetchWeeklySeries(weekOffset: number): Promise<EntityDailySeries[]> {
  // TODO: Replace with GET /analytics/weekly?offset={weekOffset} when available.
  await simulateLatency();
  const today = new Date();
  const weekStart = startOfWeek(today);
  weekStart.setUTCDate(weekStart.getUTCDate() - weekOffset * 7);

  const days: DailyPoint[][] = ENTITIES.map(() => []);

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const currentDate = addDays(weekStart, dayIndex);
    const iso = currentDate.toISOString().slice(0, 10);

    ENTITIES.forEach((entity, entityIndex) => {
      const rnd = seededRandom(`weekly:${entity}:${iso}`);
      const base = 40 + entityIndex * 6;
      const applications = Math.max(0, Math.round(base + rnd() * 30));
      const signups = Math.max(0, Math.round(base * 0.8 + rnd() * 18));
      const approvals = Math.max(0, Math.round(base * 0.45 + rnd() * 14));
      days[entityIndex].push({
        date: iso,
        applications,
        signups,
        approvals,
      });
    });
  }

  return ENTITIES.map((entity, idx) => ({ entity, days: days[idx] }));
}
