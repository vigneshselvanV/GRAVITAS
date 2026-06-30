import React, { useEffect, useState } from "react";
import { callGemini, buildDailyBriefPrompt } from "../api/gemini";
import { GravitasTask } from "../types";
import { GeminiTag } from "./GeminiTag";

export function DailyBrief({
  tasks,
  onDismiss,
}: {
  tasks: GravitasTask[];
  onDismiss: () => void;
}) {
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrief = async () => {
      try {
        const prompt = buildDailyBriefPrompt(tasks);
        const res = await callGemini(prompt);
        if (res.function === "DAILY_BRIEF") {
          setBrief(res);
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

    fetchBrief();
  }, [tasks, onDismiss]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
        <div className="text-xl uppercase font-bold tracking-widest animate-pulse">
          Generating Morning Briefing...
        </div>
      </div>
    );
  }

  if (!brief) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full max-h-[95vh] flex flex-col bg-zinc-900 border-2 border-zinc-700 shadow-2xl">
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="text-zinc-500 uppercase tracking-widest text-sm mb-2">
            {brief.date_label}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase mb-6 text-zinc-100">
            Daily Briefing
          </h1>

          <div className="space-y-6">
            {brief.agent_message && (
              <div className="bg-zinc-800 p-4 border-l-4 border-zinc-500 text-lg">
                "{brief.agent_message}"
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-500 uppercase">
                  Battles Today
                </div>
                <div className="text-2xl font-bold">{brief.battles_today}</div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-500 uppercase">
                  Completed Yesterday
                </div>
                <div className="text-2xl font-bold text-urgency-low">
                  {brief.completed_yesterday}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-zinc-500 uppercase tracking-widest text-sm mb-2">
                Top Priority
              </h3>
              <div className="bg-urgency-high text-zinc-950 p-4 font-bold text-xl uppercase break-words">
                {brief.top_priority_task || "None"}
              </div>
            </div>

            {brief.burnout_warning && (
              <div className="bg-urgency-critical text-zinc-950 p-3 font-bold uppercase text-center animate-pulse">
                WARNING: High risk of burnout detected. Manage energy.
              </div>
            )}

            <div>
              <h3 className="text-zinc-500 uppercase tracking-widest text-sm mb-2">
                First Action (Execute Now)
              </h3>
              <div className="border border-zinc-700 p-4 font-bold text-lg break-words">
                &gt; {brief.first_action_now || "Awaiting orders."}
              </div>
            </div>

            {brief.at_risk_tasks && brief.at_risk_tasks.length > 0 && (
              <div>
                <h3 className="text-zinc-500 uppercase tracking-widest text-sm mb-2">
                  At Risk
                </h3>
                <ul className="list-disc pl-5 text-urgency-medium">
                  {brief.at_risk_tasks.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 pt-6 border-t border-zinc-800 flex justify-between items-center bg-zinc-900 shrink-0">
          <GeminiTag />
          <button
            onClick={onDismiss}
            className="bg-zinc-100 text-zinc-950 px-6 py-2 md:px-8 md:py-3 uppercase font-bold hover:bg-zinc-300 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
