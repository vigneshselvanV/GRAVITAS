import { useState, useEffect } from "react";
import { GravitasTask } from "../types";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { useAuth } from "../components/AuthContext";

export function useTasks() {
  const [tasks, setTasksState] = useState<GravitasTask[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasksState([]);
      return;
    }

    const q = query(collection(db, "tasks"), where("user_id", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id
        } as GravitasTask;
      });
      setTasksState(fetchedTasks);
    }, (error) => {
      console.error("Firestore Error in useTasks:", error);
    });

    return unsubscribe;
  }, [user]);

  const setTasks = (newTasks: GravitasTask[]) => {
    // Only used for local optimistic updates if needed, but primarily we rely on onSnapshot.
    setTasksState(newTasks);
  };

  const removeUndefined = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(removeUndefined);
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((acc: any, key) => {
        if (obj[key] !== undefined) {
          acc[key] = removeUndefined(obj[key]);
        }
        return acc;
      }, {});
    }
    return obj;
  };

  const addTask = async (task: GravitasTask) => {
    if (!user) return;
    const taskWithUser = { ...task, user_id: user.uid };
    try {
      await setDoc(doc(db, "tasks", task.id), removeUndefined(taskWithUser));
    } catch (e) {
      console.error("Error adding task", e);
    }
  };

  const updateTask = async (id: string, updates: Partial<GravitasTask>) => {
    if (!user) return;
    try {
      const taskRef = doc(db, "tasks", id);
      const updateData = {
        ...updates,
        last_activity: new Date().toISOString()
      };
      await updateDoc(taskRef, removeUndefined(updateData));
    } catch (e) {
      console.error("Error updating task", e);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "tasks", id));
    } catch (e) {
      console.error("Error deleting task", e);
    }
  };

  return { tasks, addTask, updateTask, deleteTask, setTasks };
}
