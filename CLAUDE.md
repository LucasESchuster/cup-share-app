@AGENTS.md

# Cup Share — Frontend

Coffee recipe sharing platform. This is a **Next.js 16 frontend** that consumes a separate Laravel API. There is no database, ORM, or backend logic in this repo — all data comes from `API_BASE_URL`.

## Stack & Versions

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Language       | TypeScript 5 (strict mode)                            |
| Framework      | Next.js 16.2 (App Router, React Server Components)    |
| React          | 19.2                                                  |
| Styling        | Tailwind CSS 4 (PostCSS plugin, no tailwind.config)   |
| Components     | shadcn/ui (base-nova style) + Base UI                 |
| Icons          | lucide-react                                          |
| Validation     | Zod 4                                                 |
| Toasts         | sonner                                                |
| Dark mode      | Cookie-based (`theme` cookie), toggled via class       |
| Fonts          | Geist (sans), Geist Mono, Fraunces (headings)         |
| Node           | ≥ 20.9 (see `.node-version`)                          |
| Package manager| npm                                                   |
| Deployment     | Railway (standalone output)                            |

## Commands

```sh
npm run dev      # Start dev server
npm run build    # Production build (standalone output + copied assets)
npm run start    # Start production server
npm run lint     # ESLint (flat config)
```

There are no test, migration, or seed commands — this is a frontend-only repo.

## Environment Variables

| Variable       | Description                            | Example                     |
| -------------- | -------------------------------------- | --------------------------- |
| `API_BASE_URL` | Backend API root (required)            | `http://localhost/api/v1`   |
| `APP_URL`      | Frontend origin (for auth callbacks)   | `https://cupshare.app`      |
| `NODE_ENV`     | Controls secure cookies in production  | `production`                |

## Project Structure

```
app/
├── (public)/                  # No auth required
│   ├── page.tsx               # Home — recipe feed with filters & pagination
│   ├── entrar/page.tsx        # Login (magic link form)
│   ├── receitas/[id]/page.tsx # Recipe detail (public)
│   └── suspenso/page.tsx      # Account suspended page
├── (protected)/               # verifySession() in layout
│   ├── perfil/page.tsx        # User profile (recipes tab + account tab)
│   └── receitas/
│       ├── nova/page.tsx      # Create recipe
│       └── [id]/editar/page.tsx # Edit recipe
├── (admin)/                   # verifyAdmin() in layout
│   └── admin/
│       ├── page.tsx           # Redirect → /admin/brew-methods
│       ├── brew-methods/      # CRUD brew methods
│       ├── equipamentos/      # CRUD equipment
│       ├── usuarios/          # User management (ban/unban)
│       └── magic-links/       # Magic link monitor
├── actions/                   # Server Actions
│   ├── admin.ts               # Brew methods, equipment, users (admin)
│   ├── auth.ts                # requestMagicLink
│   ├── likes.ts               # like/unlike recipe
│   ├── recipes.ts             # CRUD recipes + visibility toggle
│   └── user.ts                # updateProfile, deleteAccount
├── api/auth/logout/route.ts   # POST logout Route Handler
├── auth/callback/route.ts     # GET magic link callback Route Handler
├── layout.tsx                 # Root layout (fonts, theme, Toaster)
└── globals.css                # Tailwind v4 theme (OKLCh color system)

components/
├── admin/                     # Admin CRUD managers (all "use client")
├── auth/                      # MagicLinkForm, LogoutButton, ProfileForm
├── layout/                    # Header (server), Footer (server), UserMenu, ThemeToggle
├── recipes/                   # RecipeForm, RecipeCard, RecipeGrid, RecipeFilters,
│                              # RecipePagination, RecipeSteps, LikeButton, DeleteRecipeButton
├── providers/                 # (empty — reserved)
└── ui/                        # shadcn/ui primitives (do not edit manually)

lib/
├── api/
│   ├── client.ts              # apiFetch<T>() — central fetch wrapper with auth & error handling
│   ├── recipes.ts             # Recipe CRUD + likes
│   ├── equipment.ts           # getEquipment()
│   ├── reference.ts           # getBrewMethods()
│   ├── users.ts               # getMe, updateMe, deleteMe, getMyRecipes
│   └── admin.ts               # Admin API functions
├── dal.ts                     # verifySession(), verifyAdmin(), getOptionalToken() — cached
├── session.ts                 # Cookie management (create/delete/get token)
├── types.ts                   # All TypeScript types + Zod schemas
└── utils.ts                   # cn() (clsx + tailwind-merge)

proxy.ts                       # Next.js middleware — route protection & auth redirects
```

