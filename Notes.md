# Snoop — Frontend Technical Report

> Working notes for the frontend chapter of the graduation-project technical report.
> Everything below describes what was actually built in this repository. Sections marked
> **[PLACEHOLDER]** flag material that belongs in the final document but depends on information
> I could not derive from the code alone — each placeholder lists the exact steps to fill it in.

---

## 1. Overview

**Snoop** is a cross-platform mobile application that lets a user find products by **typing a
description, by snapping/uploading a photo, or by combining both** ("multimodal" search). The
frontend is a single codebase that runs natively on **iOS and Android** and also ships as a
**responsive web app** from the exact same source.

The frontend's job is to be a thin, fast, and friendly client over an AI-powered backend:
the heavy work (turning text and images into embeddings and ranking products by similarity) lives
on the server; the frontend is responsible for **capturing the user's intent, presenting results
beautifully, and keeping the experience responsive and forgiving** even when the network is slow or
the user is signed out.

| Aspect | Choice |
|---|---|
| Framework | React Native (via the Expo SDK 54 toolchain) |
| Language | TypeScript (strict mode) |
| Routing | Expo Router (file-based) |
| Targets | iOS, Android, and Web (one codebase) |
| Backends consumed | Two services — a Node/SuperTokens auth service and a Spring Boot product API |

---

## 2. Why React Native

The project required a **mobile-first product** that could be demonstrated on a phone but also be
opened in a browser for the graduation panel without building a separate website. React Native was
selected for the following concrete reasons:

1. **One codebase, three platforms.** React Native compiles the same component tree to real native
   iOS and Android views, and — through `react-native-web` — to DOM elements in the browser. This
   removed the cost of maintaining separate Swift/Kotlin/Web front ends, which was decisive for a
   time-boxed graduation project with a small team.

