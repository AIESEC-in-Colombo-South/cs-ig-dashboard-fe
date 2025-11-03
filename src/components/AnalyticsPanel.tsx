import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, BarChart4, LineChart, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart as RechartsLineChart, Line } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ENTITY_KEYS, ENTITY_LABELS } from "@/constants/entities";
import type { EntityDailySeries, EntityKey } from "@/types";

const APPLICATIONS_COLOR = "#2563eb";
const SIGNUPS_COLOR = "#22c55e";

function formatDateLabel(iso: string) {
  const date = new Date(iso + "T00:00:00Z");
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function formatFullLabel(iso: string) {
  const date = new Date(iso + "T00:00:00Z");
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export interface AnalyticsPanelProps {
  data: EntityDailySeries[];
  loading: boolean;
  weekLabel: string;
  canGoForward: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  chartMode: "bar" | "trend";
  onChartModeChange: (mode: "bar" | "trend") => void;
}

export default function AnalyticsPanel({
  data,
  loading,
  weekLabel,
  canGoForward,
  onPrevWeek,
  onNextWeek,
  chartMode,
  onChartModeChange,
}: AnalyticsPanelProps) {
  const [selectedEntity, setSelectedEntity] = useState<EntityKey>(ENTITY_KEYS[0]);

  useEffect(() => {
    if (data.length > 0 && !data.find((d) => d.entity === selectedEntity)) {
      setSelectedEntity(data[0].entity);
    }
  }, [data, selectedEntity]);

  const barChartData = useMemo(() => {
    return data.map((series) => ({
      entity: ENTITY_LABELS[series.entity] ?? series.entity,
      Applications: series.days.reduce((acc, day) => acc + day.applications, 0),
      Signups: series.days.reduce((acc, day) => acc + day.signups, 0),
    }));
  }, [data]);

  const currentSeries = useMemo(() => data.find((series) => series.entity === selectedEntity), [data, selectedEntity]);

  const trendChartData = useMemo(() => {
    if (!currentSeries) return [];
    return currentSeries.days.map((day) => ({
      dayLabel: formatDateLabel(day.date),
      tooltipLabel: formatFullLabel(day.date),
      Applications: day.applications,
      Signups: day.signups,
    }));
  }, [currentSeries]);

  const totals = useMemo(() => {
    if (!currentSeries) return { applications: 0, signups: 0 };
    return {
      applications: currentSeries.days.reduce((acc, day) => acc + day.applications, 0),
      signups: currentSeries.days.reduce((acc, day) => acc + day.signups, 0),
    };
  }, [currentSeries]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">Engagement Insights</h2>
          <p className="text-sm text-slate-500">Track applications versus signups over time.</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="outline" size="sm" onClick={onPrevWeek} disabled={loading && data.length === 0} className="w-full sm:w-auto">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous week
          </Button>
          <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 shadow-inner text-center sm:text-left">{weekLabel}</div>
          <Button variant="outline" size="sm" onClick={onNextWeek} disabled={!canGoForward} className="w-full sm:w-auto">
            Next week <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:justify-start">
        <Button
          variant={chartMode === "bar" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChartModeChange("bar")}
          className="flex w-full items-center gap-2 sm:w-auto"
        >
          <BarChart4 className="h-4 w-4" /> Weekly overview
        </Button>
        <Button
          variant={chartMode === "trend" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChartModeChange("trend")}
          className="flex w-full items-center gap-2 sm:w-auto"
        >
          <LineChart className="h-4 w-4" /> Daily trend
        </Button>
      </div>

      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-6">
          {data.length === 0 && !loading ? (
            <div className="py-16 text-center text-sm text-slate-500">No activity recorded for this week yet.</div>
          ) : chartMode === "bar" ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-slate-900">Weekly totals</h3>
                <p className="text-sm text-slate-500">Compare entity level applications versus signups for the selected week.</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="entity" tick={{ fill: "#475569", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#cbd5f5" }} />
                    <Legend />
                    <Bar dataKey="Applications" fill={APPLICATIONS_COLOR} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Signups" fill={SIGNUPS_COLOR} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-slate-900">Daily breakdown</h3>
                <p className="text-sm text-slate-500">Explore the day-by-day movement for a specific entity.</p>
              </div>
              <Tabs value={selectedEntity} onValueChange={(value: string) => setSelectedEntity(value as EntityKey)}>
                <TabsList className="bg-slate-100 flex flex-wrap justify-center gap-1 sm:justify-start">
                  {data.map((series) => (
                    <TabsTrigger key={series.entity} value={series.entity}>
                      {ENTITY_LABELS[series.entity] ?? series.entity}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {data.map((series) => (
                  <TabsContent key={series.entity} value={series.entity}>
                    {selectedEntity === series.entity && (
                      <div className="space-y-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="text-xs font-semibold uppercase text-slate-500">Applications</div>
                            <div className="mt-1 text-3xl font-semibold text-slate-900 tabular-nums">{totals.applications}</div>
                            <div className="text-xs text-slate-500">Total for the week</div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="text-xs font-semibold uppercase text-slate-500">Signups</div>
                            <div className="mt-1 text-3xl font-semibold text-slate-900 tabular-nums">{totals.signups}</div>
                            <div className="text-xs text-slate-500">Total for the week</div>
                          </div>
                        </div>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={trendChartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="dayLabel" tick={{ fill: "#475569", fontSize: 12 }} />
                              <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 12 }} />
                              <Tooltip
                                formatter={(value: number, name) => [value, name]}
                                labelFormatter={(label, payload) => {
                                  const point = payload?.[0]?.payload as { tooltipLabel?: string };
                                  return point?.tooltipLabel || label;
                                }}
                                contentStyle={{ borderRadius: 12, borderColor: "#cbd5f5" }}
                              />
                              <Legend />
                              <Line type="monotone" dataKey="Applications" stroke={APPLICATIONS_COLOR} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                              <Line type="monotone" dataKey="Signups" stroke={SIGNUPS_COLOR} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
          {loading && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Updating weekly snapshot…
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
