import { useState, useEffect } from "react";
import { AgentActivity } from "../types";
import { getActivities, saveActivities } from "../utils/storage";

export function useActivities() {
  const [activities, setActivitiesState] = useState<AgentActivity[]>([]);

  useEffect(() => {
    setActivitiesState(getActivities());
  }, []);

  const addActivity = (message: string, type: AgentActivity["type"]) => {
    const newActivity: AgentActivity = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message,
      type
    };
    
    setActivitiesState((prev) => {
      const newActivities = [newActivity, ...prev].slice(0, 100); // Keep last 100
      saveActivities(newActivities);
      return newActivities;
    });
  };

  return { activities, addActivity };
}
