import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api, CreateTaskPayload, UpdateTaskPayload } from "../services/api";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export type Task = {
  id: string | number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
};

type TaskContextType = {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (task: CreateTaskPayload) => Promise<void>;
  updateTask: (id: string | number, updates: UpdateTaskPayload) => Promise<void>;
  toggleTaskComplete: (id: string | number) => Promise<void>;
  deleteTask: (id: string | number) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
  deleteAllTasks: () => Promise<void>;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) {
      setTasks([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error: any) {
      if (error.message?.includes('denied') || error.message?.includes('Token is not valid')) {
        logout();
      } else {
        toast.error(error.message || "Failed to fetch tasks");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (task: CreateTaskPayload) => {
    try {
      const newTask = await api.createTask(task);
      setTasks((prev) => [newTask, ...prev]);
      toast.success("Task created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create task");
      throw error;
    }
  };

  const updateTask = async (id: string | number, updates: UpdateTaskPayload) => {
    try {
      const updated = await api.updateTask(id, updates);
      setTasks((prev) =>
        prev.map((task) => (String(task.id) === String(id) ? updated : task))
      );
      toast.success("Task updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update task");
      throw error;
    }
  };

  const toggleTaskComplete = async (id: string | number) => {
    const current = tasks.find((t) => String(t.id) === String(id));
    if (!current) return;
    const targetCompleted = !current.completed;
    
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        String(task.id) === String(id) ? { ...task, completed: targetCompleted } : task
      )
    );

    try {
      const updated = await api.updateTask(id, { completed: targetCompleted });
      setTasks((prev) =>
        prev.map((task) => (String(task.id) === String(id) ? updated : task))
      );
    } catch (error: any) {
      // Rollback on error
      setTasks((prev) =>
        prev.map((task) =>
          String(task.id) === String(id) ? { ...task, completed: current.completed } : task
        )
      );
      toast.error(error.message || "Failed to update task status");
    }
  };

  const deleteTask = async (id: string | number) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((task) => String(task.id) !== String(id)));
      toast.success("Task deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete task");
      throw error;
    }
  };

  const clearCompletedTasks = async () => {
    const completedTasks = tasks.filter((t) => t.completed);
    try {
      await Promise.all(completedTasks.map((t) => api.deleteTask(t.id)));
      setTasks((prev) => prev.filter((t) => !t.completed));
      toast.success("Completed tasks cleared");
    } catch (error: any) {
      toast.error(error.message || "Failed to clear completed tasks");
      fetchTasks();
    }
  };

  const deleteAllTasks = async () => {
    try {
      await Promise.all(tasks.map((t) => api.deleteTask(t.id)));
      setTasks([]);
      toast.success("All tasks deleted permanently");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete all tasks");
      fetchTasks();
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        fetchTasks,
        addTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        clearCompletedTasks,
        deleteAllTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
