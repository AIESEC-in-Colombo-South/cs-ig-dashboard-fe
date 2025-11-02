import * as React from "react";
import clsx from "@/utils/clsx";

export function Tabs({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode; }) {
  const idPrefix = React.useId();

  return (
    <div data-tabs="true">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as any, {
          __tabsValue: value,
          __onTabsChange: onValueChange,
          __tabsPrefix: idPrefix,
        });
      })}
    </div>
  );
}

export function TabsList({ className, __tabsValue, __onTabsChange, __tabsPrefix, children }: any) {
  return (
    <div
      className={clsx("inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 p-1 backdrop-blur", className)}
      role="tablist"
      aria-orientation="horizontal"
      data-tabs-list
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as any, { __tabsValue, __onTabsChange, __tabsPrefix });
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, __onTabsChange, __tabsValue, __tabsPrefix }: any) {
  const active = __tabsValue === value;
  const id = `${__tabsPrefix}-trigger-${value}`;

  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`${__tabsPrefix}-panel-${value}`}
      tabIndex={active ? 0 : -1}
      onClick={() => __onTabsChange && __onTabsChange(value)}
      className={clsx(
        "relative overflow-hidden rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
        active
          ? "text-white shadow-lg"
          : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
      )}
      data-tabs-trigger={value}
    >
      {active && <span className="absolute inset-0 rounded-xl bg-blue-600 shadow-[0_10px_30px_-12px_rgba(37,99,235,0.75)]" aria-hidden />}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function TabsContent({ value, __tabsValue, __tabsPrefix, children }: any) {
  const active = __tabsValue === value;
  return (
    <div
      id={`${__tabsPrefix}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${__tabsPrefix}-trigger-${value}`}
      hidden={!active}
      className={clsx("mt-4", !active && "hidden")}
      data-tabs-panel={value}
    >
      {active ? children : null}
    </div>
  );
}
