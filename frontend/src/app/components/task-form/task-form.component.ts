import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, Category, TaskStatus, TaskPriority } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  categories: Category[] = [];
  form: Partial<Task> = {};
  isSaving = false;

  readonly statuses: TaskStatus[] = ['A_FAIRE', 'EN_COURS', 'TERMINE'];
  readonly priorities: TaskPriority[] = ['BASSE', 'MOYENNE', 'HAUTE'];

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(cats => {
      this.categories = cats;
      this.initForm();
    });
  }

  initForm(): void {
    if (this.task) {
      this.form = { ...this.task };
    } else {
      this.form = {
        title: '',
        description: '',
        creationDate: new Date().toISOString().split('T')[0],
        dueDate: null,
        status: 'A_FAIRE',
        priority: 'MOYENNE',
        category: this.categories[0],
      };
    }
  }

  onCategoryChange(id: string): void {
    this.form.category = this.categories.find(c => c.id === +id);
  }

  save(): void {
    if (!this.form.title || !this.form.category) return;
    this.isSaving = true;
    const task = this.form as Task;
    const req = this.task?.id
      ? this.taskService.update(this.task.id, task)
      : this.taskService.create(task);
    req.subscribe({
      next: () => { this.isSaving = false; this.saved.emit(); },
      error: () => { this.isSaving = false; }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
