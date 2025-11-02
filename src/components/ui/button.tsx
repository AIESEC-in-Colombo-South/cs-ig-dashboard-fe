
import * as React from "react";
import clsx from "@/utils/clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md";
};

export function Button({ className, variant="default", size="md", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 ease-out transform shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:scale-[1.015] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-[.97] disabled:opacity-60 disabled:pointer-events-none";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm"
  } as const;
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 hover:ring-2 hover:ring-blue-200/80 focus-visible:outline-blue-300",
    secondary: "bg-blue-100 text-blue-900 hover:bg-blue-200 hover:ring-2 hover:ring-blue-200/60 focus-visible:outline-blue-200",
    outline: "border border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-400 hover:ring-2 hover:ring-slate-200 focus-visible:outline-slate-300",
    ghost: "text-slate-700 hover:bg-slate-100 hover:ring-2 hover:ring-slate-200 focus-visible:outline-slate-200"
  } as const;
  return <button className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
}
