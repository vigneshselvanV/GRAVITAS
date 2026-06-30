export interface MicroStep {
  step_id: number;
  title: string;
  description: string;
  duration_minutes: number;
  order: number;
  status: "pending" | "completed" | "skipped";
  is_blocker: boolean;
  completed_on_time?: boolean;
}

export interface FocusBlock {
  block_id: number;
  label: string;
  start_offset_minutes: number;
  duration_minutes: number;
  step_ids: number[];
}

export interface TaskPlan {
  micro_steps: MicroStep[];
  focus_blocks: FocusBlock[];
  total_minutes_required?: number;
  completion_eta?: string;
  buffer_minutes?: number;
  warning?: string | null;
  agent_message?: string;
  plan_generated_at?: string;
  reasoning?: {
    factors: string[];
    success_before: number;
    success_after: number;
  };
}

export interface GravitasTask {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  effort_hours: number;
  priority_score: number;
  category: "academic" | "work" | "personal" | "financial";
  urgency_label: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  tags: string[];
  status: "pending" | "in_progress" | "completed" | "overdue";
  plan?: TaskPlan;
  nudge_level: number;
  last_activity: string;
  created_at: string;
  user_id?: string;
  completed_on_time?: boolean;
  completed_at?: string;
}

export interface AgentActivity {
  id: string;
  timestamp: string;
  message: string;
  type:
    "nudge" | "replan" | "conflict" | "rescue" | "system" | "plan" | "brief" | "completed";
}

export interface GravitasSettings {
  nudge_interval_minutes: number;
  daily_brief_time: string;
  rescue_mode_threshold_hours: number;
}
