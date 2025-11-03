
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Logo";
import clsx from "@/utils/clsx";
import type { EntityStats, Weights } from "@/types";
import { computeScore } from "@/lib/score";
import { ENTITY_LABELS } from "@/constants/entities";

type RankedEntry = EntityStats & { score: number };

const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const podiumStyles: Record<number, { container: string; text: string; highlight: string; logo: "sm" | "md" | "lg" }> = {
  1: {
    container: "bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 text-white border-none shadow-2xl",
    text: "text-white",
    highlight: "bg-white/20 text-white border border-white/30",
    logo: "lg"
  },
  2: {
    container: "bg-blue-50 border border-blue-100 shadow-lg",
    text: "text-blue-900",
    highlight: "bg-blue-100 text-blue-900 border border-blue-200",
    logo: "md"
  },
  3: {
    container: "bg-amber-50 border border-amber-100 shadow-lg",
    text: "text-amber-900",
    highlight: "bg-amber-100 text-amber-900 border border-amber-200",
    logo: "md"
  }
};

function formatPlace(place: number) {
  if (place === 1) return "Champion";
  if (place === 2) return "Runner-up";
  if (place === 3) return "Third Place";
  const suffix = ["th", "st", "nd", "rd"][(place % 100 >> 3) === 1 ? 0 : (place % 10 <= 3 ? place % 10 : 0)];
  return `${place}${suffix || "th"} Place`;
}

function PodiumCard({ entry, place, orderClass, maxScore }: { entry: RankedEntry; place: 1 | 2 | 3; orderClass?: string; maxScore: number }) {
  const displayLabel = ENTITY_LABELS[entry.entity] ?? entry.entity;
  const styles = podiumStyles[place];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx("relative px-1 py-4 sm:px-3", orderClass)}
    >
      <Card className={clsx("overflow-hidden", styles.container)}>
        <CardContent className={clsx("p-6 sm:p-8 flex flex-col gap-5", styles.text)}>
          <div className="flex items-center gap-4">
            <Logo label={displayLabel} size={styles.logo} />
            <div className="text-left">
              <span className={clsx("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm", styles.highlight)}>
                {medals[place]} {formatPlace(place)}
              </span>
              <h3 className={clsx("mt-2 text-2xl font-semibold leading-tight", styles.text)}>{displayLabel}</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide opacity-80">Score</div>
                <div className="text-4xl font-black tabular-nums">{Math.round(entry.score)}</div>
              </div>
              <div className="text-right text-xs opacity-80 space-y-1">
                <div>Applications · <span className="tabular-nums font-semibold opacity-100">{entry.applications}</span></div>
                <div>Signups · <span className="tabular-nums font-semibold opacity-100">{entry.signups}</span></div>
                <div>Approvals · <span className="tabular-nums font-semibold opacity-100">{entry.approvals}</span></div>
              </div>
            </div>
            <div className={clsx("h-2 w-full overflow-hidden rounded-full", place === 1 ? "bg-white/30" : "bg-slate-200")}>
              <div
                className={clsx("h-full rounded-full", place === 1 ? "bg-white/80" : place === 2 ? "bg-blue-400" : "bg-amber-400")}
                style={{ width: `${Math.min(100, (entry.score / maxScore) * 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LeaderboardRow({ entry, place }: { entry: RankedEntry; place: number }) {
  const label = ENTITY_LABELS[entry.entity] ?? entry.entity;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 sm:w-2/5">
            <div className="h-10 w-10 rounded-lg bg-slate-900 text-white grid place-items-center text-sm font-semibold">{place}</div>
            <Logo label={label} size="sm" />
            <div>
              <div className="font-semibold text-slate-900">{label}</div>
              <div className="text-xs text-slate-500">Score {Math.round(entry.score)}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:flex-1">
            <div className="rounded-xl bg-slate-100 p-3 text-center">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Apps</div>
              <div className="text-lg font-semibold tabular-nums text-slate-900">{entry.applications}</div>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 text-center">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Signups</div>
              <div className="text-lg font-semibold tabular-nums text-slate-900">{entry.signups}</div>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 text-center">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Approvals</div>
              <div className="text-lg font-semibold tabular-nums text-slate-900">{entry.approvals}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Leaderboard({ data, weights }: { data: EntityStats[]; weights: Weights }) {
  const ranked: RankedEntry[] = [...data].map((r) => ({ ...r, score: computeScore(r, weights) })).sort((a, b) => b.score - a.score);
  const topThree = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const podiumLayout: Array<{ entry?: RankedEntry; place: 1 | 2 | 3; orderClass?: string }> = [
    { entry: topThree[1], place: 2, orderClass: "sm:order-1 sm:translate-y-4" },
    { entry: topThree[0], place: 1, orderClass: "sm:order-2 sm:-translate-y-8" },
    { entry: topThree[2], place: 3, orderClass: "sm:order-3 sm:translate-y-8" }
  ];

  const topScore = ranked[0]?.score || 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:gap-8 sm:grid-cols-3 sm:px-6 sm:items-end">
        {podiumLayout.map(({ entry, place, orderClass }) => {
          if (!entry) return null;
          return <PodiumCard key={entry.entity} entry={entry} place={place} orderClass={orderClass} maxScore={topScore} />;
        })}
      </div>

      {rest.length > 0 && (
        <div className="grid gap-3">
          {rest.map((entry, idx) => (
            <LeaderboardRow key={entry.entity} entry={entry} place={idx + 4} />
          ))}
        </div>
      )}
    </div>
  );
}
