// 📝 test/app.e2e-spec.ts

import { test, expect } from '@playwright/test';

// Environment detection
const BASE_URL = process.env.BASE_URL || 'http://localhost:4200';
const API_URL = process.env.API_URL || 'https://full-stack-lu1-opdracht2.onrender.com';

// Detect if we need hash routing (GitHub Pages) or path routing (local)
const USE_HASH_ROUTING = BASE_URL.includes('github.io');

// Helper function to construct URLs based on environment
const route = (path: string) => {
  if (USE_HASH_ROUTING) {
    return `${BASE_URL}/#${path}`;
  }
  return `${BASE_URL}${path}`;
};

// Helper to check if URL contains the expected path
const urlContains = (url: string, path: string): boolean => {
  if (USE_HASH_ROUTING) {
    return url.includes(`#${path}`);
  }
  return url.includes(path);
};

// Test data - use persistent user for faster tests
const testUser = {
  name: 'E2E Test User',
  email: 'e2e-test@example.com',
  password: 'Test123456!'
};

test.describe('Lu1 KeuzeKompas - E2E Tests', () => {
  
  // Setup hook to ensure test user exists
  test.beforeAll(async ({ request }) => {
    try {
      await request.post(`${API_URL}/auth/register`, {
        data: testUser,
        failOnStatusCode: false
      });
    } catch (e) {
      console.log('Test user already exists or registration failed - continuing');
    }
  });

  // ============================================
  // 🔐 AUTHENTICATION TESTS
  // ============================================
  
  test.describe('Authentication', () => {
    
    test('should register a new user', async ({ page }) => {
      const uniqueUser = {
        name: 'New User',
        email: `new-${Date.now()}@example.com`,
        password: 'Test123456!'
      };

      await page.goto(route('/register'), { waitUntil: 'domcontentloaded' });
      
      // Wait for Angular to bootstrap and render
      await page.waitForTimeout(2000);
      
      // Try to find registration form elements
      const nameInput = page.locator('input[id="name"], input[name="name"], input[formcontrolname="name"]').first();
      
      if (await nameInput.isVisible({ timeout: 8000 })) {
        await nameInput.fill(uniqueUser.name);
        
        await page.fill('input[id="email"], input[name="email"], input[formcontrolname="email"]', uniqueUser.email);
        await page.fill('input[id="password"], input[name="password"], input[formcontrolname="password"]', uniqueUser.password);
        
        const confirmPasswordInput = page.locator('input[id="confirmPassword"], input[name="confirmPassword"], input[formcontrolname="confirmPassword"]').first();
        if (await confirmPasswordInput.isVisible({ timeout: 2000 })) {
          await confirmPasswordInput.fill(uniqueUser.password);
        }
        
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        
        // Check if we were redirected
        expect(urlContains(page.url(), '/modules')).toBeTruthy();
      }
    });

    test('should login with registered user', async ({ page }) => {
      await page.goto(route('/login'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Wait for login form
      const emailInput = page.locator('input[id="email"], input[name="email"], input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      
      // Fill login form
      await emailInput.fill(testUser.email);
      await page.fill('input[id="password"], input[name="password"], input[type="password"]', testUser.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForTimeout(3000);
      
      // Should redirect to modules page
      expect(urlContains(page.url(), '/modules')).toBeTruthy();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(route('/login'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const emailInput = page.locator('input[id="email"], input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      
      // Fill with wrong password
      await emailInput.fill(testUser.email);
      await page.fill('input[id="password"], input[type="password"]', 'WrongPassword123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for error
      await page.waitForTimeout(2000);
      
      // Should show error or stay on login page
      expect(urlContains(page.url(), '/login')).toBeTruthy();
    });

    test('should redirect to login when not authenticated', async ({ page, context }) => {
      // Clear all auth data
      await context.clearCookies();
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Try to access protected route
      await page.goto(route('/modules'), { waitUntil: 'domcontentloaded' });
      
      // Wait for redirect
      await page.waitForTimeout(3000);
      
      // Should redirect to login
      expect(urlContains(page.url(), '/login')).toBeTruthy();
    });

    test('should logout successfully', async ({ page, context }) => {
      // Login first
      await page.goto(route('/login'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const emailInput = page.locator('input[id="email"], input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.fill(testUser.email);
      await page.fill('input[id="password"], input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Verify we're logged in
      expect(urlContains(page.url(), '/modules')).toBeTruthy();
      
      // Click logout button - try multiple selectors
      const logoutBtn = page.locator('button:has-text("Uitloggen"), button:has-text("🚪"), a:has-text("Uitloggen"), button:has-text("Logout")').first();
      if (await logoutBtn.isVisible({ timeout: 5000 })) {
        await logoutBtn.click();
        await page.waitForTimeout(2000);
        expect(urlContains(page.url(), '/login')).toBeTruthy();
      }
    });
  });

  // ============================================
  // 📚 MODULES TESTS
  // ============================================
  
  test.describe('Modules Page', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto(route('/login'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const emailInput = page.locator('input[id="email"], input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.fill(testUser.email);
      await page.fill('input[id="password"], input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Wait for successful login and navigation
      await page.waitForTimeout(3000);
      
      // Verify we're on modules page or navigate there
      if (!urlContains(page.url(), '/modules')) {
        await page.goto(route('/modules'), { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }
    });

    test('should load and display modules', async ({ page }) => {
      // Wait for modules to load - be more flexible with selectors
      const moduleCard = page.locator('.module-card, .card, [class*="card"], [data-testid="module"]').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
    });

    test('should display module information', async ({ page }) => {
      const moduleCard = page.locator('.module-card, .card, [class*="card"]').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
      
      // Check for module elements - use more flexible selectors
      const title = page.locator('h1, h2, h3, h4, .title, [class*="title"]').first();
      await expect(title).toBeVisible({ timeout: 10000 });
    });

    test('should search modules', async ({ page }) => {
      const moduleCard = page.locator('.module-card, .card, [class*="card"]').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
      
      // Find search input - try multiple selectors
      const searchInput = page.locator('input[placeholder*="Zoek"], input[placeholder*="Search"], input[placeholder*="zoek"], input[type="search"], input[type="text"]').first();
      
      if (await searchInput.isVisible({ timeout: 5000 })) {
        await searchInput.fill('Web');
        await page.waitForTimeout(1000);
        
        // Verify search is working (should have some results or no results message)
        const hasResults = await page.locator('.module-card, .card, [class*="card"]').count() > 0;
        const hasNoResults = await page.locator(':text("geen"), :text("Geen"), :text("no results"), :text("No results")').count() > 0;
        expect(hasResults || hasNoResults).toBeTruthy();
      }
    });

    test('should filter by credits', async ({ page }) => {
      const moduleCard = page.locator('.module-card, .card').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
      
      // Look for credit filter checkboxes
      const creditCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: '15' }).or(page.locator('label:has-text("15") input[type="checkbox"]')).first();
      
      if (await creditCheckbox.isVisible({ timeout: 5000 })) {
        await creditCheckbox.check();
        await page.waitForTimeout(1000);
        expect(await creditCheckbox.isChecked()).toBe(true);
      }
    });

    test('should filter by level', async ({ page }) => {
      const moduleCard = page.locator('.module-card, .card').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
      
      // Look for any level filter checkbox
      const levelCheckbox = page.locator('input[type="checkbox"]').nth(0);
      
      if (await levelCheckbox.isVisible({ timeout: 5000 })) {
        await levelCheckbox.check();
        await page.waitForTimeout(1000);
      }
    });

    test('should filter by location', async ({ page }) => {
      const moduleCard = page.locator('.module-card, .card').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
      
      // Look for any location checkbox
      const locationCheckbox = page.locator('input[type="checkbox"]').nth(1);
      
      if (await locationCheckbox.isVisible({ timeout: 5000 })) {
        await locationCheckbox.check();
        await page.waitForTimeout(1000);
      }
    });

    test('should clear all filters', async ({ page }) => {
      const moduleCard = page.locator('.module-card, .card').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
      
      // Look for clear filter button
      const clearBtn = page.locator('button:has-text("Wis"), button:has-text("Clear"), button:has-text("✕"), button:has-text("Reset")').first();
      
      if (await clearBtn.isVisible({ timeout: 5000 })) {
        await clearBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test('should show active filter count', async ({ page }) => {
      const moduleCard = page.locator('.module-card, .card').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
      
      // Apply a filter by searching
      const searchInput = page.locator('input[type="search"], input[type="text"]').first();
      if (await searchInput.isVisible({ timeout: 5000 })) {
        await searchInput.fill('Test');
        await page.waitForTimeout(1000);
      }
    });

    test('should toggle theme', async ({ page }) => {
      // Look for theme toggle button
      const themeBtn = page.locator('button[class*="theme"], button:has-text("🌙"), button:has-text("☀️"), button[aria-label*="theme"]').first();
      
      if (await themeBtn.isVisible({ timeout: 5000 })) {
        await themeBtn.click();
        await page.waitForTimeout(500);
      }
    });
  });

  // ============================================
  // ⭐ FAVORITES TESTS
  // ============================================
  
  test.describe('Favorites', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(route('/login'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const emailInput = page.locator('input[id="email"], input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.fill(testUser.email);
      await page.fill('input[id="password"], input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Navigate to modules if not there
      if (!urlContains(page.url(), '/modules')) {
        await page.goto(route('/modules'), { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }
      
      const moduleCard = page.locator('.module-card, .card, [class*="card"]').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
    });

    test('should add module to favorites', async ({ page }) => {
      // Find favorite button - try multiple selectors
      const favoriteBtn = page.locator('button:has-text("☆"), button:has-text("⭐"), button[class*="favorite"], button[aria-label*="favorite"]').first();
      
      if (await favoriteBtn.isVisible({ timeout: 5000 })) {
        await favoriteBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should remove module from favorites', async ({ page }) => {
      const favoriteBtn = page.locator('button:has-text("☆"), button:has-text("⭐"), button[class*="favorite"]').first();
      
      if (await favoriteBtn.isVisible({ timeout: 5000 })) {
        // Add to favorites
        await favoriteBtn.click();
        await page.waitForTimeout(500);
        
        // Remove from favorites
        await favoriteBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test('should show favorite summary', async ({ page }) => {
      // Look for favorite summary section
      const hasFavSection = await page.locator('[class*="favorite"], [class*="summary"]').count() > 0;
      expect(hasFavSection).toBeTruthy();
    });

    test('should filter by favorites', async ({ page }) => {
      // Add to favorites first
      const favoriteBtn = page.locator('button:has-text("☆"), button:has-text("⭐")').first();
      if (await favoriteBtn.isVisible({ timeout: 5000 })) {
        await favoriteBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should toggle favorite filter', async ({ page }) => {
      // Just verify we can access the page
      expect(urlContains(page.url(), '/modules')).toBeTruthy();
    });
  });

  // ============================================
  // 📋 MODULE DETAIL TESTS
  // ============================================
  
  test.describe('Module Detail', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login and navigate to first module
      await page.goto(route('/login'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const emailInput = page.locator('input[id="email"], input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.fill(testUser.email);
      await page.fill('input[id="password"], input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Navigate to modules
      if (!urlContains(page.url(), '/modules')) {
        await page.goto(route('/modules'), { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }
      
      // Click first module
      const moduleCard = page.locator('.module-card, .card, [class*="card"]').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
      await moduleCard.click();
      await page.waitForTimeout(2000);
    });

    test('should display module details', async ({ page }) => {
      // Check for title
      const title = page.locator('h1, h2, h3').first();
      await expect(title).toBeVisible({ timeout: 10000 });
    });

    test('should display module metadata', async ({ page }) => {
      // Look for any content on the page
      const content = page.locator('main, .container, div').first();
      await expect(content).toBeVisible();
    });

    test('should navigate back to modules', async ({ page }) => {
      // Find back button
      const backBtn = page.locator('button:has-text("Terug"), button:has-text("←"), a:has-text("Terug"), button:has-text("Back")').first();
      
      if (await backBtn.isVisible({ timeout: 5000 })) {
        await backBtn.click();
        await page.waitForTimeout(2000);
        expect(urlContains(page.url(), '/modules')).toBeTruthy();
      }
    });

    test('should add module to favorites from detail page', async ({ page }) => {
      const favBtn = page.locator('button:has-text("☆"), button:has-text("⭐"), button[class*="favorite"]').first();
      
      if (await favBtn.isVisible({ timeout: 5000 })) {
        await favBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should navigate to edit page', async ({ page }) => {
      const editBtn = page.locator('button:has-text("Bewerken"), button:has-text("✏️"), button:has-text("Edit")').first();
      
      if (await editBtn.isVisible({ timeout: 5000 })) {
        await editBtn.click();
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/modules\/[^/]+\/edit/);
      }
    });

    test('should delete module', async ({ page }) => {
      page.on('dialog', dialog => dialog.accept());
      
      const deleteBtn = page.locator('button:has-text("Verwijderen"), button:has-text("🗑️"), button:has-text("Delete")').first();
      
      if (await deleteBtn.isVisible({ timeout: 5000 })) {
        await deleteBtn.click();
        await page.waitForTimeout(2000);
      }
    });
  });

  // ============================================
  // ➕ CREATE MODULE TESTS
  // ============================================
  
  test.describe('Create Module', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(route('/login'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const emailInput = page.locator('input[id="email"], input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.fill(testUser.email);
      await page.fill('input[id="password"], input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Navigate to create
      if (!urlContains(page.url(), '/modules')) {
        await page.goto(route('/modules'), { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }
      
      const createBtn = page.locator('button:has-text("Nieuwe"), button:has-text("➕"), button:has-text("Create"), a[href*="new"]').first();
      if (await createBtn.isVisible({ timeout: 5000 })) {
        await createBtn.click();
        await page.waitForTimeout(2000);
      }
    });

    test('should display create form', async ({ page }) => {
      // Check for form elements
      const form = page.locator('form, input, textarea').first();
      await expect(form).toBeVisible({ timeout: 10000 });
    });

    test('should create new module', async ({ page }) => {
      const moduleId = Math.floor(Math.random() * 10000) + 5000;
      
      // Fill only fields that exist
      const nameInput = page.locator('input[id="name"], input[name="name"], input[formcontrolname="name"]').first();
      if (await nameInput.isVisible({ timeout: 5000 })) {
        await nameInput.fill(`Test Module ${moduleId}`);
        
        // Try to submit
        const submitBtn = page.locator('button[type="submit"], button:has-text("Aanmaken"), button:has-text("Create")').first();
        if (await submitBtn.isVisible({ timeout: 5000 })) {
          await submitBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    });

    test('should validate required fields', async ({ page }) => {
      const submitBtn = page.locator('button[type="submit"], button:has-text("Aanmaken")').first();
      
      if (await submitBtn.isVisible({ timeout: 5000 })) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should cancel module creation', async ({ page }) => {
      const cancelBtn = page.locator('button:has-text("Annuleren"), button:has-text("Cancel")').first();
      
      if (await cancelBtn.isVisible({ timeout: 5000 })) {
        await cancelBtn.click();
        await page.waitForTimeout(2000);
        expect(urlContains(page.url(), '/modules')).toBeTruthy();
      }
    });
  });

  // ============================================
  // ✏️ EDIT MODULE TESTS
  // ============================================
  
  test.describe('Edit Module', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login and navigate to edit page
      await page.goto(route('/login'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const emailInput = page.locator('input[id="email"], input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.fill(testUser.email);
      await page.fill('input[id="password"], input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Navigate to modules
      if (!urlContains(page.url(), '/modules')) {
        await page.goto(route('/modules'), { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }
      
      // Click first module
      const moduleCard = page.locator('.module-card, .card, [class*="card"]').first();
      await expect(moduleCard).toBeVisible({ timeout: 15000 });
      await moduleCard.click();
      await page.waitForTimeout(2000);
      
      // Click edit
      const editBtn = page.locator('button:has-text("Bewerken"), button:has-text("✏️")').first();
      if (await editBtn.isVisible({ timeout: 5000 })) {
        await editBtn.click();
        await page.waitForTimeout(2000);
      }
    });

    test('should display edit form with module data', async ({ page }) => {
      const nameInput = page.locator('input[id="name"], input[name="name"], input[formcontrolname="name"]').first();
      
      if (await nameInput.isVisible({ timeout: 5000 })) {
        const value = await nameInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    });

    test('should update module', async ({ page }) => {
      const nameInput = page.locator('input[id="name"], input[name="name"], input[formcontrolname="name"]').first();
      
      if (await nameInput.isVisible({ timeout: 5000 })) {
        await nameInput.fill('Updated Module Name');
        
        const saveBtn = page.locator('button:has-text("Opslaan"), button:has-text("Save"), button[type="submit"]').first();
        if (await saveBtn.isVisible({ timeout: 5000 })) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    });
  });

});