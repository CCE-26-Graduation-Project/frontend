# Snoop Design System

> A minimalist iOS mobile app that searches across local and international stores to find any product — fashion, electronics, furniture, or appliances — and returns results sorted by lowest price. Snoop does not sell anything. It compares, informs, and redirects users to official store websites.

---

## Product context

**App name:** Snoop
**Platform:** iOS (React Native, Reanimated 3+)
**Category:** Shopping search aggregator / price comparison
**One-line pitch:** A smart shopping search engine with a soul — trustworthy, friendly, and effortless to use. "It'll sniff out the lowest price for you."
**Brand persona:** A loyal, slightly nosy companion who's very good at finding deals. Calm, warm, professional, never pushy.

Snoop is a search layer over the entire web of stores. The user types (or speaks or photographs) anything they want, Snoop queries dozens of marketplaces and shops, sorts the results by lowest price, and redirects to the official store to complete the purchase. The product itself never handles checkout.

The brand is anchored by **Snoop the dog** — a friendly cartoon mascot (Google-illustration style, floppy peach ears, white body, navy outlines). Snoop appears contextually on empty states, onboarding, voice and camera search, loading, errors, and "deal found" celebrations. The mascot adapts to whichever palette is active.

## Sources provided
- `uploads/IBM_Plex_Mono.zip` — *(not delivered; folder was empty when I checked. I substituted IBM Plex Mono from Google Fonts and flagged this below.)*
- A long product spec covering 4 candidate palettes, SF Pro + IBM Plex Mono typography, 4pt spacing grid, navigation, 10 named screens, mascot guidelines, motion + a11y rules.
- A 4-swatch palette image (`uploads/pasted-1779280097636-0.png`) for the **Snoop** brand identity — the system was rebranded to use this single palette as the canonical theme.

The four spec'd palettes (*Clear Sky*, *Warm Linen*, *Mint Focus*, *Violet Calm*) are still defined in `colors_and_type.css` as alternate themes if you want to A/B — the iOS UI kit page lets you switch between all five.

---

## Index — what's in this design system

```
README.md                     ← you are here
SKILL.md                      ← Agent Skills entry point
colors_and_type.css           ← all 4 palettes + SF Pro / IBM Plex Mono scale as CSS variables
fonts/                        ← IBM Plex Mono webfont files
assets/
  character/                  ← Snoop mascot — 6 expressions, palette-aware
  icons/                      ← Lucide icon set (CDN-linked; documented in ICONOGRAPHY) + compare-prices.svg
  logo/                       ← Snoop wordmark + monogram
preview/                      ← Design System tab cards (palette swatches, type specimens, components, etc.)
ui_kits/
  ios_app/                    ← iOS UI kit: index.html (interactive prototype) + JSX components
screens/
  index.html                  ← All 10 spec screens rendered side-by-side across all 4 palettes
```

---

## CONTENT FUNDAMENTALS

### Voice and tone
Snoop writes like **a loyal friend who's very good at sniffing out deals**. Not a discount flyer, not a chatbot, not a banker.

- **Second-person, present-tense.** "What are you looking for today?" not "What is the user searching for?"
- **Conversational contractions** ("I'll", "you're", "we've") — robotic prose is forbidden.
- **Short sentences, plain English.** No marketing adjectives like *amazing, incredible, ultimate*. No hype.
- **Confident but humble.** The app tells you what it found and lets you decide. It never says "the best deal" — only "lowest price found".
- **Helpful, never bossy.** Suggestions are framed as offers ("Try…", "Want to…?"), not commands.
- **Warm but professional.** Friendly enough to greet you by time of day; serious enough that you trust it with money decisions.

### Casing
- **Sentence case** for everything: buttons, titles, nav, headers. *"Go to store"*, not *"Go To Store"*.
- **Title Case is reserved** for product titles and brand names that already use it ("Search the Apple Store").

