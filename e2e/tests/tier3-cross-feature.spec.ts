import { test, expect } from '@playwright/test';

test.describe('Tier 3: Cross-Feature Combinations', () => {

  test('T3_COMB_01: Complete Category & Task Lifecycle', async ({ page }) => {
    // 1. Go to `/categories` and create category `"Temporary Lifecycle"`.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('Temporary Lifecycle');
    await page.locator('textarea[name="description"]').fill('Temporary lifecycle category');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Go to Dashboard and create task `"Life Task"` under `"Temporary Lifecycle"`.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Life Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Temporary Lifecycle' });
    await page.getByRole('button', { name: 'Submit' }).click();

    // 3. Verify task card displays.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Life Task' });
    await expect(card).toBeVisible();

    // 4. Delete task `"Life Task"`.
    await card.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(card).not.toBeVisible();

    // 5. Go to `/categories` and delete `"Temporary Lifecycle"`.
    await page.goto('/categories');
    const row = page.locator('tr, .category-item').filter({ hasText: 'Temporary Lifecycle' });
    await row.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 6. Verify category is successfully deleted.
    await expect(page.locator('table, .category-list')).not.toContainText('Temporary Lifecycle');
  });

  test('T3_COMB_02: Dynamic Category Rename Propagation', async ({ page }) => {
    // 1. Create category `"Old Name"`.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('Old Name');
    await page.locator('textarea[name="description"]').fill('Old Name description');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Create task `"Dynamic Task"` under category `"Old Name"`.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Dynamic Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Old Name' });
    await page.getByRole('button', { name: 'Submit' }).click();

    // 3. Go to `/categories` and edit `"Old Name"` to `"New Name"`.
    await page.goto('/categories');
    const row = page.locator('tr, .category-item').filter({ hasText: 'Old Name' });
    await row.locator('.btn-edit, button:has-text("Edit")').click();
    await page.locator('input[name="name"]').fill('New Name');
    await page.getByRole('button', { name: 'Save' }).click();

    // 4. Navigate to dashboard.
    await page.goto('/');

    // 5. Assert `"Dynamic Task"` card displays category badge `"New Name"`.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Dynamic Task' });
    await expect(card.locator('.task-category')).toContainText('New Name');
  });

  test('T3_COMB_03: Filtered Task Category Modification', async ({ page }) => {
    // 1. Filter dashboard by Category `"Personal"`.
    await page.goto('/');
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'Personal' });

    // 2. Edit a task in the list, change category from `"Personal"` to `"Work"`.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Personal' }).first();
    const title = await card.locator('.task-title').textContent();
    await card.locator('.btn-edit, text="Edit"').click();
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    // 3. Save.
    await page.getByRole('button', { name: 'Save' }).click();

    // 4. Assert task is no longer visible on dashboard.
    await expect(page.locator('.task-card, .task-item').filter({ hasText: title || '' })).not.toBeVisible();
  });

  test('T3_COMB_04: Resolve Overdue Task by Adjusting Due Date', async ({ page }) => {
    // 1. Create task with past due date.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Adjust Date Overdue Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('input[name="dueDate"]').fill('2020-01-01');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Verify overdue warning is shown.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Adjust Date Overdue Task' });
    await expect(card.locator('.overdue-alert, text="En retard", text="Overdue"')).toBeVisible();

    // 3. Edit task, change due date to tomorrow's date.
    await card.locator('.btn-edit, text="Edit"').click();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.locator('input[name="dueDate"]').fill(dateString);
    // 4. Save.
    await page.getByRole('button', { name: 'Save' }).click();

    // 5. Assert overdue warning is gone.
    await expect(card.locator('.overdue-alert, text="En retard", text="Overdue"')).not.toBeVisible();
  });

  test('T3_COMB_05: Cascade Block and Re-assignment', async ({ page }) => {
    // 1. Create category `"Locked"` and assign task `"Locked Task"` to it.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('Locked');
    await page.locator('textarea[name="description"]').fill('Locked category');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Locked Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Locked' });
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Go to `/categories`, verify delete `"Locked"` fails.
    await page.goto('/categories');
    const row = page.locator('tr, .category-item').filter({ hasText: 'Locked' });
    await row.locator('.btn-delete, button:has-text("Delete")').click();
    await expect(page.locator('.toast-error, .error-msg, [role="alert"]')).toBeVisible();

    // 3. Go to Dashboard, edit `"Locked Task"`, change category to `"Work"`.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Locked Task' });
    await card.locator('.btn-edit, text="Edit"').click();
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.getByRole('button', { name: 'Save' }).click();

    // 4. Return to `/categories`, delete `"Locked"`.
    await page.goto('/categories');
    await row.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 5. Verify category `"Locked"` is deleted successfully.
    await expect(page.locator('table, .category-list')).not.toContainText('Locked');
  });

  test('T3_COMB_06: Filtered Priority Modification', async ({ page }) => {
    // 1. Filter by Priority `"HAUTE"`.
    await page.goto('/');
    await page.locator('select[name="filterPriority"]').selectOption('HAUTE');

    const card = page.locator('.task-card, .task-item').filter({ hasText: 'HAUTE' }).first();
    const title = await card.locator('.task-title').textContent();

    // 2. Edit a task in the list, change priority to `"BASSE"`.
    await card.locator('.btn-edit, text="Edit"').click();
    await page.locator('select[name="priority"]').selectOption('BASSE');
    // 3. Save.
    await page.getByRole('button', { name: 'Save' }).click();

    // 4. Verify task disappears from the dashboard list.
    await expect(page.locator('.task-card, .task-item').filter({ hasText: title || '' })).not.toBeVisible();
  });

  test('T3_COMB_07: Dual Creation & Filter Integration', async ({ page }) => {
    // 1. Create category `"CatA"`, then category `"CatB"`.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('CatA');
    await page.locator('textarea[name="description"]').fill('Desc A');
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('CatB');
    await page.locator('textarea[name="description"]').fill('Desc B');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Create task `"Task A"` in category `"CatA"`, and task `"Task B"` in `"CatB"`.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Task A');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'CatA' });
    await page.getByRole('button', { name: 'Submit' }).click();

    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Task B');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'CatB' });
    await page.getByRole('button', { name: 'Submit' }).click();

    // 3. Filter by category `"CatA"` -> verify only `"Task A"` is visible.
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'CatA' });
    await expect(page.locator('.task-card, .task-item').filter({ hasText: 'Task A' })).toBeVisible();
    await expect(page.locator('.task-card, .task-item').filter({ hasText: 'Task B' })).not.toBeVisible();

    // 4. Filter by category `"CatB"` -> verify only `"Task B"` is visible.
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'CatB' });
    await expect(page.locator('.task-card, .task-item').filter({ hasText: 'Task B' })).toBeVisible();
    await expect(page.locator('.task-card, .task-item').filter({ hasText: 'Task A' })).not.toBeVisible();
  });

  test('T3_COMB_08: Overdue Status Resolve under Filters', async ({ page }) => {
    // 1. Filter by status `"A_FAIRE"`.
    await page.goto('/');
    await page.locator('select[name="filterStatus"]').selectOption('A_FAIRE');

    // Make sure we have an overdue task in A_FAIRE status
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Filter Overdue A_FAIRE');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('input[name="dueDate"]').fill('2020-01-01');
    await page.locator('select[name="status"]').selectOption('A_FAIRE');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Open the overdue task, change status to `"TERMINE"`.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Filter Overdue A_FAIRE' });
    await card.locator('.btn-edit, text="Edit"').click();
    await page.locator('select[name="status"]').selectOption('TERMINE');
    await page.getByRole('button', { name: 'Save' }).click();

    // 3. Verify task card disappears from `"A_FAIRE"` list.
    await expect(card).not.toBeVisible();

    // 4. Switch filter to `"TERMINE"`.
    await page.locator('select[name="filterStatus"]').selectOption('TERMINE');

    // 5. Verify task is shown, has status `"TERMINE"`, and overdue badge is NOT visible.
    await expect(card).toBeVisible();
    await expect(card.locator('.overdue-alert, text="En retard", text="Overdue"')).not.toBeVisible();
  });

});
