import React, { useEffect, useState } from "react";
import { GravitasTask } from "../types";
import { callGemini, buildRescuePrompt } from "../api/gemini";
import { formatTimeRemaining } from "../utils/time";

export function RescueMode({
  task,
  onDismiss,
}: {
  task: GravitasTask;
  onDismiss: () => void;
}) {
  const [rescue, setRescue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const startRescue = async () => {
      try {
        const remainingSteps =
          task.plan?.micro_steps?.filter((s) => s.status !== "completed") || [];
        const prompt = buildRescuePrompt(task, remainingSteps);
        const res = await callGemini(prompt);
        if (res.function === "RESCUE_MODE") {
          setRescue(res);
        } else {
          onDismiss();
        }
      } catch (e) {
        console.error(e);
        onDismiss();
      } finally {
        setLoading(false);
      }
    };
    startRescue();
  }, [task, onDismiss]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-urgency-critical/20 backdrop-blur flex items-center justify-center">
        <div className="bg-urgency-critical text-zinc-950 p-6 font-bold uppercase text-2xl animate-pulse">
          Initializing Rescue Mode...
        </div>
      </div>
    );
  }

  if (!rescue) return null;

  const totalSteps = task.plan?.micro_steps?.length || 1;
  const completedSteps =
    task.plan?.micro_steps?.filter((s) => s.status === "completed").length || 0;
  const remainingPercent = Math.round(
    ((totalSteps - completedSteps) / totalSteps) * 100,
  );

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-3xl max-h-[95vh] flex flex-col border-4 border-urgency-critical bg-zinc-900 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
        {/* Flashing background effect */}
        <div className="absolute inset-0 bg-urgency-critical/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b-2 border-urgency-critical pb-4 gap-4">
              <div>
                <h2 className="text-urgency-critical font-bold text-3xl md:text-4xl uppercase tracking-tighter">
                  Mission Failure Imminent
                </h2>
                <div className="text-zinc-100 text-xl mt-1 break-words">{task.title}</div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-xs text-urgency-critical uppercase font-bold tracking-widest">
                  Deadline
                </div>
                <div className="text-3xl md:text-4xl font-bold font-mono text-zinc-100">
                  {formatTimeRemaining(task.deadline)}
                </div>
                <div className="text-xs text-zinc-400 mt-1 uppercase font-bold tracking-widest md:text-right">
                  Remaining Work:{" "}
                  <span className="text-zinc-100">{remainingPercent}%</span>
                </div>
              </div>
            </div>

            <div className="bg-urgency-critical text-zinc-950 p-4 font-bold text-lg md:text-xl uppercase mb-8 break-words">
              "{rescue.agent_message}"
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div>
                <h3 className="text-zinc-500 uppercase tracking-widest font-bold mb-4">
                  Must Complete
                </h3>
                <ul className="space-y-3">
                  {rescue.must_complete?.map((step: string, i: number) => (
                    <li key={i} className="flex gap-3 text-zinc-100">
                      <span className="text-urgency-critical font-bold mt-0.5">
                        &gt;
                      </span>
                      <span className="break-words">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-zinc-500 uppercase tracking-widest font-bold mb-4">
                  Must Drop (Do not do)
                </h3>
                <ul className="space-y-3 opacity-50">
                  {rescue.must_drop?.map((step: string, i: number) => (
                    <li
                      key={i}
                      className="flex gap-3 text-zinc-400 line-through"
                    >
                      <span className="text-zinc-600 font-bold mt-0.5">X</span>
                      <span className="break-words">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center p-6 md:p-8 pt-4 border-t-2 border-zinc-800 bg-zinc-900 shrink-0 gap-4">
            <div className="text-sm font-bold uppercase self-start sm:self-auto">
              Survival ETA:{" "}
              <span className="text-urgency-high">
                {new Date(rescue.survival_eta).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <span className="text-sm font-bold uppercase text-zinc-400 hidden sm:inline">
                Recommended Sprint:
              </span>
              <button
                onClick={onDismiss}
                className="bg-urgency-critical text-zinc-950 px-6 py-2 md:px-8 md:py-3 uppercase font-bold text-lg md:text-xl hover:bg-white transition-colors animate-pulse w-full sm:w-auto"
              >
                START NOW
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
