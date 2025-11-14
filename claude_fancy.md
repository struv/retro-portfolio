# Claude Code Blog Style Guide

## Color Palette

### Primary Colors
```css
--midnight-black: #0f0f0f;      /* Primary background */
--charcoal: #1a1a1a;            /* Secondary background */
--obsidian: #252525;            /* Card/elevated surfaces */
```

### Accent Colors
```css
--burnished-gold: #d4af37;      /* Primary accent, links, highlights */
--warm-bronze: #cd7f32;         /* Secondary accent, hover states */
--champagne: #f5e6d3;           /* Text on dark, lamp glow effect */
```

### Tertiary Colors
```css
--forest-emerald: #1a3d2e;      /* Code blocks, callouts */
--deep-jade: #2d5a3f;           /* Borders, subtle emphasis */
--palm-green: #3d6b4f;          /* Hover states for green elements */
```

### Text Colors
```css
--cream: #ebe4d8;               /* Primary text */
--warm-gray: #b8b0a3;           /* Secondary text */
--dim-gold: #9b8b6f;            /* Tertiary text, captions */
```

## Typography

### Font Stack
```css
--serif-primary: 'Cormorant Garamond', 'Baskerville', 'Garamond', 'Georgia', serif;
--serif-display: 'Playfair Display', 'Didot', 'Georgia', serif;
--mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### Type Scale
```css
--text-xs: 0.75rem;    /* 12px - captions, labels */
--text-sm: 0.875rem;   /* 14px - secondary text */
--text-base: 1.125rem; /* 18px - body text */
--text-lg: 1.375rem;   /* 22px - lead paragraphs */
--text-xl: 1.75rem;    /* 28px - h3 */
--text-2xl: 2.25rem;   /* 36px - h2 */
--text-3xl: 3rem;      /* 48px - h1 */
--text-4xl: 4rem;      /* 64px - hero text */
```

### Font Weights
```css
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.2;
--leading-normal: 1.6;
--leading-relaxed: 1.8;
--leading-loose: 2.0;
```

## Layout

### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
```

### Border Radius
```css
--radius-sm: 2px;
--radius-md: 4px;
--radius-lg: 8px;
--radius-xl: 16px;
```

## Component Styles

### Headers
```css
h1 {
  font-family: var(--serif-display);
  font-size: var(--text-3xl);
  font-weight: var(--weight-light);
  color: var(--champagne);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-8);
}

h2 {
  font-family: var(--serif-display);
  font-size: var(--text-2xl);
  font-weight: var(--weight-regular);
  color: var(--cream);
  line-height: var(--leading-tight);
  margin-top: var(--space-16);
  margin-bottom: var(--space-6);
}

h3 {
  font-family: var(--serif-primary);
  font-size: var(--text-xl);
  font-weight: var(--weight-medium);
  color: var(--cream);
  line-height: var(--leading-normal);
  margin-top: var(--space-12);
  margin-bottom: var(--space-4);
}
```

### Body Text
```css
p {
  font-family: var(--serif-primary);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  color: var(--cream);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.lead {
  font-size: var(--text-lg);
  font-weight: var(--weight-light);
  color: var(--champagne);
  line-height: var(--leading-loose);
}

.caption {
  font-size: var(--text-sm);
  color: var(--dim-gold);
  font-style: italic;
}
```

### Links
```css
a {
  color: var(--burnished-gold);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

a:hover {
  color: var(--warm-bronze);
  border-bottom-color: var(--warm-bronze);
}
```

### Code Blocks
```css
code {
  font-family: var(--mono);
  font-size: 0.9em;
  background: var(--forest-emerald);
  color: var(--champagne);
  padding: 0.2em 0.4em;
  border-radius: var(--radius-sm);
}

pre {
  background: var(--forest-emerald);
  border: 1px solid var(--deep-jade);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  overflow-x: auto;
  margin: var(--space-8) 0;
}

pre code {
  background: none;
  padding: 0;
}
```

### Blockquotes
```css
blockquote {
  border-left: 3px solid var(--burnished-gold);
  padding-left: var(--space-6);
  margin: var(--space-8) 0;
  font-style: italic;
  color: var(--warm-gray);
}
```

### Cards
```css
.card {
  background: var(--obsidian);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.15);
}
```

### Buttons
```css
.button-primary {
  background: var(--burnished-gold);
  color: var(--midnight-black);
  font-family: var(--serif-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.button-primary:hover {
  background: var(--warm-bronze);
  transform: scale(1.02);
}

.button-secondary {
  background: transparent;
  color: var(--burnished-gold);
  border: 1px solid var(--burnished-gold);
  font-family: var(--serif-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.button-secondary:hover {
  background: var(--burnished-gold);
  color: var(--midnight-black);
}
```

## Visual Effects

### Glow Effects
```css
.lamp-glow {
  box-shadow: 0 0 40px rgba(245, 230, 211, 0.3);
  filter: brightness(1.2);
}

.gold-shimmer {
  background: linear-gradient(
    135deg,
    var(--burnished-gold),
    var(--warm-bronze),
    var(--burnished-gold)
  );
  background-size: 200% 200%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

### Glass Morphism
```css
.glass {
  background: rgba(26, 26, 26, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 175, 55, 0.1);
}
```

### Shadows
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 16px 64px rgba(0, 0, 0, 0.6);
--shadow-gold: 0 4px 24px rgba(212, 175, 55, 0.2);
```

## Accessibility

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--burnished-gold);
  outline-offset: 2px;
}
```

### Contrast Ratios
- Primary text (cream on midnight-black): 13.8:1 ✓
- Secondary text (warm-gray on midnight-black): 9.2:1 ✓
- Gold accent (burnished-gold on midnight-black): 6.4:1 ✓

### Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Usage Guidelines

### Do's
- Use generous whitespace to create breathing room
- Layer elements with subtle shadows for depth
- Apply warm lighting effects to interactive elements
- Use gold accents sparingly for maximum impact
- Maintain high contrast for readability
- Let serif typography shine with appropriate sizing

### Don'ts
- Avoid pure white text (use cream/champagne instead)
- Don't overuse gold—it loses impact
- Avoid thin fonts below 16px
- Don't stack multiple effects on one element
- Avoid sharp corners on large elements
- Don't compromise on text contrast

## Example Page Structure

```html
<article class="blog-post">
  <header class="post-header">
    <h1>Building with Claude Code</h1>
    <p class="lead">An exploration of AI-assisted development in the terminal</p>
    <div class="meta">
      <time class="caption">October 24, 2025</time>
      <span class="caption">8 min read</span>
    </div>
  </header>
  
  <div class="post-content">
    <p>Your body text here...</p>
    
    <h2>Section Heading</h2>
    <p>More content...</p>
    
    <pre><code>// Code example
claude code analyze app.py</code></pre>
    
    <blockquote>
      "Pull quote or important callout"
    </blockquote>
  </div>
  
  <footer class="post-footer">
    <div class="card">
      <h3>Related Reading</h3>
      <!-- Related posts -->
    </div>
  </footer>
</article>
```

## Inspiration Notes

This palette draws from:
- Midnight hotel lounges with intimate lighting
- Brass fixtures and warm lamp glow
- Deep velvet textures and polished surfaces
- Palm gardens viewed through dark glass
- The confluence of natural elegance and technical precision