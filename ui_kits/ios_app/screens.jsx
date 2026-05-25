// Snoop — 10 screen compositions.
// Each screen renders the *inner* contents of an iOS device frame
// (i.e. without status bar / home indicator — those come from IOSDevice).
// Wraps everything in PaletteWrapper so [data-palette] takes effect locally.

const SCREEN_HEIGHT = 874 - 47; // frame height − status bar approx
const CATEGORY_LIST = [
  { icon: "shirt", label: "Fashion" },
  { icon: "shoe", label: "Shoes" },
  { icon: "bag", label: "Bags" },
  { icon: "fridge", label: "Appliances" },
];

const TRENDING_PRODUCTS = [
  { name: "Dyson V15 Detect Vacuum", vendor: "Dyson", tone: "warm" },
  { name: "LEGO Botanical Roses", vendor: "LEGO", tone: "character" },
  { name: "iPad mini 7th gen", vendor: "Apple Store", tone: "accent" },
  { name: "Nintendo Switch OLED", vendor: "Nintendo", tone: "dark" },
  { name: "Hario V60 Pour Over", vendor: "Specialty Coffee", tone: "warm" },
];

const RESULTS_GRID_DATA = [
  { name: "Sony WH-1000XM5 wireless headphones", store: "Best Buy", storeLogo: "BB", price: "$249.00", oldPrice: "$329.00", discountPct: 24, tone: "accent" },
  { name: "Apple iPhone 15 Pro 256GB Titanium", store: "Apple Store", storeLogo: "A", price: "$999.00", tone: "dark" },
  { name: "Nike Air Max 90 Sneakers", store: "Nike", storeLogo: "N", price: "$89.97", oldPrice: "$140.00", discountPct: 36, tone: "warm" },
  { name: "Dyson V15 Detect Vacuum", store: "Dyson", storeLogo: "D", price: "$649.00", tone: "character" },
  { name: "LEGO Botanical Roses 10328", store: "LEGO", storeLogo: "L", price: "$54.99", tone: "warm" },
  { name: "Hario V60 Pour Over Set", store: "Coffee Co.", storeLogo: "C", price: "$32.50", oldPrice: "$42.50", discountPct: 24, tone: "character" },
];

const RESULTS_LIST_DATA = [
  { name: "LG OLED C3 65\" 4K Smart TV", specs: "OLED · 120Hz · webOS 23", priceRange: "$1,499 – $2,199", topStores: ["Best Buy", "LG.com", "Amazon"], stores: "23 stores", tone: "dark" },
  { name: "Sony WH-1000XM5 Wireless Headphones", specs: "Active noise cancel · 30h battery", priceRange: "$249 – $429", topStores: ["Best Buy", "Sony", "B&H Photo"], stores: "18 stores", tone: "accent" },
  { name: "Apple MacBook Air 13\" M3", specs: "8GB / 256GB · Starlight", priceRange: "$999 – $1,199", topStores: ["Apple Store", "Best Buy", "Amazon"], stores: "11 stores", tone: "character" },
  { name: "Dyson V15 Detect Cordless Vacuum", specs: "Laser detection · 60min runtime", priceRange: "$549 – $799", topStores: ["Dyson", "Best Buy", "Target"], stores: "12 stores", tone: "warm" },
];

const NOTIFICATIONS = [
  { unread: true, expr: "happy", title: "Price drop on iPhone 15 Pro", body: "Now $899 at Apple Store — down $100 from yesterday.", time: "Just now" },
  { unread: false, expr: "thinking", title: "Back in stock: Sony WH-1000XM5", body: "Available again at Best Buy from $329.", time: "2h ago" },
  { unread: false, expr: "waving", title: "Welcome to Snoop", body: "I'll sniff out the best prices on everything you save.", time: "Yesterday" },
];

