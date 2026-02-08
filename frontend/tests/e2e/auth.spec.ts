import { test, expect } from '@playwright/test';

test.describe('Autenticação e Fluxo Principal', () => {
  test('deve realizar login com sucesso e carregar dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'admin@pdv.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h4')).toContainText('Centro de Comando');
  });

  test('deve abrir o command palette via atalho', async ({ page }) => {
    await page.goto('/dashboard');
    // Simular login se necessário ou usar estado persistido
    await page.keyboard.press('Control+K');
    await expect(page.locator('[cmdk-dialog]')).toBeVisible();
  });
});
