# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a feature-rich Next.js 15 blogging template using Tailwind CSS v4, TypeScript, and Contentlayer for content management. It uses the modern App Router architecture with React Server Components.

## Development Commands

### Common Development Tasks
```bash
# Start development server
yarn dev

# Build for production
yarn build

# Run linting with auto-fix
yarn lint

# Analyze bundle size
yarn analyze

# Check package updates
yarn outdated
```

### Content Development
```bash
# Add new blog post
# Create MDX file in data/blog/ with frontmatter

# Add new author
# Create MDX file in data/authors/

# Update site configuration
# Edit data/siteMetadata.js
```

## Architecture Overview

### Core Technology Stack
- **Framework**: Next.js 15 with App Router (React Server Components)
- **Styling**: Tailwind CSS v4 with custom theme configuration
- **Content**: Contentlayer2 for type-safe MDX processing
- **Language**: TypeScript with path mapping (@/ aliases)
- **Package Manager**: Yarn 3.6.1

### Key Directories
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
- `layouts/` - Three post layout variants (PostLayout, PostSimple, PostBanner)
- `data/` - Content (blog posts, authors) and configuration
- `css/` - Tailwind configuration and custom styles

### Content System Architecture
- **MDX Processing**: Contentlayer handles MDX compilation with frontmatter
- **Type Generation**: Auto-generated TypeScript types for all content
- **Plugin Chain**: Math (KaTeX), syntax highlighting, GitHub alerts, citations
- **Search Index**: Auto-generated search data for Kbar/Algolia

### Build Process Flow
1. Contentlayer processes MDX files and generates types
2. Next.js builds with App Router optimizations
3. Post-build script generates RSS feeds
4. Bundle analysis available via `yarn analyze`

## Configuration Files

### Essential Configuration
- `data/siteMetadata.js` - Site information, analytics, social links
- `contentlayer.config.ts` - Content processing and plugin configuration
- `next.config.js` - Contentlayer integration, security headers, redirects
- `css/tailwind.css` - Theme tokens using Tailwind v4 @theme syntax

### Content Structure
- Blog posts: `data/blog/` (supports nested folders)
- Authors: `data/authors/` (multi-author support)
- Navigation: `data/headerNavLinks.ts`
- Projects: `data/projectsData.ts`

## Development Patterns

### TypeScript Integration
- Path mapping with `@/` aliases for clean imports
- Contentlayer generates types for all MDX content
- Partial strict mode (strictNullChecks enabled)

### Styling Architecture
- Tailwind v4 with custom theme tokens
- Component-specific styling via utility classes
- Dark/light theme switching with next-themes
- Prism.js for code block syntax highlighting

### Component Architecture
- Server Components by default (App Router)
- Client components marked with 'use client'
- MDX component mapping for custom markdown rendering
- Layout system with multiple post template options

## Quality Assurance

### Pre-commit Hooks
- Husky + lint-staged runs on commit
- ESLint with auto-fix
- Prettier formatting with Tailwind class sorting

### Linting Configuration
- Next.js, TypeScript, and accessibility rules
- Prettier integration with Tailwind plugin
- Custom rules for MDX and content validation

## Deployment Notes

### Build Requirements
- Node.js 18+ 
- Yarn 3.6.1 (uses Yarn PnP)
- Contentlayer processes content before Next.js build

### Environment Variables
- Check `data/siteMetadata.js` for analytics and service integrations
- Comment system configuration (Giscus, Utterances, Disqus)
- Newsletter service setup (various providers supported)

### Static Assets
- Images: Use `public/static/` directory
- Favicons: Replace in `public/static/favicons/`
- Optimize images with next/image component

## Content Management

### Blog Post Structure
- Frontmatter with title, date, tags, summary, authors
- Support for draft posts and featured content
- Automatic tag generation and filtering
- SEO optimization with structured data

### Multi-author Support
- Author profiles in `data/authors/`
- Multiple authors per post supported
- Social media integration for author profiles

### Customization Points
- Theme colors: `css/tailwind.css` @theme section
- Site metadata: `data/siteMetadata.js`
- Navigation: `data/headerNavLinks.ts`
- Footer and social links via siteMetadata