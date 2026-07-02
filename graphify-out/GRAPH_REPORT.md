# Graph Report - frontend_repo  (2026-07-02)

## Corpus Check
- 64 files · ~111,987 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 444 nodes · 766 edges · 23 communities (19 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d89ee0b9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]

## God Nodes (most connected - your core abstractions)
1. `theme` - 25 edges
2. `expo` - 14 edges
3. `Product` - 14 edges
4. `VISUAL FOUNDATIONS` - 13 edges
5. `Snoop — Frontend Technical Report` - 12 edges
6. `useFavourites()` - 11 edges
7. `getJson()` - 10 edges
8. `request()` - 9 edges
9. `getAccessToken()` - 9 edges
10. `Snoop Design System` - 9 edges

## Surprising Connections (you probably didn't know these)
- `FavScreen()` --calls--> `useFavourites()`  [EXTRACTED]
  app/(tabs)/fav.tsx → contexts/FavouritesContext.tsx
- `ProfileScreen()` --calls--> `useFavourites()`  [EXTRACTED]
  app/(tabs)/profile.tsx → contexts/FavouritesContext.tsx
- `ProductDetailScreen()` --calls--> `useFavourites()`  [EXTRACTED]
  app/product/[id].tsx → contexts/FavouritesContext.tsx
- `ResultsScreen()` --calls--> `usePaginatedSearch()`  [EXTRACTED]
  app/results.tsx → hooks/usePaginatedSearch.ts
- `Props` --references--> `Product`  [EXTRACTED]
  components/ProductCard.tsx → constants/data.ts

## Import Cycles
- 1-file cycle: `metro.config.js -> metro.config.js`

## Communities (23 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (55): AuthContext, AuthContextType, FavouritesContext, ApiError, deleteJson(), getJson(), NetworkError, postJson() (+47 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (20): AttachmentPreview(), AttachmentPreviewProps, styles, FilterIcon(), Props, CATEGORIES, FilterSheet(), FilterState (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (49): ResultsScreen(), styles, ViewMode, FullscreenGallery(), styles, { width: SW, height: SH }, LoadMoreButton(), Props (+41 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (33): Aesthetic direction, Backgrounds and imagery, Casing, Caveats / open questions, Character, Color, CONTENT FUNDAMENTALS, Corner radii (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (31): dependencies, expo, expo-asset, expo-haptics, expo-image-picker, expo-linear-gradient, expo-linking, expo-router (+23 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (26): backgroundColor, adaptiveIcon, package, versionCode, typedRoutes, expo, android, experiments (+18 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (27): CategoryCard(), Props, styles, FEATHER, FeatherName, Icon(), IconName, IconProps (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (10): BottomNav(), CAMERA_GRADIENT, makeNotchPath(), styles, TabKey, TABS, ITEMS, NavItem (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (15): Props, Props, Product, FavouritesContextType, fetchPage(), Options, SearchParams, appendImagePart() (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (5): DC, DCCtx, dcFlatten(), DCSection(), DesignCanvas()

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (6): Adding a new endpoint (the expandable path), Backend service layer, Files, Removing an embedding search mode (txt_emb / img_emb), Turning the stubs on, What connects to what

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, strict, extends, include, @/*

### Community 19 - "Community 19"
Cohesion: 0.11
Nodes (18): 10. Initial steps of designing the system (the process), 11. Summary of technical contributions (for the report's conclusion), 1. Overview, 2. Why React Native, 3. Tooling — what was used and why, 4. Application structure — how everything connects, 5. The backend communication layer (`services/`), 6. State management — pragmatic, not over-engineered (+10 more)

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (5): styles, AuthProvider(), FavouritesProvider(), Listener, onSessionExpired()

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (4): ICON, Notif, NotifType, styles

### Community 22 - "Community 22"
Cohesion: 0.40
Nodes (4): How to import (≈3 minutes, free), Keeping it in sync, Snoop — Design Tokens (Figma import), What's inside

## Knowledge Gaps
- **183 isolated node(s):** `name`, `slug`, `version`, `policy`, `orientation` (+178 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `theme` connect `Community 2` to `Community 0`, `Community 1`, `Community 6`, `Community 9`, `Community 20`, `Community 21`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `Product` connect `Community 10` to `Community 0`, `Community 1`, `Community 2`, `Community 6`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `useFavourites()` connect `Community 2` to `Community 0`, `Community 6`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _183 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08354646206308611 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09686609686609686 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05403348554033485 - nodes in this community are weakly interconnected._