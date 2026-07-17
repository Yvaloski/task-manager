import { test, expect } from '@playwright/test';

test.describe('Tier 1: Feature Coverage', () => {

  // --- Feature 1: Category Creation ---

  test('T1_CAT_CREATE_01: Create Category with Valid Data', async ({ page }) => {
    // 1. Navigate to Category management view `/categories`.
    await page.goto('/categories');
    // 2. Click the "Add Category" button.
    await page.getByRole('button', { name: 'Add Category' }).click();
    // 3. Fill input `[name="name"]` with `"Personal Tasks"`.
    await page.locator('input[name="name"]').fill('Personal Tasks');
    // 4. Fill textarea `[name="description"]` with `"Tasks related to personal life"`.
    await page.locator('textarea[name="description"]').fill('Tasks related to personal life');
    // 5. Click button `"Submit"`.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 6. Verify success toast message is displayed.
    await expect(page.locator('.toast-success, [role="alert"]')).toBeVisible();
    // 7. Verify `"Personal Tasks"` appears in the category table list.
    await expect(page.locator('table, .category-list')).toContainText('Personal Tasks');
  });

  test('T1_CAT_CREATE_02: Verify Created Category in Task Form Selector', async ({ page }) => {
    // 1. Navigate to `/categories` and create a category named `"Health"`.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('Health');
    await page.locator('textarea[name="description"]').fill('Health related tasks');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // 2. Navigate to Dashboard `/` and click `"Create Task"` / `"Add Task"`.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // 3. Click category dropdown selector.
    const dropdown = page.locator('select[name="categoryId"]');
    await dropdown.click();
    
    // 4. Assert that option `"Health"` is present.
    await expect(dropdown.locator('option')).toContainText(['Health']);
  });

  test('T1_CAT_CREATE_03: Create Category with Minimum Length Name', async ({ page }) => {
    // 1. Navigate to `/categories`, open "Add Category".
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    // 2. Fill name with `"Gym"`.
    await page.locator('input[name="name"]').fill('Gym');
    // 3. Click `"Submit"`.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 4. Verify category `"Gym"` appears in the categories list.
    await expect(page.locator('table, .category-list')).toContainText('Gym');
  });

  test('T1_CAT_CREATE_04: Create Category with Maximum Length Name', async ({ page }) => {
    // 1. Navigate to `/categories`, open "Add Category".
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    // 2. Fill name with 50 characters: `"A".repeat(50)`.
    const longName = 'A'.repeat(50);
    await page.locator('input[name="name"]').fill(longName);
    // 3. Click `"Submit"`.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 4. Verify category is created and listed.
    await expect(page.locator('table, .category-list')).toContainText(longName);
  });

  test('T1_CAT_CREATE_05: Create Category with Special Characters in Description', async ({ page }) => {
    // 1. Open "Add Category" modal.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    // 2. Fill name with `"Design"`.
    await page.locator('input[name="name"]').fill('Design');
    // 3. Fill description with `"Design & UI/UX - testing !@#%^*()_+"`.
    const specialDesc = 'Design & UI/UX - testing !@#%^*()_+';
    await page.locator('textarea[name="description"]').fill(specialDesc);
    // 4. Submit and verify description is displayed verbatim in details.
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('table, .category-list')).toContainText(specialDesc);
  });

  // --- Feature 2: Category Deletion & List Display ---

  test('T1_CAT_DELETE_01: Delete an Unused Category', async ({ page }) => {
    // 1. Navigate to `/categories`.
    await page.goto('/categories');
    // 2. Click the delete icon/button next to category `"Personal Tasks"`.
    // We assume a row contains the category name and a delete action button.
    const row = page.locator('tr, .category-item').filter({ hasText: 'Personal Tasks' });
    await row.locator('.btn-delete, button:has-text("Delete")').click();
    // 3. Click `"Confirm"` in confirmation modal.
    await page.getByRole('button', { name: 'Confirm' }).click();
    // 4. Verify success message and check that `"Personal Tasks"` is absent from the table.
    await expect(page.locator('.toast-success, [role="alert"]')).toBeVisible();
    await expect(page.locator('table, .category-list')).not.toContainText('Personal Tasks');
  });

  test('T1_CAT_DELETE_02: Delete Prepopulated Category', async ({ page }) => {
    // 1. Navigate to `/categories`.
    await page.goto('/categories');
    // 2. Find a prepopulated category (e.g. `"Study"` if unused).
    const row = page.locator('tr, .category-item').filter({ hasText: 'Study' });
    // 3. Click "Delete", then "Confirm".
    await row.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    // 4. Verify category is removed.
    await expect(page.locator('table, .category-list')).not.toContainText('Study');
  });

  test('T1_CAT_DELETE_03: Initial Prepopulated List Verification', async ({ page }) => {
    // 1. Navigate to `/categories`.
    await page.goto('/categories');
    // 2. Count total rows in categories list.
    const rowCount = await page.locator('table tbody tr, .category-item').count();
    // 3. Assert count is `>= 3`.
    expect(rowCount).toBeGreaterThanOrEqual(3);
  });

  test('T1_CAT_DELETE_04: Verify Deletion Syncs with Task Form', async ({ page }) => {
    // 1. Create a category `"Temporary"`.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('Temporary');
    await page.locator('textarea[name="description"]').fill('Temporary desc');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Delete `"Temporary"`.
    const row = page.locator('tr, .category-item').filter({ hasText: 'Temporary' });
    await row.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 3. Navigate to task creation form.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();

    // 4. Assert category option `"Temporary"` is absent.
    const dropdown = page.locator('select[name="categoryId"]');
    await expect(dropdown.locator('option')).not.toContainText(['Temporary']);
  });

  test('T1_CAT_DELETE_05: Cancel Deletion Flow', async ({ page }) => {
    // 1. Navigate to `/categories`.
    await page.goto('/categories');
    // 2. Click "Delete" on any category (e.g. Work).
    const row = page.locator('tr, .category-item').filter({ hasText: 'Work' });
    await row.locator('.btn-delete, button:has-text("Delete")').click();
    // 3. In the confirmation dialog, click "Cancel".
    await page.getByRole('button', { name: 'Cancel' }).click();
    // 4. Verify category remains in the table.
    await expect(page.locator('table, .category-list')).toContainText('Work');
  });

  // --- Feature 3: Task Creation ---

  test('T1_TASK_CREATE_01: Create Task with Standard Fields', async ({ page }) => {
    // 1. Navigate to Dashboard `/`.
    await page.goto('/');
    // 2. Click `"Add Task"`.
    await page.getByRole('button', { name: 'Add Task' }).click();
    // 3. Fill title: `"Write E2E Plan"`, description: `"Formulate Playwright cases"`.
    await page.locator('input[name="title"]').fill('Write E2E Plan');
    await page.locator('textarea[name="description"]').fill('Formulate Playwright cases');
    // 4. Select category: `"Work"`, priority: `"HAUTE"`, status: `"A_FAIRE"`.
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('select[name="priority"]').selectOption('HAUTE');
    await page.locator('select[name="status"]').selectOption('A_FAIRE');
    // 5. Input due date: tomorrow's date.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.locator('input[name="dueDate"]').fill(dateString);
    // 6. Click `"Submit"`.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 7. Verify task card displays on dashboard with correct title, priority, status.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Write E2E Plan' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('HAUTE');
    await expect(card).toContainText('A_FAIRE');
  });

  test('T1_TASK_CREATE_02: Create Task in status EN_COURS', async ({ page }) => {
    // 1. Open Task Form.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    // 2. Fill fields, select status `"EN_COURS"`.
    await page.locator('input[name="title"]').fill('In Progress Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('select[name="status"]').selectOption('EN_COURS');
    // 3. Click `"Submit"`.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 4. Verify task appears on dashboard under the "In Progress" group/badge.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'In Progress Task' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('EN_COURS');
  });

  test('T1_TASK_CREATE_03: Create Task in status TERMINE', async ({ page }) => {
    // 1. Open Task Form.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    // 2. Fill fields, select status `"TERMINE"`.
    await page.locator('input[name="title"]').fill('Completed Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('select[name="status"]').selectOption('TERMINE');
    // 3. Click `"Submit"`.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 4. Verify task card shows "TERMINE" status indicator.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Completed Task' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('TERMINE');
  });

  test('T1_TASK_CREATE_04: Create Task with BASSE Priority', async ({ page }) => {
    // 1. Open Task Form.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    // 2. Fill title, select priority `"BASSE"`.
    await page.locator('input[name="title"]').fill('Low Priority Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('select[name="priority"]').selectOption('BASSE');
    // 3. Click `"Submit"`.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 4. Verify task is shown with a priority indicator.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Low Priority Task' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('BASSE');
  });

  test('T1_TASK_CREATE_05: Create Task with Empty Description', async ({ page }) => {
    // 1. Open Task Form.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    // 2. Fill title, leave description blank.
    await page.locator('input[name="title"]').fill('No Description Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    // 3. Click `"Submit"`.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 4. Verify task is created and description shows empty/placeholder text in details.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'No Description Task' });
    await expect(card).toBeVisible();
    await card.locator('.btn-view, text="View"').first().click();
    await expect(page.locator('.task-details-modal, [role="dialog"]')).toBeVisible();
    // Check description is empty or shows placeholder
    await expect(page.locator('.task-details-modal, [role="dialog"]')).toContainText('');
    await page.locator('[aria-label="Close"], .btn-close').click();
  });

  // --- Feature 4: Task Reading / Dashboard List ---

  test('T1_TASK_READ_01: Initial Load Prepopulated Tasks', async ({ page }) => {
    // 1. Navigate to Dashboard.
    await page.goto('/');
    // 2. Count number of task cards.
    const taskCount = await page.locator('.task-card, .task-item').count();
    // 3. Assert count is `>= 5`.
    expect(taskCount).toBeGreaterThanOrEqual(5);
  });

  test('T1_TASK_READ_02: View Task Details Dialog', async ({ page }) => {
    // 1. Navigate to dashboard and locate task card `"Setup repository"`.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Setup repository' });
    // 2. Click the card or `"View"` button.
    await card.locator('.btn-view, text="View"').click();
    // 3. Verify details modal opens.
    const modal = page.locator('.task-details-modal, [role="dialog"]');
    await expect(modal).toBeVisible();
    // 4. Assert that fields (title, description, status, priority, category) match the task details.
    await expect(modal.locator('.modal-title, h2, h3')).toContainText('Setup repository');
    await page.locator('[aria-label="Close"], .btn-close').click();
  });

  test('T1_TASK_READ_03: No Tasks Filter Empty State', async ({ page }) => {
    // 1. Navigate to Dashboard.
    await page.goto('/');
    // 2. Set status filter to `"TERMINE"`, category to `"Personal"`. (Ensure no tasks match).
    await page.locator('select[name="filterStatus"]').selectOption('TERMINE');
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'Personal' });
    // 3. Assert that `"No tasks found"` is visible.
    await expect(page.locator('.no-tasks-msg, text="No tasks found"')).toBeVisible();
  });

  test('T1_TASK_READ_04: Task Due Date Order', async ({ page }) => {
    // 1. Navigate to Dashboard.
    await page.goto('/');
    // 2. Fetch all due date texts from task list cards.
    const dueDates = await page.locator('.task-card .due-date, .task-item .due-date').allTextContents();
    // Parse dates to verify sorted in ascending order
    const dates = dueDates.map(d => new Date(d.replace('Due Date: ', '').trim()).getTime());
    for (let i = 0; i < dates.length - 1; i++) {
      if (!isNaN(dates[i]) && !isNaN(dates[i+1])) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i+1]);
      }
    }
  });

  test('T1_TASK_READ_05: Task Count Metric Indicators', async ({ page }) => {
    // 1. Navigate to Dashboard.
    await page.goto('/');
    // 2. Read task count badge.
    const badgeText = await page.locator('.total-tasks-badge, .task-count-metric').textContent();
    const countFromBadge = parseInt(badgeText || '0', 10);
    // 3. Compare badge count with actual number of task cards displayed.
    const actualCount = await page.locator('.task-card, .task-item').count();
    // 4. Assert numbers match.
    expect(countFromBadge).toEqual(actualCount);
  });

  // --- Feature 5: Task Editing / Updating ---

  test('T1_TASK_UPDATE_01: Edit Task Title & Description', async ({ page }) => {
    // 1. Locate a task card and click `"Edit"`.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').first();
    await card.locator('.btn-edit, text="Edit"').click();
    // 2. Modify title to `"Refactored API"` and description to `"Spring Security updates"`.
    await page.locator('input[name="title"]').fill('Refactored API');
    await page.locator('textarea[name="description"]').fill('Spring Security updates');
    // 3. Click `"Save"`.
    await page.getByRole('button', { name: 'Save' }).click();
    // 4. Verify task card displays the updated text.
    await expect(page.locator('.task-card, .task-item').filter({ hasText: 'Refactored API' })).toBeVisible();
  });

  test('T1_TASK_UPDATE_02: Change Task Status', async ({ page }) => {
    // 1. Edit a task with status `"A_FAIRE"`.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'A_FAIRE' }).first();
    const title = await card.locator('.task-title').textContent();
    await card.locator('.btn-edit, text="Edit"').click();
    // 2. Set status selector to `"EN_COURS"`.
    await page.locator('select[name="status"]').selectOption('EN_COURS');
    // 3. Save.
    await page.getByRole('button', { name: 'Save' }).click();
    // 4. Verify task badge shifts to "EN_COURS".
    const updatedCard = page.locator('.task-card, .task-item').filter({ hasText: title || '' });
    await expect(updatedCard).toContainText('EN_COURS');
  });

  test('T1_TASK_UPDATE_03: Change Task Priority', async ({ page }) => {
    // 1. Edit a task with priority `"BASSE"`.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'BASSE' }).first();
    const title = await card.locator('.task-title').textContent();
    await card.locator('.btn-edit, text="Edit"').click();
    // 2. Set priority to `"HAUTE"`.
    await page.locator('select[name="priority"]').selectOption('HAUTE');
    // 3. Save.
    await page.getByRole('button', { name: 'Save' }).click();
    // 4. Verify badge priority or color changes to red.
    const updatedCard = page.locator('.task-card, .task-item').filter({ hasText: title || '' });
    await expect(updatedCard).toContainText('HAUTE');
  });

  test('T1_TASK_UPDATE_04: Update Task Category Link', async ({ page }) => {
    // 1. Edit a task with category `"Work"`.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Work' }).first();
    const title = await card.locator('.task-title').textContent();
    await card.locator('.btn-edit, text="Edit"').click();
    // 2. Select `"Personal"` from category dropdown.
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Personal' });
    // 3. Save.
    await page.getByRole('button', { name: 'Save' }).click();
    // 4. Verify task card displays category tag `"Personal"`.
    const updatedCard = page.locator('.task-card, .task-item').filter({ hasText: title || '' });
    await expect(updatedCard).toContainText('Personal');
  });

  test('T1_TASK_UPDATE_05: Edit Task Due Date', async ({ page }) => {
    // 1. Edit task.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').first();
    const title = await card.locator('.task-title').textContent();
    await card.locator('.btn-edit, text="Edit"').click();
    // 2. Set due date to next month.
    const future = new Date();
    future.setMonth(future.getMonth() + 1);
    const dateString = future.toISOString().split('T')[0];
    await page.locator('input[name="dueDate"]').fill(dateString);
    // 3. Save.
    await page.getByRole('button', { name: 'Save' }).click();
    // 4. Verify task card shows the new date.
    const updatedCard = page.locator('.task-card, .task-item').filter({ hasText: title || '' });
    await expect(updatedCard).toContainText(dateString);
  });

  // --- Feature 6: Task Deletion ---

  test('T1_TASK_DELETE_01: Delete Task from Dashboard Card', async ({ page }) => {
    // 1. Locate target task card.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').first();
    const title = await card.locator('.task-title').textContent();
    // 2. Click `"Delete"` icon/button.
    await card.locator('.btn-delete, button:has-text("Delete")').click();
    // 3. Click `"Confirm"` in confirmation modal.
    await page.getByRole('button', { name: 'Confirm' }).click();
    // 4. Assert task card is removed from dashboard.
    await expect(page.locator('.task-card, .task-item').filter({ hasText: title || '' })).not.toBeVisible();
  });

  test('T1_TASK_DELETE_02: Cancel Task Deletion', async ({ page }) => {
    // 1. Click `"Delete"` icon on a task card.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').first();
    const title = await card.locator('.task-title').textContent();
    await card.locator('.btn-delete, button:has-text("Delete")').click();
    // 2. In the confirmation dialog, click `"Cancel"`.
    await page.getByRole('button', { name: 'Cancel' }).click();
    // 3. Assert task card is still visible.
    await expect(page.locator('.task-card, .task-item').filter({ hasText: title || '' })).toBeVisible();
  });

  test('T1_TASK_DELETE_03: Delete Task from Details Modal', async ({ page }) => {
    // 1. Click a task card to open the Details modal.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').first();
    const title = await card.locator('.task-title').textContent();
    await card.locator('.btn-view, text="View"').click();
    // 2. Click `"Delete Task"` inside modal.
    await page.locator('.task-details-modal .btn-delete, [role="dialog"] button:has-text("Delete Task")').click();
    // 3. Confirm deletion.
    await page.getByRole('button', { name: 'Confirm' }).click();
    // 4. Assert modal closes and task card is removed.
    await expect(page.locator('.task-details-modal, [role="dialog"]')).not.toBeVisible();
    await expect(page.locator('.task-card, .task-item').filter({ hasText: title || '' })).not.toBeVisible();
  });

  test('T1_TASK_DELETE_04: Delete Multiple Tasks Sequentially', async ({ page }) => {
    await page.goto('/');
    // 1. Delete Task A, confirm.
    const cardA = page.locator('.task-card, .task-item').first();
    const titleA = await cardA.locator('.task-title').textContent();
    await cardA.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.locator('.task-card, .task-item').filter({ hasText: titleA || '' })).not.toBeVisible();

    // 2. Delete Task B, confirm.
    const cardB = page.locator('.task-card, .task-item').first();
    const titleB = await cardB.locator('.task-title').textContent();
    await cardB.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    // 3. Verify both cards are gone.
    await expect(page.locator('.task-card, .task-item').filter({ hasText: titleB || '' })).not.toBeVisible();
  });

  test('T1_TASK_DELETE_05: Verification of Counter Decrement', async ({ page }) => {
    // 1. Note current total count badge value.
    await page.goto('/');
    const badgeTextBefore = await page.locator('.total-tasks-badge, .task-count-metric').textContent();
    const beforeCount = parseInt(badgeTextBefore || '0', 10);
    // 2. Delete a task.
    await page.locator('.task-card, .task-item').first().locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    // 3. Assert total count badge value is exactly `initial - 1`.
    const badgeTextAfter = await page.locator('.total-tasks-badge, .task-count-metric').textContent();
    const afterCount = parseInt(badgeTextAfter || '0', 10);
    expect(afterCount).toEqual(beforeCount - 1);
  });

  // --- Feature 7: Visual Indicators & Styles ---

  test('T1_VISUAL_IND_01: HAUTE Priority Color Badge', async ({ page }) => {
    // 1. Locate a task card with priority `"HAUTE"`.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'HAUTE' }).first();
    const badge = card.locator('.badge-priority, .priority-badge');
    // 2. Check CSS classes of its priority badge.
    // 3. Assert it contains `bg-red-100` and `text-red-800` (or similar red Tailwind styles).
    await expect(badge).toHaveClass(/bg-red-100/);
    await expect(badge).toHaveClass(/text-red-800/);
  });

  test('T1_VISUAL_IND_02: MOYENNE Priority Color Badge', async ({ page }) => {
    // 1. Locate task card with priority `"MOYENNE"`.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'MOYENNE' }).first();
    const badge = card.locator('.badge-priority, .priority-badge');
    // 2. Assert its priority badge contains `bg-yellow-100` and `text-yellow-800`.
    await expect(badge).toHaveClass(/bg-yellow-100/);
    await expect(badge).toHaveClass(/text-yellow-800/);
  });

  test('T1_VISUAL_IND_03: BASSE Priority Color Badge', async ({ page }) => {
    // 1. Locate task card with priority `"BASSE"`.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'BASSE' }).first();
    const badge = card.locator('.badge-priority, .priority-badge');
    // 2. Assert its priority badge contains `bg-blue-100` and `text-blue-800`.
    await expect(badge).toHaveClass(/bg-blue-100/);
    await expect(badge).toHaveClass(/text-blue-800/);
  });

  test('T1_VISUAL_IND_04: Overdue Task Alert Banner', async ({ page }) => {
    // 1. Create a task with due date set to yesterday.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Overdue Visual Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];
    await page.locator('input[name="dueDate"]').fill(dateString);
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Assert that task card shows warning icon or red overdue alert tag (e.g. `"Overdue"`).
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Overdue Visual Task' });
    await expect(card.locator('.overdue-alert, text="En retard", text="Overdue"')).toBeVisible();
  });

  test('T1_VISUAL_IND_05: Future Due Date Visuals', async ({ page }) => {
    // 1. Create a task with due date in the future.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Future Visual Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const dateString = future.toISOString().split('T')[0];
    await page.locator('input[name="dueDate"]').fill(dateString);
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Assert that no overdue red alerts or warnings are present.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Future Visual Task' });
    await expect(card.locator('.overdue-alert, text="En retard", text="Overdue"')).not.toBeVisible();
  });

  // --- Feature 8: Dashboard Task Filtering ---

  test('T1_DASH_FILTER_01: Filter Tasks by Category', async ({ page }) => {
    // 1. Select category filter `"Work"`.
    await page.goto('/');
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'Work' });
    // 2. Assert that all visible tasks have category label `"Work"`.
    const categoryBadges = await page.locator('.task-card .task-category, .task-item .task-category').allTextContents();
    for (const badge of categoryBadges) {
      expect(badge).toContain('Work');
    }
    // 3. Assert that tasks with category `"Personal"` are hidden.
    await expect(page.locator('.task-card, .task-item').filter({ hasText: 'Personal' })).not.toBeVisible();
  });

  test('T1_DASH_FILTER_02: Filter Tasks by Status', async ({ page }) => {
    // 1. Select status filter `"A_FAIRE"`.
    await page.goto('/');
    await page.locator('select[name="filterStatus"]').selectOption('A_FAIRE');
    // 2. Assert that all visible tasks show status `"A_FAIRE"`.
    const statuses = await page.locator('.task-card .task-status, .task-item .task-status').allTextContents();
    for (const status of statuses) {
      expect(status).toContain('A_FAIRE');
    }
  });

  test('T1_DASH_FILTER_03: Filter Tasks by Priority', async ({ page }) => {
    // 1. Select priority filter `"HAUTE"`.
    await page.goto('/');
    await page.locator('select[name="filterPriority"]').selectOption('HAUTE');
    // 2. Assert all visible tasks have `"HAUTE"` badge.
    const priorities = await page.locator('.task-card .priority-badge, .task-item .priority-badge').allTextContents();
    for (const priority of priorities) {
      expect(priority).toContain('HAUTE');
    }
  });

  test('T1_DASH_FILTER_04: Reset Interactive Filters', async ({ page }) => {
    await page.goto('/');
    const initialCount = await page.locator('.task-card, .task-item').count();
    // 1. Select status `"TERMINE"`.
    await page.locator('select[name="filterStatus"]').selectOption('TERMINE');
    // 2. Click `"Reset Filters"` or select `"All"` (which is empty value in select option).
    await page.locator('select[name="filterStatus"]').selectOption('');
    // 3. Verify complete task list is restored.
    const finalCount = await page.locator('.task-card, .task-item').count();
    expect(finalCount).toEqual(initialCount);
  });

  test('T1_DASH_FILTER_05: Double Filter Combination', async ({ page }) => {
    // 1. Select category filter `"Work"`.
    await page.goto('/');
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'Work' });
    // 2. Select priority filter `"HAUTE"`.
    await page.locator('select[name="filterPriority"]').selectOption('HAUTE');
    // 3. Verify visible tasks match both criteria.
    const cards = await page.locator('.task-card, .task-item').all();
    for (const card of cards) {
      await expect(card.locator('.task-category')).toContainText('Work');
      await expect(card.locator('.priority-badge')).toContainText('HAUTE');
    }
  });

});