2. **Native capability access.** The core feature is *visual* search. React Native (through the Expo
   modules) gives direct, permission-gated access to the **device camera and photo library**, which
   a plain web app cannot do reliably. The camera-based search is therefore a true native feature on
   phones, and gracefully removed on web (where it doesn't belong).

3. **A familiar, component-driven mental model.** React's declarative `state → UI` model makes
   complex, stateful screens (a paginated search that can be loading, empty, errored, or populated)
   far easier to reason about than imperative UI code.

4. **A large, mature ecosystem.** Navigation, gestures, SVG, gradients, haptics, and image-picking
   are all solved problems with well-maintained libraries, so engineering effort could stay focused
   on the product rather than on plumbing.

5. **Performance close to native.** UI runs on the native thread; animations used in the app are
   driven by the **native driver** (see §9), so they remain smooth even while JavaScript is busy.

### How React Native works (for the report's background section)

React Native lets you describe an interface in JavaScript/TypeScript using React components, but
instead of rendering to a web DOM it renders to **actual native platform widgets** (a `<View>`
becomes a `UIView` on iOS and an `android.view.View` on Android). Conceptually it runs in three
parts:

- **The JavaScript thread** runs your React code — your components, state, and business logic.
- **The native (UI) thread** owns the real on-screen views and stays responsive to touches and
  scrolling.
- **A bridge / interface layer** carries instructions between the two (e.g. "create this view",
  "this button was tapped"). Animations declared with the *native driver* are handed off to the
  native side once, so they run independently of the JavaScript thread and never stutter when JS is
  busy.

On the **web**, `react-native-web` maps those same primitives onto accessible HTML elements and CSS,
which is why the identical component code can render a `<nav>` landmark and respond to mouse hover in
a browser while rendering a floating tab bar on a phone.

---

## 3. Tooling — what was used and why

| Tool / Library | Role in the project | Why it was chosen |
|---|---|---|
| **Expo (SDK 54)** | Build system, dev server, native module access, OTA-ready packaging | Removes the need to manage Xcode/Android Studio native projects directly; provides a curated, version-aligned set of native modules; lets the app run instantly on a physical device via QR code during development and demos. |
| **TypeScript (strict)** | Whole codebase is typed | Catches whole classes of bugs at compile time; the strict API/UI type boundary (see §6) documents the contract with the backend and makes refactors safe. |
| **Expo Router** | File-based navigation | Each file under `app/` becomes a route; navigation structure is readable directly from the folder tree. Supports typed routes, modal presentations, and per-screen transition animations. |
| **React Navigation (bottom-tabs)** | Underlies the tab navigator that Expo Router builds on | Industry-standard navigation primitives; the project supplies a *custom* tab bar on top of it. |
| **react-native-safe-area-context** | Respects notches, status bars, home indicators | Guarantees content is never hidden behind system UI on any device. |
| **expo-image-picker** | Camera capture + gallery selection for visual search | Handles OS permission prompts and returns a usable image URI; the entry point for image-embedding search. |
| **expo-haptics** | Tactile feedback (e.g. on saving a favourite) | Adds a moment of physical confirmation that makes interactions feel intentional and premium. |
| **expo-linear-gradient** | Gradient fills (camera button, image placeholders) | Lightweight way to add depth and brand warmth without shipping image assets. |
| **react-native-svg** | The "Snoop" mascot and vector iconography | Resolution-independent, recolorable, and animatable artwork with zero image files. |
| **@expo/vector-icons (Feather, MaterialCommunityIcons)** | UI iconography | Large, consistent icon set bundled with Expo; no custom asset pipeline needed. |
| **expo-linking** | Opening external store URLs ("Go to store") | Standard, safe deep-link/URL opening across platforms. |
| **expo-status-bar** | Status-bar styling | Keeps the status bar legible against the app's light theme. |

**Why Expo specifically (and not bare React Native):** Expo bundles all the native modules above at
mutually-compatible versions, provides a single config file (`app.json`) for icons, splash, scheme,
and permission strings, and enables running the app on a real device during development and the final
demo without a native build step. For a graduation project this dramatically lowers setup and
demo risk.

---

## 4. Application structure — how everything connects

The repository is organized by responsibility, which keeps screens thin and logic reusable:

```
app/            ← screens & navigation (file-based routes)
  _layout.tsx        root navigator + global providers
  (tabs)/            the five main tabs (home, browse, camera, favourites, profile)
  search.tsx         full-screen search overlay
  results.tsx        search results
  product/[id].tsx   product detail
  notifications.tsx  notifications
components/     ← reusable, presentational UI building blocks
contexts/       ← app-wide state (FavouritesContext)
hooks/          ← reusable stateful logic (usePaginatedSearch, useImageAttachment)
services/       ← the entire backend communication layer
constants/      ← design tokens (theme) and shared types/data
```

The flow of control is layered and one-directional, which is what keeps the app maintainable:

```
Screen (app/)  →  Hook / Context  →  Service (services/)  →  apiClient  →  Backend
   ▲                                                                          │
   └──────────────────  typed data mapped from wire-shape to UI-shape  ◄──────┘
```

- **Screens** never call the network or `fetch` directly. They call a **hook** or a **context**.
- **Hooks/contexts** orchestrate state and call **service** functions.
- **Services** own all knowledge of backend endpoints and call a single low-level **apiClient**.
- **apiClient** is the one and only place that touches `fetch`.

This separation means a backend change (a new field, a renamed route) touches *one* service file,
not every screen — a direct application of the **single-responsibility** and
**separation-of-concerns** principles.

### Navigation model

- The **root layout** wraps the whole app in the safe-area provider and the favourites provider,
  then declares a **stack** navigator. The tab section is one entry in that stack; `search`,
  `results`, `product/[id]`, and `notifications` are pushed on top with tailored transitions
  (the search screen slides up as a full-screen modal; detail and results slide in from the right).
- The **tab layout** renders the five primary destinations. Crucially, it is **platform-adaptive**:
  on phones it draws a custom floating **bottom** navigation bar; on web it draws a **top**
  navigation bar instead, and it removes the camera tab on web (image capture is native-only). This
  is the single place where the two form factors intentionally diverge.

---

## 5. The backend communication layer (`services/`)

This is the most engineered part of the frontend and deserves its own section in the report.

- **`config.ts`** centralizes every base URL and the request timeout. It is **platform-aware**: it
  automatically resolves `localhost` correctly per platform (the Android emulator reaches the host
  machine at a different address than the iOS simulator), and every value can be overridden at
  build/run time with environment variables, so the same build points at local or cloud backends
  without code changes.

- **`apiClient.ts`** is the single "choke point" through which every request flows. It provides:
  - a **per-request timeout** implemented with `AbortController`, so a hung server can never freeze
    the UI;
  - **uniform error handling** — it normalizes every failure into one of two typed errors,
    `ApiError` (the server responded with a non-2xx status, carrying the status code and body) or
    `NetworkError` (the request never completed). Callers can branch on these precisely (e.g. treat
    `401` as "signed out" rather than a crash);
  - **consistent JSON handling** that tolerates empty bodies and non-JSON error pages;
  - automatic **session-cookie** inclusion so authenticated endpoints work transparently.
  Three thin helpers (`getJson`, `postJson`, `postMultipart`, `deleteJson`) are what the rest of the
  app uses.

- **`types.ts`** declares the **wire shapes** — the exact JSON the backend sends. These are kept
  deliberately separate from the UI types, forming a typed contract with the server.

- **Domain services** each own one area of the API:
  - `search.ts` — the multimodal search endpoint. It builds a `multipart/form-data` request and
    attaches a **text part**, an **image part**, or **both**, which selects text-embedding,
    image-embedding, or combined search on the backend. Image attachment is handled differently on
    web (fetched into a real `Blob`) versus native (a file descriptor), so a single function works
    everywhere.
  - `products.ts` — trending products and the **mapping from wire-shape to UI-shape** (e.g. turning a
    raw price number into a formatted string, deriving a stable placeholder colour from the product
    id).
  - `favourites.ts` — the authenticated save/un-save endpoints.
  - `auth.ts` — sign up / sign in / sign out / session check against the SuperTokens auth service.

- **`index.ts`** re-exports everything so screens import from a single, stable surface (`../services`).

**Two backends, one client.** The app talks to two independent services — a **SuperTokens auth
service** for identity/sessions and a **Spring Boot API** for product data — and the config +
apiClient design lets a single request helper serve both by pointing each service module at the
right base URL.

---

## 6. State management — pragmatic, not over-engineered

No heavyweight state library (Redux, MobX, etc.) was introduced. Instead the app uses **React's
built-in primitives**, chosen to match each kind of state:

- **Local component state** for everything screen-specific (the current query text, which view mode
  is selected, whether an input is focused).

- **React Context** for the one piece of genuinely *global* state: the user's **favourites**
  (`FavouritesContext`). Any screen can read the list and toggle items without prop-drilling.
  This context is where two important UX patterns live:
  - **Optimistic updates with rollback.** Tapping the heart updates the on-screen state
    *immediately*, then syncs with the backend in the background. If the server call fails, the
    change is rolled back so the UI never lies about what was actually saved.
  - **Graceful degradation when signed out.** If the favourites request returns `401`, the app
    silently switches to a local-only mode — the user can still save items for the session, and the
    rest of the app keeps working. Authentication is treated as an enhancement, not a gate.

- **Custom hooks** for reusable stateful logic:
  - **`usePaginatedSearch`** owns the entire search lifecycle so that the browse screen and the
    results screen don't each re-implement it: running a fresh search, appending the next page for
    "Load more", and exposing `loading`, `error`, `hasMore`, and the running total. It guards against
    a subtle real-world bug — **stale responses** — using a monotonically increasing run id: if the
    user fires a new search before an old one returns, the old (now irrelevant) response is discarded
    so results can never flicker back to a previous query.
  - **`useImageAttachment`** encapsulates picking a single image from the gallery, including the
    permission prompt and friendly fallbacks.

This "right tool for the scope" approach keeps the app simple while still handling the genuinely
hard cases (concurrency, optimistic UI, offline/unauth fallback) correctly.

---

## 7. The design system

A graduation panel notices polish, so a **token-based design system** was established up front in
`constants/theme.ts`, rather than scattering colours and sizes across screens. This is the same
discipline used by professional component libraries and design tools.

### Design tokens

Every visual decision is a named token, and components reference tokens — never raw values:

- **Colour** — a single, intentional palette (warm cream/peach backgrounds, a calm blue accent, a
  navy ink for text, a dedicated "savings" green for prices, plus error/divider/surface roles).
  Centralizing colour guarantees consistency and makes a future dark mode or rebrand a one-file
  change.
- **Spacing** — a numeric scale (4, 8, 12, 16, 20, 24, 32, 40, 48) so every margin and gap is a
  multiple of a base unit. This enforces a consistent vertical and horizontal rhythm.
- **Radius** — a small set of corner-radius roles (chip, compact, card, nav, pill).
- **Typography** — a type scale modelled on **Apple's Human Interface Guidelines** (display, title,
  headline, body, callout, subheadline, footnote, caption) with matching weights and letter-spacing,
  so text hierarchy is consistent and reads as "native".
