# Architecture — UI Components

## Overview

Shared React component library consumed by the web app (and potentially other future apps). Published as an internal workspace package (`@repo/ui`).

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| UI Library | React | 19.2.0 |
| Language | TypeScript | 5.9.2 |
| Linting | ESLint (shared config) | 9 |

## Package Configuration

The package uses direct file exports via the `exports` field in `package.json`:

```json
{
  "exports": {
    "./*": "./src/*.tsx"
  }
}
```

Consumers import components as:
```typescript
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
```

## Components

| Component | File | Props | Description |
|-----------|------|-------|-------------|
| `Button` | `button.tsx` | `children`, `className`, `appName` | Basic button with click handler |
| `Card` | `card.tsx` | `className`, `title`, `children`, `href` | Link card with title and content |
| `Code` | `code.tsx` | `children`, `className` | Inline code wrapper |

## Source Structure

```
packages/ui/
├── src/
│   ├── button.tsx
│   ├── card.tsx
│   └── code.tsx
├── package.json
└── tsconfig.json
```

## Architecture Notes

- These are starter components from the Turborepo template — the web app has grown its own component library under `apps/web/src/shared/ui/` for production UI needs
- The package has no tests yet (`"test": "echo \"@repo/ui: no tests yet\""`)
- A Turborepo generator is configured for scaffolding new components: `pnpm --filter @repo/ui generate:component`
- All components use named exports
- No styling framework is bundled — consumers bring their own CSS/Tailwind

## Relationship to Web App

The web app imports from `@repo/ui` but also maintains its own `shared/ui/` directory containing production UI components (ErrorMessage, LoadingState, A11yAnnouncer, OfflineReadOnlyBanner). The `@repo/ui` package currently serves as the Turborepo-scaffolded shared library baseline.
