import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import TestBlocksPage from './test-blocks/+page.svelte';

describe('Test Blocks Page', () => {
	test('should render page header with correct information', () => {
		render(TestBlocksPage);
		
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Block System Test - Phase 1');
		expect(screen.getByText('Testing basic block and layout rendering with static data.')).toBeInTheDocument();
		
		// Use more flexible text matchers for text split across elements
		expect(screen.getByText('Layout:')).toBeInTheDocument();
		expect(screen.getByText('Single Column')).toBeInTheDocument();
		expect(screen.getByText('Blocks:')).toBeInTheDocument();
		expect(screen.getByText('2 TextBlocks in the main slot')).toBeInTheDocument();
	});

	test('should render the rendered output section', () => {
		render(TestBlocksPage);
		
		expect(screen.getByRole('heading', { level: 2, name: 'Rendered Output:' })).toBeInTheDocument();
		expect(screen.getByText('Rendered Output:')).toBeInTheDocument();
	});

	test('should render debug information section', () => {
		render(TestBlocksPage);
		
		expect(screen.getByRole('heading', { level: 2, name: 'Debug Information:' })).toBeInTheDocument();
		expect(screen.getByText('Layout Metadata')).toBeInTheDocument();
		expect(screen.getByText('Blocks Data')).toBeInTheDocument();
	});

	test('should render BlocksRenderer component container', () => {
		const { container } = render(TestBlocksPage);
		
		// Look for the renderer container
		const rendererContainer = container.querySelector('.renderer-container');
		expect(rendererContainer).toBeInTheDocument();
	});

	test('should have proper styling classes', () => {
		const { container } = render(TestBlocksPage);
		
		expect(container.querySelector('.page-header')).toBeInTheDocument();
		expect(container.querySelector('.test-section')).toBeInTheDocument();
		expect(container.querySelector('.debug-section')).toBeInTheDocument();
		expect(container.querySelector('.renderer-container')).toBeInTheDocument();
	});

	test('should render debug details elements', () => {
		const { container } = render(TestBlocksPage);
		
		const details = container.querySelectorAll('details');
		expect(details).toHaveLength(2);
		
		const summaries = container.querySelectorAll('summary');
		expect(summaries[0]).toHaveTextContent('Layout Metadata');
		expect(summaries[1]).toHaveTextContent('Blocks Data');
	});

	test('should contain JSON debug information', () => {
		const { container } = render(TestBlocksPage);
		
		const preElements = container.querySelectorAll('pre');
		expect(preElements).toHaveLength(2);
		
		// Check that the pre elements contain JSON-like content
		expect(preElements[0].textContent).toContain('singleColumn');
		expect(preElements[1].textContent).toContain('TextBlock');
	});

	test('should be a valid Svelte component', async () => {
		const module = await import('./test-blocks/+page.svelte');
		expect(module.default).toBeDefined();
		expect(typeof module.default).toBe('function');
	});
}); 