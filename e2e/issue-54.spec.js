import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:5173/tools/';

// The app renders two Sidebar instances (mobile overlay + desktop fixed).
// Both contain identical buttons — use :visible to target the rendered desktop sidebar.
const sidebarButton = (page) =>
  page.locator('button:has-text("Color Picker"):visible').first();

test.describe('Issue #54: Color Picker Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('color picker entry appears in sidebar', async ({ page }) => {
    await expect(sidebarButton(page)).toBeVisible();
  });

  test('sidebar entry has a lucide icon (svg)', async ({ page }) => {
    await expect(sidebarButton(page).locator('svg')).toBeVisible();
  });

  test('tool renders a native color input', async ({ page }) => {
    await sidebarButton(page).click();
    await expect(page.locator('input[type="color"]')).toBeVisible();
  });

  test('HEX, RGB, and HSL formats are all displayed simultaneously', async ({ page }) => {
    await sidebarButton(page).click();
    await expect(page.locator('input[type="color"]')).toBeVisible();

    await expect(page.locator('input[aria-label="HEX value"]')).toBeVisible();
    await expect(page.locator('input[aria-label="RGB value"]')).toBeVisible();
    await expect(page.locator('input[aria-label="HSL value"]')).toBeVisible();
  });

  test('each format has a copy-to-clipboard button', async ({ page }) => {
    await sidebarButton(page).click();
    await expect(page.locator('input[type="color"]')).toBeVisible();

    await expect(page.locator('button[aria-label="Copy HEX value"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Copy RGB value"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Copy HSL value"]')).toBeVisible();
  });

  test('copy button shows "Copied!" confirmation then reverts', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await sidebarButton(page).click();
    await expect(page.locator('input[type="color"]')).toBeVisible();

    const copyHexButton = page.locator('button[aria-label="Copy HEX value"]');
    await expect(copyHexButton).toContainText('Copy');
    await copyHexButton.click();
    await expect(copyHexButton).toContainText('Copied!');
    // Confirmation auto-clears after ~1.5s — wait up to 3s for revert
    await expect(copyHexButton).toContainText('Copy', { timeout: 3000 });
  });

  test('typing a valid HEX value updates RGB and HSL in real time', async ({ page }) => {
    await sidebarButton(page).click();
    await expect(page.locator('input[type="color"]')).toBeVisible();

    const hexInput = page.locator('input[aria-label="HEX value"]');
    await hexInput.fill('#ff0000');
    await hexInput.press('Tab');

    // Pure red: rgb(255, 0, 0) → hsl(0, 100%, 50%)
    await expect(page.locator('input[aria-label="RGB value"]')).toHaveValue('rgb(255, 0, 0)');
    await expect(page.locator('input[aria-label="HSL value"]')).toHaveValue('hsl(0, 100%, 50%)');
  });

  test('tool makes no external network requests', async ({ page }) => {
    const externalRequests = [];
    page.on('request', (request) => {
      const url = request.url();
      if (
        !url.startsWith('http://localhost:') &&
        !url.startsWith('https://localhost:') &&
        !url.startsWith('ws://') &&
        !url.startsWith('wss://')
      ) {
        externalRequests.push(url);
      }
    });

    await sidebarButton(page).click();
    await expect(page.locator('input[type="color"]')).toBeVisible();
    await page.locator('input[aria-label="HEX value"]').fill('#00ff00');

    expect(externalRequests).toHaveLength(0);
  });
});
