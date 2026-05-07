import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:5173/tools/';

const qrTool = (page) =>
  page.locator('button:has-text("QR Code"):visible').first();

test.describe('Issue #62: Bug in the QR Code generator for Email', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await qrTool(page).click();
    await page.locator('button:has-text("Email")').first().click();
  });

  test('spaces in email subject are encoded as %20 not +', async ({ page }) => {
    await page.fill('input[placeholder="Recipient email"]', 'test@example.com');
    await page.fill('input[placeholder="Subject (optional)"]', 'Hello World');
    await page.locator('button:has-text("Generate QR Codes")').click();
    const payload = await page.locator('[data-testid="qr-code-card"]').getAttribute('data-payload');
    expect(payload).toContain('subject=Hello%20World');
    expect(payload).not.toContain('subject=Hello+World');
  });

  test('spaces in email body are encoded as %20 not +', async ({ page }) => {
    await page.fill('input[placeholder="Recipient email"]', 'test@example.com');
    await page.fill('textarea[placeholder="Message body (optional)"]', 'How are you');
    await page.locator('button:has-text("Generate QR Codes")').click();
    const payload = await page.locator('[data-testid="qr-code-card"]').getAttribute('data-payload');
    expect(payload).toContain('body=How%20are%20you');
    expect(payload).not.toContain('body=How+are+you');
  });

  test('newlines in body are encoded as %0D%0A', async ({ page }) => {
    await page.fill('input[placeholder="Recipient email"]', 'test@example.com');
    await page.fill('textarea[placeholder="Message body (optional)"]', 'Line1\nLine2');
    await page.locator('button:has-text("Generate QR Codes")').click();
    const payload = await page.locator('[data-testid="qr-code-card"]').getAttribute('data-payload');
    expect(payload).toContain('%0D%0A');
  });

  test('special characters in subject are correctly percent-encoded', async ({ page }) => {
    await page.fill('input[placeholder="Recipient email"]', 'test@example.com');
    await page.fill('input[placeholder="Subject (optional)"]', 'Q&A: 100% done!');
    await page.locator('button:has-text("Generate QR Codes")').click();
    const payload = await page.locator('[data-testid="qr-code-card"]').getAttribute('data-payload');
    expect(payload).toContain('%');
    expect(payload).not.toContain('subject=Q&A');
  });

  test('URL type QR generation is unaffected', async ({ page }) => {
    await page.locator('button:has-text("URL")').first().click();
    await page.fill('textarea[placeholder="https://example.com"]', 'https://example.com');
    await page.locator('button:has-text("Generate QR Codes")').click();
    const payload = await page.locator('[data-testid="qr-code-card"]').getAttribute('data-payload');
    expect(payload).toBe('https://example.com');
  });

  test('Text type QR generation is unaffected', async ({ page }) => {
    await page.locator('div.gap-2 button:has-text("Text")').click();
    await page.fill('textarea[placeholder="Type or paste text to encode"]', 'Hello World');
    await page.locator('button:has-text("Generate QR Codes")').click();
    const payload = await page.locator('[data-testid="qr-code-card"]').getAttribute('data-payload');
    expect(payload).toBe('Hello World');
  });
});
