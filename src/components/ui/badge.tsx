
import * as React from "react";
import clsx from "@/utils/clsx";

type Props = React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" };

export function Badge({ className, variant="default", ...props }: Props) {
  const map = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-900 border border-slate-200"
  };
  return <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-full text-xs", map[variant], className)} {...props} />;
}
