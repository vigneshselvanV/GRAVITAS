import React, { useState } from "react";
import { GravitasTask } from "../types";
import { UrgencyBadge } from "./UrgencyBadge";
import { formatTimeRemaining } from "../utils/time";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TaskCardProps {
  task: GravitasTask;
  onClick: () => void;
  key?: string | number;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const isCompleted = task.status === "completed";
  const opacity = isCompleted ? "opacity-50" : "opacity-100";

  let missionSuccess = 70;
  if (task.plan?.micro_steps) {
    const total = task.plan.micro_steps.length;
    let missed = 0;
    let completed = 0;

    // Simple heuristic calculation based on completed/total
    if (total > 0) {
      completed = task.plan.micro_steps.filter(
        (s) => s.status === "completed",
      ).length;
      missed = task.plan.micro_steps.filter(
        (s) => !s.completed_on_time && s.status === "completed",
      ).length; // A bit simplified
      missionSuccess = Math.max(
        0,
        Math.min(100, 70 - missed * 5 + completed * 3),
      );
    }
  }

  const progressPercent = task.plan?.micro_steps?.length
    ? Math.round(
        (task.plan.micro_steps.filter((s) => s.status === "completed").length /
          task.plan.micro_steps.length) *
          100,
      )
    : 0;

  return (
    <div
      onClick={onClick}
      className={`border-2 border-zinc-800 bg-zinc-900 p-5 cursor-pointer hover:border-zinc-500 hover:bg-zinc-800/50 transition-colors ${opacity} flex flex-col justify-between h-full group`}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-zinc-100 uppercase tracking-tight truncate pr-4">
            {task.title}
          </h3>
          <UrgencyBadge label={task.urgency_label} />
        </div>

        <div className="text-sm text-zinc-400 mb-6 line-clamp-2">
          {task.description}
        </div>
        
        {task.plan?.reasoning && (
          <div className="mb-4">
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReasoning(!showReasoning);
                }}
                className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase hover:text-zinc-300 transition-colors"
             >
                {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Why this plan
             </button>
             {showReasoning && (
               <div className="mt-2 p-3 border border-zinc-800 bg-zinc-950 text-xs text-zinc-400 font-mono space-y-1 animate-in slide-in-from-top-2 fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                  {task.plan.reasoning.factors.map((factor, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-blue-500">→</span>
                      <span>{factor}</span>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Mission Success
          </span>
          <span className="text-sm font-bold font-mono">{missionSuccess}%</span>
        </div>

        <div className="w-full bg-zinc-800 h-1 mb-4 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-zinc-100 transition-all duration-500 group-hover:bg-zinc-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs font-mono">
          <div className="text-zinc-500 uppercase">
            ETA:{" "}
            <span className="text-zinc-300 ml-1">
              {task.plan?.completion_eta
                ? new Date(task.plan.completion_eta).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "PENDING"}
            </span>
          </div>
          <div className="text-zinc-500 uppercase flex gap-2">
            <span>{formatTimeRemaining(task.deadline)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
