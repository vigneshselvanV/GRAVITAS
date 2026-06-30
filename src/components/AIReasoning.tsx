import React from "react";
import { motion } from "motion/react";
import { GeminiTag } from "./GeminiTag";

interface AIReasoningProps {
  reasoning: {
    factors: string[];
    success_before: number;
    success_after: number;
  };
}

export function AIReasoning({ reasoning }: AIReasoningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-indigo-500/50 bg-indigo-950/20 p-5 shadow-[0_0_15px_rgba(99,102,241,0.1)] relative"
    >
      <div className="flex justify-between items-start mb-4 border-b border-indigo-500/30 pb-3">
        <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
          <span className="text-lg">⚡</span> Why I Changed Your Plan
        </h3>
        <GeminiTag />
      </div>

      <ul className="space-y-2 mb-6">
        {reasoning.factors.map((factor, i) => (
          <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            {factor}
          </li>
        ))}
      </ul>

      <div className="bg-zinc-950 border border-indigo-500/30 p-3 flex justify-between items-center text-sm font-mono">
        <span className="text-zinc-500 uppercase">Estimated Success</span>
        <div className="flex items-center gap-3 font-bold">
          <span className="text-urgency-high line-through opacity-70">
            {reasoning.success_before}%
          </span>
          <span className="text-zinc-500">→</span>
          <span className="text-urgency-low text-lg">
            {reasoning.success_after}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
