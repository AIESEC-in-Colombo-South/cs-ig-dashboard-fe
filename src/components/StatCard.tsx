import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import clsx from "@/utils/clsx";

interface StatCardProps {
  title: string;
  value: number;
  hint?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export default function StatCard({ title, value, hint, icon, loading }: StatCardProps) {
  return (
    <Card className="bg-white/90 border border-slate-200 shadow-sm backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>{title}</span>
            </div>
            <div>
              {loading ? (
                <div className="h-8 w-24 rounded-lg bg-slate-200/80 animate-pulse" />
              ) : (
                <div className="text-3xl font-semibold text-slate-900 tabular-nums">{value}</div>
              )}
              {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
            </div>
          </div>
          {icon && (
            <div className={clsx("rounded-2xl bg-blue-50 text-blue-600 p-3 shadow-inner", loading && "opacity-60")}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
