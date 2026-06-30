import React, { useState, useRef, useEffect } from "react";
import { AgentActivity } from "../types";
import { GeminiTag } from "./GeminiTag";

interface ActivityLogProps {
  activities: AgentActivity[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const [filter, setFilter] = useState<"ALL" | "CONFLICTS" | "COMPLETED" | "PLANNED">("ALL");
  const [showOlder, setShowOlder] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // The newest items will be at the top, but we should make sure we're viewing them
    }
  }, [activities, filter, showOlder]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "conflict":
        return "text-urgency-high";
      case "rescue":
        return "text-urgency-critical";
      case "nudge":
        return "text-urgency-medium";
      case "replan":
      case "plan":
        return "text-zinc-100";
      case "completed":
        return "text-urgency-low";
      default:
        return "text-zinc-400";
    }
  };

  const getLogBorder = (type: string) => {
    switch (type) {
      case "conflict":
        return "border-l-urgency-critical";
      case "rescue":
        return "border-l-urgency-critical";
      case "completed":
        return "border-l-urgency-low";
      case "plan":
      case "replan":
        return "border-l-blue-500";
      default:
        return "border-l-zinc-700";
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "plan":
        return "🧠";
      case "conflict":
        return "⚠";
      case "rescue":
        return "🔥";
      case "completed":
        return "✓";
      case "replan":
        return "↻";
      case "brief":
        return "📋";
      default:
        return "•";
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (filter === "ALL") return true;
    if (filter === "CONFLICTS") return act.type === "conflict";
    if (filter === "COMPLETED") return act.type === "completed";
    if (filter === "PLANNED") return act.type === "plan" || act.type === "replan";
    return true;
  });

  const now = new Date().getTime();
  const recentActivities = filteredActivities.filter((act) => (now - new Date(act.timestamp).getTime()) <= 24 * 60 * 60 * 1000).slice().reverse();
  const olderActivities = filteredActivities.filter((act) => (now - new Date(act.timestamp).getTime()) > 24 * 60 * 60 * 1000).slice().reverse();

  return (
    <div className="bg-zinc-950 border-2 border-zinc-800 p-4 h-[600px] overflow-hidden flex flex-col">
      <div className="flex justify-between items-start mb-4 border-b-2 border-zinc-800 pb-2">
        <h3 className="text-zinc-500 uppercase tracking-widest text-xs font-bold">
          Agent Activity Log
        </h3>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-mono font-bold tracking-widest shrink-0">
        {["ALL", "CONFLICTS", "COMPLETED", "PLANNED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-2 py-1 uppercase border border-zinc-800 transition-colors ${filter === tab ? "bg-zinc-100 text-zinc-950" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-2 custom-scrollbar">
        {recentActivities.length === 0 && !showOlder && (
          <div className="text-zinc-600 animate-pulse">
            Awaiting system events...
          </div>
        )}
        {recentActivities.map((act) => ( 
          <div key={act.id} className={`flex gap-2 items-start pl-2 border-l-2 ${getLogBorder(act.type)} bg-zinc-900/50 py-2 pr-2 animate-in fade-in slide-in-from-top-2 duration-300`}>
            <span className="text-zinc-500 shrink-0">
              {formatTime(act.timestamp)}
            </span>
            <span className="shrink-0 text-zinc-500">—</span>
            <span className="shrink-0">{getLogIcon(act.type)}</span>
            <span className={getLogColor(act.type)}>{act.message}</span>
          </div>
        ))}
        {olderActivities.length > 0 && (
          <div className="pt-2 pb-2">
            <button 
              onClick={() => setShowOlder(!showOlder)}
              className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-widest py-2 border-t border-zinc-800 border-dashed transition-colors"
            >
              {showOlder ? "Hide older activity" : "Show older activity"}
            </button>
          </div>
        )}
        {showOlder && olderActivities.map((act) => (
          <div key={act.id} className={`flex gap-2 items-start pl-2 border-l-2 ${getLogBorder(act.type)} bg-zinc-900/20 py-2 pr-2 opacity-60`}>
            <span className="text-zinc-500 shrink-0 line-through">
              {formatTime(act.timestamp)}
            </span>
            <span className="shrink-0 text-zinc-500">—</span>
            <span className="shrink-0">{getLogIcon(act.type)}</span>
            <span className={getLogColor(act.type)}>{act.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
