<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TextBlock from './TextBlock.svelte';

  const { Story } = defineMeta({
    title: 'Blocks/TextBlock',
    component: TextBlock,
    tags: ['autodocs'],
    argTypes: {
      text: {
        control: 'text',
        description: 'HTML content to render in the text block'
      }
    },
    args: {
      text: '<p>Default text content</p>'
    }
  });
</script>

<!-- Basic text content -->
<Story 
  name="Default" 
  args={{ 
    text: '<p>This is a simple paragraph of text rendered by the TextBlock component.</p>' 
  }} 
/>

<!-- Rich HTML content -->
<Story 
  name="Rich HTML" 
  args={{ 
    text: '<h2>Rich Content Example</h2><p>This TextBlock can render <strong>bold text</strong>, <em>italic text</em>, and even <a href="#">links</a>.</p><ul><li>List item 1</li><li>List item 2</li></ul>' 
  }} 
/>

<!-- Multiple paragraphs -->
<Story 
  name="Multiple Paragraphs" 
  args={{ 
    text: '<p>This is the first paragraph with some content.</p><p>This is a second paragraph that demonstrates how the TextBlock handles multiple paragraphs with proper spacing.</p><p>And here\'s a third paragraph to show the line-height styling in action.</p>' 
  }} 
/>

<!-- Empty content -->
<Story 
  name="Empty" 
  args={{ 
    text: '' 
  }} 
/>

<!-- Long content -->
<Story 
  name="Long Content" 
  args={{ 
    text: '<h3>Lorem Ipsum</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><blockquote><p>"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."</p></blockquote>' 
  }} 
/> 