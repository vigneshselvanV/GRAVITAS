import React, { useState } from "react";
import { callGemini } from "../api/gemini";
import { toolsDeclaration } from "../api/tools";
import { GravitasTask } from "../types";

interface AddTaskProps {
  onCancel: () => void;
  onAdd: (task: GravitasTask) => void;
  existingTasks: GravitasTask[];
  addActivity: (message: string, type: any) => void;
}

export function AddTask({
  onCancel,
  onAdd,
  existingTasks,
  addActivity,
}: AddTaskProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setLoadingState("Initializing...");
    setError(null);
    setConflictWarning(null);
    try {
      const executeWithRetry = async <T,>(operation: (signal: AbortSignal) => Promise<T>, maxRetries = 1): Promise<T> => {
        let attempts = 0;
        while (attempts <= maxRetries) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(new Error("Timeout: GRAVITAS took too long to think (25s limit)")), 25000);
          try {
            const result = await operation(controller.signal);
            clearTimeout(timeoutId);
            return result;
          } catch (error: any) {
            clearTimeout(timeoutId);
            attempts++;
            if (attempts > maxRetries || (!error.message?.includes("Timeout") && error.name !== "AbortError")) {
              throw error;
            }
            console.warn(`Attempt ${attempts} failed. Retrying...`);
          }
        }
        throw new Error("Maximum retries reached.");
      };

      const nowTime = new Date().getTime();
      const activeTasksSummary = existingTasks
        .filter((t) => t.status !== "completed" && t.status !== "overdue" && (!t.deadline || new Date(t.deadline).getTime() > nowTime))
        .map((t) => ({
          title: t.title,
          deadline: t.deadline,
          effort_hours: t.effort_hours,
          priority_score: t.priority_score,
          status: t.status,
        }));

      // 1. Extract Task using tools
      setLoadingState("Analyzing conflicts...");
      const taskContext = `USER_INPUT: "${input}"\nEXISTING_TASKS: ${JSON.stringify(activeTasksSummary)}`;
      const tools = [toolsDeclaration];
      
      const extractRes = await executeWithRetry((signal) => callGemini(taskContext, tools, {
        functionCallingConfig: {
          mode: "ANY",
          allowedFunctionNames: ["extract_task"]
        }
      }, signal));
      
      if (!extractRes.functionCalls || extractRes.functionCalls.length === 0) {
        throw new Error("Failed to parse task: Gemini did not call extract_task.");
      }
      
      const extracted = extractRes.functionCalls[0].args;

      if (extracted.conflicts_detected) {
        addActivity(
          `CONFLICT DETECTED: ${extracted.conflicts_detected}`,
          "conflict",
        );
        setConflictWarning(extracted.conflicts_detected);
      }

      // 2. Generate Plan
      setLoadingState("Generating plan...");
      const planContext = `TASK_DETAILS: ${JSON.stringify(extracted)}\nALL_ACTIVE_TASKS: ${JSON.stringify(activeTasksSummary)}\nCRITICAL: focus_blocks must NOT overlap with any existing focus_blocks already scheduled in ALL_ACTIVE_TASKS for the same day. If total required hours across all tasks exceeds available hours before nearest deadline, flag in warning field and prioritize by urgency_label. Now break this into micro-steps and focus blocks.`;
      
      const planRes = await executeWithRetry((signal) => callGemini(planContext, tools, {
        functionCallingConfig: {
          mode: "ANY",
          allowedFunctionNames: ["generate_plan"]
        }
      }, signal));

      if (!planRes.functionCalls || planRes.functionCalls.length === 0) {
        throw new Error("Failed to generate plan: Gemini did not call generate_plan.");
      }
      
      const plan = planRes.functionCalls[0].args;

      if (plan.schedule_conflict && plan.conflict_note) {
        addActivity(`⚠ Schedule conflict resolved — ${plan.conflict_note}`, "conflict");
        setConflictWarning((prev) => prev ? `${prev} | SCHEDULING: ${plan.conflict_note}` : plan.conflict_note);
      }

      const newTask: GravitasTask = {
        id: crypto.randomUUID(),
        ...extracted,
        plan: {
          micro_steps: plan.micro_steps || [],
          focus_blocks: plan.focus_blocks || [],
          total_minutes_required: plan.total_minutes_required,
          completion_eta: plan.completion_eta,
          buffer_minutes: plan.buffer_minutes,
          warning: plan.warning,
          agent_message: plan.agent_message,
          plan_generated_at: new Date().toISOString(),
        },
        status: "pending",
        nudge_level: 0,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      addActivity(`Mission planned: ${newTask.title}`, "plan");
      onAdd(newTask);
    } catch (err: any) {
      console.error("Task generation failed:", err);
      setError(err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950/90 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-zinc-700 w-full max-w-2xl p-6">
        <h2 className="text-xl font-bold mb-4 uppercase">New Directive</h2>

        {error && (
          <div className="bg-urgency-critical text-zinc-950 p-2 mb-4 font-bold">
            {error}
          </div>
        )}
        {conflictWarning && (
          <div className="bg-urgency-high text-zinc-950 p-2 mb-4 font-bold uppercase animate-pulse">
            CONFLICT: {conflictWarning}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <textarea
              autoFocus
              className="w-full h-32 bg-zinc-950 border-2 border-zinc-700 p-4 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 resize-none"
              placeholder="What needs to be done? Include deadlines and constraints."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border-2 border-zinc-700 hover:bg-zinc-800 uppercase font-bold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-zinc-100 text-zinc-950 hover:bg-zinc-300 uppercase font-bold flex items-center"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  {loadingState ? loadingState.toUpperCase() : "GRAVITAS IS THINKING"}
                  <span className="animate-pulse">...</span>
                </span>
              ) : (
                "Deploy"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
