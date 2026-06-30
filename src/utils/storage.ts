import { GravitasTask, GravitasSettings, AgentActivity } from "../types";

const TASKS_KEY = "gravitas_tasks";
const SETTINGS_KEY = "gravitas_settings";
const ACTIVITIES_KEY = "gravitas_activities";

export function getActivities(): AgentActivity[] {
  const data = localStorage.getItem(ACTIVITIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveActivities(activities: AgentActivity[]): void {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
}

export function getTasks(): GravitasTask[] {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTasks(tasks: GravitasTask[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getSettings(): GravitasSettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) return JSON.parse(data);
  return {
    nudge_interval_minutes: 30,
    daily_brief_time: "08:00",
    rescue_mode_threshold_hours: 2,
  };
}

export function saveSettings(settings: GravitasSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
