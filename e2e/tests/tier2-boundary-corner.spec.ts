import { test, expect } from '@playwright/test';

test.describe('Tier 2: Boundary & Corner Cases', () => {

  // --- Feature 1: Category Creation Boundaries ---

  test('T2_CAT_CREATE_01: Create Category with Empty Name (Validation Error)', async ({ page }) => {
    // 1. Open Category Form.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    // 2. Leave Name empty, input description.
    await page.locator('textarea[name="description"]').fill('Description here');
    // 3. Attempt to click `"Submit"`.
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    // 4. Assert input has invalid state or validation message `"Name is required"` is visible.
    // If Angular forms are used, submit might be disabled or show message when touched/submitted
    if (await submitBtn.isDisabled()) {
      expect(await submitBtn.isDisabled()).toBe(true);
    } else {
      await submitBtn.click();
      await expect(page.locator('.error-msg, text="Name is required", text="Le nom est obligatoire"')).toBeVisible();
    }
  });

  test('T2_CAT_CREATE_02: Create Category with Name Too Short (2 characters)', async ({ page }) => {
    // 1. Fill Name with `"IT"`.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('IT');
    // 2. Assert message `"Name must be at least 3 characters"` is displayed.
    // 3. Assert submit button is disabled.
    await expect(page.locator('.error-msg, text="Name must be at least 3 characters", text="Le nom doit contenir au moins 3 caractères"')).toBeVisible();
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeDisabled();
  });

  test('T2_CAT_CREATE_03: Create Category with Name Exceeding 50 characters', async ({ page }) => {
    // 1. Fill Name with `"C"`.repeat(51).
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    const longName = 'C'.repeat(51);
    await page.locator('input[name="name"]').fill(longName);
    // 2. Assert validation message `"Name cannot exceed 50 characters"` or input is blocked.
    const validationMsg = page.locator('.error-msg, text="Name cannot exceed 50 characters", text="Le nom ne peut pas dépasser 50 caractères"');
    const inputVal = await page.locator('input[name="name"]').inputValue();
    if (inputVal.length > 50) {
      await expect(validationMsg).toBeVisible();
      await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
    } else {
      // If HTML max-length constraint prevents typing more than 50
      expect(inputVal.length).toBe(50);
    }
  });

  test('T2_CAT_CREATE_04: Create Category with Duplicate Name', async ({ page }) => {
    // 1. Open form, input name `"Work"` (already exists).
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('Work');
    await page.locator('textarea[name="description"]').fill('Duplicate work category');
    // 2. Submit.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 3. Assert toast error or inline warning `"Category name already exists"`.
    await expect(page.locator('.toast-error, .error-msg, [role="alert"]')).toContainText(['already exists', 'déjà', 'Work']);
  });

  test('T2_CAT_CREATE_05: Category Description Length Boundary (255 characters)', async ({ page }) => {
    // 1. Input name `"Testing"`.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('Testing');
    // 2. Input description of 256 characters.
    const longDesc = 'D'.repeat(256);
    await page.locator('textarea[name="description"]').fill(longDesc);
    // 3. Assert validation message `"Description cannot exceed 255 characters"` appears.
    const inputVal = await page.locator('textarea[name="description"]').inputValue();
    if (inputVal.length > 255) {
      await expect(page.locator('.error-msg, text="Description cannot exceed 255 characters", text="La description ne peut pas dépasser 255 caractères"')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
    } else {
      expect(inputVal.length).toBe(255);
    }
  });

  // --- Feature 2: Category Deletion & List Boundaries ---

  test('T2_CAT_DELETE_01: Attempt to Delete Category with Assigned Tasks', async ({ page }) => {
    // 1. Navigate to `/categories`.
    await page.goto('/categories');
    // 2. Find category `"Work"` (which has prepopulated tasks).
    const row = page.locator('tr, .category-item').filter({ hasText: 'Work' });
    // 3. Click `"Delete"`.
    await row.locator('.btn-delete, button:has-text("Delete")').click();
    // 4. Assert that UI displays block dialog or error toast `"Cannot delete category with associated tasks"`.
    await expect(page.locator('.toast-error, .error-msg, [role="alert"]')).toContainText(['Cannot delete category', 'associated tasks', 'associées', 'impossible']);
  });

  test('T2_CAT_DELETE_02: Delete Last Remaining Category', async ({ page }) => {
    // Delete all categories via API to ensure clean slate
    await page.goto('/categories');
    // Read category rows
    const categories = await page.locator('tr .category-name, .category-item .category-name').allTextContents();
    for (const catName of categories) {
      // Find row and delete
      const row = page.locator('tr, .category-item').filter({ hasText: catName });
      await row.locator('.btn-delete, button:has-text("Delete")').first().click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      // Wait for deletion or toast
      await page.waitForTimeout(500);
    }
    
    // 2. Navigate to Dashboard, click `"Create Task"`.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    // 3. Assert category selector is disabled or displays `"Please create a category first"`.
    const dropdown = page.locator('select[name="categoryId"]');
    const disabledState = await dropdown.isDisabled();
    if (disabledState) {
      expect(disabledState).toBe(true);
    } else {
      const options = await dropdown.locator('option').allTextContents();
      const validOptions = options.map(o => o.trim()).filter(o => o !== '');
      expect(validOptions.length).toBe(0);
    }
  });

  test('T2_CAT_DELETE_03: Double Click Delete Confirmation', async ({ page }) => {
    // 1. Create a dummy category.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('Dummy Double');
    await page.locator('textarea[name="description"]').fill('Desc');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Click "Delete".
    const row = page.locator('tr, .category-item').filter({ hasText: 'Dummy Double' });
    await row.locator('.btn-delete, button:has-text("Delete")').click();

    // 3. Double-click the "Confirm" button quickly.
    const confirmBtn = page.getByRole('button', { name: 'Confirm' });
    await confirmBtn.dblclick();

    // 4. Assert category deletes without application crash.
    await expect(page.locator('table, .category-list')).not.toContainText('Dummy Double');
  });

  test('T2_CAT_DELETE_04: Overlong Category Name UI Overflow', async ({ page }) => {
    // 1. Create category with name `"A".repeat(45)`.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    const longName = 'A'.repeat(45);
    await page.locator('input[name="name"]').fill(longName);
    await page.locator('textarea[name="description"]').fill('layout test');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Open task creation and look at the layout.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();

    // 3. Assert elements do not overflow viewport width.
    const width = await page.evaluate(() => window.innerWidth);
    const formWidth = await page.locator('form, .modal-content').first().evaluate(el => el.getBoundingClientRect().width);
    expect(formWidth).toBeLessThanOrEqual(width);
  });

  test('T2_CAT_DELETE_05: Navigate to Non-existent Category URL', async ({ page }) => {
    // 1. Go directly to URL `/categories/99999`.
    await page.goto('/categories/99999');
    // 2. Verify application redirects or displays "Category Not Found".
    const bodyText = await page.locator('body').textContent();
    const isNotFound = bodyText?.includes('Not Found') || bodyText?.includes('not found') || bodyText?.includes('introuvable') || (page.url() !== '/categories/99999');
    expect(isNotFound).toBe(true);
  });

  // --- Feature 3: Task Creation Boundaries ---

  test('T2_TASK_CREATE_01: Create Task with Empty Title', async ({ page }) => {
    // 1. Open Task Form.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    // 2. Leave title empty, set status, priority, category.
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    // 3. Assert validation error `"Title is required"` and submit button is inactive.
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    if (await submitBtn.isDisabled()) {
      expect(await submitBtn.isDisabled()).toBe(true);
    } else {
      await submitBtn.click();
      await expect(page.locator('.error-msg, text="Title is required", text="Le titre est obligatoire"')).toBeVisible();
    }
  });

  test('T2_TASK_CREATE_02: Create Task with Past Due Date', async ({ page }) => {
    // 1. Open Task Form.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    // 2. Set due date to `"2020-01-01"`.
    await page.locator('input[name="title"]').fill('Past Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('input[name="dueDate"]').fill('2020-01-01');
    // 3. Submit.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 4. Verify task displays on dashboard with overdue indicator.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Past Task' });
    await expect(card.locator('.overdue-alert, text="En retard", text="Overdue"')).toBeVisible();
  });

  test('T2_TASK_CREATE_03: Create Task with Title Exceeding Limit', async ({ page }) => {
    // 1. Input Title `"A".repeat(101)`.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    const longTitle = 'A'.repeat(101);
    await page.locator('input[name="title"]').fill(longTitle);
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    // 2. Assert validation error `"Title cannot exceed 100 characters"`.
    const titleVal = await page.locator('input[name="title"]').inputValue();
    if (titleVal.length > 100) {
      await expect(page.locator('.error-msg, text="Title cannot exceed 100 characters", text="Le titre ne peut pas dépasser 100 caractères"')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
    } else {
      expect(titleVal.length).toBe(100);
    }
  });

  test('T2_TASK_CREATE_04: Create Task with Today\'s Date as Due Date', async ({ page }) => {
    // 1. Set due date to current local date.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Today Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="dueDate"]').fill(today);
    // 2. Submit.
    await page.getByRole('button', { name: 'Submit' }).click();
    // 3. Verify task is created without errors.
    await expect(page.locator('.task-card, .task-item').filter({ hasText: 'Today Task' })).toBeVisible();
  });

  test('T2_TASK_CREATE_05: Task Creation without Category', async ({ page }) => {
    // 1. Open Task Form.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    // 2. Fill title, select no category.
    await page.locator('input[name="title"]').fill('No Category Task');
    await page.locator('select[name="categoryId"]').selectOption('');
    // 3. Verify validation error or disabled submit button.
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    if (await submitBtn.isDisabled()) {
      expect(await submitBtn.isDisabled()).toBe(true);
    } else {
      await submitBtn.click();
      await expect(page.locator('.error-msg, text="Category is required", text="La catégorie est obligatoire"')).toBeVisible();
    }
  });

  // --- Feature 4: Task Reading / Dashboard List Boundaries ---

  test('T2_TASK_READ_01: Task Card Multi-line Text Wrapping', async ({ page }) => {
    // 1. Create a task with description having 5 lines of text.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Multiline Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    const multilineDesc = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    await page.locator('textarea[name="description"]').fill(multilineDesc);
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Observe task card on dashboard.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Multiline Task' });
    // 3. Assert task card height adjusts or displays scroll/truncation without overlapping other cards.
    const boundingBox = await card.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.height).toBeGreaterThan(50);
  });

  test('T2_TASK_READ_02: Task Title Unicode Rendering', async ({ page }) => {
    // 1. Create task with title `"🎯 Finish sprint #3! [100%]"`
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    const unicodeTitle = '🎯 Finish sprint #3! [100%]';
    await page.locator('input[name="title"]').fill(unicodeTitle);
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Assert text is displayed accurately on dashboard.
    await expect(page.locator('.task-card, .task-item').filter({ hasText: unicodeTitle })).toBeVisible();
  });

  test('T2_TASK_READ_03: Load Dashboard with Large Volume of Tasks (100 Tasks)', async ({ page }) => {
    // 1. Send 100 task posts via API.
    // Fetch a valid category ID first
    const categoriesResponse = await page.request.get('http://localhost:8080/api/categories');
    const categories = await categoriesResponse.json();
    const category = categories[0] || { id: 1, name: 'Work' };

    for (let i = 0; i < 100; i++) {
      await page.request.post('http://localhost:8080/api/tasks', {
        data: {
          title: `Bulk Task ${i}`,
          description: `Bulk description ${i}`,
          status: 'A_FAIRE',
          priority: 'MOYENNE',
          dueDate: new Date().toISOString().split('T')[0],
          category: category
        }
      });
    }

    // 2. Navigate to Dashboard.
    const startTime = Date.now();
    await page.goto('/');
    // 3. Verify page renders within 2 seconds.
    const taskCount = await page.locator('.task-card, .task-item').count();
    const elapsed = Date.now() - startTime;
    
    expect(taskCount).toBeGreaterThanOrEqual(100);
    expect(elapsed).toBeLessThan(2000);
  });

  test('T2_TASK_READ_04: Navigate to Non-existent Task Details URL', async ({ page }) => {
    // 1. Navigate directly to `/tasks/99999`.
    await page.goto('/tasks/99999');
    // 2. Verify 404 message or dashboard redirect.
    const bodyText = await page.locator('body').textContent();
    const isNotFound = bodyText?.includes('Not Found') || bodyText?.includes('not found') || bodyText?.includes('introuvable') || (page.url() !== '/tasks/99999');
    expect(isNotFound).toBe(true);
  });

  test('T2_TASK_READ_05: Verify URL Hash/Query Synchronization', async ({ page }) => {
    // 1. Navigate directly to `/?status=TERMINE`.
    await page.goto('/?status=TERMINE');
    // 2. Verify status filter dropdown is pre-selected to "TERMINE".
    const filter = page.locator('select[name="filterStatus"]');
    await expect(filter).toHaveValue('TERMINE');
    // 3. Verify only completed tasks are shown.
    const statuses = await page.locator('.task-card .task-status, .task-item .task-status').allTextContents();
    for (const status of statuses) {
      expect(status).toContain('TERMINE');
    }
  });

  // --- Feature 5: Task Editing / Updating Boundaries ---

  test('T2_TASK_UPDATE_01: Clear Task Title during Update', async ({ page }) => {
    // 1. Click "Edit" on a task.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').first();
    await card.locator('.btn-edit, text="Edit"').click();
    // 2. Clear title input field.
    await page.locator('input[name="title"]').clear();
    // 3. Assert validation warning `"Title is required"` and save is blocked.
    const saveBtn = page.getByRole('button', { name: 'Save' });
    if (await saveBtn.isDisabled()) {
      expect(await saveBtn.isDisabled()).toBe(true);
    } else {
      await saveBtn.click();
      await expect(page.locator('.error-msg, text="Title is required", text="Le titre est obligatoire"')).toBeVisible();
    }
  });

  test('T2_TASK_UPDATE_02: Update Due Date to Past Date', async ({ page }) => {
    // 1. Edit task with future due date.
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Will Be Past Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('input[name="dueDate"]').fill('2099-01-01');
    await page.getByRole('button', { name: 'Submit' }).click();

    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Will Be Past Task' });
    await card.locator('.btn-edit, text="Edit"').click();

    // 2. Change due date to yesterday's date.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];
    await page.locator('input[name="dueDate"]').fill(dateString);
    // 3. Save.
    await page.getByRole('button', { name: 'Save' }).click();
    // 4. Assert overdue badge is now displayed on card.
    await expect(card.locator('.overdue-alert, text="En retard", text="Overdue"')).toBeVisible();
  });

  test('T2_TASK_UPDATE_03: Complete Overdue Task', async ({ page }) => {
    // 1. Identify an overdue task card (red warning visible).
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').filter({ has: page.locator('.overdue-alert, text="En retard", text="Overdue"') }).first();
    const title = await card.locator('.task-title').textContent();
    
    // 2. Edit the task and change status to `"TERMINE"`.
    await card.locator('.btn-edit, text="Edit"').click();
    await page.locator('select[name="status"]').selectOption('TERMINE');
    // 3. Save.
    await page.getByRole('button', { name: 'Save' }).click();

    // 4. Assert overdue warning tag is no longer visible on card.
    const updatedCard = page.locator('.task-card, .task-item').filter({ hasText: title || '' });
    await expect(updatedCard.locator('.overdue-alert, text="En retard", text="Overdue"')).not.toBeVisible();
  });

  test('T2_TASK_UPDATE_04: Re-assign to New Category', async ({ page }) => {
    // 1. Create category `"Marketing"`.
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('Marketing');
    await page.locator('textarea[name="description"]').fill('Marketing ops');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Edit a task, select `"Marketing"`.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').first();
    const title = await card.locator('.task-title').textContent();
    await card.locator('.btn-edit, text="Edit"').click();
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Marketing' });
    // 3. Save.
    await page.getByRole('button', { name: 'Save' }).click();

    // 4. Assert task displays category `"Marketing"`.
    const updatedCard = page.locator('.task-card, .task-item').filter({ hasText: title || '' });
    await expect(updatedCard).toContainText('Marketing');
  });

  test('T2_TASK_UPDATE_05: Cancel Edits Preserves Original Values', async ({ page }) => {
    // 1. Edit a task.
    await page.goto('/');
    const card = page.locator('.task-card, .task-item').first();
    const originalTitle = await card.locator('.task-title').textContent();
    await card.locator('.btn-edit, text="Edit"').click();
    
    // 2. Change title to `"New Title"`.
    await page.locator('input[name="title"]').fill('New Title');
    // 3. Click `"Cancel"`.
    await page.getByRole('button', { name: 'Cancel' }).click();

    // 4. Assert title on dashboard is still the original title.
    await expect(card.locator('.task-title')).toContainText(originalTitle || '');
  });

  // --- Feature 6: Task Deletion Boundaries ---

  test('T2_TASK_DELETE_01: Concurrent Deletion', async ({ page, context }) => {
    // 1. Create a task first
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Concurrent Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.getByRole('button', { name: 'Submit' }).click();

    // Open dashboard in two side-by-side browser contexts.
    const pageB = await context.newPage();
    await pageB.goto('/');

    // Delete in page A
    const cardA = page.locator('.task-card, .task-item').filter({ hasText: 'Concurrent Task' });
    await cardA.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(cardA).not.toBeVisible();

    // Attempt to delete in page B
    const cardB = pageB.locator('.task-card, .task-item').filter({ hasText: 'Concurrent Task' });
    await cardB.locator('.btn-delete, button:has-text("Delete")').click();
    await pageB.getByRole('button', { name: 'Confirm' }).click();

    // Assert that context B handles the 404 response gracefully.
    await expect(pageB.locator('.toast-error, .error-msg, [role="alert"]')).toBeVisible();
    await pageB.close();
  });

  test('T2_TASK_DELETE_02: Delete All Tasks Empty Dashboard UI', async ({ page }) => {
    await page.goto('/');
    // Sequentially delete every task
    let taskCount = await page.locator('.task-card, .task-item').count();
    while (taskCount > 0) {
      await page.locator('.task-card, .task-item').first().locator('.btn-delete, button:has-text("Delete")').click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      await page.waitForTimeout(200);
      taskCount = await page.locator('.task-card, .task-item').count();
    }
    // Verify dashboard displays "No tasks found"
    await expect(page.locator('.no-tasks-msg, text="No tasks found"')).toBeVisible();
  });

  test('T2_TASK_DELETE_03: Delete Filtered Task from Details Modal', async ({ page }) => {
    // 1. Create a Work task
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Filter Delete Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.getByRole('button', { name: 'Submit' }).click();

    // Filter by category "Work"
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'Work' });

    // Open details for a task and delete it
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Filter Delete Task' });
    await card.locator('.btn-view, text="View"').click();
    await page.locator('.task-details-modal .btn-delete, [role="dialog"] button:has-text("Delete Task")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Assert dashboard list remains filtered, and count is updated
    await expect(page.locator('select[name="filterCategory"]')).toHaveValue(/Work/);
    await expect(card).not.toBeVisible();
  });

  test('T2_TASK_DELETE_04: Category Preserved on Task Deletion', async ({ page }) => {
    // 1. Create a task linked to Work
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Preserve Category Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.getByRole('button', { name: 'Submit' }).click();

    // Delete tasks linked to category "Work"
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Preserve Category Task' });
    await card.locator('.btn-delete, button:has-text("Delete")').click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Go to /categories and assert category "Work" is still present
    await page.goto('/categories');
    await expect(page.locator('table, .category-list')).toContainText('Work');
  });

  test('T2_TASK_DELETE_05: Delete Confirmation Modal Escape Key Dismissal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Escape Delete Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.getByRole('button', { name: 'Submit' }).click();

    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Escape Delete Task' });
    await card.locator('.btn-delete, button:has-text("Delete")').click();

    // Press keyboard "Escape"
    await page.keyboard.press('Escape');

    // Assert confirmation modal closes and task remains
    await expect(page.locator('.delete-confirm-modal, [role="dialog"]')).not.toBeVisible();
    await expect(card).toBeVisible();
  });

  // --- Feature 7: Visual Indicators & Styles Boundaries ---

  test('T2_VISUAL_IND_01: Task Due on Leap Day Overdue Check', async ({ page }) => {
    // 1. Create task with due date "2024-02-29".
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Leap Day Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('input[name="dueDate"]').fill('2024-02-29');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Assert task displays overdue warning (since 2024-02-29 is in the past).
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Leap Day Task' });
    await expect(card.locator('.overdue-alert, text="En retard", text="Overdue"')).toBeVisible();
  });

  test('T2_VISUAL_IND_02: Task Due in Far Future (Year 2099)', async ({ page }) => {
    // 1. Create task with due date "2099-12-31".
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Far Future Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('input[name="dueDate"]').fill('2099-12-31');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Assert date format renders and no overdue styles are present.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Far Future Task' });
    await expect(card.locator('.overdue-alert, text="En retard", text="Overdue"')).not.toBeVisible();
    await expect(card).toContainText('2099-12-31');
  });

  test('T2_VISUAL_IND_03: Viewport Responsive Breakpoints', async ({ page }) => {
    // 1. Resize viewport to 375x667.
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // 2. Verify priority indicators are fully visible and readable.
    const badge = page.locator('.badge-priority, .priority-badge').first();
    await expect(badge).toBeVisible();
  });

  test('T2_VISUAL_IND_04: Completed Task Overdue Exemption', async ({ page }) => {
    // 1. Create overdue task with status "TERMINE"
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Completed Overdue Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.locator('input[name="dueDate"]').fill('2020-01-01');
    await page.locator('select[name="status"]').selectOption('TERMINE');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Verify task card does not show red overdue warning.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Completed Overdue Task' });
    await expect(card.locator('.overdue-alert, text="En retard", text="Overdue"')).not.toBeVisible();
  });

  test('T2_VISUAL_IND_05: Priority Badge Color Contrast', async ({ page }) => {
    await page.goto('/');
    // Locate HAUTE badge
    const badge = page.locator('.badge-priority, .priority-badge').filter({ hasText: 'HAUTE' }).first();
    await expect(badge).toHaveClass(/bg-red-100/);
    await expect(badge).toHaveClass(/text-red-800/);
  });

  // --- Feature 8: Dashboard Task Filtering Boundaries ---

  test('T2_DASH_FILTER_01: Filter Category with Zero Tasks', async ({ page }) => {
    // 1. Create category "Vacations".
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.locator('input[name="name"]').fill('Vacations');
    await page.locator('textarea[name="description"]').fill('Trips');
    await page.getByRole('button', { name: 'Submit' }).click();

    // 2. Set category filter to "Vacations".
    await page.goto('/');
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'Vacations' });

    // 3. Assert dashboard shows empty state.
    await expect(page.locator('.no-tasks-msg, text="No tasks found"')).toBeVisible();
  });

  test('T2_DASH_FILTER_02: Add Task Matching Active Filter', async ({ page }) => {
    await page.goto('/');
    // 1. Filter by category "Work".
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'Work' });

    // 2. Create a task with category "Work".
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Matching Filter Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Work' });
    await page.getByRole('button', { name: 'Submit' }).click();

    // 3. Assert task appears in the dashboard list.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Matching Filter Task' });
    await expect(card).toBeVisible();
  });

  test('T2_DASH_FILTER_03: Add Task Not Matching Active Filter', async ({ page }) => {
    await page.goto('/');
    // 1. Filter by category "Work".
    await page.locator('select[name="filterCategory"]').selectOption({ label: 'Work' });

    // 2. Create a task with category "Personal".
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.locator('input[name="title"]').fill('Non Matching Filter Task');
    await page.locator('select[name="categoryId"]').selectOption({ label: 'Personal' });
    await page.getByRole('button', { name: 'Submit' }).click();

    // 3. Assert task does not appear in dashboard list.
    const card = page.locator('.task-card, .task-item').filter({ hasText: 'Non Matching Filter Task' });
    await expect(card).not.toBeVisible();
  });

  test('T2_DASH_FILTER_04: Filter Persistence Post-Edit', async ({ page }) => {
    // 1. Filter by priority "HAUTE".
    await page.goto('/');
    await page.locator('select[name="filterPriority"]').selectOption('HAUTE');

    const card = page.locator('.task-card, .task-item').filter({ hasText: 'HAUTE' }).first();
    const title = await card.locator('.task-title').textContent();

    // 2. Edit one of the visible tasks.
    await card.locator('.btn-edit, text="Edit"').click();
    await page.locator('textarea[name="description"]').fill('Updated description post-edit');
    // 3. Click save.
    await page.getByRole('button', { name: 'Save' }).click();

    // 4. Assert dashboard list is still filtered by "HAUTE".
    await expect(page.locator('select[name="filterPriority"]')).toHaveValue('HAUTE');
    const updatedCard = page.locator('.task-card, .task-item').filter({ hasText: title || '' });
    await expect(updatedCard).toBeVisible();
  });

  test('T2_DASH_FILTER_05: URL Query Parameter Update', async ({ page }) => {
    // 1. Select status filter "TERMINE".
    await page.goto('/');
    await page.locator('select[name="filterStatus"]').selectOption('TERMINE');
    // 2. Assert that browser URL contains ?status=TERMINE.
    expect(page.url()).toContain('status=TERMINE');
  });

});
