# Repository Guidelines

## Project Structure & Module Organization
`app/` implements the App Router entrypoints, layouts, and metadata files; colocated folders (e.g., `app/blog`) own their route-specific components. Shared UI sits in `components/`, higher-level wrappers in `layouts/`, and Tailwind/global styles in `css/`. Markdown + MDX sources live under `data/` (`data/blog`, `data/projects`) and are typed through `contentlayer.config.ts`; public assets go in `public/`, while helper chores (RSS, sitemap) live in `scripts/`.

## Build, Test, and Development Commands
- `npm run dev` (aliases: `yarn dev`, `pnpm dev`): starts the dev server with hot reload and Contentlayer watch.
- `npm run build`: creates the production bundle then runs `scripts/postbuild.mjs` to refresh RSS/search artifacts.
- `npm run start`: serves `.next/` for pre-release verification or remote previews.
- `npm run lint`: executes Next + ESLint with auto-fix over `app`, `components`, `layouts`, and `scripts`.
- `npm run analyze`: builds with the bundle analyzer to inspect slow routes before shipping.

## Coding Style & Naming Conventions
Use TypeScript, React Function Components, and server components by default—only mark files with `"use client"` when hooks or browser APIs are involved. Sorting of Tailwind classes and general formatting are handled by Prettier plus `prettier-plugin-tailwindcss`; run it before committing. Components use PascalCase filenames, routes stay lowercase-kebab, Markdown slugs remain snake_case. Prefer named exports except for the default export that Next expects for route components.

## Testing Guidelines
Linting and `npm run build` form the minimum validation gate—both must pass before a PR. When you add automated coverage, colocate specs next to the feature using `<name>.test.tsx` or a `__tests__/` directory, and mock Contentlayer data so builds stay deterministic. Capture a short screen recording for meaningful UI changes (blog listing, light/dark themes, charts) and attach it to the PR.

## Commit & Pull Request Guidelines
Recent commits follow `[type] short message` (e.g., `[feat] add spotlight hero`, `[fix] rss dates`); mimic that style and keep descriptions in present tense. Pull requests need: summary, linked issue (if any), test evidence (`npm run lint`, `npm run build`, manual browser check), and screenshots for visual adjustments. Call out new content files or environment variable requirements so reviewers can reproduce the change quickly.

## Content & Configuration Tips
Edit author/site metadata in `data/siteMetadata.js`, and store secrets in `.env.local`; expose them with `NEXT_PUBLIC_` only when the client truly needs them. After touching feeds, SEO data, or heavy assets, rerun `npm run build` to regenerate the RSS/sitemap outputs deposited in `public/`.
