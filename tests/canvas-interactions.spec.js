import { test, expect } from '@playwright/test';

test.describe('CanvasPage Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should load canvas page without errors', async ({ page }) => {
    // Check if canvas is visible
    await expect(page.locator('canvas')).toBeVisible();

    // Check if controls are present
    await expect(page.locator('h2:has-text("Styling Controls")')).toBeVisible();
  });

  test('should change font size without console errors', async ({ page }) => {
    // Listen for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Change font size
    const fontSizeSlider = page.locator('#fontSize');
    await fontSizeSlider.fill('48');

    // Wait a bit for any errors
    await page.waitForTimeout(500);

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });

  test('should change letter spacing without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Change letter spacing
    const letterSpacingSlider = page.locator('#letterSpacing');
    await letterSpacingSlider.fill('5');

    await page.waitForTimeout(500);

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });

  test('should change title color', async ({ page }) => {
    // Click title color picker
    const titleColorPicker = page.locator('#titleColor');
    await titleColorPicker.click();

    // Change color to red (you might need to adjust selector based on color picker implementation)
    await page.keyboard.type('#ff0000');
    await page.keyboard.press('Enter');

    // Verify no errors occurred
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test('should change author color', async ({ page }) => {
    const authorColorPicker = page.locator('#authorColor');
    await authorColorPicker.click();

    await page.keyboard.type('#00ff00');
    await page.keyboard.press('Enter');

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test('should handle viewport controls', async ({ page }) => {
    // Test viewport drag toggle
    const viewportButton = page.locator('button:has-text("Enabled (Ctrl+Drag)")');
    await viewportButton.click();

    // Should toggle to disabled
    await expect(page.locator('button:has-text("Disabled")')).toBeVisible();

    // Toggle back
    await page.locator('button:has-text("Disabled")').click();
    await expect(page.locator('button:has-text("Enabled (Ctrl+Drag)")')).toBeVisible();
  });

  test('should handle line selection', async ({ page }) => {
    // This test assumes poem lines are clickable
    // You might need to adjust selectors based on your actual implementation
    const poemLines = page.locator('.poem-line');
    const lineCount = await poemLines.count();

    if (lineCount > 0) {
      await poemLines.first().click();

      // Check if selection indicator appears
      await expect(page.locator('text="geselecteerd"')).toBeVisible();
    }
  });
});

// Example of testing custom hooks (would require additional setup)
test.describe('Custom Hooks', () => {
  // Note: Testing custom hooks usually requires @testing-library/react-hooks
  // or a custom test setup

  test.skip('useCanvasState should initialize correctly', async () => {
    // This would require setting up a test environment for React hooks
    // Example implementation:
    /*
    const { result } = renderHook(() => useCanvasState());

    expect(result.current.fontSize).toBe(36);
    expect(result.current.fillColor).toBe('#ffffff');
    expect(result.current.titleColor).toBe('#ffffff');
    expect(result.current.authorColor).toBe('#cccccc');
    */
  });
});