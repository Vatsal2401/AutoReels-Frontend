---
paths:
  - "**/*.{ts,tsx}"
---

# Next.js Patterns

> Next.js 14 App Router patterns for the Auto Reels frontend.

## Server vs Client Components (CRITICAL)
- **Default is Server Component** — no directive needed
- Add `'use client'` ONLY for: event handlers, React hooks (`useState`, `useEffect`), browser APIs, TanStack Query
- Keep data fetching in Server Components when possible — faster, no loading state needed
- Pass data down as props from Server → Client Components

```tsx
// Server Component (no directive) — fetches data on server
export default async function VideoPage({ params }: { params: { id: string } }) {
  const video = await getVideo(params.id); // direct DB/API call
  return <VideoPlayer video={video} />;
}

// Client Component — has interactivity
'use client';
export function VideoPlayer({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  return <button onClick={() => setPlaying(!playing)}>...</button>;
}
```

## App Router File Conventions
```
app/
  layout.tsx          — shared layout (wrap with providers)
  page.tsx            — route page component
  loading.tsx         — Suspense fallback for the route
  error.tsx           — error boundary for the route (must be 'use client')
  not-found.tsx       — 404 page
  (group)/            — route group (no URL segment)
```

## TanStack Query v5 (CRITICAL — v5 API)
```tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['videos', userId],
  queryFn: () => videosApi.list(userId),
});

// Mutation
const queryClient = useQueryClient();
const { mutate } = useMutation({
  mutationFn: (dto: CreateVideoDto) => videosApi.create(dto),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] }),
});
```
**CRITICAL:** v5 uses `{ queryKey, queryFn }` object — NOT positional args like v4.

## API Client Pattern
```typescript
// lib/api/videos.ts
import axios from 'axios';

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const videosApi = {
  list: () => client.get<Video[]>('/video').then(r => r.data),
  create: (dto: CreateVideoDto) => client.post<Video>('/video', dto).then(r => r.data),
  get: (id: string) => client.get<Video>(`/video/${id}`).then(r => r.data),
};
```

## Component Conventions
- **`cn()` utility** — always use for merging Tailwind classes: `import { cn } from '@/lib/utils'`
- **shadcn/ui components** — import from `@/components/ui/...`
- **Icons** — import from `lucide-react`
- **Toasts** — `import { toast } from 'sonner'`
- **Path aliases** — use `@/` for all internal imports, never relative `../../`

```tsx
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
```

## Form Pattern
```tsx
'use client';
const [value, setValue] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await mutateAsync({ value });
    toast.success('Created successfully');
  } catch {
    toast.error('Something went wrong');
  }
};
```

## Image & Link
- Always use `next/image` instead of `<img>`
- Always use `next/link` for internal navigation instead of `<a>`

```tsx
import Image from 'next/image';
import Link from 'next/link';
```

## Anti-Patterns
- Do NOT add `'use client'` to layouts unnecessarily — breaks streaming
- Do NOT fetch data with useEffect + fetch — use TanStack Query
- Do NOT use `<img>` or `<a>` for internal content — use `next/image` and `next/link`
- Do NOT hardcode API URLs — use `process.env.NEXT_PUBLIC_API_URL`
- Do NOT use v4 TanStack Query API — this project uses v5
- Do NOT use `pages/` directory — App Router only
