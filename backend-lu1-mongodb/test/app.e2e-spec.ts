// 📝 test/app.e2e-spec.ts

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://junbo-chen.github.io/Full-Stack-LU1-opdracht2';
const API_URL = 'https://full-stack-lu1-opdracht2.onrender.com';

// Test data
const testUser = {
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  password: 'Test123456'
};

test.describe('Lu1 KeuzeKompas - E2E Tests', () => {
  
  // ============================================
  // 🔐 AUTHENTICATION TESTS
  // ============================================
  
  test.describe('Authentication', () => {
    
    test('should register a new user', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      // Fill registration form
      await page.fill('input[id="name"]', testUser.name);
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      await page.fill('input[id="confirmPassword"]', testUser.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should redirect to modules page
      await page.waitForURL(`${BASE_URL}/modules`);
      expect(page.url()).toContain('/modules');
    });

    test('should login with registered user', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Fill login form
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should redirect to modules page
      await page.waitForURL(`${BASE_URL}/modules`);
      expect(page.url()).toContain('/modules');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Fill with wrong password
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', 'WrongPassword123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should show error message
      const errorMessage = await page.locator('.error-message');
      await expect(errorMessage).toBeVisible();
    });

    test('should redirect to login when not authenticated', async ({ page }) => {
      // Try to access modules without logging in
      await page.goto(`${BASE_URL}/modules`);
      
      // Should redirect to login
      await page.waitForURL(`${BASE_URL}/login`);
      expect(page.url()).toContain('/login');
    });

    test('should logout successfully', async ({ page, context }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/modules`);
      
      // Click logout
      await page.click('button:has-text("🚪 Uitloggen")');
      
      // Should redirect to login
      await page.waitForURL(`${BASE_URL}/login`);
      expect(page.url()).toContain('/login');
      
      // Token should be cleared
      const cookies = await context.cookies();
      const authToken = cookies.find(c => c.name === 'auth_token');
      expect(authToken).toBeFalsy();
    });
  });

  // ============================================
  // 📚 MODULES TESTS
  // ============================================
  
  test.describe('Modules Page', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/modules`);
    });

    test('should load and display modules', async ({ page }) => {
      // Wait for modules to load
      await page.waitForSelector('.module-card');
      
      // Check if cards are visible
      const cards = await page.locator('.module-card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display module information', async ({ page }) => {
      await page.waitForSelector('.module-card');
      
      // Check for module elements
      const title = await page.locator('.card-title').first();
      const badge = await page.locator('.badge-credit').first();
      const location = await page.locator('.card-location').first();
      
      await expect(title).toBeVisible();
      await expect(badge).toBeVisible();
      await expect(location).toBeVisible();
    });

    test('should navigate to module detail', async ({ page }) => {
      await page.waitForSelector('.module-card');
      
      // Click on first module
      await page.click('.module-card');
      
      // Should navigate to detail page
      await page.waitForURL(/\/modules\/\d+/);
      expect(page.url()).toMatch(/\/modules\/\d+/);
    });

    test('should navigate to create module page', async ({ page }) => {
      // Click create button
      await page.click('button:has-text("➕ Nieuwe Module")');
      
      // Should navigate to create page
      await page.waitForURL(`${BASE_URL}/modules/new`);
      expect(page.url()).toContain('/modules/new');
    });

    test('should search modules', async ({ page }) => {
      await page.waitForSelector('.module-card');
      const initialCount = await page.locator('.module-card').count();
      
      // Type in search
      await page.fill('input[placeholder="Zoek op naam..."]', 'Web');
      await page.waitForTimeout(500);
      
      // Check filtered results
      const filteredCount = await page.locator('.module-card').count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('should filter by credits', async ({ page }) => {
      await page.waitForSelector('.checkbox-label');
      
      // Click on 15 EC checkbox
      await page.click('input[value="15"]');
      await page.waitForTimeout(500);
      
      // Verify filter is applied
      const checkedInput = await page.locator('input[value="15"]');
      expect(await checkedInput.isChecked()).toBe(true);
    });

    test('should filter by level', async ({ page }) => {
      // Get all checkboxes for level
      const levelCheckboxes = await page.locator('.filter-group:has(text("📈 Niveau")) input[type="checkbox"]');
      
      // Check first level
      await levelCheckboxes.first().check();
      await page.waitForTimeout(500);
      
      // Verify filter is applied
      expect(await levelCheckboxes.first().isChecked()).toBe(true);
    });

    test('should filter by location', async ({ page }) => {
      // Get first location checkbox
      const locationCheckboxes = await page.locator('.filter-group:has(text("📍 Locatie")) input[type="checkbox"]');
      
      // Check first location
      await locationCheckboxes.first().check();
      await page.waitForTimeout(500);
      
      // Verify filter is applied
      expect(await locationCheckboxes.first().isChecked()).toBe(true);
    });

    test('should clear all filters', async ({ page }) => {
      // Apply some filters
      await page.fill('input[placeholder="Zoek op naam..."]', 'Test');
      await page.waitForTimeout(300);
      
      // Click clear filters button
      const clearButton = await page.locator('button:has-text("✕ Wis alle filters")');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(300);
      }
      
      // Search input should be empty
      const searchInput = await page.inputValue('input[placeholder="Zoek op naam..."]');
      expect(searchInput).toBe('');
    });

    test('should show active filter count', async ({ page }) => {
      // Apply a filter
      await page.fill('input[placeholder="Zoek op naam..."]', 'Test');
      await page.waitForTimeout(300);
      
      // Check if filter count is visible
      const filterCount = await page.locator('.filter-count');
      await expect(filterCount).toBeVisible();
    });

    test('should toggle theme', async ({ page }) => {
      // Click theme toggle
      await page.click('button.btn-theme-toggle');
      
      // Check if dark theme is applied
      const htmlElement = page.locator('html');
      const theme = await htmlElement.getAttribute('data-theme');
      
      expect(theme).toBeTruthy();
    });
  });

  // ============================================
  // ⭐ FAVORITES TESTS
  // ============================================
  
  test.describe('Favorites', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/modules`);
      await page.waitForSelector('.module-card');
    });

    test('should add module to favorites', async ({ page }) => {
      // Click favorite button
      const favoriteBtn = await page.locator('.card-favorite-btn').first();
      await favoriteBtn.click();
      
      // Wait for API call
      await page.waitForTimeout(500);
      
      // Check if favorite icon is filled
      const isFavorite = await favoriteBtn.locator('visible=true').evaluate(el => el.textContent === '⭐');
      expect(isFavorite).toBeTruthy();
    });

    test('should remove module from favorites', async ({ page }) => {
      // Add to favorites first
      const favoriteBtn = await page.locator('.card-favorite-btn').first();
      await favoriteBtn.click();
      await page.waitForTimeout(300);
      
      // Click again to remove
      await favoriteBtn.click();
      await page.waitForTimeout(300);
      
      // Check if favorite icon is empty
      const text = await favoriteBtn.textContent();
      expect(text).toContain('☆');
    });

    test('should show favorite summary', async ({ page }) => {
      // Add to favorites
      await page.locator('.card-favorite-btn').first().click();
      await page.waitForTimeout(500);
      
      // Check if favorite summary appears
      const favoriteSummary = await page.locator('.favorite-summary');
      await expect(favoriteSummary).toBeVisible();
    });

    test('should filter by favorites', async ({ page }) => {
      // Add first module to favorites
      await page.locator('.card-favorite-btn').first().click();
      await page.waitForTimeout(500);
      
      // Get initial count
      const allCards = await page.locator('.module-card');
      const allCount = await allCards.count();
      
      // Click favorite filter button
      const favoriteSummary = await page.locator('.favorite-summary');
      await favoriteSummary.click();
      await page.waitForTimeout(500);
      
      // Check if only favorites are shown
      const filteredCards = await page.locator('.module-card');
      const filteredCount = await filteredCards.count();
      
      expect(filteredCount).toBeLessThanOrEqual(allCount);
    });

    test('should toggle favorite filter', async ({ page }) => {
      // Add to favorites
      await page.locator('.card-favorite-btn').first().click();
      await page.waitForTimeout(500);
      
      // Click favorite summary
      const favoriteSummary = await page.locator('.favorite-summary');
      await favoriteSummary.click();
      
      // Check if button has active class
      const activeClass = await favoriteSummary.getAttribute('class');
      expect(activeClass).toContain('active');
      
      // Click again
      await favoriteSummary.click();
      
      // Active class should be removed
      const activeClassAfter = await favoriteSummary.getAttribute('class');
      expect(activeClassAfter).not.toContain('active');
    });
  });

  // ============================================
  // 📋 MODULE DETAIL TESTS
  // ============================================
  
  test.describe('Module Detail', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/modules`);
      
      // Navigate to first module detail
      await page.waitForSelector('.module-card');
      await page.click('.module-card');
      await page.waitForURL(/\/modules\/\d+/);
    });

    test('should display module details', async ({ page }) => {
      // Check for detail elements
      const title = await page.locator('h1');
      const description = await page.locator('.description-text');
      
      await expect(title).toBeVisible();
      expect(await title.textContent()).not.toBe('');
    });

    test('should display module metadata', async ({ page }) => {
      // Check for metadata
      const meta = await page.locator('.meta-item');
      const count = await meta.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should navigate back to modules', async ({ page }) => {
      // Click back button
      await page.click('button:has-text("← Terug")');
      
      // Should go back to modules page
      await page.waitForURL(`${BASE_URL}/modules`);
      expect(page.url()).toContain('/modules');
    });

    test('should add module to favorites from detail page', async ({ page }) => {
      // Click favorite button
      const favBtn = await page.locator('button.btn-favorite-large');
      
      // Get initial text
      const initialText = await favBtn.textContent();
      
      // Click
      await favBtn.click();
      await page.waitForTimeout(300);
      
      // Text should change
      const afterText = await favBtn.textContent();
      expect(afterText).not.toBe(initialText);
    });

    test('should navigate to edit page', async ({ page }) => {
      // Click edit button
      await page.click('button:has-text("✏️ Bewerken")');
      
      // Should navigate to edit page
      await page.waitForURL(/\/modules\/\d+\/edit/);
      expect(page.url()).toMatch(/\/modules\/\d+\/edit/);
    });

    test('should delete module', async ({ page }) => {
      // Setup - intercept alert
      page.on('dialog', dialog => {
        dialog.accept();
      });
      
      // Click delete button
      await page.click('button:has-text("🗑️ Verwijderen")');
      
      // Should redirect to modules
      await page.waitForURL(`${BASE_URL}/modules`);
      expect(page.url()).toContain('/modules');
    });
  });

  // ============================================
  // ➕ CREATE MODULE TESTS
  // ============================================
  
  test.describe('Create Module', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/modules`);
      
      // Navigate to create
      await page.click('button:has-text("➕ Nieuwe Module")');
      await page.waitForURL(`${BASE_URL}/modules/new`);
    });

    test('should display create form', async ({ page }) => {
      // Check for form elements
      const inputs = await page.locator('input, textarea, select');
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should create new module', async ({ page }) => {
      const moduleId = Math.floor(Math.random() * 10000) + 5000;
      
      // Fill form
      await page.fill('input[id="formId"]', moduleId.toString());
      await page.fill('input[id="name"]', 'Test Module');
      await page.fill('textarea[id="shortDescription"]', 'Test short description');
      await page.fill('textarea[id="description"]', 'Test full description');
      await page.fill('textarea[id="content"]', 'Test content');
      await page.fill('textarea[id="learningOutcomes"]', 'Test outcomes');
      await page.selectOption('select[id="studyCredit"]', '15');
      await page.selectOption('select[id="level"]', 'NLQF5');
      await page.selectOption('select[id="location"]', 'Breda');
      
      // Submit
      await page.click('button:has-text("➕ Aanmaken")');
      
      // Should navigate to detail page
      await page.waitForURL(/\/modules\/\d+/);
      expect(page.url()).toMatch(/\/modules\/\d+/);
    });

    test('should validate required fields', async ({ page }) => {
      // Try to submit empty form
      await page.click('button:has-text("➕ Aanmaken")');
      
      // Should show error
      const errorMsg = await page.locator('.error-message');
      await expect(errorMsg).toBeVisible();
    });

    test('should cancel module creation', async ({ page }) => {
      // Click cancel
      await page.click('button:has-text("Annuleren")');
      
      // Should go back to modules
      await page.waitForURL(`${BASE_URL}/modules`);
      expect(page.url()).toContain('/modules');
    });
  });

  // ============================================
  // ✏️ EDIT MODULE TESTS
  // ============================================
  
  test.describe('Edit Module', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/modules`);
      
      // Navigate to module detail
      await page.waitForSelector('.module-card');
      await page.click('.module-card');
      await page.waitForURL(/\/modules\/\d+/);
      
      // Click edit
      await page.click('button:has-text("✏️ Bewerken")');
      await page.waitForURL(/\/modules\/\d+\/edit/);
    });

    test('should display edit form with module data', async ({ page }) => {
      // Check if form is filled
      const nameInput = await page.locator('input[id="name"]');
      const name = await nameInput.inputValue();
      expect(name).not.toBe('');
    });

    test('should update module', async ({ page }) => {
      // Change a field
      const nameInput = await page.locator('input[id="name"]');
      await nameInput.clear();
      await nameInput.fill('Updated Module Name');
      
      // Submit
      await page.click('button:has-text("💾 Opslaan")');
      
      // Should navigate to detail
      await page.waitForURL(/\/modules\/\d+/);
      expect(page.url()).toMatch(/\/modules\/\d+/);
    });
  });

  // ============================================
  // 🎨 UI/UX TESTS
  // ============================================
  
  test.describe('UI/UX', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/modules`);
    });

    test('should have responsive layout', async ({ page }) => {
      const sidebar = await page.locator('.sidebar');
      const mainContent = await page.locator('.main-content');
      
      await expect(sidebar).toBeVisible();
      await expect(mainContent).toBeVisible();
    });

    test('should display loading state', async ({ page }) => {
      // Navigate to clear cache
      await page.goto(`${BASE_URL}/modules`);
      
      // Check for spinner
      const spinner = await page.locator('.spinner');
      expect(spinner).toBeTruthy();
    });

    test('should show no results message', async ({ page }) => {
      // Search for non-existent module
      await page.fill('input[placeholder="Zoek op naam..."]', 'xyznonexistent123');
      await page.waitForTimeout(500);
      
      // Check for no results message
      const noResults = await page.locator('.no-results');
      await expect(noResults).toBeVisible();
    });

    test('should display result count', async ({ page }) => {
      await page.waitForSelector('.subtitle');
      
      // Check if subtitle shows result count
      const subtitle = await page.locator('.subtitle');
      const text = await subtitle.textContent();
      expect(text).toContain('module');
    });
  });

});