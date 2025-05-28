import { expect, test } from '@playwright/test';

test.describe('Test Blocks Page - Phase 1 E2E', () => {
	test('should load and render the test blocks page correctly', async ({ page }) => {
		await page.goto('/test-blocks');

		// Check page title
		await expect(page).toHaveTitle('Test Blocks - Phase 1');

		// Check main heading
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Block System Test - Phase 1');

		// Check that the page description is visible
		await expect(page.getByText('Testing basic block and layout rendering with static data.')).toBeVisible();

		// Check layout information
		await expect(page.getByText(/Layout:.*Single Column/)).toBeVisible();
		await expect(page.getByText(/Blocks:.*2 TextBlocks/)).toBeVisible();
	});

	test('should render the BlocksRenderer output correctly', async ({ page }) => {
		await page.goto('/test-blocks');

		// Check that the rendered output section exists
		await expect(page.getByRole('heading', { name: 'Rendered Output:' })).toBeVisible();

		// Check that the renderer container exists
		await expect(page.locator('.renderer-container')).toBeVisible();

		// Wait for the BlocksRenderer to load and render content
		// The content should include the text from our hardcoded blocks
		await expect(page.getByText('Hello World from TextBlock 1')).toBeVisible();
		await expect(page.getByText('This is the first text block in our single column layout.')).toBeVisible();
		await expect(page.getByText('Another paragraph from TextBlock 2')).toBeVisible();
	});

	test('should have working debug information section', async ({ page }) => {
		await page.goto('/test-blocks');

		// Check debug section exists
		await expect(page.getByRole('heading', { name: 'Debug Information:' })).toBeVisible();

		// Check that details elements exist
		const layoutMetadataDetails = page.getByText('Layout Metadata');
		const blocksDataDetails = page.getByText('Blocks Data');
		
		await expect(layoutMetadataDetails).toBeVisible();
		await expect(blocksDataDetails).toBeVisible();

		// Test expanding the details
		await layoutMetadataDetails.click();
		await expect(page.getByText('"id": "singleColumn"')).toBeVisible();

		await blocksDataDetails.click();
		await expect(page.getByText('"blockType": "TextBlock"')).toBeVisible();
	});

	test('should have proper styling and layout', async ({ page }) => {
		await page.goto('/test-blocks');

		// Check that main styling elements are present
		await expect(page.locator('.page-header')).toBeVisible();
		await expect(page.locator('.test-section')).toBeVisible();
		await expect(page.locator('.debug-section')).toBeVisible();

		// Check that the renderer container has the expected styling
		const rendererContainer = page.locator('.renderer-container');
		await expect(rendererContainer).toBeVisible();
		await expect(rendererContainer).toHaveCSS('border-style', 'dashed');
	});

	test('should not show any loading or error states', async ({ page }) => {
		await page.goto('/test-blocks');

		// Wait for content to load
		await page.waitForSelector('.renderer-container');

		// Check that no loading states are visible
		await expect(page.getByText('Loading layout and components...')).not.toBeVisible();
		
		// Check that no error states are visible
		await expect(page.getByText(/Error loading components/)).not.toBeVisible();
		await expect(page.getByText(/Unable to render/)).not.toBeVisible();
	});

	test('should render TextBlocks with correct HTML structure', async ({ page }) => {
		await page.goto('/test-blocks');

		// Wait for the content to load
		await page.waitForSelector('.single-column');

		// Check that the SingleColumn layout is rendered
		await expect(page.locator('.single-column')).toBeVisible();

		// Check that TextBlocks are rendered with correct classes
		await expect(page.locator('.text-block')).toHaveCount(2);

		// Check that HTML content is properly rendered
		await expect(page.locator('h2')).toHaveText('Hello World from TextBlock 1');
		await expect(page.locator('p').first()).toHaveText('This is the first text block in our single column layout.');
	});

	test('should be responsive and accessible', async ({ page }) => {
		await page.goto('/test-blocks');

		// Test different viewport sizes
		await page.setViewportSize({ width: 320, height: 568 }); // Mobile
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		// Check basic accessibility
		await expect(page.getByRole('main')).toBeVisible();
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.getByRole('heading', { level: 2 })).toHaveCount(3); // "Rendered Output", "Debug Information", and the TextBlock h2
	});
}); 