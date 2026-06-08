# Backend service layer

All communication with the backend lives here. Screens never call `fetch` directly —
they import from `../services`. This keeps the wire format in one place and lets the
backend evolve without touching the UI.

## Files

| File           | Role                                                                 |
| -------------- | ------------------------------------------------------------------- |
| `config.ts`    | Base URLs (per platform) + timeout. Override with `EXPO_PUBLIC_*`.  |
| `apiClient.ts` | `fetch` wrapper: timeout, JSON parse, `ApiError`/`NetworkError`, cookies. |
| `types.ts`     | Wire shapes: `SearchResult`, `ApiProduct`, `AuthUser`.             |
| `search.ts`    | **WIRED** → `POST /api/public/search` (text + image embeddings).  |
| `products.ts`  | **STUBS** → product details / trending + API→UI mapping.          |
| `auth.ts`      | node-auth (SuperTokens) sign in / up / out + session check.        |

## What connects to what

```
app/search.tsx ─(query)─▶ app/results.tsx ─▶ searchByText ─▶ POST /api/public/search
app/(tabs)/camera.tsx ─(imageUri)─▶ app/results.tsx ─▶ searchByImage ─▶ POST /api/public/search
                                            │
                                            └▶ enrichResults ─▶ getProductsByIds (STUB)
                                                                 └─ falls back to placeholder cards
```

The search endpoint returns only `{ productId, similarity }`. `enrichResults` tries to
fetch product details and, until that backend endpoint exists, renders placeholder cards
that still carry the real similarity score — so search is verifiably live today.

## Adding a new endpoint (the expandable path)

1. Add the wire shape to `types.ts`.
2. Add a function to the relevant service module using `getJson` / `postJson` /
   `postMultipart` — never call `fetch` directly.
3. Export it from `index.ts`.
4. Call it from a screen.

## Turning the stubs on

When the backend ships product endpoints, open `products.ts`, delete the
`throw new NotImplementedError(...)` line, and uncomment the `return getJson(...)` line
below it. The screens already prefer real data, so nothing else changes.

## Removing an embedding search mode (txt_emb / img_emb)

See the boxed note in `types.ts`. In short: dropping `img_emb` means deleting
`searchByImage` + the image branch of `searchMultimodal` and the camera wiring; dropping
`txt_emb` means deleting `searchByText` + the text branch and the search-box handoff.
Embeddings never appear in `ApiProduct`, so the UI is unaffected either way.