- **Elevation/shadows** — a four-step shadow scale (rest, card, floating, nav) that gives the UI a
  consistent sense of depth and layering.

### Design principles applied

- **8-point grid / spacing scale** — the spacing tokens implement the widely-used 8pt
  (with 4pt half-steps) layout grid for visual rhythm.
- **Apple Human Interface Guidelines** — the typographic scale and the **≥44pt minimum touch
  targets** throughout (nav items, buttons, icon hit-slops) follow Apple's accessibility and layout
  guidance.
- **Atomic/component-driven design** — small presentational components (`ProductCard`,
  `ProductPlaceholder`, `LoadMoreButton`, `SnoopCharacter`, chips, nav bars) compose into screens;
  nothing is duplicated.
- **A consistent visual language** — every surface uses the same palette, radii, and shadows, so the
  app feels like one coherent product rather than a set of screens.

### Brand and personality — the "Snoop" mascot

A custom **SVG mascot** (`SnoopCharacter`) is drawn entirely in code (no image assets) and supports
**six expressions** (neutral, happy, thinking, listening, surprised, waving). The same character is
reused as an emotional thread through the whole app: it **waves** on the home greeting, **thinks**
while a search is loading, looks **surprised** on an empty/error result, and is **happy** on the
profile. This turns otherwise-dead moments (loading, empty states, errors) into on-brand,
reassuring ones — a deliberate, low-cost way to build personality and trust.

