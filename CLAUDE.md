# Personal Website - Technical Documentation

## Project Overview
This is a personal portfolio website for Prannay Hebbar, an AI Researcher. The site is built using a modern design system and includes responsive layouts, interactive JavaScript modules, and a clean, professional aesthetic.

## Site Structure

### Main Pages
- `index.html` / `tldr.html` - Homepage with main content and navigation
- `about.html` - Personal background and experience
- `blogs.html` - Blog posts and articles
- `projects.html` - Project showcase
- `principles.html` - Personal principles and philosophy
- `contact.html` - Contact information and social links
- `other-stuff.html` - Additional content
- `detail.html` - Dynamic content viewer for blog posts/articles

### Key Directories
- `assets/` - All static assets (CSS, JS, images)
  - `css/` - Modular CSS files for clean, professional design
  - `js/` - JavaScript modules and main script
  - `images/` - Site images, logos, icons
- `content/` - Markdown files for blog posts and articles

## CSS Architecture

The CSS follows a modular approach:

### Core Files
- `reset.css` - CSS reset
- `root.css` - CSS custom properties and design tokens
- `elements.css` - Base HTML element styles
- `fonts.css` - Typography definitions

### Layout & Components
- `page.css` - Main page layouts and container styles
- `signal.css` - Signal/content block components
- `thoughts.css` - Blog/article listing styles
- `nav.css` / `header.css` / `footer.css` - Navigation components
- `content.css` - Content formatting and typography
- `button.css` - Button component styles

### Key CSS Classes
- `.page` - Main page container with proper margins and blur effects
- `.signal` - Content blocks with the signal design pattern
- `.signal--clone` - Special content sections with custom positioning
- `.thoughts` - Blog/article listing containers
- `.page__content` - Article/blog content areas

## JavaScript Architecture

### Main Script
- `assets/js/script.js` - Main entry point, imports and initializes modules

### Modules (`assets/js/modules/`)
- `scroll.js` - Essential for content positioning and signal display
- `toggle.js` - Mobile menu functionality
- `navigate.js` - Touch/swipe navigation for mobile
- `controller.js` - Stub file (floating nav not used)
- `signup.js` - Stub file (signup forms not used)

## Content System

### Blog/Article Content
- Content stored as Markdown files in `content/` directory
- Accessed via `detail.html#path/to/content` format
- Uses marked.js for Markdown parsing
- Dynamic loading with JavaScript

### Navigation Structure
The site uses a consistent navigation pattern across all pages with:
- Logo/home link
- Main navigation (TLDR, Blogs, Projects, Principles, Other Stuff, Contact)
- Social media links (Twitter, GitHub, LinkedIn)

## Design System Features

### Responsive Design
- Mobile-first approach
- Breakpoint at 64em for desktop styles
- Touch-friendly navigation for mobile devices

### Visual Effects
- Bottom blur gradient effect on all pages
- Proper spacing to ensure content is readable above blur
- Smooth transitions and hover effects

### Typography
- Uses Lab Grotesque font family
- Responsive font sizing with CSS custom properties
- Optimized line lengths for readability (39ch for lists, 65ch for articles)

## Key Configuration Notes

### Spacing & Layout
- Uses `--spacing: 0.75em` for consistent horizontal margins
- Content indentation of `2.8ch` for proper alignment
- Bottom margins calculated to avoid blur effect: `calc(3.7em + var(--line-height) + 2em)`

### Content Positioning
- Signal content requires specific CSS for proper display
- Main content section uses `signal--clone` class with custom positioning
- Page content areas need proper margin-left/right for desktop alignment

## Development Notes

### Git Workflow
- Use branches for major changes (e.g., `fix-javascript-modules`)
- Main development on `master` branch
- JavaScript modules were added to resolve 404 import errors

### Common Tasks
1. **Adding new blog content**: Create `.md` file in `content/` directory
2. **Styling adjustments**: Modify relevant CSS files in `assets/css/`
3. **Layout issues**: Check page.css and signal.css for margin/positioning rules
4. **JavaScript errors**: Verify all modules exist in `assets/js/modules/`

### Browser Compatibility
- Modern browsers with ES6 module support
- Uses CSS custom properties extensively
- Responsive design tested on mobile and desktop

## Deployment
- Hosted on GitHub Pages
- Static site with no server-side dependencies
- All content served directly from repository