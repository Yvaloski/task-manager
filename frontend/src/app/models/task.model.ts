export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  creationDate: string;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: Category;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: number;
}