> **[PLACEHOLDER — Design process & source of truth]**
> If the report should describe *how* the design system was authored (e.g. in Figma) and show the
> original mockups, add it here. To produce this section:
> 1. Collect the design files (Figma/Sketch/Adobe XD) used before implementation and export the key
>    frames (home, search, results, product detail) as images.
> 2. Note the design-token decisions made in the tool (colour styles, text styles) and show how they
>    map 1:1 to `constants/theme.ts`.
> 3. If no formal design tool was used and the UI was designed directly in code, state that explicitly
>    and describe the iteration process instead.

> **[PLACEHOLDER — Accessibility & contrast audit]**
> The code already applies several accessibility practices (≥44pt touch targets, web `navigation`
> landmark, `accessibilityRole`/`accessibilityState`/`accessibilityLabel` on the web nav, keyboard
> focus rings, non-colour active indicators such as the underline). To make this a measured claim:
> 1. Run the palette through a WCAG contrast checker (e.g. text on background, price-green on cream)
>    and record the AA/AAA pass/fail ratios.
> 2. Test with a screen reader (VoiceOver/TalkBack) on the main flow and note the results.
> 3. Summarize findings in a short table.

---

## 8. Feature walkthrough (screen by screen)

- **Home (`index`)** — a personalized greeting with the waving mascot, a category row, a tap-to-open
  search bar, and a **Trending** section with **timeframe filters** (All-time / Monthly / Weekly /
  Daily) that re-query the backend. Trending data is fetched live with proper loading state and
  cancellation on unmount.
- **Browse (`browse`)** — the primary search workspace: a live search field with attach-photo
  support, a result **count bar**, a two-column product grid, and tailored **loading / empty / error
  / idle** states (each fronted by the mascot). Uses `usePaginatedSearch` with "Load more".
- **Search overlay (`search`)** — a focused, full-screen modal that slides up, auto-focuses the
  input, shows recent searches and suggestions, and supports attaching an image before submitting.
- **Results (`results`)** — shows what was searched (text or "Visual search"), a real total count, a
  **grid/list view toggle**, **skeleton-card** loading, and "Load more" pagination. It also
  **pre-seeds the favourites state** from the backend so hearts are correct immediately.
- **Camera (`camera`)** — a native camera screen with a viewfinder, shutter, and gallery shortcut;
  captures or picks a photo and hands it to image search. Hidden on web.
- **Product detail (`product/[id]`)** — a swipeable **image gallery** with paging dot indicators,
  category/store/price block with optional discount, a **"Go to store"** external link, and a
  **save** action with a spring animation, a confirmation caption, and haptic feedback. It also
  **records a click** to the backend (feeding the trending algorithm).
- **Favourites (`fav`)** — the saved-products grid, with a friendly empty state and a call to action.
- **Profile (`profile`)** — full **sign-in / sign-up** flow against the auth service, a session check
  on mount, a signed-in dashboard with stats and menu, and sign-out.
- **Alerts / Notifications** — a notifications list (price drops, restocks, welcome) presented with
  the mascot per item.

---

## 9. How the experience was made smooth — UX engineering

This section gathers the concrete techniques used to make the app feel fast, responsive, and
trustworthy — the parts a panel *feels* even if they can't name them.

**Responsiveness & perceived performance**
- **Optimistic UI**: saving a favourite reflects instantly; the network sync happens in the
  background with rollback on failure.
- **Skeleton screens** on the results screen show the *shape* of content while loading, which feels
  faster than a spinner and reduces layout shift.
- **Branded loading/empty/error states** (mascot + clear copy + a retry affordance) replace blank
  screens, so the app always communicates what's happening.
- **Pagination with "Load more"** keeps initial loads small and lets the list grow on demand; the
  total count is always shown ("Showing N of M").

