
import React, { useMemo } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Logo from "@/components/Logo";
import { ENTITY_LABELS } from "@/constants/entities";
import type { EntityStats, Scope } from "@/types";

export default function Scoreboard({ data, scope }: { data: EntityStats[]; scope: Scope }) {
  const totals = useMemo(() => {
    const sum = (k: keyof EntityStats) => data.reduce((acc, r) => acc + (r[k] as number), 0);
    return { applications: sum("applications"), signups: sum("signups"), approvals: sum("approvals") };
  }, [data]);

  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-600" />
            <h2 className="text-xl font-semibold">Scoreboard ({scope === "overall" ? "Total Numbers" : "Daily Numbers"})</h2>
          </div>
          <div className="text-xs text-slate-500 sm:text-right">
            Totals · Apps {totals.applications} · Signups {totals.signups} · Approvals {totals.approvals}
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead className="text-right">Applications</TableHead>
                  <TableHead className="text-right">Signups</TableHead>
                  <TableHead className="text-right">Approvals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((r) => {
                  const label = ENTITY_LABELS[r.entity] ?? r.entity;
                  return (
                    <TableRow key={r.entity}>
                      <TableCell className="flex items-center gap-3">
                        <Logo label={label} />
                        <span className="font-medium">{label}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.applications}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.signups}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.approvals}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="grid gap-3 sm:hidden">
          {data.map((r) => {
            const label = ENTITY_LABELS[r.entity] ?? r.entity;
            return (
              <div key={r.entity} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Logo label={label} />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{label}</div>
                    <div className="text-xs text-slate-500">Apps {r.applications} · Signups {r.signups} · Approvals {r.approvals}</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs uppercase text-slate-500">Apps</div>
                    <div className="font-semibold tabular-nums">{r.applications}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-slate-500">Signups</div>
                    <div className="font-semibold tabular-nums">{r.signups}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-slate-500">Approvals</div>
                    <div className="font-semibold tabular-nums">{r.approvals}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
