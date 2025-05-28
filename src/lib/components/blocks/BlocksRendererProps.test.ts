import { describe, test, expect } from 'vitest';
import type {
	BlockData,
	LayoutSlot,
	LayoutMetadata,
	BlocksRendererComponentProps,
	BlocksBySlotTarget
} from './BlocksRendererProps.js';

describe('BlocksRendererProps Types', () => {
	test('BlockData interface should accept valid block data', () => {
		const blockData: BlockData = {
			id: 'test-block-1',
			blockType: 'TextBlock',
			slotTarget: 'main',
			data: { text: 'Hello world' }
		};

		expect(blockData.id).toBe('test-block-1');
		expect(blockData.blockType).toBe('TextBlock');
		expect(blockData.slotTarget).toBe('main');
		expect(blockData.data).toEqual({ text: 'Hello world' });
	});

	test('LayoutSlot interface should accept valid slot data', () => {
		const layoutSlot: LayoutSlot = {
			id: 'main',
			name: 'Main Content',
			allowedBlockTypes: ['TextBlock', 'ImageBlock']
		};

		expect(layoutSlot.id).toBe('main');
		expect(layoutSlot.name).toBe('Main Content');
		expect(layoutSlot.allowedBlockTypes).toEqual(['TextBlock', 'ImageBlock']);
	});

	test('LayoutSlot interface should work without allowedBlockTypes', () => {
		const layoutSlot: LayoutSlot = {
			id: 'sidebar',
			name: 'Sidebar Content'
		};

		expect(layoutSlot.id).toBe('sidebar');
		expect(layoutSlot.name).toBe('Sidebar Content');
		expect(layoutSlot.allowedBlockTypes).toBeUndefined();
	});

	test('LayoutMetadata interface should accept valid metadata', () => {
		const layoutMetadata: LayoutMetadata = {
			id: 'singleColumn',
			name: 'Single Column',
			description: 'A simple single column layout',
			slots: [
				{ id: 'main', name: 'Main Content' }
			]
		};

		expect(layoutMetadata.id).toBe('singleColumn');
		expect(layoutMetadata.name).toBe('Single Column');
		expect(layoutMetadata.description).toBe('A simple single column layout');
		expect(layoutMetadata.slots).toHaveLength(1);
	});

	test('BlocksRendererComponentProps interface should accept valid props', () => {
		const props: BlocksRendererComponentProps = {
			layoutId: 'singleColumn',
			blocksData: [
				{
					id: 'b1',
					blockType: 'TextBlock',
					slotTarget: 'main',
					data: { text: 'Hello' }
				}
			],
			layoutMetadata: {
				id: 'singleColumn',
				name: 'Single Column',
				slots: [{ id: 'main', name: 'Main Content' }]
			}
		};

		expect(props.layoutId).toBe('singleColumn');
		expect(props.blocksData).toHaveLength(1);
		expect(props.layoutMetadata?.id).toBe('singleColumn');
	});

	test('BlocksBySlotTarget type should group blocks correctly', () => {
		const blocksBySlotTarget: BlocksBySlotTarget = {
			main: [
				{
					id: 'b1',
					blockType: 'TextBlock',
					slotTarget: 'main',
					data: { text: 'First block' }
				},
				{
					id: 'b2',
					blockType: 'TextBlock',
					slotTarget: 'main',
					data: { text: 'Second block' }
				}
			],
			sidebar: [
				{
					id: 'b3',
					blockType: 'ImageBlock',
					slotTarget: 'sidebar',
					data: { src: 'image.jpg', alt: 'Test image' }
				}
			]
		};

		expect(blocksBySlotTarget.main).toHaveLength(2);
		expect(blocksBySlotTarget.sidebar).toHaveLength(1);
		expect(blocksBySlotTarget.main[0].data.text).toBe('First block');
		expect(blocksBySlotTarget.sidebar[0].data.src).toBe('image.jpg');
	});
}); 