## Scope Restriction

**This repo is frontend-only.** The backend is a separate Laravel API. Never access, read, or suggest changes to backend code. If a problem appears to originate from the API, report it — do not attempt to fix it.

## Architecture & Conventions

### Language

All user-facing text is in **Brazilian Portuguese (pt-BR)**. Route paths, labels, error messages, validation messages — everything is in Portuguese. The `<html lang="pt-BR">` is set in the root layout.

### Server vs Client Components

- **Pages and layouts are Server Components** by default. They fetch data directly using `lib/api/` functions.
- **Interactive components use `"use client"`** — forms, buttons with actions, filters, anything with `useState`/`useEffect`.
- **Server Components**: Header, Footer, RecipeCard, RecipeGrid, all pages.
- **Client Components**: all forms, filters, admin managers, LikeButton, ThemeToggle.

### Data Fetching

All data is fetched **server-side** through `lib/api/` functions. These functions:
- Import `'server-only'` — they cannot be imported in client components.
- Use `apiFetch<T>()` from `lib/api/client.ts`, which auto-injects the Bearer token from cookies.
- Are called directly in Server Components and Server Actions — never from the client.

### API Client (`lib/api/client.ts`)

- `apiFetch<T>(path, options)` — wraps `fetch()` with auth headers, JSON content type, and error handling.
- Returns `T` for success, `undefined` for 204 No Content.
- Throws `ApiError(status, message)` for generic errors.
- Throws `ApiValidationError(errors, message)` for 422 with `{ errors: Record<string, string[]> }`.
- On 403 with `"Account suspended."` → redirects to `/suspenso` with ban details.
- Handles Next.js redirect errors by re-throwing them (check for `NEXT_REDIRECT` digest).

### Authentication

Magic link flow:
1. User submits email → `requestMagicLink` server action → backend sends email.
2. User clicks link → `/auth/callback?token=xxx` (Route Handler) → validates with backend → sets `cup_share_token` cookie.
3. Cookie: httpOnly, secure in prod, sameSite lax, 7-day expiry.
4. Logout: POST `/api/auth/logout` → backend logout → delete cookie.

Session verification (`lib/dal.ts`):
- `verifySession()` — cached; reads cookie, fetches user via `getMe()`, redirects to `/entrar` if missing.
- `verifyAdmin()` — cached; calls `verifySession()` then checks `is_admin`, redirects to `/` if false.
- `getOptionalToken()` — cached; returns token or `undefined` (no redirect).

### Route Protection (`proxy.ts`)

Middleware that runs on every non-API/non-static request:
- Protected paths (`/perfil`, `/receitas/nova`, `/receitas/[id]/editar`, `/equipamentos`): redirect to `/entrar` if no token.
- Auth-only path (`/entrar`): redirect to `/` if token exists.
- Recipe detail (`/receitas/[id]`) is public — only `/editar` is protected.

### Server Actions Pattern

Located in `app/actions/`. All follow this convention:

```typescript
type ActionState = {
  errors?: Record<string, string[]>  // field-level validation errors
  error?: string                      // general error message
} | undefined                         // undefined = success

export async function myAction(prevState: ActionState, formData: FormData): Promise<ActionState>
```

Key rules:
- Always call `verifySession()` or `verifyAdmin()` first.
- Parse and validate FormData with Zod before API call (for recipe actions).
- On success: `revalidatePath()`, optionally `redirect()`, return `undefined`.
- On failure: return `{ errors }` or `{ error }`.
- **Always re-throw redirect errors**: `if (isRedirectError(err)) throw err`.
- For bound actions (edit/update), the first param is the entity ID: `action.bind(null, id)`.

### Form Handling in Components

Two patterns:

1. **`useActionState`** — for create/update forms (MagicLinkForm, ProfileForm, admin managers):
   ```typescript
   const [state, action, pending] = useActionState(serverAction, undefined)
   ```
   - `state === undefined` → success.
   - `state.errors` → field-level errors shown under each input.
   - `state.error` → general error shown as banner/toast.

