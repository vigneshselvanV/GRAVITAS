import React from "react";
import { GravitasTask } from "../types";
import { formatTimeRemaining } from "../utils/time";

interface MissionControlPanelProps {
  tasks: GravitasTask[];
}

export function MissionControlPanel({ tasks }: MissionControlPanelProps) {
  const activeTasks = tasks.filter((t) => t.status !== "completed");

  // 1. Mission Success
  let missionSuccess = 70;
  let previousSuccess = 65; // Mocked previous value for trend
  if (activeTasks.length > 0) {
    let totalScore = 0;
    activeTasks.forEach((task) => {
      let taskScore = 70;
      if (task.plan?.micro_steps) {
        const total = task.plan.micro_steps.length;
        if (total > 0) {
          const completed = task.plan.micro_steps.filter(
            (s) => s.status === "completed",
          ).length;
          const missed = task.plan.micro_steps.filter(
            (s) => !s.completed_on_time && s.status === "completed",
          ).length;
          taskScore = Math.max(
            0,
            Math.min(100, 70 - missed * 5 + completed * 3),
          );
        }
      }
      totalScore += taskScore;
    });
    missionSuccess = Math.round(totalScore / activeTasks.length);
  } else if (tasks.length > 0) {
    missionSuccess = 100; // All tasks completed
  }

  const successDelta = missionSuccess - previousSuccess;

  // 2. Burnout Risk
  let totalEffortToday = 0;
  const now = new Date().getTime();
  activeTasks.forEach((t) => {
    if (t.deadline) {
      const deadlineTime = new Date(t.deadline).getTime();
      const hoursUntilDeadline = (deadlineTime - now) / (1000 * 60 * 60);
      if (hoursUntilDeadline > 0 && hoursUntilDeadline <= 24) {
        totalEffortToday += t.effort_hours;
      }
    }
  });
  const burnoutRisk = Math.min(100, Math.round((totalEffortToday / 12) * 100));

  // 3. Focus Today
  let focusTodayMins = 0;
  activeTasks.forEach((t) => {
    if (t.plan?.focus_blocks) {
      t.plan.focus_blocks.forEach((b) => {
        // sum up all focus blocks for active tasks
        focusTodayMins += b.duration_minutes;
      });
    }
  });
  const focusHours = Math.floor(focusTodayMins / 60);
  const focusMins = focusTodayMins % 60;
  const focusTodayLabel = `${focusHours}h ${focusMins}m`;

  // 4. Next Action
  let nextAction = "None";
  if (activeTasks.length > 0) {
    // Find highest priority task
    const topTask = [...activeTasks].sort(
      (a, b) => b.priority_score - a.priority_score,
    )[0];
    const pendingStep = topTask.plan?.micro_steps?.find(
      (s) => s.status !== "completed",
    );
    nextAction = pendingStep ? pendingStep.title : `Complete ${topTask.title}`;
  }

  // 5. Time Until Failure
  let timeUntilFailure = "--";
  let isFailureImminent = false;
  const criticalTasks = activeTasks.filter(
    (t) => t.urgency_label === "CRITICAL" && t.deadline,
  );
  
  const determineFailureTime = (task: GravitasTask) => {
    const deadlineTime = new Date(task.deadline!).getTime();
    if ((deadlineTime - now) < (24 * 60 * 60 * 1000)) {
       isFailureImminent = true;
    }
    return formatTimeRemaining(task.deadline!);
  }

  if (criticalTasks.length > 0) {
    const nearestCritical = criticalTasks.sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    )[0];
    timeUntilFailure = determineFailureTime(nearestCritical);
  } else if (activeTasks.filter((t) => t.deadline).length > 0) {
    const nearest = activeTasks
      .filter((t) => t.deadline)
      .sort(
        (a, b) =>
          new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
      )[0];
    timeUntilFailure = determineFailureTime(nearest);
  }

  // Colors
  const getSuccessColor = (val: number) => {
    if (val >= 80) return "text-urgency-low";
    if (val >= 50) return "text-urgency-medium";
    return "text-urgency-critical";
  };

  const getBurnoutColor = (val: number) => {
    if (val >= 80) return "text-urgency-critical";
    if (val >= 50) return "text-urgency-medium";
    return "text-urgency-low";
  };

  return (
    <div className="bg-zinc-950 border-2 border-zinc-800 p-4 mb-8">
      <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-4 border-b-2 border-zinc-800 pb-2">
        Mission Control Panel
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="border border-zinc-800 p-3 flex flex-col justify-between transition-transform hover:scale-[1.02] duration-200">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 flex items-center justify-between">
            <span>Mission Success</span>
            {successDelta !== 0 && (
              <span className={`text-[10px] ${successDelta > 0 ? "text-urgency-low" : "text-urgency-critical"}`}>
                {successDelta > 0 ? '↑' : '↓'} {Math.abs(successDelta)}%
              </span>
            )}
          </div>
          <div
            className={`text-3xl font-mono font-bold ${getSuccessColor(missionSuccess)}`}
          >
            {missionSuccess}%
          </div>
        </div>

        <div className="border border-zinc-800 p-3 flex flex-col justify-between transition-transform hover:scale-[1.02] duration-200">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">
            Burnout Risk
          </div>
          <div
            className={`text-3xl font-mono font-bold ${getBurnoutColor(burnoutRisk)}`}
          >
            {burnoutRisk}%
          </div>
        </div>

        <div className="border border-zinc-800 p-3 flex flex-col justify-between transition-transform hover:scale-[1.02] duration-200">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">
            Focus Today
          </div>
          <div className="text-3xl font-mono font-bold text-zinc-100">
            {focusTodayLabel}
          </div>
        </div>

        <div className="border border-zinc-800 p-3 flex flex-col justify-between col-span-2 lg:col-span-1 transition-transform hover:scale-[1.02] duration-200">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">
            Next Action
          </div>
          <div className="text-sm font-bold text-zinc-300 uppercase truncate">
            {nextAction}
          </div>
        </div>

        <div className={`border border-zinc-800 p-3 flex flex-col justify-between col-span-2 lg:col-span-1 transition-transform hover:scale-[1.02] duration-200 relative overflow-hidden group ${isFailureImminent ? 'border-b-urgency-critical border-b-4' : ''}`}>
          {isFailureImminent && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-urgency-critical/20 to-transparent pointer-events-none"></div>
          )}
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 relative z-10">
            Time Until Failure
          </div>
          <div
            className={`text-3xl font-mono font-bold relative z-10 ${timeUntilFailure === "--" ? "text-zinc-500" : (isFailureImminent ? "text-urgency-critical" : "text-zinc-100")}`}
          >
            {timeUntilFailure}
          </div>
        </div>
      </div>
    </div>
  );
}
