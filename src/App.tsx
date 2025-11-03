
import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw, Trophy, BarChart3, ClipboardList, UserPlus2, CheckCircle2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import Leaderboard from "@/components/Leaderboard";
import Scoreboard from "@/components/Scoreboard";
import SplashScreen from "@/components/SplashScreen";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import csLogo from "@/public/cs_logo.jpg";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { Scope, EntityStats, EntityDailySeries } from "@/types";
import { DEFAULT_WEIGHTS } from "@/lib/score";
import { fetchEntitySnapshot, fetchWeeklySeries } from "@/api/aiesec";
import clsx from "@/utils/clsx";
import { ENTITY_LABELS } from "@/constants/entities";

export default function App() {
  const [scope, setScope] = useState<Scope>("overall");
  const [data, setData] = useState<EntityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [metric, setMetric] = useState<keyof EntityStats>("applications");
  const [showSplash, setShowSplash] = useState(true);
  const [splashTimerDone, setSplashTimerDone] = useState(false);
  const [initialDataReady, setInitialDataReady] = useState(false);
  const [analyticsView, setAnalyticsView] = useState<"bar" | "trend">("trend");
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState<EntityDailySeries[]>([]);
  const weights = DEFAULT_WEIGHTS;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchEntitySnapshot(scope);
      setData(res);
    } catch (error) {
      console.error("Failed to load entity snapshot", error);
    } finally {
      setInitialDataReady(true); // Ensure splash only hides after first attempt.
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [scope]);
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [scope]);

  useEffect(() => {
    if (tab !== "analytics") return;
    let active = true;
    const run = async () => {
      setWeeklyLoading(true);
      try {
        const res = await fetchWeeklySeries(weekOffset);
        if (!active) return;
        setWeeklyData(res);
      } catch (error) {
        if (active) {
          console.error("Failed to load weekly analytics", error);
        }
      } finally {
        if (active) setWeeklyLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [tab, weekOffset]);

  useEffect(() => {
    if (splashTimerDone && initialDataReady) {
      setShowSplash(false);
    }
  }, [splashTimerDone, initialDataReady]);

  const weekLabel = useMemo(() => {
    const today = new Date();
    const base = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const day = base.getUTCDay();
    const diff = (day + 6) % 7;
    base.setUTCDate(base.getUTCDate() - diff - weekOffset * 7);
    const end = new Date(base);
    end.setUTCDate(base.getUTCDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${fmt(base)} – ${fmt(end)}`;
  }, [weekOffset]);

  const totals = useMemo(() => ({
    applications: data.reduce((s, r) => s + r.applications, 0),
    signups: data.reduce((s, r) => s + r.signups, 0),
    approvals: data.reduce((s, r) => s + r.approvals, 0),
  }), [data]);

  const statCards = [
    {
      key: "applications",
      title: "Applications",
      value: totals.applications,
      hint: scope === "daily" ? "Today" : "Total",
      icon: <ClipboardList className="h-5 w-5" />
    },
    {
      key: "signups",
      title: "Signups",
      value: totals.signups,
      hint: scope === "daily" ? "Today" : "Total",
      icon: <UserPlus2 className="h-5 w-5" />
    },
    {
      key: "approvals",
      title: "Approvals",
      value: totals.approvals,
      hint: scope === "daily" ? "Today" : "Total",
      icon: <CheckCircle2 className="h-5 w-5" />
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-36 -left-20 h-80 w-80 rounded-full bg-[#0A3B78]/35 blur-[140px]" />
        <div className="absolute top-1/3 right-[-140px] h-96 w-96 rounded-full bg-[#8CC641]/25 blur-[150px]" />
        <div className="absolute bottom-[-200px] left-1/3 h-[420px] w-[420px] rounded-full bg-[#1C4F9A]/30 blur-[160px]" />
      </div>
      {showSplash && <SplashScreen onDone={() => setSplashTimerDone(true)} />}

      {/* Header */}
      <header className="mx-auto max-w-6xl px-4 pt-8 sm:pt-10 md:pt-12">
        <div className="relative overflow-hidden rounded-2xl border border-[#0A3B78]/30 bg-gradient-to-r from-[#0A3B78] via-[#1354A0] to-[#0E2B5B] text-white shadow-[0_25px_70px_-35px_rgba(8,24,68,0.9)] sm:rounded-3xl">
          <div className="absolute inset-0 opacity-70 mix-blend-screen">
            <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-[#8CC641]/30 blur-[110px]" />
            <div className="absolute right-[-60px] bottom-[-80px] h-80 w-80 rounded-full bg-[#1A5FB4]/45 blur-[130px]" />
          </div>
          <div className="relative flex flex-col gap-8 px-5 py-7 text-center sm:px-6 md:flex-row md:items-center md:justify-between md:px-12 md:py-10 md:text-left">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:text-left">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-xl shadow-black/35 sm:h-20 sm:w-20">
                <img src={csLogo} alt="AIESEC CS logo" className="h-[78%] object-contain sm:h-[90%]" />
              </div>
              <div className="max-w-xl space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70 sm:text-xs md:tracking-[0.35em]">AIESEC IN COLOMBO SOUTH</p>
                <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl">Initiative Groups Dashboard</h1>
                <p className="text-sm text-white/80 md:text-base">
                  Revive. Rebuild .Reignite
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-4 items-center md:w-auto md:items-end">
              <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start md:justify-end">
                <Badge className="bg-[#8CC641] text-[#0A3B78] shadow-sm">Hackathon Live</Badge>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80 shadow-sm sm:text-xs">
                  Realtime edition · {currentYear}
                </span>
              </div>
              <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-relaxed text-white/90 shadow-inner backdrop-blur sm:text-left">
                  <div className="font-semibold text-white">Live telemetry</div>
                  <div className="text-xs uppercase tracking-wide text-white/70">Auto updates every 30 seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* View toggles */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex flex-wrap justify-center gap-1 sm:justify-start">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-white/70 p-1 backdrop-blur">
              <Button variant={scope === "overall" ? "secondary" : "ghost"} size="sm" onClick={() => setScope("overall")} className="flex-1 sm:flex-none"> <CalendarDays className="mr-1 h-4 w-4"/> Total Numbers</Button>
              <Button variant={scope === "daily" ? "secondary" : "ghost"} size="sm" onClick={() => setScope("daily")} className="flex-1 sm:flex-none"> <CalendarDays className="mr-1 h-4 w-4"/> Daily Numbers</Button>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={loading} className="w-full sm:w-auto">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading" : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {statCards.map((card) => (
            <StatCard
              key={card.key}
              title={card.title}
              value={card.value}
              hint={card.hint}
              icon={card.icon}
              loading={loading}
            />
          ))}
        </div>

        {/* Tabs content */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsContent value="home">
            {/* Leaderboard */}
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-semibold">Leaderboard</h2>
                <span className="text-xs text-slate-500">Weights: Apps ×10 · Signups ×5 · Approvals ×30</span>
              </div>
            </div>
            <Leaderboard data={data} weights={DEFAULT_WEIGHTS} />

            {/* Comparison chart */}
            <div className="mt-6 bg-white border border-slate-200 rounded-2xl">
              <div className="p-5">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-slate-600" />
                    <h3 className="font-semibold">Entity comparison</h3>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                    {(["applications", "signups", "approvals"] as (keyof EntityStats)[]).map((m) => (
                      <Button
                        key={m}
                        size="sm"
                        variant={metric === m ? "secondary" : "ghost"}
                        onClick={() => setMetric(m)}
                        className="w-full sm:w-auto"
                      >
                        {m[0].toUpperCase() + m.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.map((d) => ({
                      name: ENTITY_LABELS[d.entity] ?? d.entity,
                      Applications: d.applications,
                      Signups: d.signups,
                      Approvals: d.approvals,
                    }))}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={metric === 'applications' ? 'Applications' : metric === 'signups' ? 'Signups' : 'Approvals'} radius={[6,6,0,0]} fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scoreboard">
            <Scoreboard data={data} scope={scope} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPanel
              data={weeklyData}
              loading={weeklyLoading}
              weekLabel={weekLabel}
              canGoForward={weekOffset > 0}
              onPrevWeek={() => setWeekOffset((offset) => offset + 1)}
              onNextWeek={() => setWeekOffset((offset) => Math.max(0, offset - 1))}
              chartMode={analyticsView}
              onChartModeChange={(mode) => setAnalyticsView(mode)}
            />
          </TabsContent>
        </Tabs>

        <footer className="mt-12 border-t border-slate-200 pt-6">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-slate-500 md:flex-row md:justify-between md:text-left">
            <span>&copy; {currentYear} AIESEC in Colombo South · Initiative Groups Dashboard</span>
            <span className="text-xs text-slate-400">Live totals synced from alignments API · Horizon · SLTC · KDU</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
