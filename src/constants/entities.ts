import type { EntityKey } from "@/types";

export const ENTITY_KEYS: EntityKey[] = ["Horizon", "SLTC", "KDU"];

export const ENTITY_ALIGNMENT_IDS: Record<EntityKey, number> = {
  Horizon: 39880,
  SLTC: 13106,
  KDU: 10231,
};

export const ENTITY_LABELS: Record<EntityKey, string> = {
  Horizon: "Horizon Campus",
  SLTC: "SLTC",
  KDU: "KDU",
};

export const ALIGNMENT_ID_TO_ENTITY: Record<number, EntityKey> = Object.entries(ENTITY_ALIGNMENT_IDS).reduce(
  (acc, [entity, id]) => {
    acc[id] = entity as EntityKey;
    return acc;
  },
  {} as Record<number, EntityKey>
);