2. **`useTransition`** — for simple actions (delete, like/unlike, logout):
   ```typescript
   const [isPending, startTransition] = useTransition()
   startTransition(async () => { await serverAction(id) })
   ```

### Optimistic Updates

`LikeButton` uses `useOptimistic` for instant feedback, reverts on error.

### URL-Based State

Filters and pagination use `useSearchParams` + `useRouter` to persist state in the URL. Components read from and write to query params — no client state store.

### Loading States

No `loading.tsx` files. Uses React `<Suspense>` with skeleton fallbacks in pages.

### Error Handling in Pages

No `error.tsx` files. Pages catch `ApiError` with status 404 and call `notFound()`. Other errors propagate to Next.js default error handling.

### Types (`lib/types.ts`)

All types are centralized. Key types:
- `Recipe`, `RecipeStep`, `RecipeEquipment`, `RecipeVisibility`, `RecipeFilters`
- `User`, `AdminUser`, `MagicLink`, `MagicLinkStatus`
- `BrewMethod`, `BrewMethodCategory`, `Equipment`, `EquipmentType`
- `Paginated<T>`, `PaginatedMeta`
- `RecipeFormSchema` (Zod) — validated in server actions before API calls.

### Styling

- Tailwind CSS v4 via `@tailwindcss/postcss` — **no `tailwind.config` file**. Theme is defined in `globals.css` with `@theme`.
- Color system uses OKLCh for perceptual consistency (coffee-themed palette).
- `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional class merging.
- shadcn/ui components in `components/ui/` — installed via `shadcn` CLI, do not edit manually.
- Dark mode via `.dark` class on `<html>`, toggled by ThemeToggle writing a `theme` cookie.

### Pagination

Backend returns Laravel-style `Paginated<T>` with `{ data, meta, links }`. The `meta` object contains `current_page`, `last_page`, `total`, `per_page`, `from`, `to`. Frontend pagination components read `meta` and update the `page` search param.

## Business Rules

- **Recipe water/yield XOR**: A recipe must have either `water_ml` or `yield_ml`, never both, never neither. Enforced by Zod `.refine()` in `RecipeFormSchema`.
- **Minimum 1 like**: `LikeButton` enforces `Math.max(1, count)` — recipes always show at least 1 like.
- **Owner cannot like own recipe**: `LikeButton` is disabled when `isOwner` is true.
- **Brew method categories**: `filter`, `espresso`, `pressure`, `cold_brew` — each has a Portuguese label and icon.
- **Equipment types**: `grinder`, `espresso_machine`, `scale`, `dripper`, `kettle`, `other`.
- **Grinder clicks**: Equipment entries that reference a grinder show an extra `grinder_clicks` field.
- **Recipe draft persistence**: `RecipeForm` auto-saves to localStorage (`cup-share:recipe-draft`) with 800ms debounce and offers restoration on mount.
- **Account suspension**: 403 responses with `"Account suspended."` trigger a redirect to `/suspenso` showing ban date and reason.

## What NOT to Do

- **Do not access or modify backend code.** This repo is frontend-only. The Laravel API lives elsewhere.
- **Do not set cookies in Server Component pages.** In Next.js 16, `cookies().set()` only works in Route Handlers and Server Actions. It fails silently in Server Components.
- **Do not import `lib/api/` functions in client components.** They use `'server-only'` and will error.
- **Do not edit `components/ui/` files manually.** These are shadcn/ui primitives managed by the CLI.
- **Do not create `tailwind.config` files.** Tailwind v4 theme is in `globals.css`.
- **Do not forget to re-throw redirect errors in server action catch blocks.** Next.js redirects throw errors with a `NEXT_REDIRECT` digest — catch blocks must check `isRedirectError(err)` and re-throw, or the redirect silently fails.
- **Do not use `useActionState` with initial state that isn't `undefined`.** The convention is `undefined = success`, so initial state should be `undefined`.
- **Do not create `loading.tsx` or `error.tsx` files.** The project uses `<Suspense>` with skeletons and manual `notFound()` calls instead.
- **Do not forget `revalidatePath()` after mutations.** Every server action that writes data must revalidate the affected paths.
- **Base UI `Select.Value` requires explicit children** for label display in controlled mode — do not leave it empty.
