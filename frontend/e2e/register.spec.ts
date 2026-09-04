import { test, expect } from '@playwright/test';

/**
 * これらのテストは docker-compose のフルスタック（nginx/backend/postgres/frontend）が
 * https://localhost で起動している前提で実行する（`docker compose up -d`）。
 */

test.describe('新規登録フォーム', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=新規登録');
    await page.click('text=新規登録');
  });

  test('8文字未満のパスワードでは登録ボタンが無効化される', async ({ page }) => {
    const suffix = Date.now();
    await page.fill('input[type="email"]', `pwtest${suffix}@example.com`);
    await page.fill('input[type="text"]', `pwtest${suffix}`);
    await page.fill('input[type="password"]', 'short');

    await expect(page.getByText('あと3文字以上必要です（8文字以上）')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('既に使われているユーザー名では登録ボタンが無効化される', async ({ page }) => {
    const suffix = Date.now();
    await page.fill('input[type="email"]', `dup${suffix}@example.com`);
    await page.fill('input[type="text"]', 'Dev1');
    await page.fill('input[type="password"]', 'password123');

    await expect(page.getByText('そのユーザー名はすでに使われています')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('有効な内容で登録すると成功メッセージが表示されホーム画面に遷移する', async ({ page }) => {
    const suffix = Date.now();
    const email = `e2eplaywright${suffix}@example.com`;
    const username = `e2eplaywright${suffix}`;

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="text"]', username);
    await page.fill('input[type="password"]', 'password123');

    await expect(page.getByText('使用可能です').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();

    await page.click('button[type="submit"]');

    await expect(page.getByText('登録が完了しました')).toBeVisible();
    await expect(page.getByText('部屋を新しく作る')).toBeVisible({ timeout: 5000 });

    const storedUser = await page.evaluate(() => localStorage.getItem('ft_user'));
    expect(JSON.parse(storedUser ?? '{}').username).toBe(username);
  });
});
