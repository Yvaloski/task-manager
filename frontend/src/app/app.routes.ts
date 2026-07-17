import { Routes } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { CategoryManagerComponent } from './components/category-manager/category-manager.component';

export const routes: Routes = [
  { path: '', component: TaskListComponent },
  { path: 'categories', component: CategoryManagerComponent },
  { path: '**', redirectTo: '' },
];
