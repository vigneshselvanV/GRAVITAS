import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GravitasTask } from "../types";
import { formatISODate, formatTimeRemaining } from "../utils/time";
import { UrgencyBadge } from "./UrgencyBadge";
import { AIReasoning } from "./AIReasoning";
import { callGemini } from "../api/gemini";
import { toolsDeclaration } from "../api/tools";

interface TaskDetailProps {
  task: GravitasTask;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<GravitasTask>) => void;
  onDelete: (id: string) => void;
  addActivity: (message: string, type: any) => void;
}

export function TaskDetail({
  task,
  onBack,
  onUpdate,
  onDelete,
  addActivity,
}: TaskDetailProps) {
  const [replanning, setReplanning] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionReason, setExtensionReason] = useState("");
  const [extensionDraft, setExtensionDraft] = useState<any>(null);
  const [draftingExtension, setDraftingExtension] = useState(false);
  const [, setTick] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleStep = (stepId: number) => {
    if (!task.plan || !task.plan.micro_steps) return;

    const steps = [...task.plan.micro_steps];
    const stepIndex = steps.findIndex((s) => s.step_id === stepId);
    if (stepIndex === -1) return;

    const step = steps[stepIndex];

    const isBlocked = steps
      .slice(0, stepIndex)
      .some((s) => s.is_blocker && s.status !== "completed");
    if (isBlocked && step.status !== "completed") {
      return;
    }

    const currentStatus = step.status;
    const newStatus = currentStatus === "completed" ? "pending" : "completed";

    if (newStatus === "completed") {
      const derivedStatus = getStepStatus(stepId, "pending");
      steps[stepIndex] = {
        ...step,
        status: newStatus,
        completed_on_time: derivedStatus !== "missed",
      };
    } else {
      steps[stepIndex] = {
        ...step,
        status: newStatus,
        completed_on_time: undefined,
      };
    }

    // Check if all steps are completed
    const allCompleted = steps.every((s) => s.status === "completed");

    const updates: Partial<GravitasTask> = {
      plan: { ...task.plan, micro_steps: steps },
      status: allCompleted ? "completed" : "in_progress",
    };

    if (allCompleted && task.status !== "completed") {
      // Just completed
      updates.completed_at = new Date().toISOString();
      if (task.deadline) {
        updates.completed_on_time =
          new Date(updates.completed_at).getTime() <=
          new Date(task.deadline).getTime();
      } else {
        updates.completed_on_time = true;
      }
      addActivity(
        `Task '${task.title}' completed ${updates.completed_on_time ? "ON TIME" : "LATE"}`,
        "system",
      );
    }

    onUpdate(task.id, updates);
  };

  const handleReplan = async (missedStepId: number) => {
    setReplanning(true);
    try {
      const tools = [toolsDeclaration];
      const prompt = `TASK: ${JSON.stringify(task)}\nMISSED_STEP_ID: ${missedStepId}\nThe user missed a step. Decide to replan.`;
      const res = await callGemini(prompt, tools, {
        functionCallingConfig: {
          mode: "ANY",
          allowedFunctionNames: ["replan"]
        }
      });

      if (res.functionCalls && res.functionCalls.length > 0) {
        const args = res.functionCalls[0].args;
        
        // Let's do a complete replan by clearing the old plan and triggering a generation
        const planPrompt = `TASK_DETAILS: ${JSON.stringify(task)}\nREASONING: ${args.reasoning}\nNow generate a brand new plan to recover.`;
        const planRes = await callGemini(planPrompt, tools, {
          functionCallingConfig: {
            mode: "ANY",
            allowedFunctionNames: ["generate_plan"]
          }
        });
        
        if (planRes.functionCalls && planRes.functionCalls.length > 0) {
          const planArgs = planRes.functionCalls[0].args;
          onUpdate(task.id, {
            plan: {
              ...task.plan!,
              micro_steps: planArgs.micro_steps || [],
              focus_blocks: planArgs.focus_blocks || [],
              completion_eta: planArgs.completion_eta,
              agent_message: planArgs.agent_message,
              plan_generated_at: new Date().toISOString(),
              reasoning: args.reasoning
            },
          });
          const missedStep = task.plan?.micro_steps?.find(
            (s) => s.step_id === missedStepId,
          );
          addActivity(
            `Task '${task.title}' missed step '${missedStep?.title || missedStepId}' — Replanned automatically`,
            "replan",
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReplanning(false);
    }
  };

  const handleDraftExtension = async () => {
    if (!extensionReason.trim()) return;
    setDraftingExtension(true);
    try {
      const tools = [toolsDeclaration];
      const prompt = `TASK: ${JSON.stringify(task)}\nREASON: ${extensionReason}\nDraft an extension request email.`;
      const res = await callGemini(prompt, tools, {
        functionCallingConfig: {
          mode: "ANY",
          allowedFunctionNames: ["draft_extension_email"]
        }
      });
      if (res.functionCalls && res.functionCalls.length > 0) {
        setExtensionDraft(res.functionCalls[0].args);
        addActivity(`Drafted extension request for '${task.title}'`, "system");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDraftingExtension(false);
    }
  };

  const getStepStatus = (stepId: number, currentStatus: string) => {
    if (currentStatus === "completed") return "completed";

    const block = task.plan?.focus_blocks?.find((b) =>
      b.step_ids.includes(stepId),
    );
    if (!block) return "pending";

    const planTime = new Date(
      task.plan?.plan_generated_at || task.created_at,
    ).getTime();
    const startTime = planTime + block.start_offset_minutes * 60000;
    const endTime = startTime + block.duration_minutes * 60000;
    const now = Date.now();

    if (now < startTime) return "pending";
    if (now >= startTime && now <= endTime) return "in_progress";
    return "missed";
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={onBack}
        className="mb-6 text-zinc-500 hover:text-zinc-100 uppercase font-bold text-sm tracking-widest"
      >
        &lt; Back to Dashboard
      </button>

      {task.plan?.agent_message && (
        <div className="bg-zinc-800 p-4 mb-8 border-l-4 border-zinc-500">
          <p className="font-bold text-sm uppercase">GRAVITAS says:</p>
          <p className="text-zinc-300 mt-1">"{task.plan.agent_message}"</p>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
          <p className="text-zinc-400 max-w-2xl">{task.description}</p>
        </div>
        <div className="flex flex-col items-end">
          <UrgencyBadge label={task.urgency_label} />
          <div className="mt-2 text-right">
            <div className="text-xs text-zinc-500">DEADLINE</div>
            <div className="font-bold text-zinc-100">
              {formatISODate(task.deadline)}
            </div>
            <div className="text-sm text-urgency-critical">
              {formatTimeRemaining(task.deadline)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold uppercase border-b-2 border-zinc-800 pb-2 flex justify-between items-end">
            <span>Execution Plan</span>
            {task.plan?.micro_steps && (
              <span className="text-xs text-zinc-500">
                {
                  task.plan.micro_steps.filter((s) => s.status === "completed")
                    .length
                }{" "}
                / {task.plan.micro_steps.length}
              </span>
            )}
          </h2>

          {task.plan?.micro_steps && (
            <div className="w-full bg-zinc-800 h-2 -mt-2 mb-2">
              <div
                className="bg-zinc-400 h-2 transition-all duration-500"
                style={{
                  width: `${Math.round((task.plan.micro_steps.filter((s) => s.status === "completed").length / task.plan.micro_steps.length) * 100)}%`,
                }}
              />
            </div>
          )}

          {replanning && (
            <div className="bg-urgency-medium text-zinc-950 p-3 font-bold uppercase text-center animate-pulse mb-6">
              RECALIBRATING...
            </div>
          )}

          {task.plan?.reasoning && !replanning && (
            <div className="mb-6">
              <AIReasoning reasoning={task.plan.reasoning} />
            </div>
          )}

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {task.plan?.micro_steps?.map((step, index) => {
                const derivedStatus = getStepStatus(step.step_id, step.status);
                const isBlocked = task
                  .plan!.micro_steps!.slice(0, index)
                  .some((s) => s.is_blocker && s.status !== "completed");

                return (
                  <motion.div
                    key={step.step_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-4 p-4 border-2 ${isBlocked && derivedStatus !== "completed" ? "border-zinc-800 bg-zinc-950 opacity-40 cursor-not-allowed" : derivedStatus === "completed" ? "border-zinc-800 opacity-50 bg-zinc-950" : derivedStatus === "missed" ? "border-urgency-critical bg-urgency-critical/5" : "border-zinc-700 bg-zinc-900"} transition-all`}
                  >
                    <button
                      onClick={() => toggleStep(step.step_id)}
                      disabled={isBlocked && derivedStatus !== "completed"}
                      className={`mt-1 w-6 h-6 border-2 flex items-center justify-center shrink-0 ${isBlocked && derivedStatus !== "completed" ? "border-zinc-700 bg-zinc-900" : derivedStatus === "completed" ? "border-zinc-500 bg-zinc-500 text-zinc-950" : "border-zinc-400 hover:bg-zinc-800"}`}
                    >
                      {derivedStatus === "completed" && "✓"}
                      {isBlocked && derivedStatus !== "completed" && "🔒"}
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-bold ${derivedStatus === "completed" ? "line-through text-zinc-500" : "text-zinc-100"}`}
                          >
                            {step.title}
                          </h3>
                          {derivedStatus === "in_progress" && (
                            <span className="text-[10px] bg-zinc-100 text-zinc-950 px-1 py-0.5 uppercase font-bold animate-pulse">
                              Active
                            </span>
                          )}
                          {derivedStatus === "missed" && (
                            <span className="text-[10px] bg-urgency-critical text-zinc-950 px-1 py-0.5 uppercase font-bold">
                              Missed
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500 whitespace-nowrap ml-4">
                          {step.duration_minutes}m
                        </span>
                      </div>
                      {step.description && (
                        <p className="text-sm text-zinc-400 mt-1">
                          {step.description}
                        </p>
                      )}
                      {step.is_blocker && (
                        <span className="inline-block mt-2 text-xs bg-urgency-high text-zinc-950 px-1 py-0.5 uppercase font-bold">
                          Blocker
                        </span>
                      )}
                    </div>
                    {derivedStatus === "missed" && (
                      <button
                        onClick={() => handleReplan(step.step_id)}
                        disabled={replanning}
                        className="text-xs border border-urgency-critical p-1 uppercase text-urgency-critical hover:bg-urgency-critical hover:text-zinc-950 transition-colors"
                      >
                        Replan
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold uppercase border-b-2 border-zinc-800 pb-2 mb-6">
            Focus Blocks
          </h2>
          <div className="space-y-4">
            {task.plan?.focus_blocks?.map((block) => (
              <div
                key={block.block_id}
                className="bg-zinc-900 p-3 border-l-4 border-zinc-500"
              >
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                  Block {block.block_id}
                </div>
                <div className="font-bold">{block.label}</div>
                <div className="text-sm text-zinc-400 mt-1">
                  {block.duration_minutes} mins
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t-2 border-zinc-800 space-y-4">
            <button
              onClick={() => setShowExtensionModal(true)}
              className="w-full py-2 border-2 border-zinc-500 text-zinc-300 uppercase font-bold hover:bg-zinc-800 transition-colors"
            >
              Request Extension
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="w-full py-2 border-2 border-urgency-critical text-urgency-critical uppercase font-bold hover:bg-urgency-critical hover:text-zinc-950 transition-colors"
            >
              Abort Directive
            </button>
          </div>
        </div>
      </div>

      {showExtensionModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-zinc-700 w-full max-w-lg p-6 max-h-[95vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4 uppercase shrink-0">
              Draft Extension Request
            </h2>

            {!extensionDraft ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                <p className="text-sm text-zinc-400 mb-4 shrink-0">
                  Provide context for the delay. Agent will draft a professional
                  extension request.
                </p>
                <textarea
                  className="w-full h-24 bg-zinc-950 border-2 border-zinc-700 p-3 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 resize-none mb-4 shrink-0"
                  placeholder="e.g. unexpected personal emergency, blocked on dependency..."
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                />
                <div className="flex justify-end space-x-4 shrink-0 mt-auto">
                  <button
                    onClick={() => setShowExtensionModal(false)}
                    className="px-4 py-2 border-2 border-zinc-700 hover:bg-zinc-800 uppercase font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDraftExtension}
                    disabled={draftingExtension || !extensionReason.trim()}
                    className="px-4 py-2 bg-zinc-100 text-zinc-950 hover:bg-zinc-300 uppercase font-bold text-sm"
                  >
                    {draftingExtension ? "Drafting..." : "Generate Draft"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="bg-zinc-950 border-2 border-zinc-700 p-4 mb-4 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-2">
                    To: {extensionDraft.recipient_placeholder}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">
                    Subject: {extensionDraft.subject}
                  </div>
                  <div className="text-sm text-zinc-300 whitespace-pre-wrap">
                    {extensionDraft.body}
                  </div>
                  <div className="mt-4 pt-2 border-t border-zinc-800 text-xs text-zinc-500 shrink-0">
                    Suggested New Deadline:{" "}
                    {formatISODate(extensionDraft.suggested_new_deadline)}
                  </div>
                </div>
                <div className="text-xs text-urgency-medium uppercase font-bold mb-4 shrink-0">
                  ⚠️ Agent drafted this — review before sending. (Does not
                  auto-send)
                </div>
                <div className="flex justify-end space-x-4 shrink-0">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Subject: ${extensionDraft.subject}\n\n${extensionDraft.body}`,
                      );
                      setShowExtensionModal(false);
                      setExtensionDraft(null);
                    }}
                    className="px-4 py-2 bg-zinc-100 text-zinc-950 hover:bg-zinc-300 uppercase font-bold text-sm"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => {
                      setShowExtensionModal(false);
                      setExtensionDraft(null);
                    }}
                    className="px-4 py-2 border-2 border-zinc-700 hover:bg-zinc-800 uppercase font-bold text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
