import React from "react";

export function UrgencyBadge({ label }: { label: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" }) {
  const colors = {
    CRITICAL: "bg-urgency-critical text-zinc-950 animate-pulse",
    HIGH: "bg-urgency-high text-zinc-950",
    MEDIUM: "bg-urgency-medium text-zinc-950",
    LOW: "bg-urgency-low text-zinc-950",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-bold uppercase ${colors[label]}`}>
      {label}
    </span>
  );
}
