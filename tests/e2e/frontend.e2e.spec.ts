import { expect, test } from '@playwright/test'

// `/` serves the Offer & New Hire Request Manager (src/app/(app)), not the CMS
// home page. This is a committed smoke test only — it renders the shell and one
// record round-trip, and deliberately does not touch export/print paths.
// The wider behavioural sweep lives in the task-10 report.

const APP_URL = 'http://localhost:3000/'

test.describe('Offer & New Hire Request Manager @ /', () => {
  test('renders the app shell', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(String(e)))

    await page.goto(APP_URL)

    await expect(page).toHaveTitle('Offer & New Hire Request Manager')
    await expect(page.locator('header.app h1')).toHaveText('Offer & New Hire Request Manager')

    // Pipeline / Hired / Archived / Analysis are always present; Editor is hidden
    // until a record is open, so assert "at least four".
    const tabs = page.locator('nav.tabbar button')
    expect(await tabs.count()).toBeGreaterThanOrEqual(4)
    await expect(tabs.nth(0)).toContainText('Pipeline')
    await expect(tabs.nth(3)).toContainText('Analysis')

    expect(errors).toEqual([])
  })

  test('new request autosaves and lands in the pipeline', async ({ page }) => {
    await page.goto(APP_URL)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()

    await page.getByRole('button', { name: '+ New Request' }).click()
    await page.locator('[data-fid="employeeName"] input').fill('Playwright Smoke')

    // Autosave is debounced at 600ms (S2 618–636); the tab count is the signal.
    await expect(page.locator('nav.tabbar button').first()).toContainText('Pipeline (1)', {
      timeout: 5000,
    })

    await page.locator('nav.tabbar button').first().click()
    await expect(page.locator('table.stage-table tbody')).toContainText('Playwright Smoke')
  })
})
