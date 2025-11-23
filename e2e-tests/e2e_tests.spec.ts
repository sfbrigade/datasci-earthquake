import { test, expect } from '@playwright/test';
import { Headings } from "../app/data/data";

test("should load the home page with core UI elements", async ({page}) => {
  await page.goto('/');

  // Expects page to have a heading
  await expect(page.getByText(Headings.home.text)).toBeVisible();

  // Expects page to have SafeHome logo
  await expect(page.getByRole('link', { name: 'SafeHome logo SafeHome' })).toBeVisible();

  // Expects page to have searchbox
  await expect(page.getByRole('combobox', { name: 'Search San Francisco address' })).toBeVisible();

  // Expects page to have a map
  await expect(page.getByRole('region', { name: 'Map' })).toBeVisible();

  // Expects page to have 3 hazard cards
  const cards = page.locator('.chakra-card__root');
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toBeVisible();
  await expect(cards.nth(1)).toBeVisible();
  await expect(cards.nth(2)).toBeVisible();
});

test('should display correct hazard report for a searched address', async ({ page }) => {
  await page.goto('/');
  const searchBox = page.getByRole('combobox', { name: 'Search San Francisco address' });
  await searchBox.click();
  await searchBox.fill('321 7th Street');
  await page.getByText('321 7th Street', { exact: true }).click();

  // Expects page to have a heading for the search result address
  await expect(page.getByText('Report for 321 7th Street')).toBeVisible({ timeout: 10000 });
  
  // Expects hazard cards to have pill data for the search result address
  const cards = page.locator('.chakra-card__root');
  await expect(cards.first()).toContainText('No Data');
  await expect(cards.nth(1)).toContainText('Susceptible');
  await expect(cards.nth(2)).toContainText('Not in Zone');
});