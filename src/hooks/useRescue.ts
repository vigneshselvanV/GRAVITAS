import { useEffect, useState } from "react";
import { GravitasTask } from "../types";
import { getHoursUntil } from "../utils/time";

export function useRescue(tasks: GravitasTask[], addActivity: (message: string, type: any) => void) {
  const [rescueTask, setRescueTask] = useState<GravitasTask | null>(null);
  const [rescuedIds, setRescuedIds] = useState<string[]>([]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const activeTasks = tasks.filter(t => t.status !== "completed" && t.deadline);
      
      for (const task of activeTasks) {
        const hoursLeft = getHoursUntil(task.deadline);
        // If deadline is < 2 hours and we haven't already completed it
        if (hoursLeft > 0 && hoursLeft < 2 && !rescuedIds.includes(task.id)) {
          setRescueTask(task);
          setRescuedIds(prev => [...prev, task.id]);
          addActivity(`Deadline critical for '${task.title}' — Auto-initiated Rescue Mode sprint`, "rescue");
          break; // only rescue one at a time
        }
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [tasks, rescuedIds, addActivity]);

  return { rescueTask, clearRescue: () => setRescueTask(null) };
}
