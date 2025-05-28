import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import TextBlock from './TextBlock.svelte';

describe('TextBlock', () => {
	test('should render plain text', () => {
		const text = 'Hello, world!';
		render(TextBlock, { props: { text } });
		
		expect(screen.getByText('Hello, world!')).toBeInTheDocument();
	});

	test('should render HTML content', () => {
		const text = '<h2>Test Heading</h2><p>Test paragraph with <strong>bold text</strong>.</p>';
		const { container } = render(TextBlock, { props: { text } });
		
		expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Heading');
		
		// Use container query to be more specific
		const textBlock = container.querySelector('.text-block');
		expect(textBlock).toBeInTheDocument();
		expect(textBlock?.textContent).toContain('Test paragraph with');
		expect(screen.getByText('bold text')).toBeInTheDocument();
	});

	test('should have correct CSS class', () => {
		const text = 'Test content';
		const { container } = render(TextBlock, { props: { text } });
		
		const textBlock = container.querySelector('.text-block');
		expect(textBlock).toBeInTheDocument();
		expect(textBlock).toHaveTextContent('Test content');
	});

	test('should handle empty text', () => {
		const text = '';
		const { container } = render(TextBlock, { props: { text } });
		
		const textBlock = container.querySelector('.text-block');
		expect(textBlock).toBeInTheDocument();
		expect(textBlock).toHaveTextContent('');
	});

	test('should handle special characters and entities', () => {
		const text = 'Special chars: &lt;script&gt; &amp; &quot;quotes&quot;';
		render(TextBlock, { props: { text } });
		
		expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
	});

	test('should be a valid Svelte component', async () => {
		const module = await import('./TextBlock.svelte');
		expect(module.default).toBeDefined();
		expect(typeof module.default).toBe('function');
	});
}); 