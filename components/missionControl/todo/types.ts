export interface Task {
  id: string;
  title: string;
  completed: boolean;
  deadline?: string;
  category?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  x: number;
  y: number;
  pinned?: boolean;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  progress: number;
  tasks: Task[];
  notes: Note[];
}