// ─────────────────────────────────────────────────────────────
// 1. HOME
// ─────────────────────────────────────────────────────────────
function HomeScreen({ palette, username = "Alex" }) {
  return (
    <PaletteWrapper palette={palette}>
      <div style={{ paddingTop: 8, paddingBottom: 120, position: "relative", minHeight: SCREEN_HEIGHT }}>
        {/* Top bar */}
        <TopBar
          left={<LogoWordmark size={22} />}
          right={<IconButton name="bell" bg="var(--bg-2)" />}
        />
        {/* Greeting + character */}
        <div style={{
          padding: "8px 20px 12px", display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ flex: 1 }}>
            <div className="t-title1" style={{ fontSize: 26 }}>Good morning, {username}.</div>
            <div className="t-body" style={{ color: "var(--text-2)", marginTop: 2 }}>
              What are you looking for today?
            </div>
          </div>
          <Snoop expression="waving" size={84} />
        </div>
        {/* Search bar */}
        <div style={{ padding: "8px 20px 20px" }}>
          <SearchBar />
        </div>

        {/* Categories — 4 fixed, single row, no scroll */}
        <div style={{ padding: "4px 20px 8px" }}>
          <div className="t-title3" style={{ marginBottom: 12 }}>Categories</div>
          <div style={{ display: "flex", gap: 10 }}>
            {CATEGORY_LIST.map(c => (
              <div key={c.label} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8,
              }}>
                <div style={{
                  width: "100%", aspectRatio: "1", borderRadius: 16,
                  background: "var(--bg-2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-1)",
                }}>
                  <Icon name={c.icon} size={28} strokeWidth={1.6} />
                </div>
                <div style={{ font: "500 12px/1.1 var(--font-sans)", color: "var(--text-1)", textAlign: "center" }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending — horizontally scrollable product mini-cards */}
        <div style={{ padding: "20px 0 0" }}>
          <div className="t-title3" style={{ padding: "0 20px", marginBottom: 12 }}>Trending</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 20px" }}>
            {TRENDING_PRODUCTS.map(p => (
              <TrendingMiniCard key={p.name} {...p} />
            ))}
          </div>
        </div>

        <BottomNav active="home" showPulse={true} />
      </div>
    </PaletteWrapper>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. SEARCH ACTIVE / FULLSCREEN
// ─────────────────────────────────────────────────────────────
function SearchActiveScreen({ palette }) {
  const sugg = [
    { icon: "clock", text: "iPhone 15 Pro", recent: true },
    { icon: "clock", text: "iPhone 15", recent: true },
    { icon: "flame", text: "iPhone 15 Pro Max", trending: true },
    { icon: "search", text: "iPhone 15 case", muted: true },
    { icon: "folder", text: "iPhone — Electronics", folder: true },
  ];
  return (
    <PaletteWrapper palette={palette}>
      <div style={{ minHeight: SCREEN_HEIGHT, paddingBottom: 320, position: "relative" }}>
        <div style={{ padding: "8px 16px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <IconButton name="back" size={22} />
          <div style={{ flex: 1 }}>
            <SearchBar value="iPhon 15" focused={true} showIcons={false} />
          </div>
          <button style={{
            height: 36, padding: "0 14px", borderRadius: 999,
            background: "var(--text-1)", color: "#FFF9D2", border: "none",
            font: "600 14px/1 var(--font-sans)", letterSpacing: "-0.005em",
            cursor: "pointer",
          }}>Cancel</button>
        </div>

        {/* Recent — chip row, now lives on the search-active screen */}
        <div style={{ padding: "8px 20px 4px" }}>
          <div className="t-title3" style={{ marginBottom: 10, fontSize: 17 }}>Recent</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            <RecentChip label="iPhone 15 Pro" />
            <RecentChip label="Sony headphones" />
            <RecentChip label="Coffee table" />
            <RecentChip label="Nike Air Max" />
          </div>
        </div>

        {/* Live suggestions */}
        <div style={{ padding: "12px 4px 0" }}>
          {sugg.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
              borderBottom: "0.5px solid var(--divider)",
            }}>
              <Icon name={s.icon} size={18} color={s.trending ? "var(--savings)" : "var(--text-2)"} />
              <span className="t-body" style={{ flex: 1, color: s.muted ? "var(--text-2)" : "var(--text-1)" }}>
                {s.text}
              </span>
              {s.recent && <Icon name="close" size={16} color="var(--text-2)" />}
              {s.folder && <span className="t-caption" style={{
                padding: "3px 8px", borderRadius: 8,
                background: "var(--text-1)", color: "#FFF9D2", fontWeight: 600,
              }}>Category</span>}
            </div>
          ))}
        </div>
      </div>
    </PaletteWrapper>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. RESULTS — GRID
// ─────────────────────────────────────────────────────────────
function ResultsGridScreen({ palette }) {
  return (
    <PaletteWrapper palette={palette}>
      <div style={{ minHeight: SCREEN_HEIGHT, paddingBottom: 130, position: "relative" }}>
        <ResultsTopBar query="iPhone 15 Pro" />
        <ResultsToolbar view="grid" />
        <TypoBanner />
        <div className="t-subhead" style={{ padding: "10px 20px 6px" }}>
          2,340 results across 47 stores
        </div>
        <div style={{ padding: "8px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {RESULTS_GRID_DATA.map((p, i) => (
            <GridProductCard key={i} {...p} />
          ))}
        </div>
        <BottomNav active="home" />
      </div>
    </PaletteWrapper>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. RESULTS — LIST
// ─────────────────────────────────────────────────────────────
function ResultsListScreen({ palette }) {
  return (
    <PaletteWrapper palette={palette}>
      <div style={{ minHeight: SCREEN_HEIGHT, paddingBottom: 130, position: "relative" }}>
        <ResultsTopBar query="65 inch tv" />
        <ResultsToolbar view="list" />
        <div className="t-subhead" style={{ padding: "10px 20px 6px" }}>
          412 results across 31 stores
        </div>
        <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {RESULTS_LIST_DATA.map((p, i) => (
            <ListProductCard key={i} {...p} />
          ))}
        </div>
        <BottomNav active="home" />
      </div>
    </PaletteWrapper>
  );
}

function ResultsTopBar({ query }) {
  return (
    <div style={{ padding: "8px 16px 4px", display: "flex", alignItems: "center", gap: 8 }}>
      <IconButton name="back" size={22} />
      <div style={{ flex: 1 }}>
        <div style={{
          height: 44, borderRadius: 22, background: "var(--bg-2)",
          display: "flex", alignItems: "center", padding: "0 14px", gap: 10,
        }}>
          <Icon name="search" size={18} color="var(--text-2)" />
          <span style={{ flex: 1, font: "500 16px/1 var(--font-sans)", color: "var(--text-1)" }}>{query}</span>
        </div>
      </div>
      <IconButton name="filter" size={20} bg="var(--bg-2)" />
      <IconButton name="sort" size={20} bg="var(--bg-2)" />
    </div>
  );
}

function ResultsToolbar({ view }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "4px 20px 0" }}>
      <div style={{
        display: "inline-flex", padding: 3, background: "var(--bg-2)",
        borderRadius: 10, gap: 0,
      }}>
        <span style={{
          padding: "5px 9px", borderRadius: 8,
          background: view === "grid" ? "#fff" : "transparent",
          boxShadow: view === "grid" ? "var(--shadow-rest)" : "none",
        }}>
          <Icon name="grid" size={16} color={view === "grid" ? "var(--text-1)" : "var(--text-2)"} />
        </span>
        <span style={{
          padding: "5px 9px", borderRadius: 8,
          background: view === "list" ? "#fff" : "transparent",
          boxShadow: view === "list" ? "var(--shadow-rest)" : "none",
        }}>
          <Icon name="list" size={16} color={view === "list" ? "var(--text-1)" : "var(--text-2)"} />
        </span>
      </div>
    </div>
  );
}

function TypoBanner() {
  return (
    <div style={{ margin: "10px 16px 0", padding: "10px 14px", borderRadius: 12, background: "var(--bg-2)" }}>
      <div className="t-subhead" style={{ color: "var(--text-1)" }}>
        Showing results for <strong>iPhone 15 Pro</strong>
      </div>
      <div className="t-subhead" style={{ marginTop: 2 }}>
        Search instead for <span style={{ color: "var(--text-1)", fontWeight: 600, textDecoration: "underline" }}>iPhon 15</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. PRODUCT DETAIL — per vendor (one product, one store)
// ─────────────────────────────────────────────────────────────
function ProductDetailScreen({ palette, withSheet = false }) {
  const [saved, setSaved] = (React.useState ? React.useState(false) : [false, () => {}]);
  return (
    <PaletteWrapper palette={palette}>
      <div style={{ minHeight: SCREEN_HEIGHT, position: "relative", paddingBottom: 120 }}>
        {/* Top bar — bookmark moves here */}
        <div style={{
          display: "flex", alignItems: "center", padding: "8px 16px",
          gap: 8, position: "relative", zIndex: 5,
        }}>
          <IconButton name="back" size={22} bg="rgba(255,249,210,0.85)" />
          <div style={{ flex: 1 }} />
          <span className="t-caption" style={{ color: "var(--text-2)" }}>12 of 2,340</span>
          <button onClick={() => setSaved(!saved)} aria-label="Save" style={{
            width: 40, height: 40, borderRadius: 999, border: "none",
            background: saved ? "var(--text-1)" : "rgba(255,249,210,0.85)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 1px 3px rgba(30,43,77,0.10)",
          }}>
            <Icon name="bookmark" size={18}
              color={saved ? "#FFF9D2" : "var(--text-1)"}
              strokeWidth={saved ? 0 : 2}
              style={saved ? { fill: "#FFF9D2" } : {}} />
          </button>
        </div>
        {/* Image */}
        <div style={{ padding: "8px 16px 12px" }}>
          <div style={{
            height: 300, borderRadius: 20, position: "relative",
            background: "linear-gradient(135deg, var(--bg-2), color-mix(in oklab, var(--accent) 14%, var(--bg-2)))",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: "16% 22%", borderRadius: 16,
              background: "color-mix(in oklab, var(--accent) 38%, white)",
              boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
            }}/>
            <div style={{
              position: "absolute", bottom: 14, left: 0, right: 0,
              display: "flex", justifyContent: "center", gap: 6,
            }}>
              {[0, 1, 2, 3].map(i => (
                <span key={i} style={{
                  width: i === 0 ? 18 : 6, height: 6, borderRadius: 999,
                  background: i === 0 ? "var(--text-1)" : "rgba(30,43,77,0.20)",
                }}/>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "8px 20px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 10px", borderRadius: 8,
              background: "var(--text-1)", color: "#FFF9D2",
              font: "600 11px/1.2 var(--font-sans)",
            }}>Electronics</span>
          </div>
          <div className="t-title1" style={{ fontSize: 24 }}>
            Apple iPhone 15 Pro 256GB Titanium
          </div>
          {/* Vendor row — single store for this listing */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 12,
            background: "var(--bg-2)",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "var(--surface)",
              display: "flex", alignItems: "center", justifyContent: "center",
              font: "700 13px/1 var(--font-sans)", color: "var(--text-1)",
              boxShadow: "0 1px 2px rgba(30,43,77,0.08)",
            }}>A</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-headline">Apple Store</div>
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                font: "500 12px/1.2 var(--font-sans)", color: "var(--text-2)",
              }}>
                <Icon name="check" size={11} color="var(--savings)" strokeWidth={3} />
                Verified store
              </div>
            </div>
            <Icon name="globe" size={16} color="var(--text-2)" />
          </div>

          {/* Price — vendor's actual price */}
          <div style={{ marginTop: 4 }}>
            <div className="t-caption">Apple Store price</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
              <span className="p-detail-hero">$999.00</span>
              <span className="p-strike">$1,099.00</span>
              <span style={{
                font: "700 12px/1 var(--font-sans)", color: "var(--savings)",
                padding: "4px 8px", borderRadius: 8,
                background: "color-mix(in srgb, var(--savings) 18%, transparent)",
              }}>−9%</span>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div style={{ padding: "12px 20px 0" }}>
          <div className="t-title3" style={{ marginBottom: 8 }}>Specifications</div>
          <div style={{ borderRadius: 12, overflow: "hidden" }}>
            {[
              ["Display", "6.1\" Super Retina XDR"],
              ["Chip", "A17 Pro"],
              ["Storage", "256 GB"],
              ["Camera", "48MP main + 12MP ultrawide"],
              ["Battery", "Up to 23h video"],
            ].map(([k, v], i) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between", padding: "10px 14px",
                background: i % 2 === 0 ? "var(--bg-2)" : "transparent",
              }}>
                <span className="t-subhead">{k}</span>
                <span className="t-subhead" style={{ color: "var(--text-1)", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Go to store — inline, under specs */}
        <div style={{ padding: "20px 20px 4px", display: "flex", flexDirection: "column", gap: 6 }}>
          <PrimaryButton fullWidth={true}>Go to Apple Store</PrimaryButton>
          <div className="t-caption" style={{ textAlign: "center", color: "var(--text-2)" }}>
            Opens the official Apple Store website
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: "20px 20px 0" }}>
          <div className="t-title3" style={{ marginBottom: 8 }}>About this product</div>
          <div className="t-body" style={{ color: "var(--text-1)" }}>
            iPhone 15 Pro is forged in titanium and features the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.
          </div>
          <span style={{
            display: "inline-block", marginTop: 8,
            color: "var(--text-1)", fontWeight: 600,
            textDecoration: "underline", cursor: "pointer",
            font: "600 14px/1.3 var(--font-sans)",
          }}>Show more</span>
        </div>

        <BottomNav active="home" />
        {withSheet && <ComparisonSheet />}
      </div>
    </PaletteWrapper>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. PRODUCT DETAIL + COMPARISON SHEET (overlay)
// ─────────────────────────────────────────────────────────────
function ComparisonSheet() {
  const rows = [
    { tone: "accent", name: "Sony WH-1000XM5", store: "Best Buy", price: "$329.00", lowest: true },
    { tone: "dark", name: "Bose QuietComfort Ultra", store: "Bose", price: "$429.00" },
    { tone: "character", name: "Apple AirPods Max", store: "Apple Store", price: "$549.00" },
  ];
  return (
    <>
      {/* scrim */}
      <div style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
        zIndex: 30,
      }}/>
      {/* sheet */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        height: "65%", borderRadius: "24px 24px 0 0",
        background: "var(--bg-1)", zIndex: 35,
        boxShadow: "0 -10px 40px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 38, height: 5, borderRadius: 99, background: "var(--divider)" }}/>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 16px" }}>
          <span className="t-title2">Comparison</span>
          <span className="t-headline" style={{ color: "var(--text-1)" }}>Clear all</span>
        </div>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((r, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "48px 1fr auto", gap: 12,
              alignItems: "center", padding: "10px 12px", borderRadius: 12,
              background: r.lowest ? "color-mix(in srgb, var(--savings) 12%, transparent)" : "transparent",
              border: r.lowest ? "1px solid color-mix(in srgb, var(--savings) 30%, transparent)" : "0.5px solid var(--divider)",
            }}>
              <ProductImg tone={r.tone} height={48} radius="10px" />
              <div style={{ minWidth: 0 }}>
                <div className="t-headline" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                <div className="t-caption">{r.store}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="p-table" style={{
                  color: r.lowest ? "var(--savings)" : "var(--text-1)",
                  fontWeight: r.lowest ? 600 : 400,
                }}>{r.price}</div>
                {r.lowest && <div style={{
                  font: "600 9px/1 var(--font-sans)", textTransform: "uppercase",
                  color: "var(--savings)", letterSpacing: 0.06 + "em", marginTop: 2,
                }}>Lowest</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. SAVED
// ─────────────────────────────────────────────────────────────
function SavedScreen({ palette }) {
  return (
    <PaletteWrapper palette={palette}>
      <div style={{ minHeight: SCREEN_HEIGHT, paddingBottom: 130, position: "relative" }}>
        <TopBar
          left={<span className="t-title1" style={{ fontSize: 26 }}>Saved</span>}
          right={<>
            <IconButton name="grid" size={18} bg="var(--bg-2)" />
            <IconButton name="filter" size={18} bg="var(--bg-2)" />
          </>}
        />
        <div className="t-subhead" style={{ padding: "0 20px 8px" }}>
          4 saved · last updated 2h ago
        </div>
        <div style={{ padding: "8px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {RESULTS_GRID_DATA.slice(0, 4).map((p, i) => (
            <GridProductCard key={i} {...p} saved={true} />
          ))}
        </div>
        <BottomNav active="saved" />
      </div>
    </PaletteWrapper>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
function NotificationsScreen({ palette }) {
  return (
    <PaletteWrapper palette={palette}>
      <div style={{ minHeight: SCREEN_HEIGHT, paddingBottom: 130, position: "relative" }}>
        <TopBar
          left={<span className="t-title1" style={{ fontSize: 26 }}>Alerts</span>}
          right={<span className="t-subhead" style={{ color: "var(--text-1)", fontWeight: 600 }}>Mark all read</span>}
        />
        <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "52px 1fr auto", gap: 12,
              padding: 14, borderRadius: 14,
              background: n.unread ? "var(--bg-2)" : "transparent",
              alignItems: "flex-start",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 999, background: "var(--bg-1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                <Snoop expression={n.expr} size={56} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <div className="t-headline" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {n.title}
                  {n.unread && <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--text-1)" }}/>}
                </div>
                <div className="t-subhead" style={{ color: "var(--text-2)" }}>{n.body}</div>
              </div>
              <div className="t-caption" style={{ flexShrink: 0 }}>{n.time}</div>
            </div>
          ))}
        </div>
        <BottomNav active="alerts" />
      </div>
    </PaletteWrapper>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. NO RESULTS / ERROR
// ─────────────────────────────────────────────────────────────
function NoResultsScreen({ palette }) {
  return (
    <PaletteWrapper palette={palette}>
      <div style={{ minHeight: SCREEN_HEIGHT, paddingBottom: 130, position: "relative" }}>
        <div style={{ padding: "8px 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <IconButton name="back" size={22} />
          <div style={{ flex: 1 }}>
            <div style={{
              height: 44, borderRadius: 22, background: "var(--bg-2)",
              display: "flex", alignItems: "center", padding: "0 14px", gap: 10,
            }}>
              <Icon name="search" size={18} color="var(--text-2)" />
              <span style={{ flex: 1, font: "500 16px/1 var(--font-sans)" }}>xqzpltbrn</span>
            </div>
          </div>
        </div>
        <div style={{
          padding: "60px 32px", display: "flex", flexDirection: "column",
          alignItems: "center", textAlign: "center", gap: 16,
        }}>
          <Snoop expression="surprised" size={180} />
          <div className="t-title1" style={{ fontSize: 24 }}>Nothing found.</div>
          <div className="t-body" style={{ color: "var(--text-2)", maxWidth: 280 }}>
            I checked 47 stores but couldn't match that. Try a different word or check the spelling.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <SecondaryButton icon="refresh">Try again</SecondaryButton>
            <SecondaryButton icon="search">New search</SecondaryButton>
          </div>
        </div>
        <BottomNav active="home" />
      </div>
    </PaletteWrapper>
  );
}

// ─────────────────────────────────────────────────────────────
// 10. LOADING
// ─────────────────────────────────────────────────────────────
function LoadingScreen({ palette }) {
  return (
    <PaletteWrapper palette={palette}>
      <div style={{ minHeight: SCREEN_HEIGHT, paddingBottom: 130, position: "relative" }}>
        <div style={{ padding: "8px 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <IconButton name="back" size={22} />
          <div style={{ flex: 1 }}>
            <div style={{
              height: 44, borderRadius: 22, background: "var(--bg-2)",
              display: "flex", alignItems: "center", padding: "0 14px", gap: 10,
            }}>
              <Icon name="search" size={18} color="var(--text-2)" />
              <span style={{ flex: 1, font: "500 16px/1 var(--font-sans)" }}>noise cancelling headphones</span>
            </div>
          </div>
        </div>
        <div style={{
          padding: "40px 32px 24px", display: "flex", flexDirection: "column",
          alignItems: "center", textAlign: "center", gap: 12,
        }}>
          <Snoop expression="thinking" size={180} />
          <div className="t-title2" style={{ marginTop: 4 }}>Finding deals…</div>
          <div className="t-subhead" style={{ color: "var(--text-2)", maxWidth: 280 }}>
            Searching across 47 stores. This usually takes about a second.
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 8, height: 8, borderRadius: 999, background: "var(--text-1)",
                animation: `snoop-bounce 1s ${i * 0.15}s infinite ease-in-out`,
              }}/>
            ))}
          </div>
        </div>
        {/* skeleton cards */}
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              background: "var(--surface)", borderRadius: 16, padding: 12,
              display: "grid", gridTemplateColumns: "80px 1fr", gap: 12,
              boxShadow: "var(--shadow-card)",
            }}>
              <div style={{ width: 80, height: 80, borderRadius: 12, background: "var(--bg-2)" }}/>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                <div style={{ width: "85%", height: 14, borderRadius: 4, background: "var(--bg-2)" }}/>
                <div style={{ width: "55%", height: 12, borderRadius: 4, background: "var(--bg-2)" }}/>
                <div style={{ width: "35%", height: 16, borderRadius: 4, background: "var(--bg-2)" }}/>
              </div>
            </div>
          ))}
        </div>
        <BottomNav active="home" />
      </div>
    </PaletteWrapper>
  );
}

Object.assign(window, {
  HomeScreen, SearchActiveScreen, ResultsGridScreen, ResultsListScreen,
  ProductDetailScreen, ComparisonSheet, SavedScreen, NotificationsScreen,
  NoResultsScreen, LoadingScreen,
  CATEGORY_LIST, RESULTS_GRID_DATA, RESULTS_LIST_DATA, NOTIFICATIONS,
});
