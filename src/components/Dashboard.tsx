import React from "react";
import { GravitasTask, AgentActivity } from "../types";
import { TaskCard } from "./TaskCard";
import { ActivityLog } from "./ActivityLog";
import { MissionControlPanel } from "./MissionControlPanel";
import { useAuth } from "./AuthContext";
import { BrainCircuit } from "lucide-react";

interface DashboardProps {
  tasks: GravitasTask[];
  activities: AgentActivity[];
  onTaskClick: (task: GravitasTask) => void;
  onAddTask: () => void;
}

export function Dashboard({
  tasks,
  activities,
  onTaskClick,
  onAddTask,
}: DashboardProps) {
  const { user, logOut } = useAuth();
  
  const trulyActiveTasks = tasks.filter((t) => t.status !== "completed" && t.status !== "overdue" && (!t.deadline || new Date(t.deadline).getTime() > new Date().getTime()));
  const activeCount = trulyActiveTasks.length;

  // Sort tasks by priority_score descending, then by urgency level, then by deadline
  const sortedTasks = [...trulyActiveTasks].sort((a, b) => {
    if (b.priority_score !== a.priority_score) {
      return b.priority_score - a.priority_score;
    }
    // Sort by deadline if available
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return 0;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Morning briefing incoming.";
    if (hour >= 11 && hour < 17) return "Midday status check.";
    if (hour >= 17 && hour < 22) return "Evening assessment.";
    return "Late hours detected. Confirm you're not sacrificing sleep for deadlines.";
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-4 border-b-2 border-zinc-800 gap-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter">
            GRAVITAS
          </h1>
          <div className="text-zinc-500 uppercase text-xs tracking-widest mt-1">
            Autonomous Productivity Agent
          </div>
          <div className="text-[var(--color-urgency-medium)] text-sm font-mono mt-2">
            {getGreeting()}
          </div>
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-6 items-center justify-between w-full md:w-auto">
          <div className="text-left md:text-right border-zinc-800 md:pl-6 md:border-l-2">
            <div className="text-xs text-zinc-500 uppercase tracking-widest">
              Commander
            </div>
            <div className="text-sm font-mono text-zinc-100 max-w-[150px] md:max-w-full truncate">
              {user?.email}
            </div>
            <button onClick={logOut} className="text-xs text-[var(--color-urgency-high)] hover:text-white font-bold tracking-wider uppercase underline mt-1 transition-colors">Sign out</button>
          </div>
          <div className="text-left md:text-right border-zinc-800 pl-4 md:pl-6 border-l-2 relative">
            <div className="text-xs text-zinc-500 uppercase tracking-widest flex items-center justify-start md:justify-end gap-1">
              Active Directives
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-100 flex items-center justify-start md:justify-end gap-2">
              {activeCount}
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 border border-zinc-800 px-1.5 py-0.5 ml-2 mt-1 whitespace-nowrap">
                <BrainCircuit className="w-3 h-3 text-zinc-400" />
                <span>Gemini 2.5 Flash</span>
              </div>
            </div>
          </div>
          <button
            onClick={onAddTask}
            className="w-full md:w-auto ml-0 md:ml-4 bg-zinc-100 text-zinc-950 px-6 py-3 md:py-2 uppercase font-bold text-sm hover:bg-zinc-300 transition-colors"
          >
            New Directive
          </button>
        </div>
      </header>

      <MissionControlPanel tasks={trulyActiveTasks} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {trulyActiveTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 bg-zinc-900/20">
              <div className="text-2xl text-zinc-300 uppercase tracking-widest font-bold mb-2">
                NO ACTIVE DIRECTIVES
              </div>
              <p className="text-zinc-500 font-mono text-sm mb-8 text-center max-w-sm">
                Issue your first directive to begin autonomous execution.
              </p>
              <button
                onClick={onAddTask}
                className="bg-white text-black px-8 py-4 uppercase font-bold tracking-wider hover:bg-zinc-200 transition-all hover:scale-105 duration-200"
              >
                NEW DIRECTIVE
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-4 ${sortedTasks.length === 1 ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <ActivityLog activities={activities} />
        </div>
      </div>
    </div>
  );
}
