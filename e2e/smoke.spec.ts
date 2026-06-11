import { test, expect } from '@playwright/test';

// Minimal regression net for the static export. Three recent waves
// landed on the mobile path with zero automated checks; these tests
// assert the export still serves and the entry points still render,
// on both a desktop viewport and a Pixel 7 descriptor.

test.describe('home', () => {
  test('/ loads the hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sagar Budhathoki/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'SAGAR BUDHATHOKI' }),
    ).toBeVisible();
  });

  test('/#projects deep link leaves the hero and shows the nav', async ({ page }) => {
    await page.goto('/#projects');
    // The header only mounts once the active section is not the hero,
    // so a visible nav label proves the deep link landed on the scene.
    // Scoped to the nav landmark: the left-edge section dots also carry
    // a "Go to PROJECTS" label.
    await expect(
      page.getByRole('navigation').getByRole('button', { name: /PROJECTS/ }),
    ).toBeVisible();
  });
});

test('/terminal/ boots into the shell', async ({ page }) => {
  await page.goto('/terminal/');
  // Fresh sessions play the boot screen first; returning sessions go
  // straight to xterm. Either one proves the page is alive.
  const xterm = page.locator('.xterm');
  const bootScreen = page.getByRole('heading', { name: 'sagar.sh' });
  await expect(xterm.or(bootScreen).first()).toBeVisible();
});

// Plain content routes: assert they exist in the export and render
// something. Kept loose on purpose so copy edits never break the net.
for (const path of ['/work/', '/resume/', '/colophon/']) {
  test(`${path} responds with content`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response, `no response for ${path}`).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(page.locator('body')).not.toBeEmpty();
  });
}

test('unknown URLs get the 404 page', async ({ page }) => {
  // Both `npx serve` and GitHub Pages serve out/404.html with a 404
  // status for paths that do not exist (verified against serve locally).
  // The site ships a custom terminal-themed not-found page.
  const response = await page.goto('/definitely-not-a-page/');
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(404);
  await expect(page.getByText('No such file or directory')).toBeVisible();
});
