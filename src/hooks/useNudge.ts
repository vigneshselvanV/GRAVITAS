import { useEffect, useState } from "react";
import { GravitasTask } from "../types";
import { callGemini } from "../api/gemini";
import { toolsDeclaration } from "../api/tools";
import { getHoursSince } from "../utils/time";

export function useNudge(tasks: GravitasTask[], updateTask: (id: string, updates: Partial<GravitasTask>) => void, addActivity: (message: string, type: any) => void) {
  const [nudgeMessage, setNudgeMessage] = useState<any | null>(null);
  const [lastNudges, setLastNudges] = useState<Record<string, number>>({});

  useEffect(() => {
    const checkInterval = setInterval(async () => {
      const activeTasks = tasks.filter(t => t.status !== "completed");
      const now = Date.now();
      
      for (const task of activeTasks) {
        const hoursInactive = getHoursSince(task.last_activity);
        const lastNudgeTime = lastNudges[task.id] || 0;
        const minutesSinceLastNudge = (now - lastNudgeTime) / (1000 * 60);

        if (hoursInactive > 0.5 && minutesSinceLastNudge > 30) { // Nudge at most every 30 mins per task
          try {
            const tools = [toolsDeclaration];
            const prompt = `TASK: ${JSON.stringify(task)}\nHOURS_INACTIVE: ${hoursInactive.toFixed(2)}\nGenerate escalating reminder when user inactive on a task`;
            
            const res = await callGemini(prompt, tools, {
              functionCallingConfig: {
                mode: "ANY",
                allowedFunctionNames: ["send_nudge"]
              }
            });
            
            if (res.functionCalls && res.functionCalls.length > 0) {
              const nudgeData = res.functionCalls[0].args;
              setNudgeMessage({ taskTitle: task.title, ...nudgeData });
              updateTask(task.id, { nudge_level: nudgeData.nudge_level });
              addActivity(`Detected inactivity on '${task.title}' — Nudge Level ${nudgeData.nudge_level} issued`, "nudge");
              
              setLastNudges(prev => ({ ...prev, [task.id]: now }));
            }
          } catch (e: any) {
            if (e.message?.includes("Rate Limit") || e.message?.includes("429")) {
              console.warn("Nudge paused due to API rate limit. Will retry later.");
              // Throttle to avoid spamming the API when rate limited
              setLastNudges(prev => ({ ...prev, [task.id]: now }));
            } else {
              console.error("Nudge error:", e);
            }
          }
          break; // Only nudge for one task at a time
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(checkInterval);
  }, [tasks, updateTask, addActivity, lastNudges]);

  return { nudgeMessage, clearNudge: () => setNudgeMessage(null) };
}
