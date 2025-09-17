# Personal Site Template

A clean, minimalist personal website template based on the 37signals design system. This template provides a professional foundation for showcasing your work, skills, and personality with a focus on typography, clean layouts, and accessibility.

## 🚀 Quick Start

1. Replace all placeholder variables (see [Placeholder Variables](#placeholder-variables) below)
2. Update your images in `/assets/images/`
3. Customize navigation links
4. Add your content to the existing pages
5. Create additional pages as needed

## 📋 Placeholder Variables to Replace

Search and replace these placeholders throughout the HTML files:

### Essential Information
- `[YOUR_NAME]` - Your full name (appears in titles, logos, navigation)
- `[YOUR_TAGLINE]` - Your professional tagline or title
- `[YOUR_DESCRIPTION]` - Brief description for meta tags and SEO
- `[YOUR_MAIN_HEADING]` - Main heading on homepage
- `[YOUR_INTRODUCTION]` - Homepage introduction paragraph

### Contact & Social Media
- `[YOUR_EMAIL]` - Your email address
- `[YOUR_TWITTER]` - Twitter username (without @)
- `[YOUR_LINKEDIN]` - LinkedIn profile username

### Homepage Sections
- `[Section Title 1]` through `[Section Title 6]` - Six main section titles on homepage
- `[Footer Link 1]` through `[Footer Link 5]` - Footer navigation links

### About Page Content
- `[Your Background]` - Section heading for your background
- `[ADD YOUR BACKGROUND HERE]` - Your professional background content
- `[Your Expertise]` - Section heading for expertise
- `[ADD YOUR EXPERTISE HERE]` - Your skills and expertise content
- `[Skill Category 1]` and `[Skill Category 2]` - Skill category headings
- `[Skill 1]` through `[Skill 6]` - Individual skills to list
- `[Your Philosophy]` - Section heading for your philosophy
- `[ADD YOUR PHILOSOPHY HERE]` - Your work philosophy or approach
- `[ADD YOUR FAVORITE QUOTE OR PERSONAL MOTTO HERE]` - Quote or motto
- `[Current Focus]` - Section heading for current focus
- `[ADD YOUR CURRENT FOCUS HERE]` - What you're currently working on
- `[Get in Touch]` - Contact section heading
- `[ADD CONTACT INFORMATION HERE]` - Contact information paragraph

## 🖼️ Images to Replace

Replace these images in `/assets/images/`:

### Required Images
- `logo.svg` - Main logo (light version for dark backgrounds)
- `logo-black.svg` - Logo for light backgrounds
- `favicon.png` - Browser favicon (16x16 or 32x32px)
- `apple-touch-icon.png` - iOS home screen icon (180x180px)
- `mask-icon.svg` - Safari pinned tab icon
- `opengraph.png` - Social media preview image (1200x630px recommended)

### Optional Images
- Images in `/books/`, `/signals/`, `/thoughts/` folders can be customized for additional content

## 📄 Adding New Pages

### 1. Create the HTML File
Use `about.html` as a template for new pages:

```html
<!doctype html>
<html lang="en">
<head>
    <title>[YOUR_NAME] &mdash; [Page Title]</title>
    <!-- Copy head section from about.html -->
</head>
<body>
    <!-- Copy navigation from about.html -->
    <main>
        <article class="page">
            <header class="page__header">
                <h1>[Page Title]</h1>
            </header>
            <div class="page__content content">
                <!-- Your content here -->
            </div>
        </article>
    </main>
    <!-- Copy footer from about.html -->
</body>
</html>
```

### 2. Update Navigation
Add your new page to the navigation in both `index.html` and any other pages:

```html
<li><a href="your-page.html" aria-label="Your Page">Your Page</a></li>
```

### 3. CSS Classes for Content
Use these classes for consistent styling:

- `page` - Main page container
- `page__header` - Page header section
- `page__content content` - Main content area with typography styles

## 📁 File Structure

```
personal-site/
├── index.html              # Homepage with signal grid layout
├── about.html              # About page template
├── assets/
│   ├── css/                # All stylesheets
│   │   ├── reset.css       # CSS reset
│   │   ├── root.css        # CSS variables and design tokens
│   │   ├── fonts.css       # Font declarations
│   │   ├── elements.css    # Base element styles
│   │   ├── page.css        # Page layout styles
│   │   ├── nav.css         # Navigation styles
│   │   ├── header.css      # Header styles
│   │   ├── footer.css      # Footer styles
│   │   ├── signal.css      # Homepage signal grid
│   │   └── ...             # Additional component styles
│   ├── js/
│   │   └── script.js       # Main JavaScript file
│   ├── fonts/              # Lab Grotesque font files
│   └── images/             # Image assets
└── README.md               # This file
```

## 🎨 Design System

### Colors
The design uses a minimal color palette defined in `root.css`:
- **Black**: `#000000` - Primary text and backgrounds
- **White**: `#FFFFFF` - Backgrounds and reverse text
- **Grey**: `#696F75` - Secondary text
- **Grey Dark**: `#0F151B` - Dark backgrounds
- **Grey Light**: `#D2D8DE` - Light backgrounds
- **Blurple**: `#5522FA` - Accent color
- **Yellow**: `#FFE200` - Highlight color
- **Red**: `#E82224` - Alert color

### Typography
- **Primary Font**: Lab Grotesque (included)
- **Monospace Font**: Lab Grotesque Mono (included)
- **Responsive sizing**: Uses `calc()` with viewport units for fluid typography

### Spacing
- **Base spacing**: `0.75em` (defined as `--spacing`)
- **Consistent margins**: Use CSS custom properties for spacing

## 🔧 Customization Tips

### Maintaining Design Consistency

1. **Use CSS Custom Properties**: Modify colors and fonts in `root.css` rather than individual files
2. **Follow the Grid**: The homepage uses a signal grid system - maintain the numbered sections (01-06)
3. **Typography Hierarchy**: Use the existing heading structure (h1, h2, h3) for consistency
4. **Navigation**: Keep navigation items concise and update all instances when adding pages

### Performance Tips

1. **Optimize Images**: Compress images before adding them to the assets folder
2. **Font Loading**: The template includes font-display optimizations
3. **CSS Organization**: Styles are modular - only modify what you need

### Accessibility Features

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Included on navigation and interactive elements  
- **Keyboard Navigation**: Mobile menu is keyboard accessible
- **Color Contrast**: Follows WCAG guidelines

## 📱 Responsive Design

The template is fully responsive with:
- **Mobile-first approach**: Base styles for mobile, enhanced for larger screens
- **Flexible navigation**: Hamburger menu on mobile, horizontal on desktop
- **Fluid typography**: Text scales smoothly across all screen sizes
- **Touch-friendly**: Appropriate touch targets on mobile devices

## 🧩 JavaScript Features

The template includes minimal JavaScript for:
- **Mobile navigation**: Toggle functionality for the hamburger menu
- **Smooth scrolling**: Enhanced page navigation
- **Controller modules**: Modular JavaScript architecture for easy customization

## 🚨 Important Notes

- **Keep it simple**: The design philosophy emphasizes clarity and simplicity
- **Test on devices**: Always test your changes on mobile devices
- **Maintain performance**: Keep the site lightweight and fast-loading
- **Update meta tags**: Don't forget to update social media and SEO meta tags

## 💡 Next Steps

1. Replace all placeholder content with your information
2. Add your professional headshot or avatar
3. Create additional pages for your portfolio, blog, or projects
4. Set up hosting and domain
5. Test thoroughly across different devices and browsers

---

**Need help?** The template is based on proven design patterns from 37signals. Keep modifications minimal to maintain the clean, professional aesthetic.