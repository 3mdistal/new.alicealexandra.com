<h1>Design System</h1>

<p>People approach design systems in a number of different ways. I've built mine up like this:</p>
<ol>
    <li><a href="#typography">Typography</a>: The base font sizes/line heights and font families for paragraphs, headings, captions, and other text elements.</li>
    <li><a href="#spacing">Spacing</a>: The spacing between text and the elements that surround it, including padding, margin, and other spacing properties.</li>
    <li><a href="#materials">Materials</a>: Levels of elevation, opacity, and other visual properties.</li>
    <li><a href="#iconography">Iconography</a>: The icons used throughout the site, along with where I got them from.</li>
    <li><a href="#colors">Colors</a>: The color palette.</li>
    <li><a href="#components">Components</a>: Small, reusable UI elements.</li>
    <li><a href="#blocks">Blocks</a>: Groups of components that can be slotted into a block layout in my CMS.</li>
    <li><a href="#block-layouts">Block Layouts</a>: Various layouts for blocks which constrain which blocks can go inside them, fully configurable in the CMS.</li>
    <li><a href="#page-layout">Page Layout</a>: The default layout of a page, including the site header, space for blocks, and the site footer.</li>
</ol>
<p>This approach has allowed me to build a variety of pages, have the flexibility to build more or change those pages at any time, and do all that without breaking the design constraints. I've emulated larger SaaS companies, but implemented the bare minimum needed for a personal site.</p>
<p>Notably, I've also dynamically coded (and then statically cached) typography, spacing, materials, icons, and colors so that the design system can be tweaked on the fly, if I'm feeling extra adhd or even just want to generate a new design based on holidays, query params, or other factors.</p>
<p>For more about this system, see <a href="/blog/design-system">this blog post</a>.</p>

<h2 id="typography">Typography</h2>
<p>All text in my design system is dynamic. It slightly changes size based on viewport width and height.</p>
<p>Given that all other measurements in my design system are based on my text size, this allows me to create designs that need far fewer hard CSS breakpoints, and "breathe" more on their own.</p>


<p>Good design systems decouple font styles from semantic html tags. This allows us to use the right styles for the content, regardless of the heading levels or other text elements.</p>

<h3>Headings</h3>
<h3>Labels</h3>
<h3>Buttons</h3>
<h3>Copy</h3>

<h2 id="spacing">Spacing</h2>

<h2 id="materials">Materials</h2>

<h2 id="iconography">Iconography</h2>

<h2 id="colors">Colors</h2>

<h2 id="components">Components</h2>

<h2 id="blocks">Blocks</h2>

<h2 id="block-layouts">Block Layouts</h2>

<h2 id="page-layout">Page Layout</h2>

<h3>Header</h3>
<h3>Body</h3>
<h3>Footer</h3>
