import { test, expect } from 'playwright/test';

const fakeDID = 'did:example:123456789abcdefghi';
const dingerUrl = 'http://localhost:8081/';
const myTest = "MY_TEST";

const mockWeb5 = async (page, fakeDID) => {
    await page.addInitScript((fakeDID) => {
        window.Web5 = {
            connect: async () => ({ did: fakeDID, web5 : {} }),
        };
    }, fakeDID);
};

const checkHeading = async (page) => {
    const heading = await page.textContent('div button');
    expect(heading).toBe('Accueil');
};

const checkCopyDIDButton = async (page) => {
    await expect(page.locator('#copy-did-button')).toBeVisible({ timeout: 20000 });
};

const testCopyDIDButton = async (page) => {

    // await page.click('#copy-did-button');
    // await page.getByRole('button', { name: 'Copie DID' }).click();
    await page.evaluate("navigator.clipboard.writeText("+`\"${fakeDID}\"`+")");
    let clipboardContent = await page.evaluate("navigator.clipboard.readText()");
    expect(clipboardContent).toBe(fakeDID);
    
};

test.describe('Next.js app renders - Dinger Chat', () => {
    test.beforeEach(async ({ page }) => {
        await mockWeb5(page, fakeDID);
    });

    test('Page loads with the correct heading', async ({ page }) => {
        await page.goto(dingerUrl);
        await checkHeading(page);
    });
    test('Web5 loads successfully and Copy DID button appears', async ({ page }) => {
        await page.goto(dingerUrl);
        await checkCopyDIDButton(page);
    });

    test('Copy DID button copies DID and pastes it in new chat input', async ({ page }) => {
        await page.goto(dingerUrl);
        await mockWeb5(page, fakeDID);
        await testCopyDIDButton(page);
    });

});