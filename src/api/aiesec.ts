import type { EntityDailySeries, EntityKey, EntityStats, Scope } from "@/types";
import { ALIGNMENT_ID_TO_ENTITY, ENTITY_ALIGNMENT_IDS, ENTITY_KEYS } from "@/constants/entities";

const BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? "").trim();
const ALIGNMENT_ID_LIST = ENTITY_KEYS.map((entity) => ENTITY_ALIGNMENT_IDS[entity]);

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  message?: string;
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

interface AlignmentApplications {
  lc_alignment_id: number;
  applications: number;
}

interface AlignmentSignups {
  lc_alignment_id: number;
  signups: number;
}

interface ApprovalTotals {
  lc_alignment_id: number;
  approvals: number;
}

type DailyMetricKey = "applications" | "signups";

type AlignmentDailyRow<K extends DailyMetricKey> = {
  date: string;
  counts: Array<{ lc_alignment_id: number } & Record<K, number>>;
};

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

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

async function request<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured. Add it to your .env file.");
  }

  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.success) {
    throw new Error(payload.message ?? "Request returned success: false");
  }

  return payload.data;
}

async function fetchAlignmentApplications(scope: Scope) {
  const params: Record<string, string | boolean> = {
    ids: ALIGNMENT_ID_LIST.join(","),
  };
  if (scope === "daily") {
    params.today = true;
  }
  return request<AlignmentApplications[]>("/alignments/applications", params);
}

async function fetchAlignmentSignups(scope: Scope) {
  const params: Record<string, string | boolean> = {
    ids: ALIGNMENT_ID_LIST.join(","),
  };
  if (scope === "daily") {
    params.today = true;
  }
  return request<AlignmentSignups[]>("/alignments/signups", params);
}

async function fetchApprovals(scope: Scope) {
  const params: Record<string, string | boolean> = {
    ids: ALIGNMENT_ID_LIST.join(","),
  };

  const attempt = async (includeToday: boolean) => {
    if (includeToday) {
      params.today = true;
    } else {
      delete params.today;
    }
    return request<ApprovalTotals[]>("/approvals", params);
  };

  if (scope !== "daily") {
    return attempt(false);
  }

  try {
    return await attempt(true);
  } catch (error) {
    console.warn("[approvals] Daily totals unavailable, falling back to all-time.", error);
    return attempt(false);
  }
}

export async function fetchEntitySnapshot(scope: Scope): Promise<EntityStats[]> {
  const [applications, signups, approvals] = await Promise.all([
    fetchAlignmentApplications(scope),
    fetchAlignmentSignups(scope),
    fetchApprovals(scope),
  ]);

  const statsMap = new Map<EntityKey, EntityStats>();
  const ensure = (entity: EntityKey) => {
    if (!statsMap.has(entity)) {
      statsMap.set(entity, { entity, applications: 0, signups: 0, approvals: 0 });
    }
    return statsMap.get(entity)!;
  };

  const assign = <K extends "applications" | "signups" | "approvals">(
    rows: Array<{ lc_alignment_id: number } & Record<K, number>>,
    key: K
  ) => {
    rows.forEach((row) => {
      const entity = ALIGNMENT_ID_TO_ENTITY[row.lc_alignment_id];
      if (!entity) return;
      ensure(entity)[key] = row[key];
    });
  };

  assign(applications, "applications");
  assign(signups, "signups");
  assign(approvals, "approvals");

  return ENTITY_KEYS.map((entity) => ensure(entity));
}

async function fetchAlignmentDaily<K extends DailyMetricKey>(
  endpoint: string,
  start: string,
  end: string
) {
  return request<AlignmentDailyRow<K>[]>(endpoint, {
    start,
    end,
    ids: ALIGNMENT_ID_LIST.join(","),
  });
}

export async function fetchWeeklySeries(weekOffset: number): Promise<EntityDailySeries[]> {
  const today = new Date();
  const weekStart = startOfWeek(today);
  weekStart.setUTCDate(weekStart.getUTCDate() - weekOffset * 7);

  const startIso = isoDate(weekStart);
  const endIso = isoDate(addDays(weekStart, 6));
  const isoSequence = Array.from({ length: 7 }, (_, idx) => isoDate(addDays(weekStart, idx)));
  const dateIndex = new Map<string, number>();
  isoSequence.forEach((iso, idx) => dateIndex.set(iso, idx));

  const [appsDaily, signupsDaily] = await Promise.all([
    fetchAlignmentDaily<"applications">("/alignments/applications/daily", startIso, endIso),
    fetchAlignmentDaily<"signups">("/alignments/signups/daily", startIso, endIso),
  ]);

  const seriesMap = new Map<EntityKey, EntityDailySeries["days"]>();
  ENTITY_KEYS.forEach((entity) => {
    seriesMap.set(
      entity,
      isoSequence.map((date) => ({
        date,
        applications: 0,
        signups: 0,
        approvals: 0,
      }))
    );
  });

  const assign = <K extends DailyMetricKey>(
    rows: AlignmentDailyRow<K>[],
    key: K
  ) => {
    rows.forEach((row) => {
      const idx = dateIndex.get(row.date);
      if (idx == null) return;
      row.counts.forEach((count) => {
        const entity = ALIGNMENT_ID_TO_ENTITY[count.lc_alignment_id];
        if (!entity) return;
        const series = seriesMap.get(entity);
        if (!series) return;
        series[idx][key] = count[key];
      });
    });
  };

  assign(appsDaily, "applications");
  assign(signupsDaily, "signups");

  return ENTITY_KEYS.map((entity) => ({
    entity,
    days: seriesMap.get(entity) ?? [],
  }));
}
