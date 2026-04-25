import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:5173/tools/';

// Both mobile overlay and desktop sidebar render identical buttons — target the visible one.
const contactButton = (page) =>
  page.locator('button:has-text("Contact Marc"):visible').first();

test.describe('Issue #58: Notify submitter via email when idea is implemented', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('IdeaModal has an optional notify-email field', async ({ page }) => {
    await contactButton(page).click();
    await expect(page.locator('#idea-notify-email')).toBeVisible();
  });

  test('notify-email label indicates the field is optional', async ({ page }) => {
    await contactButton(page).click();
    await expect(page.locator('label[for="idea-notify-email"]')).toContainText('optional');
  });

  test('send button is enabled without an email address (field is truly optional)', async ({ page }) => {
    await contactButton(page).click();
    await page.fill('#idea-subject', 'My Idea');
    // Leave notify-email blank
    await expect(page.locator('button:has-text("Send Idea")').first()).not.toBeDisabled();
  });

  test('submitter email is appended to mailto body when provided', async ({ page }) => {
    // Override window.open before clicking so we can capture the mailto URL
    await page.evaluate(() => {
      window.__capturedMailto = null;
      window.open = (url) => { window.__capturedMailto = url; };
    });

    await contactButton(page).click();
    await page.fill('#idea-subject', 'Test Idea');
    await page.fill('#idea-notify-email', 'test@example.com');
    await page.locator('button:has-text("Send Idea")').first().click();

    const capturedMailto = await page.evaluate(() => window.__capturedMailto);
    expect(capturedMailto).not.toBeNull();
    const decoded = decodeURIComponent(capturedMailto ?? '');
    expect(decoded).toContain('Notify-Email: test@example.com');
  });

  test('mailto body contains no Notify-Email line when email field is left blank', async ({ page }) => {
    await page.evaluate(() => {
      window.__capturedMailto = null;
      window.open = (url) => { window.__capturedMailto = url; };
    });

    await contactButton(page).click();
    await page.fill('#idea-subject', 'Test Idea');
    // Leave notify-email blank
    await page.locator('button:has-text("Send Idea")').first().click();

    const capturedMailto = await page.evaluate(() => window.__capturedMailto);
    const decoded = decodeURIComponent(capturedMailto ?? '');
    expect(decoded).not.toContain('Notify-Email');
  });
});
