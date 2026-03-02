import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Betöltjük a .env.local paramétereket a tesztkörnyezetbe
dotenv.config({ path: '.env.local' });

// A teszthez érdemes előkészíteni a Supabase környezetet, vagy egy megbízható tesztfiókot használni
// Ezt később kiemelhetjük egy globális teardown/setup fájlba is

// Setup Supabase Client for direct database interaction
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

test.describe('VízVillanyFűtés Core Flow: Lead Acceptance & Credits', () => {

    test('Teljes folyamat: Ügyfél felad -> Szaki jelentkezik (Függő) -> Ügyfél Elfogad', async ({ browser }) => {
        const uniqueId = crypto.randomBytes(4).toString('hex');
        const CUSTOMER_EMAIL = `test-customer-cf-${uniqueId}@example.com`;
        const CONTRACTOR_EMAIL = `test-contractor-cf-${uniqueId}@example.com`;
        const PASS = 'Test1234!';

        // 1. Két külön böngésző kontextus, hogy az Ügyfél és Szaki ne akadjon össze a sütikkel
        const customerContext = await browser.newContext();
        const contractorContext = await browser.newContext();

        const customerPage = await customerContext.newPage();
        const contractorPage = await contractorContext.newPage();

        // -- TEST USER SETUP API-N KERESZTÜL --

        // 1. Ügyfél regisztráció (Supabase Client Direct)
        const { data: customerData, error: customerError } = await supabase.auth.signUp({
            email: CUSTOMER_EMAIL,
            password: PASS,
            options: {
                data: {
                    full_name: 'Test Customer ' + uniqueId,
                    phone: '+3630' + Math.floor(1000000 + Math.random() * 9000000),
                    role: 'customer'
                }
            }
        });
        expect(customerError).toBeNull();

        // 2. Szakember regisztráció API-n
        const contractorRes = await contractorPage.request.post('/api/contractors/register', {
            data: {
                email: CONTRACTOR_EMAIL,
                password: PASS,
                display_name: 'Test Szaki ' + uniqueId,
                phone: '+3630' + Math.floor(1000000 + Math.random() * 9000000),
                type: 'individual',
                trades: ['viz'],
                service_areas: ['Budapest']
            }
        });

        const cBody = await contractorRes.text();
        if (!contractorRes.ok()) console.log('Contractor API Failed:', cBody);
        expect(contractorRes.ok()).toBeTruthy();

        // -- LÉPÉS 1: Ügyfél Belép és felad egy hirdetést --
        await customerPage.goto('/login?role=customer');
        await customerPage.waitForLoadState('domcontentloaded');
        await customerPage.getByPlaceholder('az-on-email-cime@pelda.hu').fill(CUSTOMER_EMAIL);
        await customerPage.getByPlaceholder('••••••••').fill(PASS);
        await customerPage.getByRole('button', { name: /bejelentkezés/i }).click();

        await expect(customerPage).toHaveURL('http://127.0.0.1:3000/', { timeout: 15000 });

        // -- LÉPÉS 1.5: Szakember Belép --
        await contractorPage.goto('/login?role=contractor');
        await contractorPage.waitForLoadState('domcontentloaded');
        await contractorPage.getByPlaceholder('pelda@email.hu').fill(CONTRACTOR_EMAIL);
        await contractorPage.getByPlaceholder('••••••••').fill(PASS);
        await contractorPage.getByRole('button', { name: /bejelentkezés/i }).click();

        await expect(contractorPage).toHaveURL(/.*\/contractor\/dashboard/, { timeout: 15000 });

        // TODO: Ügyfél UI-n új hiba bejelentése kitöltése
        await customerPage.getByRole('button', { name: /hiba bejelentése!/i }).first().click();

        // -- LÉPÉS 2: Szakember megkeresi és Elvállalja --
        await contractorPage.goto('/contractor-map');
        await expect(contractorPage).toHaveURL(/.*\/contractor-map/);

        // TODO: Munkára rákattintás, "Elvállalom (-2.000 Kredit) – Függőben"

        // -- LÉPÉS 3: Ügyfél elfogadja --
        await customerPage.reload(); // Frissít

        // TODO: A Szakik fülön rákattint az Elfogadom-ra

        // -- LÉPÉS 4: Validáció a Szakinál --
        await contractorPage.goto('/munkak');

        // Bezárás
        await customerContext.close();
        await contractorContext.close();
    });

});
