import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Category } from '../../models/task.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './category-manager.component.html',
})
export class CategoryManagerComponent implements OnInit {
  categories: Category[] = [];
  newName = '';
  newDescription = '';
  isSaving = false;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.categoryService.getAll().subscribe(cats => (this.categories = cats));
  }

  create(): void {
    if (!this.newName.trim()) return;
    this.isSaving = true;
    this.categoryService.create({ name: this.newName.trim(), description: this.newDescription.trim() }).subscribe({
      next: () => {
        this.newName = '';
        this.newDescription = '';
        this.isSaving = false;
        this.load();
      },
      error: () => { this.isSaving = false; }
    });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette catégorie ? Les tâches associées seront affectées.')) return;
    this.categoryService.delete(id).subscribe(() => this.load());
  }
}
