import React from "react";

export function GeminiTag() {
  return (
    <div className="flex items-center gap-1.5 opacity-60">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">
        Powered by Gemini 2.5 Flash
      </span>
    </div>
  );
}
