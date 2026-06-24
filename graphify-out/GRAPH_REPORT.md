# Graph Report - frontend_repo  (2026-06-24)

## Corpus Check
- 51 files · ~98,679 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 358 nodes · 586 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `479d712d`
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

## God Nodes (most connected - your core abstractions)
1. `theme` - 23 edges
2. `Product` - 14 edges
3. `expo` - 13 edges
4. `VISUAL FOUNDATIONS` - 13 edges
5. `useFavourites()` - 11 edges
6. `Snoop Design System` - 9 edges
7. `getJson()` - 8 edges
8. `ICONOGRAPHY` - 8 edges
9. `SnoopCharacter()` - 7 edges
10. `postJson()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `FavScreen()` --calls--> `useFavourites()`  [EXTRACTED]
  app/(tabs)/fav.tsx → contexts/FavouritesContext.tsx
- `ProfileScreen()` --calls--> `useFavourites()`  [EXTRACTED]
  app/(tabs)/profile.tsx → contexts/FavouritesContext.tsx
- `ProductDetailScreen()` --calls--> `useFavourites()`  [EXTRACTED]
  app/product/[id].tsx → contexts/FavouritesContext.tsx
- `ResultsScreen()` --calls--> `usePaginatedSearch()`  [EXTRACTED]
  app/results.tsx → hooks/usePaginatedSearch.ts
- `SearchScreen()` --calls--> `useImageAttachment()`  [EXTRACTED]
  app/search.tsx → hooks/useImageAttachment.ts

## Import Cycles
- 1-file cycle: `metro.config.js -> metro.config.js`

## Communities (19 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (38): FavouritesContext, ApiError, deleteJson(), getJson(), NetworkError, postJson(), postMultipart(), request() (+30 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (30): ICON, INITIAL, Notif, NotifType, styles, RECENT, SearchScreen(), styles (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (33): ResultsScreen(), styles, ViewMode, ProductCard, ProductCardInner(), Props, styles, ProductListCard() (+25 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (33): Aesthetic direction, Backgrounds and imagery, Casing, Caveats / open questions, Character, Color, CONTENT FUNDAMENTALS, Corner radii (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (30): dependencies, expo, expo-asset, expo-haptics, expo-image-picker, expo-linear-gradient, expo-linking, expo-router (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (22): backgroundColor, adaptiveIcon, package, typedRoutes, expo, android, experiments, ios (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (17): CategoryCard(), Props, styles, FEATHER, FeatherName, Icon(), IconName, IconProps (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (5): CATEGORY_LIST, NOTIFICATIONS, RESULTS_GRID_DATA, RESULTS_LIST_DATA, TRENDING_PRODUCTS

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (9): BottomNav(), CAMERA_GRADIENT, styles, TabKey, TABS, ITEMS, NavItem, styles (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.31
Nodes (10): fetchPage(), SearchParams, appendImagePart(), EMPTY_PAGE, fileNameFromUri(), mimeFromUri(), postSearch(), searchByImage() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (5): DC, DCCtx, dcFlatten(), DCSection(), DesignCanvas()

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (6): Adding a new endpoint (the expandable path), Backend service layer, Files, Removing an embedding search mode (txt_emb / img_emb), Turning the stubs on, What connects to what

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, strict, extends, include, @/*

## Knowledge Gaps
- **153 isolated node(s):** `name`, `slug`, `version`, `orientation`, `scheme` (+148 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `theme` connect `Community 1` to `Community 0`, `Community 9`, `Community 2`, `Community 6`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `Product` connect `Community 2` to `Community 0`, `Community 1`, `Community 10`, `Community 6`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _153 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10204081632653061 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07053140096618357 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07575757575757576 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._