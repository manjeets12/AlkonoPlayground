---
trigger: manual
---

# SEO Skill for IDE-First Projects

This document outlines the approach to SEO for developer tools like AlkonoPlayground, ensuring search visibility without losing the professional, minimal product identity.

## 🏛️ General Strategy
- **Discoverability Over Marketing**: Focus on describing *what the tool does* (React IDE, React Native Playground) rather than salesy copy.
- **Invisible SEO**: Prefer metadata (`<meta>`, Schema.org) and semantic HTML over visible on-page text.
- **Developer First**: All SEO copy must be technical, high-quality, and useful for searchers looking for specialized tools.

## 🛠️ Best Practices

### Metadata
- **Title**: Use "Brand — Keyword | Secondary Keyword" format.
  - *Example*: AlkonoPlayground — React & React Native Web IDE
- **Description**: Keep between 150-160 characters. Use actionable verbs like "Edit," "Build," "Run," or "Debug."
- **Canonical**: Always point to the primary host URL to avoid duplicate content issues (especially with staging or temporary URLs).

### Semantic HTML
- **`<h1>`**: Every page must have a single `<h1>`. In an IDE, this can be visually integrated (e.g., as part of the logo or title) or visually hidden if absolutely necessary.
- **Hierarchy**: Use `<h2>` and `<h3>` for panels or section titles if they exist, but don't force them into the IDE flow.
- **Aria-Labels**: Use descriptive `aria-label` for icons (Run button, Save button) as they help both accessibility and search contextualization.

### Technical SEO (SPA / GitHub Pages)
- **`robots.txt`**: Allow all by default but disallow any temporary or private paths if they exist.
- **`sitemap.xml`**: List only the main entry point and any static pages. Update manually if new permanent routes are added.
- **GitHub Pages 404**: Use a `404.html` script to handle SPA routing if sub-paths (like `/problems/1`) are indexed.

### Structured Data (JSON-LD)
- Use **SoftwareApplication** to help Google recognize it as a tool.
- Include `applicationCategory: "DeveloperApplication"`, `operatingSystem: "Web"`, and `offers: { price: "0" }`.

## 🚧 Guardrails & UX Protection
- **No Marketing Banners**: Marketing popups or banners for SEO are strictly forbidden.
- **Minimal Visible Copy**: SEO text should be integrated into existing UI naturally (e.g., in a "About" dialog or a small footer note).
- **Responsive-Friendly**: SEO additions must not break the fragile layout of a multi-panel IDE on smaller screens.
- **Performance**: Metadata and schema are lightweight. Avoid heavy SEO scripts or libraries.

## 🚀 Guardrails for Future SEO
- **Never** convert the homepage into a landing page.
- **Never** add "Content Sections" or blog-like areas to the editor.
- **Always** maintain the dark theme and minimal design.
- **Always** prioritize "Run" functionality over "About" visibility.
