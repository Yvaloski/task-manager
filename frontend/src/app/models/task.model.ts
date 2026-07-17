export type TaskStatus = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';
export type TaskPriority = 'BASSE' | 'MOYENNE' | 'HAUTE';

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
