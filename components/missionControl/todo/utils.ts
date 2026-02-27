import { Task } from "./types";

export const calculateProgress = (tasks: Task[]) => {
  if (!tasks || tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.completed).length;
  return Math.round((done / tasks.length) * 100);
};

export const randomId = () => Math.random().toString(36).substr(2, 9);