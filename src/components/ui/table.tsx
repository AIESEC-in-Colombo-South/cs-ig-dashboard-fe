
import * as React from "react";
export function Table({ children }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className="w-full border-collapse">{children}</table>;
}
export function TableHeader({ children }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-slate-50 text-slate-600">{children}</thead>;
}
export function TableHead({ children, className }: any) {
  return <th className={"text-left text-xs font-semibold uppercase tracking-wide p-3 border-b " + (className||"")}>{children}</th>;
}
export function TableBody({ children }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody>{children}</tbody>;
}
export function TableRow({ children }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className="hover:bg-slate-50">{children}</tr>;
}
export function TableCell({ children, className }: any) {
  return <td className={"p-3 border-b text-sm " + (className||"")}>{children}</td>;
}
