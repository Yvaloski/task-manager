import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Task, TaskFilter, TaskStatus, TaskPriority, Category } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TaskFormComponent],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  categories: Category[] = [];
  filter: TaskFilter = {};
  showForm = false;
  selectedTask: Task | null = null;
  isLoading = false;

  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  readonly priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadTasks();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe(cats => (this.categories = cats));
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getAll(this.filter).subscribe({
      next: tasks => { this.tasks = tasks; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  applyFilter(): void {
    this.loadTasks();
  }

  clearFilter(): void {
    this.filter = {};
    this.loadTasks();
  }

  openCreate(): void {
    this.selectedTask = null;
    this.showForm = true;
  }

  openEdit(task: Task): void {
    this.selectedTask = { ...task };
    this.showForm = true;
  }

  deleteTask(id: number): void {
    if (!confirm('Supprimer cette tâche ?')) return;
    this.taskService.delete(id).subscribe(() => this.loadTasks());
  }

  onFormSaved(): void {
    this.showForm = false;
    this.loadTasks();
  }

  onFormCancelled(): void {
    this.showForm = false;
  }

  priorityClass(priority: TaskPriority): string {
    return {
      HIGH: 'bg-red-100 text-red-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      LOW: 'bg-blue-100 text-blue-700',
    }[priority];
  }

  statusClass(status: TaskStatus): string {
    return {
      TODO: 'bg-gray-100 text-gray-600',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
      DONE: 'bg-green-100 text-green-700',
    }[status];
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  }

  getCategoryName(id: number | undefined): string {
    return this.categories.find(c => c.id === id)?.name ?? '—';
  }
}
