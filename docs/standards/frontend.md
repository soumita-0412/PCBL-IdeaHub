# Frontend Coding Standards — Ideas Portal

## Naming Conventions

| Artefact | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase file + export | `IdeaCard.tsx` → `export function IdeaCard` |
| Hooks | camelCase prefixed `use` | `useIdeaList.ts` |
| Services | camelCase + `.service.ts` suffix | `idea.service.ts` |
| Stores | camelCase + `.store.ts` suffix | `auth.store.ts` |
| Types/Interfaces | PascalCase | `interface IdeaResponse` |
| Constants | SCREAMING_SNAKE_CASE | `const MAX_TITLE_LENGTH = 200` |
| CSS class helpers | camelCase functions | `cn(...)` from `lib/utils` |

## Component Structure

Every component lives under `src/features/<domain>/components/` or `src/components/` (shared).

```
src/features/ideas/
├── components/
│   ├── IdeaCard/
│   │   ├── IdeaCard.tsx          ← component
│   │   ├── IdeaCard.test.tsx     ← co-located test
│   │   └── index.ts             ← re-export
│   └── IdeaList.tsx
├── hooks/
│   └── useIdeaList.ts
├── services/
│   └── idea.service.ts
├── schemas/
│   └── idea.schema.ts            ← Zod schemas
└── types/
    └── idea.types.ts
```

### Component Template

```tsx
import type { FC } from "react";

interface Props {
  id: string;
  title: string;
  onSelect?: (id: string) => void;
}

export const IdeaCard: FC<Props> = ({ id, title, onSelect }) => {
  return (
    <div className="rounded-lg border p-4">
      <h3>{title}</h3>
    </div>
  );
};
```

Rules:
- Named exports only (no default exports from component files).
- Props interface defined in the same file.
- Server Components by default; add `"use client"` only when needed (event handlers, hooks, browser APIs).

## Hooks Structure

Custom hooks live in `src/hooks/` (global) or `src/features/<domain>/hooks/`.

```ts
export function useIdeaList(params: ListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.ideas.list(params),
    queryFn: () => ideaService.list(params),
  });
}
```

Rules:
- One hook per file.
- Return objects (not arrays) for readability.
- Always pass `queryKey` from `QUERY_KEYS` constants.

## API / Service Layer

Services extend `BaseService` and use `apiClient` from `lib/axios`.

```ts
class IdeaService extends BaseService<IdeaResponse> {
  constructor() { super("/ideas"); }

  async getById(id: string): Promise<IdeaResponse> {
    return this.get(`/${id}`);
  }
}
export const ideaService = new IdeaService();
```

Rules:
- Services are singletons exported as lowercase instances.
- Never call `apiClient` directly from components or hooks.
- Access tokens are injected via Axios request interceptor.

## Form Handling

All forms use React Hook Form + Zod.

```ts
const schema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
});
type FormValues = z.infer<typeof schema>;
```

## State Management

- **Server state**: TanStack Query (fetching, caching, invalidation).
- **Global client state**: Zustand stores in `src/stores/`.
- **Local component state**: `useState` / `useReducer`.
- No Redux. No Context API for data (only for theme/auth provider wrapping).

## Import Order (enforced by ESLint)

1. Node built-ins
2. External packages
3. Internal aliases (`@/`)
4. Relative imports (`./`, `../`)
