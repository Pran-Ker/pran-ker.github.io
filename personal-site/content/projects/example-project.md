# Example Project Title

*Date: January 2024*

![Project Screenshot](/content/images/example-screenshot.png)

## Overview

This is an example markdown file showing how easy it is to add new content pages. You can write in standard markdown format and include:

- **Bold text** and *italic text*
- Lists (like this one)
- Code blocks
- Images
- Links

## Features

### Feature 1: Easy to Write
Just create a new `.md` file in the `/content/` folder. Use standard markdown syntax that you already know.

### Feature 2: Automatic Rendering
The detail page automatically converts your markdown to HTML with proper styling.

### Feature 3: Image Support
Add images to `/content/images/` and reference them like:
```markdown
![Alt text](/content/images/your-image.png)
```

## Code Examples

You can include code blocks with syntax highlighting:

```python
def hello_world():
    print("Hello from your markdown content!")
    return True
```

```javascript
const loadContent = async () => {
    const response = await fetch('content/example.md');
    const markdown = await response.text();
    return marked.parse(markdown);
};
```

## Adding Your Own Content

1. Create a new `.md` file in `/content/`
2. Add a link from any main page: `<a href="detail.html#your-file">Link Text</a>`
3. That's it! The page will automatically load your content

## Tables

You can even create tables:

| Feature | Description | Status |
|---------|------------|--------|
| Markdown Support | Full markdown rendering | ✅ Complete |
| Image Support | Embed images easily | ✅ Complete |
| Code Highlighting | Syntax highlighted code blocks | ✅ Complete |
| Back Navigation | Automatic back button | ✅ Complete |

## Quotes

> "The best way to predict the future is to invent it."
> – Alan Kay

## Conclusion

This example shows how flexible and easy the markdown content system is. You can create rich, formatted content without touching any HTML or CSS. Just write markdown and go!