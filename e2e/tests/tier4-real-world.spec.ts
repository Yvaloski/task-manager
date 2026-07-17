import { test, expect } from '@playwright/test';

test.describe('Tier 4: Real-World Application Scenarios', () => {

  test('T4_SCEN_01: Monday Morning Triage & Backlog Refinement', async ({ page }) => {
    await page.goto('/');

    // 1. Note overdue tasks.
    const overdueCount = await page.locator('.overdue-alert, text="En retard", text="Overdue"').count();

    // 2. Apply filter "Priority: HAUTE" to find critical backlog tasks.
    await page.locator('select[name="filterPriority"]').selectOption('HAUTE');

    // 3. Choose a high priority task, click edit
    const card = page.locator('.task-card, .task-item').first();
    const title = await card.locator('.task-title').textContent();
    await card.locator('.btn-edit, text="Edit"').click();

    // 4. Change status to "EN_COURS" and change due date to Friday. Click Save.
    await page.locator('select[name="status"]').selectOption('EN_COURS');
    
    // Get next Friday date
    const today = new Date();
    const nextFriday = new Date();
    nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
    const dateString = nextFriday.toISOString().split('T')[0];
    await page.locator('input[name="dueDate"]').fill(dateString);
    await page.getByRole('button', { name: 'Save' }).click();

    // 5. Click "Add Task". Create task "Client Presentation", Category: "Work", Status: "A_FAIRE", Priority: "HAUTE", Due Date: Friday.
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Client Presentation');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('select[name="status"]').selectOption('A_FAIRE');
    await page.locator('select[name="priority"]').selectOption('HAUTE');
    await page.locator('input[name="dueDate"]').fill(dateString);
    await page.getByRole('button', { name: 'Submit' }).click();

    // 6. Reset filters to "All".
    await page.locator('select[name="filterPriority"]').selectOption('');

    // 7. Verify "Client Presentation" is listed and the edited task has "EN_COURS" status.
    await expect(page.locator('.task-card, .task-item').filter({ hasText: 'Client Presentation' })).toBeVisible();
    const editedCard = page.locator('.task-card, .task-item').filter({ hasText: title || '' });
    await expect(editedCard).toContainText('EN_COURS');
  });

  test('T4_SCEN_02: End of Sprint Cleanup & Archiving', async ({ page }) => {
    await page.goto('/');

    // 1. Filter dashboard by Status "TERMINE".
    await page.locator('select[name="filterStatus"]').selectOption('TERMINE');

    // 2. For each task card displayed, click "Delete" and confirm deletion.
    let cards = await page.locator('.task-card, .task-item').all();
    for (const card of cards) {
      // Since locator is dynamic, we re-fetch the first one remaining
      await page.locator('.task-card, .task-item').first().locator('.btn-delete, button:has-text("Delete")').click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      await page.waitForTimeout(200);
    }

    // 3. Verify dashboard displays empty state.
    await expect(page.locator('.no-tasks-msg, text="No tasks found"')).toBeVisible();

    // 4. Navigate to /categories.
    await page.goto('/categories');

    // 5. Delete the "Study" category (assuming no active tasks remain under it).
    const row = page.locator('tr, .category-item').filter({ hasText: 'Study' });
    await row.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 6. Verify category is removed from categories list.
    await expect(page.locator('table, .category-list')).not.toContainText('Study');

    // 7. Open dashboard, click "Add Task", verify "Study" is no longer in the category dropdown.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    const dropdown = page.locator('select[name="categoryId"]');
    await expect(dropdown.locator('option')).not.toContainText(['Study']);
  });

  test('T4_SCEN_03: Monorepo Category Restructuring', async ({ page }) => {
    // 1. Create category "General Operations".
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('General Operations');
    await page.locator('textarea[name="description"]').fill('Consolidated categories');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Go to Dashboard, filter by Category "Work".
    await page.goto('/');
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'Work' });

    // 3. Edit each visible task and change category to "General Operations".
    let workCardsCount = await page.locator('.task-card, .task-item').count();
    while (workCardsCount > 0) {
      const card = page.locator('.task-card, .task-item').first();
      await card.locator('.btn-edit, text="Edit"').click();
      await page.locator('select[name="categoryId"]').selectOption({ label: 'General Operations' });
      await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForTimeout(200);
      workCardsCount = await page.locator('.task-card, .task-item').count(); // It drops out because filter Category Work is active
    }

    // 4. Filter dashboard by Category "Personal".
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'Personal' });

    // 5. Edit each task and change category to "General Operations".
    let personalCardsCount = await page.locator('.task-card, .task-item').count();
    while (personalCardsCount > 0) {
      const card = page.locator('.task-card, .task-item').first();
      await card.locator('.btn-edit, text="Edit"').click();
      await page.locator('select[name="categoryId"]').selectOption({ label: 'General Operations' });
      await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForTimeout(200);
      personalCardsCount = await page.locator('.task-card, .task-item').count();
    }

    // 6. Go to /categories.
    await page.goto('/categories');

    // 7. Click delete on "Work", click confirm.
    const rowWork = page.locator('tr, .category-item').filter({ hasText: 'Work' });
    await rowWork.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 8. Click delete on "Personal", click confirm.
    const rowPersonal = page.locator('tr, .category-item').filter({ hasText: 'Personal' });
    await rowPersonal.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 9. Verify both categories are successfully deleted.
    await expect(page.locator('table, .category-list')).not.toContainText('Work');
    await expect(page.locator('table, .category-list')).not.toContainText('Personal');

    // 10. Go to Dashboard, verify all tasks now display "General Operations" category badge.
    await page.goto('/');
    await page.locator('select[name="filterCategory"]').selectOption('');
    const badges = await page.locator('.task-card .task-category, .task-item .task-category').allTextContents();
    for (const badge of badges) {
      expect(badge).toContain('General Operations');
    }
  });

  test('T4_SCEN_04: End-of-Day Task Handover & Follow-Up Scheduling', async ({ page }) => {
    await page.goto('/');

    // 1. Filter dashboard by "Status: EN_COURS".
    await page.locator('select[name="filterStatus"]').selectOption('EN_COURS');

    // 2. Select active task, edit it, update status to "TERMINE". Save.
    const card = page.locator('.task-card, .task-item').first();
    const title = await card.locator('.task-title').textContent();
    await card.locator('.btn-edit, text="Edit"').click();
    await page.locator('select[name="status"]').selectOption('TERMINE');
    await page.getByRole('button', { name: 'Save' }).click();

    // 3. Click "Add Task". Create task "Resume endpoint integration", Status: "A_FAIRE", Priority: "HAUTE", Category: "Work", Due Date: tomorrow's date.
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Resume endpoint integration');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('select[name="status"]').selectOption('A_FAIRE');
    await page.locator('select[name="priority"]').selectOption('HAUTE');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.locator('input[name="dueDate"]').fill(dateString);
    await page.getByRole('button', { name: 'Submit' }).click();

    // 4. Reset filters.
    await page.locator('select[name="filterStatus"]').selectOption('');

    // 5. Verify the new task is listed as high priority and the previous task status is completed.
    const newCard = page.locator('.task-card, .task-item').filter({ hasText: 'Resume endpoint integration' });
    await expect(newCard).toBeVisible();
    await expect(newCard.locator('.priority-badge')).toContainText('HAUTE');

    const oldCard = page.locator('.task-card, .task-item').filter({ hasText: title || '' });
    await expect(oldCard.locator('.task-status')).toContainText('TERMINE');
  });

  test('T4_SCEN_05: High-Priority Overdue Task Escalation Triage', async ({ page }) => {
    // Make sure we have a low priority overdue task
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Triage Escalation Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('select[name="priority"]').selectOption('BASSE');
    await page.locator('input[name="dueDate"]').fill('2020-01-01');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 1. Filter dashboard by Priority "BASSE".
    await page.locator('select[name="filterPriority"]').selectOption('BASSE');

    // 2. Find an overdue task card.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Triage Escalation Task' });
    // 3. Click edit.
    await card.locator('.btn-edit, text="Edit"').click();

    // 4. Change Priority to "HAUTE".
    await page.locator('select[name="priority"]').selectOption('HAUTE');
    // 5. Change Status to "EN_COURS".
    await page.locator('select[name="status"]').selectOption('EN_COURS');
    // 6. Add description note: "[Triage] Escalated on Monday because task is overdue."
    await page.locator('textarea[name="description"]').fill('[Triage] Escalated on Monday because task is overdue.');
    // 7. Save.
    await page.getByRole('button', { name: 'Save' }).click();

    // 8. Assert task disappears from "BASSE" list.
    await expect(card).not.toBeVisible();

    // 9. Filter dashboard by "HAUTE".
    await page.locator('select[name="filterPriority"]').selectOption('HAUTE');

    // 10. Verify task is displayed with red priority badge, in-progress badge, and description containing the triage note.
    const escalatedCard = page.locator('.task-card, .task-item').filter({ hasText: 'Triage Escalation Task' });
    await expect(escalatedCard).toBeVisible();
    await expect(escalatedCard.locator('.priority-badge')).toContainText('HAUTE');
    await expect(escalatedCard.locator('.task-status')).toContainText('EN_COURS');
    
    // Open details to verify description note
    await escalatedCard.locator('.btn-view, text="View"').click();
    await expect(page.locator('.task-details-modal, [role="dialog"]')).toContainText('[Triage] Escalated on Monday because task is overdue.');
    await page.locator('[aria-label="Close"], .btn-close').click();
  });

});
