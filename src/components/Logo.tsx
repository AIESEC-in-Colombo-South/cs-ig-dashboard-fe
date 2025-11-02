
import React, { useMemo } from "react";
import clsx from "@/utils/clsx";

type LogoSize = "sm" | "md" | "lg";

const paletteMap: Record<string, { bg: string; text: string; border: string }> = {
  kdu: { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-200" },
  sltc: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-200" },
  horizon: { bg: "bg-indigo-100", text: "text-indigo-900", border: "border-indigo-200" },
};

const sizeMap: Record<LogoSize, string> = {
  sm: "h-11 w-11 text-base",
  md: "h-14 w-14 text-lg",
  lg: "h-16 w-16 text-xl",
};

export default function Logo({ label, size = "md" }: { label: string; size?: LogoSize }) {
  const initials = useMemo(() => label.split(" ").map((w) => w[0]).join("").toUpperCase(), [label]);
  const paletteKey = label.trim().toLowerCase().replace(/\s+/g, "");
  const palette = paletteMap[paletteKey] ?? { bg: "bg-slate-100", text: "text-slate-900", border: "border-slate-200" };

  return (
    <div className={clsx(
      "grid place-items-center rounded-xl border-2 font-bold uppercase shadow-sm",
      palette.bg,
      palette.text,
      palette.border,
      sizeMap[size] || sizeMap.md
    )}>
      {initials}
    </div>
  );
}
