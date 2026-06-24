# Snoop — Design Tokens (Figma import)

`snoop.tokens.json` is the Snoop design system exported in **Tokens Studio** format,
generated directly from the app's source of truth (`constants/theme.ts`). Importing it
recreates the full token set in Figma as variables + styles — no paid plan or MCP needed.

## What's inside

| Group | Tokens | Becomes in Figma |
|---|---|---|
| `color.*` | 12 raw colors (primitives) | Color variables |
| `bg`, `surface`, `accent`, `text`, `price`, `border`, `error`, `nav`, `white` | 12 semantic colors (aliased to primitives) | Color variables |
| `spacing.s1…s12` | 9 spacing steps (4–48, 8pt grid) | Number variables |
| `radius.*` | chip / compact / card / nav / pill | Number variables |
| `type.*` | 10-step type scale (Apple HIG) | Text styles |
| `shadow.*` | rest / card / floating / nav | Effect (shadow) styles |

## How to import (≈3 minutes, free)

1. In Figma, open **Menu → Plugins → Manage plugins**, search **"Tokens Studio for Figma"**, install it.
2. Open your file (you can reuse the existing **Snoop Design System** file or any file) and run the plugin.
3. In the plugin: **menu (⋯) → Import → Choose "single file"** and select `design/snoop.tokens.json`
   (or open the JSON, copy all, and paste into the plugin's import box).
4. The token set **`global`** appears. Click the **eye/enable** toggle so it's active.
5. Click **"Create / update variables"** (and, when prompted, **"Create styles"**) — this writes:
   - all colors as **Figma variables** (primitives + semantic, with the aliases preserved),
   - spacing + radius as **number variables**,
   - the type scale as **text styles**,
   - the shadows as **effect styles**.
6. Done. They now appear in Figma's **Variables** panel and the **Text/Effect style** pickers,
   ready to use on any frame or component.

> Note on fonts: the app uses the native iOS/Android system font; Figma can't embed that,
> so the type tokens use **Inter** as the closest free stand-in. Swap the `fontFamily.base`
> value if you prefer a different face.

## Keeping it in sync

`constants/theme.ts` remains the single source of truth. If a token changes there, update the
matching value in `snoop.tokens.json` and re-run step 5 to update Figma in place.
