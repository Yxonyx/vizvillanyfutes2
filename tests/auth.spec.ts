import { test, expect } from '@playwright/test';

test.describe('VízVillanyFűtés Authentication', () => {

    test('Elfelejtett jelszó oldal betöltése', async ({ page }) => {
        // Navigálás a login oldalra egyenesen Szakember módba
        await page.goto('/login?role=contractor');
        await page.waitForLoadState('domcontentloaded');

        // Várunk amíg az Elfelejtett jelszó link látható lesz a DOM-ban
        const forgotPasswordLink = page.locator('a[href="/elfelejtett-jelszo"]').first();
        await forgotPasswordLink.waitFor({ state: 'visible', timeout: 10000 });

        // Elfelejtett jelszó link keresése és kattintása href alapján
        await forgotPasswordLink.click({ force: true });

        // Ellenőrizni, hogy a megfelelő URL-re értünk
        await expect(page).toHaveURL(/.*\/elfelejtett-jelszo/, { timeout: 10000 });

        // Megjelenik-e az email mező
        await expect(page.getByPlaceholder('pelda@email.hu')).toBeVisible();

        // Gomb létezik
        await expect(page.locator('button', { hasText: 'Visszaállító link küldése' })).toBeVisible();
    });

});
