import { test, expect } from '@playwright/test';

test.describe('Issue #60: Pro & Con List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Pro & Con List"):visible').first().click();
    await page.waitForSelector('text=Brainstorm the pros and cons');
  });

  test('tool appears in sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button:has-text("Pro & Con List"):visible').first()).toBeVisible();
  });

  test('user can type a topic and see it displayed as heading', async ({ page }) => {
    await page.fill('#topic', 'Should I switch jobs?');
    await expect(page.locator('text=Should I switch jobs?').last()).toBeVisible();
  });

  test('user can add a pro item via button click', async ({ page }) => {
    await page.fill('input[placeholder="Add a pro…"]', 'Better salary');
    await page.locator('button:has-text("Add")').first().click();
    await expect(page.locator('text=Better salary')).toBeVisible();
  });

  test('user can add a pro item via Enter key', async ({ page }) => {
    await page.fill('input[placeholder="Add a pro…"]', 'Remote work');
    await page.locator('input[placeholder="Add a pro…"]').press('Enter');
    await expect(page.locator('text=Remote work')).toBeVisible();
  });

  test('user can add a con item via button click', async ({ page }) => {
    await page.fill('input[placeholder="Add a con…"]', 'Long commute');
    await page.locator('button:has-text("Add")').last().click();
    await expect(page.locator('text=Long commute')).toBeVisible();
  });

  test('user can add a con item via Enter key', async ({ page }) => {
    await page.fill('input[placeholder="Add a con…"]', 'Less vacation');
    await page.locator('input[placeholder="Add a con…"]').press('Enter');
    await expect(page.locator('text=Less vacation')).toBeVisible();
  });

  test('each added item has a delete button', async ({ page }) => {
    await page.fill('input[placeholder="Add a pro…"]', 'Good culture');
    await page.locator('button:has-text("Add")').first().click();
    const item = page.locator('li').filter({ hasText: 'Good culture' });
    await expect(item.locator('button[aria-label="Delete item"]')).toBeVisible();
  });

  test('user can delete an individual pro item', async ({ page }) => {
    await page.fill('input[placeholder="Add a pro…"]', 'Delete me');
    await page.locator('button:has-text("Add")').first().click();
    await expect(page.locator('text=Delete me')).toBeVisible();
    const item = page.locator('li').filter({ hasText: 'Delete me' });
    await item.locator('button[aria-label="Delete item"]').click();
    await expect(page.locator('text=Delete me')).not.toBeVisible();
  });

  test('user can reset all items and topic with one action', async ({ page }) => {
    await page.fill('#topic', 'My Decision');
    await page.fill('input[placeholder="Add a pro…"]', 'Pro one');
    await page.locator('button:has-text("Add")').first().click();
    await page.fill('input[placeholder="Add a con…"]', 'Con one');
    await page.locator('button:has-text("Add")').last().click();
    await page.locator('button:has-text("Reset")').click();
    await expect(page.locator('#topic')).toHaveValue('');
    await expect(page.locator('text=Pro one')).not.toBeVisible();
    await expect(page.locator('text=Con one')).not.toBeVisible();
  });

  test('topic and items survive a page refresh', async ({ page }) => {
    await page.fill('#topic', 'Persistent Topic');
    await page.fill('input[placeholder="Add a pro…"]', 'Persistent Pro');
    await page.locator('button:has-text("Add")').first().click();
    await expect(page.locator('text=Persistent Pro')).toBeVisible();
    await page.fill('input[placeholder="Add a con…"]', 'Persistent Con');
    await page.locator('button:has-text("Add")').last().click();
    await expect(page.locator('text=Persistent Con')).toBeVisible();
    // wait until the persist useEffect has written all data to localStorage before reloading
    await page.waitForFunction(() => {
      const s = window.localStorage.getItem('helpful-tools-procon');
      if (!s) return false;
      const d = JSON.parse(s);
      return d.topic === 'Persistent Topic' && d.pros.length > 0 && d.cons.length > 0;
    });
    await page.reload();
    await page.locator('button:has-text("Pro & Con List"):visible').first().click();
    await page.waitForSelector('text=Brainstorm the pros and cons');
    // wait for localStorage hydration (useEffect fires after initial render)
    await expect(page.locator('#topic')).toHaveValue('Persistent Topic', { timeout: 5000 });
    await expect(page.locator('text=Persistent Pro')).toBeVisible();
    await expect(page.locator('text=Persistent Con')).toBeVisible();
    // cleanup
    await page.locator('button:has-text("Reset")').click();
  });

  test('empty-state message shown when no pros added', async ({ page }) => {
    await expect(page.locator('text=No pros added yet.')).toBeVisible();
  });

  test('empty-state message shown when no cons added', async ({ page }) => {
    await expect(page.locator('text=No cons added yet.')).toBeVisible();
  });

  test('input field is cleared after adding a pro item', async ({ page }) => {
    await page.fill('input[placeholder="Add a pro…"]', 'Cleared after add');
    await page.locator('button:has-text("Add")').first().click();
    await expect(page.locator('input[placeholder="Add a pro…"]')).toHaveValue('');
  });

  test('input field is cleared after adding a con item', async ({ page }) => {
    await page.fill('input[placeholder="Add a con…"]', 'Cleared after add');
    await page.locator('button:has-text("Add")').last().click();
    await expect(page.locator('input[placeholder="Add a con…"]')).toHaveValue('');
  });
});
