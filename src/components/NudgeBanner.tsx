import React, { useEffect } from "react";

interface NudgeBannerProps {
  message: any;
  onDismiss: () => void;
}

export function NudgeBanner({ message, onDismiss }: NudgeBannerProps) {
  useEffect(() => {
    if (message && message.nudge_level < 4) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm bg-zinc-900 border-2 border-urgency-critical p-4 shadow-2xl">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-urgency-critical text-sm font-bold tracking-widest uppercase">
          ATTENTION: {message.taskTitle}
        </h3>
        <button onClick={onDismiss} className="text-zinc-500 hover:text-white">X</button>
      </div>
      <p className="text-zinc-100 text-sm mb-3">"{message.message}"</p>
      <div className="bg-urgency-critical text-zinc-950 p-2 text-sm font-bold uppercase">
        {message.action_required}
      </div>
      {message.time_remaining_label && (
        <div className="mt-2 text-xs text-zinc-400">
          TIME REMAINING: {message.time_remaining_label}
        </div>
      )}
    </div>
  );
}
