"use client";
import React, { useState } from "react";
import { Task } from "./types";
import { randomId } from "./utils";
import styles from "./styles.module.css";

interface Props {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export default function ToDoList({ tasks, setTasks }: Props) {
  const [newTask, setNewTask] = useState("");

  const safeTasks = tasks || [];

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...(safeTasks || []), { id: randomId(), title: newTask, completed: false }]);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    setTasks(safeTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(safeTasks.filter((t) => t.id !== id));
  };

  return (
    <div className={styles.card}>
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task..."
          className={`${styles.input} transition-all duration-300 ease-in-out`}
        />
        <button
          onClick={addTask}
          className={`${styles.buttonPrimary} transition-all duration-300 ease-in-out`}
        >
          Add
        </button>
      </div>
      <div className="space-y-4 mt-4">
        {safeTasks.map((task) => (
          <div
            key={task.id}
            className={`${styles.fadeIn} flex items-center justify-between transition-all duration-300 ease-in-out`}
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className={`${styles.checkbox} transition-all duration-300 ease-in-out`}
              />
              <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
                {task.title}
              </span>
            </label>
            <button
              onClick={() => deleteTask(task.id)}
              className={`${styles.buttonPrimary} bg-red-600 hover:bg-red-700 transition-all duration-300 ease-in-out`}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}