**Performance**
- The product grid uses **`FlatList` with virtualization tuning** (`removeClippedSubviews`,
  `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`) so long result lists stay smooth and
  memory-light.
- `ProductCard` is wrapped in **`React.memo`** with a custom comparison so cards don't re-render when
  unrelated state changes.
- **Stale-response guarding** in the search hook prevents wasted renders and incorrect results under
  fast typing.

**Motion & feedback (using the native driver so animations never stutter)**
- A subtle **pulse animation** on the floating camera button draws the eye to the app's signature
  action.
- A **spring "pop"** on the heart when saving, paired with a fading "Added to favourites" caption.
- **Haptic feedback** on save for a tactile confirmation.
- Per-screen **navigation transitions** (modal slide-up for search, slide-from-right for detail).

**Input & keyboard handling**
- `KeyboardAvoidingView` keeps inputs visible above the keyboard.
- **Interactive keyboard dismissal** (drag-to-dismiss) on result lists, and tap-outside dismissal.
- Auto-focus on the search overlay (timed to run *after* the open animation, so it never janks).
- Sensible input config (no autocorrect/autocapitalize on search, "search"/"done" return keys).

**Robustness & forgiveness**
- Every network call has a timeout and typed error handling, surfaced to the user as a friendly
  retry rather than a crash.
- The whole app remains usable while **signed out** (favourites degrade to local-only).
- Permission denials (camera/photos) produce a clear, actionable alert instead of a silent failure.

**Cross-platform correctness**
- Safe-area insets are respected on every screen, so nothing hides behind notches or home
  indicators.
- The navigation **adapts** to the platform (bottom bar on mobile, top bar on web) and the web nav
  adds hover/focus states and proper accessibility roles.

> **[PLACEHOLDER — Usability testing & metrics]**
> A strong report backs UX claims with evidence. This was not part of the codebase, so to add it:
> 1. Run a small usability test (5–8 participants) on the core task ("find a product by photo and
>    save it"); record task-success rate and time-on-task.
> 2. Optionally capture a System Usability Scale (SUS) score from participants.
> 3. If feasible, record cold-start time and search round-trip time on a real device and report the
>    averages. Present results in a short table with 2–3 takeaways.

---

## 10. Initial steps of designing the system (the process)

For the "methodology/approach" part of the report, the system was approached in this order:

1. **Define the core user journey** — "describe or photograph a product → see ranked results →
   open a product → save it / go to the store." Everything else supports this spine.
2. **Choose a cross-platform, native-capable stack** — React Native + Expo, to get camera access and
   one codebase across iOS/Android/Web (see §2).
3. **Establish a design system first** — palette, spacing scale, type scale, radii, and shadows as
   tokens, plus the mascot, so every screen is built from a consistent vocabulary (see §7).
4. **Design the navigation skeleton** — a tab-based primary structure with a stack for detail/search
   flows, made platform-adaptive.
5. **Build a clean backend boundary** — the layered `services → apiClient` design and the strict
   wire-shape/UI-shape type split, so the UI and the (evolving) API stay decoupled (see §5–6).
6. **Implement screens against reusable hooks/components** — keep screens declarative and thin;
   push all stateful logic into hooks and context.
7. **Layer in the experience polish** — optimistic updates, skeletons, animations, haptics, empty/
   error states, accessibility, and performance tuning (see §9).

---

## 11. Summary of technical contributions (for the report's conclusion)

- A **single React Native + TypeScript codebase** delivering native iOS/Android apps and a
  responsive web app, with platform-adaptive navigation.
- A **multimodal search client** (text, image, and combined) built on a clean, multipart, typed
  service layer that works identically on web and native.
- A **layered, decoupled architecture** (screens → hooks/context → services → single HTTP client)
  with a strict wire-shape/UI-shape type boundary, centralized timeouts, and typed error handling.
- **Robust client-side state**: optimistic favourites with rollback, graceful signed-out
  degradation, and concurrency-safe paginated search.
- A **token-based design system** grounded in established guidelines (8pt grid, Apple HIG type scale
  and touch targets) plus a custom, code-drawn mascot that gives the product personality.
- A deliberate layer of **UX engineering** — skeletons, native-driver animations, haptics, keyboard
  handling, and friendly failure states — that makes the app feel fast, polished, and trustworthy.

---

### Appendix A — How to keep this document honest

- The technical claims above are taken directly from the current source. If the code changes before
  submission, re-verify §5–§9 against the relevant files.
- Replace every **[PLACEHOLDER]** block with real artifacts (design files, audit results, test data)
  or delete it before the final hand-in — do not submit the placeholder text itself.