### Voice samples
| Surface | Copy |
|---|---|
| Home greeting (morning) | "Good morning. What are you looking for today?" |
| Empty search state | "I'll search thousands of stores for you. Just type anything above." |
| Voice search | "Listening…" |
| Camera search | "Point at any product!" |
| Typo correction | "Showing results for **iPhone 15**. Search instead for *iphon 15*." |
| Loading more results | "Finding more deals…" |
| Go to Store toast | "Great choice! Redirecting you to Apple Store." |
| Add to comparison toast | "Added to your comparison." |
| Save to favourites toast | "Saved to favourites." |
| Empty saved | "Nothing saved yet. Tap the bookmark on any product to save it here." |
| Empty notifications | "You're all caught up." |
| No results error | "Nothing found. Try a different word or check your spelling." |
| Comparison empty | "Add products to compare them side by side." |

### Emoji and special characters
- **No emoji** in product UI. The illustrated character carries the emotional load instead.
- **Currency symbols** always precede the number, no space: `$249.00`.
- **En-dash for ranges** (`$120 – $899`), em-dash for asides ("— and that's the lowest we found").

### Numbers and prices
- Always in **IBM Plex Mono** so columns of prices align visually.
- Two decimal places only when the cents matter (`$249.00` is fine, but lowest-price hero displays drop trailing `.00` if it's clean).
- "Lowest price found" is the canonical label. Never "best price", "cheapest", or "deal of the day".

---

## VISUAL FOUNDATIONS

### Aesthetic direction
**Calm, soft, and warm.** Snoop is not a discount supermarket app — there are no neon prices, no slashed-out red banners, no "ONLY 2 LEFT!" pressure tactics. The visual world is a friendly cream-and-peach surface with a sky-blue accent and a smiling dog mascot. The warmth signals helpfulness; the navy ink and clean type keep it credible.

### Color
- **Four palettes** ship side-by-side so the client can pick — *Clear Sky*, *Warm Linen*, *Mint Focus*, *Violet Calm*. All four share identical structure and semantic slots; only hue varies.
- **Background base is never pure white.** Always a tinted near-white (`#F5F8FF`, `#FAFAF7`, `#F0FDF9`, `#FAF5FF`). This is the single most important rule — it's what makes the app feel soft.
- **Text is never pure black.** Near-black tuned to each palette's temperature.
- **One primary accent per palette** carries every CTA, link, and active state. Restraint is the system.
- **Savings green** is a separate, sacred slot: it's the only color allowed on the lowest price found anywhere on screen.
- See `colors_and_type.css` for tokens.

### Typography
- **SF Pro** (system font) for everything readable: headings, body, nav, labels. Loads natively on iOS.
- **IBM Plex Mono** for *every* price value, app-wide. This is functional, not stylistic — monospace digits make stacked prices comparable at a glance.
- Sentence case everywhere. Tight tracking on display sizes (`-0.02em`).
- Never mix the two faces in a single price line.

### Spacing
- **Base unit: 4pt.** Every margin, gap, padding, and corner radius is a multiple.
- Screen horizontal margin: 16pt (compact) / 20pt (regular).
- Card padding: 16pt. Section gap: 24pt. List gap: 12pt.
- Minimum tap target: 44×44pt.

### Corner radii
- **16pt** for primary cards (product cards, hero containers, search bar).
- **12pt** for compact cards (list row thumbnails, small avatars).
- **8pt** for chips, tags, badges.
- **24pt** for the floating bottom nav top corners.
- **Pill / capsule (height/2)** for buttons and the vertical comparison handle.

### Surfaces and elevation
- Cards sit on `--bg-2` (palette secondary), the page sits on `--bg-1` (palette primary). The 1-step lift is most of the depth.
- **Shadows are tinted with the palette accent**, very soft, very wide, low opacity:
  - Resting card: `0 1px 2px rgba(accent, 6%)`
  - Floating element (nav bar, sticky CTA, toast): `0 8px 24px rgba(accent, 10–15%)`
- **No hard borders on cards.** Separation comes from background-on-background, not hairlines. Hairlines appear only inside cards to separate rows (`--divider`).

### Backgrounds and imagery
- No full-bleed photography in chrome. No gradients in chrome. No textures.
- Product imagery is the only photography that appears. It sits inside rounded containers (12pt or 16pt) on `--bg-2`.
- **Backgrounds are flat color.** That's the whole vocabulary.

### Transparency and blur
- The floating bottom nav uses **frosted glass** (`backdrop-filter: blur(20px)` over an 80% opaque tint of `--bg-1`). This is the *only* place blur is used. Modals are scrim + solid.
- Bottom sheets dim the page behind to 40% opacity scrim, no blur on the scrim.

### Motion
- **React Native Reanimated 3+, spring physics only.** No linear easing anywhere.
- Spring config: damping 14–20, stiffness 120–180. Slightly bouncy, never cartoonish.
- Entrances 300–400ms, exits 200–250ms. Users never wait for an animation.
- Search cards stagger in with 30ms offsets. Product card → detail uses a shared-element transition.
- Idle-pulse on the camera button (scale 1.0 → 1.05 → 1.0 every 4s) until the user taps it once, then stops permanently.
- Respect iOS Reduce Motion.

### Press / hover states
- **No hover** — this is iOS. The press state is the only feedback.
- Buttons: scale 0.97 on press, spring back to 1.0 on release.
- List rows: brief flash of `--bg-2` darkened ~4%.
- Icons: opacity drops to 0.6 while held.
- Bookmark toggle: smooth fill from bottom to top, then a 4–6 dot particle burst.

### Layout rules (fixed elements)
- **Floating bottom nav.** Inset 16pt from each side, lifted off the edge with shadow. 24pt top radius. Frosted glass. The camera tab is a 56pt circle that floats 12–16pt above the bar in primary accent.
- **Sticky bottom CTA bar** on the product detail screen sits above the floating nav and houses Go to Store / Add to Comparison / Favourite.
- **Vertical "Compare" pill** anchors to the bottom right edge, between the CTA bar and the nav bar. Always visible while items are in the comparison.

### Character
- The recurring mascot is **Snoop**, a friendly cartoon dog. White body, floppy peach ears, navy outline, small black nose, optional magnifying glass.
- 6 mandatory expressions: Neutral, Happy, Thinking, Listening, Surprised, Waving.
- Drawn in flat Google-illustration style: clean outlines, limited palette, no gradients, no 3D, no photorealism.
- Snoop adopts the active palette's `--character` body color and `--character-ink` outline.
- Drawn in flat Google-illustration style: clean outlines, limited palette, no gradients, no 3D, no photorealism.
- Adopts the active palette's "character highlight" color as its body fill, with a darker palette-derived outline.
- **Never blocks interactive content.** Sits beside speech bubbles, never on top of buttons.

---

## ICONOGRAPHY

### Stance
Snoop uses **Lucide** (https://lucide.dev) — a clean, consistent open-source line icon set with 1.5pt strokes and rounded line caps. It matches the calm, friendly tone better than the heavier alternatives, and it's iOS-feeling without being a literal copy of SF Symbols.

Lucide is loaded by CDN; see `ui_kits/ios_app/index.html` for the inclusion. Category icons (Electronics, Fashion, Furniture, etc.) are drawn from Lucide directly to keep stroke weight identical to the rest of the UI.

### Substitution flagged
Apple's **SF Symbols** would be the orthodox choice for an iOS app but their license forbids redistribution outside Apple platforms, so they cannot ship in a web-deliverable design system. Lucide is the closest visual match. *If the engineering team chooses SF Symbols in production, the icon shapes will look 95% identical and the design system needs no other change.*

### Sizes
- **24pt** — bottom nav, top bar icons.
- **20pt** — inline action icons (mic, camera, magnifier inside search bar).
- **16pt** — label icons (clock on recents, flame on trending, globe / pin on store rows).

### What about emoji?
**No emoji** anywhere in product UI. The character is the emotional voice of the brand; emoji would compete with it.

### What about Unicode glyphs?
- En-dash `–` for ranges.
- Em-dash `—` for asides.
- Bullet `•` permitted in metadata strings ("Apple • 47 stores").
- Checkmark `✓` permitted in completed states ("Added ✓") but Lucide's `<check>` is preferred when a real icon is available.

### Logo
- Wordmark **"Snoop"** set in SF Pro Display Semibold with a small paw-print mark next to the word, drawn in the palette accent. See `assets/logo/`.
- Monogram is an uppercase `S` on a peach square with the same paw-print mark.

### Substitutions to flag to the client
1. **IBM Plex Mono webfont** — zip was empty; loaded from Google Fonts CDN. Drop-in replacement when the real files arrive.
2. **SF Pro** — Apple's font; on the web side we fall back to `-apple-system, BlinkMacSystemFont, "Helvetica Neue"`. On iOS device, the real SF Pro renders natively.
3. **Lucide icons** in place of SF Symbols, see above.
4. **Snoop mascot** — designed from spec; no reference image was provided. Happy to iterate on body shape (dog vs. other animal), ear color, hat / accessory choices, expression range.

---

## Caveats / open questions

- IBM Plex Mono zip was empty; substituted Google Fonts version. Please reattach the real font files.
- No codebase, Figma, or screenshots were provided — every visual decision was made from the spec text. Please point me at any existing materials.
- The mascot (Snoop) is one interpretation of "friendly cartoon dog". Body shape, ear color, accessories (could add a detective hat, scarf, etc.) all open for revision.
- Real product photography placeholders are abstract color-block shapes. In production, real images replace them.

## how to run:
how to run this file and show a simulation of the screens in ios version for example ?

● Since you're on Windows, the iOS Simulator requires a Mac — but you have three good options. Here's each one:

  ---
  Step 1 — Install dependencies (do this first, always)

  ! cd D:\Mazen\Uni\GraduationProject\frontend_repo && npm install

  ---
  Option A — Physical iPhone (best iOS experience, works on Windows)

  1. Download Expo Go from the App Store on your iPhone
  2. Run in your terminal:
  ! npx expo start
  3. A QR code appears in the terminal
  4. Open your iPhone Camera app → point at the QR code → tap the Expo Go link
  5. The app loads live on your phone — hot-reloads when you save files

  ▎ Your iPhone and PC must be on the same Wi-Fi network.

  ---
  Option B — Android Emulator on Windows (closest to a simulator)

  1. Download and install Android Studio: https://developer.android.com/studio
  2. Inside Android Studio → Tools → Device Manager → Create Virtual Device
  3. Pick Pixel 8 → API 35 → Finish
  4. Click the ▶ Play button to start the emulator
  5. Then run:
  ! npx expo start --android
  5. Expo will detect the running emulator and install the app automatically.

  ---
  Option C — Web browser (instant, no setup, but not pixel-perfect iOS)

  ! npx expo start --web

  Opens in your default browser. Gives a good visual preview of the UI, though browser rendering differs slightly from
  native.

  ---
  Option D — Use a cloud Mac for real iOS Simulator

  Services like MacStadium, Codemagic, or GitHub Actions with a macOS runner let you run the iOS Simulator remotely —
  but this is overkill unless you need to test iOS-specific behavior.

  ---
  First run checklist

  Make sure you have Node.js 18+ installed. Check with:
  ! node --version

  If it's missing, download from https://nodejs.org (LTS version).

  ---
  Recommended path for you: Option A (physical iPhone + Expo Go) gives you the real iOS rendering with SF Pro fonts,
  safe area insets, and native animations — exactly what the Snoop app is designed for. Option B (Android emulator) is
  the next best thing if you don't have an iPhone handy.
