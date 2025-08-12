import { test, expect } from '@playwright/test';

test.describe('Reme IDE Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000');
  });

  test('landing page layout and animations', async ({ page }) => {
    // Wait for space background to load
    await page.waitForSelector('canvas');
    
    // Check main elements are visible
    await expect(page.locator('h1')).toContainText('Welcome to Reme');
    await expect(page.locator('nav')).toBeVisible();
    
    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('landing-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('navigation sidebar functionality', async ({ page }) => {
    const sidebar = page.locator('nav');
    await expect(sidebar).toBeVisible();
    
    // Test sidebar items
    await expect(page.locator('nav >> text=Dashboard')).toBeVisible();
    await expect(page.locator('nav >> text=Projects')).toBeVisible();
    await expect(page.locator('nav >> text=Templates')).toBeVisible();
    
    // Click templates and verify navigation
    await page.click('nav >> text=Templates');
    await expect(page).toHaveURL(/.*\/templates/);
    
    // Screenshot of templates page
    await expect(page).toHaveScreenshot('templates-page.png');
  });

  test('project creation flow', async ({ page }) => {
    // Click create project button
    await page.click('text=Create New Project');
    
    // Verify dialog opens
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Create New Project')).toBeVisible();
    
    // Fill form
    await page.fill('input[placeholder="my-awesome-project"]', 'test-project');
    await page.fill('input[placeholder="https://github.com/user/repo.git"]', 'https://github.com/test/repo.git');
    
    // Screenshot of filled form
    await expect(page).toHaveScreenshot('project-creation-form.png');
  });

  test('IDE layout when project exists', async ({ page }) => {
    // First create a project via API
    await page.evaluate(async () => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'test-project',
          repoUrl: 'https://github.com/test/repo.git',
          defaultBranch: 'main'
        })
      });
      return response.json();
    });

    // Navigate to IDE
    const projects = await page.evaluate(async () => {
      const response = await fetch('/api/projects');
      return response.json();
    });

    if (projects.length > 0) {
      await page.goto(`http://localhost:5000/ide/${projects[0].id}`);
      
      // Wait for IDE to load
      await page.waitForSelector('[data-testid="file-explorer"]', { timeout: 10000 });
      await page.waitForSelector('[data-testid="code-editor"]', { timeout: 10000 });
      
      // Screenshot of IDE layout
      await expect(page).toHaveScreenshot('ide-layout.png', {
        fullPage: true
      });
    }
  });

  test('responsive design - mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile layout
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigation should be collapsed or adapted
    await expect(page).toHaveScreenshot('mobile-landing.png');
  });

  test('dark theme consistency', async ({ page }) => {
    // Check CSS custom properties are applied
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    
    expect(bgColor).toMatch(/rgb\(0, 0, 0\)|black/);
    
    // Screenshot to verify dark theme
    await expect(page).toHaveScreenshot('dark-theme-verification.png');
  });

  test('button interactions and hover states', async ({ page }) => {
    const createButton = page.locator('text=Create New Project').first();
    
    // Screenshot default state
    await expect(createButton).toHaveScreenshot('button-default.png');
    
    // Hover state
    await createButton.hover();
    await expect(createButton).toHaveScreenshot('button-hover.png');
  });

  test('space background performance', async ({ page }) => {
    // Monitor canvas performance
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Check animation is running without excessive CPU
    const animationFrames = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        function countFrames() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve(frameCount);
          }
        }
        
        requestAnimationFrame(countFrames);
      });
    });
    
    // Should have reasonable frame rate (30+ FPS)
    expect(animationFrames as number).toBeGreaterThan(30);
  });
});

test.describe('Template Gallery Tests', () => {
  test('template grid layout', async ({ page }) => {
    await page.goto('http://localhost:5000/templates');
    
    // Wait for templates to load
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 5000 });
    
    // Check grid layout
    const templates = page.locator('[data-testid="template-card"]');
    await expect(templates).toHaveCount.greaterThan(0);
    
    await expect(page).toHaveScreenshot('template-gallery.png');
  });

  test('template search functionality', async ({ page }) => {
    await page.goto('http://localhost:5000/templates');
    
    // Test search
    await page.fill('[placeholder*="Search templates"]', 'react');
    await page.waitForTimeout(500); // Debounce
    
    await expect(page).toHaveScreenshot('template-search-results.png');
  });
});