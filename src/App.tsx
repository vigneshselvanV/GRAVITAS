import React, { useState, useEffect } from "react";
import { useTasks } from "./hooks/useTasks";
import { useNudge } from "./hooks/useNudge";
import { useRescue } from "./hooks/useRescue";
import { useActivities } from "./hooks/useActivities";
import { Dashboard } from "./components/Dashboard";
import { AddTask } from "./components/AddTask";
import { TaskDetail } from "./components/TaskDetail";
import { RescueMode } from "./components/RescueMode";
import { DailyBrief } from "./components/DailyBrief";
import { NudgeBanner } from "./components/NudgeBanner";
import { GravitasTask } from "./types";
import { useAuth } from "./components/AuthContext";
import { LoginPage } from "./components/LoginPage";

export default function App() {
  const { user } = useAuth();
  
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { activities, addActivity } = useActivities();
  const { nudgeMessage, clearNudge } = useNudge(tasks, updateTask, addActivity);
  const { rescueTask, clearRescue } = useRescue(tasks, addActivity);
  
  const [selectedTask, setSelectedTask] = useState<GravitasTask | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showDailyBrief, setShowDailyBrief] = useState(false);

  // Show daily brief on initial load once per day
  useEffect(() => {
    const lastBrief = localStorage.getItem("gravitas_last_brief");
    const today = new Date().toDateString();
    if (lastBrief !== today && tasks.length > 0) {
      setShowDailyBrief(true);
      localStorage.setItem("gravitas_last_brief", today);
    }
  }, [tasks.length]);

  // Cleanup overdue tasks
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    const now = new Date().getTime();
    tasks.forEach(task => {
      if (task.status === "pending" || task.status === "in_progress") {
        if (task.deadline && new Date(task.deadline).getTime() < now) {
          updateTask(task.id, { status: "overdue" });
          addActivity(`Directive missed: ${task.title}. Marked as overdue.`, "system");
        }
      }
    });
  }, [tasks, updateTask, addActivity]);

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen">
      {selectedTask ? (
        <TaskDetail 
          task={tasks.find(t => t.id === selectedTask.id) || selectedTask} 
          onBack={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={(id) => {
            deleteTask(id);
            setSelectedTask(null);
          }}
          addActivity={addActivity}
        />
      ) : (
        <Dashboard 
          tasks={tasks} 
          activities={activities}
          onTaskClick={setSelectedTask} 
          onAddTask={() => setIsAddingTask(true)} 
        />
      )}

      {isAddingTask && (
        <AddTask 
          existingTasks={tasks}
          onCancel={() => setIsAddingTask(false)}
          onAdd={(task) => {
            addTask(task);
            setIsAddingTask(false);
          }}
          addActivity={addActivity}
        />
      )}

      {showDailyBrief && (
        <DailyBrief tasks={tasks} onDismiss={() => setShowDailyBrief(false)} />
      )}

      {rescueTask && (
        <RescueMode task={rescueTask} onDismiss={clearRescue} />
      )}

      <NudgeBanner message={nudgeMessage} onDismiss={clearNudge} />
    </div>
  );
}

