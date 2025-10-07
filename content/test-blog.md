# Test Blog Post

This is a test blog post to demonstrate all the new features.

## Introduction

This section shows how **bold text** and *italic text* look. Here's a [link to Google](https://google.com).

## Code Examples

Here's some inline code: `const x = 10;`

And here's a code block:

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
```

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)
```

## Math Equations

Here's an inline equation: $E = mc^2$

And here's a display equation:

$$
\frac{d}{dx}\left( \int_{0}^{x} f(u)\,du\right)=f(x)
$$

Another complex equation:

$$
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}
$$

### Subsection Example

This is a subsection to test H3 styling in the table of contents.

## Lists

Here's an unordered list:

- First item
- Second item
- Third item with **bold** and *italic*

And an ordered list:

1. First step
2. Second step
3. Third step

## Blockquote

> This is a blockquote. It should have a nice border and background color.
>
> Multiple paragraphs work too.

## Tables

| Algorithm | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Quick Sort | O(n log n) | O(log n) |
| Merge Sort | O(n log n) | O(n) |
| Bubble Sort | O(n²) | O(1) |

## Conclusion

This blog post demonstrates all the enhanced features including:

- Syntax highlighting for code blocks
- Math equation rendering with KaTeX
- Auto-generated table of contents
- Reading time estimate
- Improved typography and spacing
- Prev/Next navigation between posts
