import { expect, test } from '@playwright/test'

test('shows an actionable state when providers are not configured', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText(/connect your news providers/i)).toBeVisible()
  await expect(page.getByText(/add the three vite api variables/i)).toBeVisible()
})

test('search and category filters are represented in the URL', async ({ page, isMobile }) => {
  await page.goto('/articles', { waitUntil: 'domcontentloaded' })
  await page.getByRole('textbox', { name: 'Search articles' }).fill('climate policy')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page).toHaveURL(/q=climate\+policy/)

  if (isMobile) {
    await page.getByRole('button', { name: /filters/i }).click()
    await page.getByRole('dialog').getByLabel('Science').click()
  } else {
    await page.getByLabel('Science').click()
  }
  await expect(page).toHaveURL(/category=science/)
  if (isMobile) await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click()
  await page.getByRole('button', { name: /clear all/i }).click()
  await expect(page).toHaveURL(/\/articles$/)
})

test('category preferences persist after refresh', async ({ page, isMobile }) => {
  await page.goto('/preferences', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Technology').check()
  await page.getByRole('button', { name: /save preferences/i }).click()
  await page.reload()
  await expect(page.getByLabel('Technology')).toBeChecked()

  if (isMobile) {
    await page.getByRole('button', { name: /open navigation/i }).click()
    await expect(page.getByRole('navigation', { name: /mobile navigation/i })).toBeVisible()
  }
})

test('all primary routes render without a router error', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })

  const routes = [
    { path: '/', heading: /explore the world/i },
    { path: '/articles', heading: /all articles/i },
    { path: '/categories', heading: /all categories/i },
    { path: '/preferences', heading: /your news mix/i },
    { path: '/about', heading: /three newsrooms/i },
  ]

  for (const route of routes) {
    await page.goto(route.path, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: route.heading })).toBeVisible()
    await expect(page.locator('text=Unexpected Application Error')).toHaveCount(0)
  }

  expect(runtimeErrors).toEqual([])
})
