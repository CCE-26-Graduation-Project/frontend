// Snoop UI kit — shared components.
// All components draw from CSS variables; the default :root palette is
// Snoop's cream/peach/blue. Wrap any subtree in [data-palette="..."]
// to swap to a backup theme without changing components.

// ─────────────────────────────────────────────────────────────
// Icons — Lucide-style line icons (copied paths so we don't fight network)
// ─────────────────────────────────────────────────────────────
function Icon({ name, size = 22, color = "currentColor", strokeWidth = 2, style = {} }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></>,
    camera: <><path d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="4"/></>,
    home: <><path d="m3 11 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></>,
    bookmark: <><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0v5l1.5 3h-15L6 13z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
    user: <><circle cx="12" cy="9" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    back: <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
    forward: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    close: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    filter: <><path d="M3 6h18"/><path d="M7 12h10"/><path d="M11 18h2"/></>,
    sort: <><path d="M3 6h13"/><path d="M3 12h9"/><path d="M3 18h5"/><path d="m17 8 4-4-4-4"/><path d="M21 4h-8"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    list: <><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    flame: <><path d="M12 21c4 0 7-3 7-7 0-3-2-5-2-8 0-1-1-2-2-2 0 3-2 4-3 5-2-2-3-4-3-6-3 1-5 5-5 9 0 6 4 9 8 9z"/></>,
    trending: <><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/></>,
    pin: <><path d="M12 21s-7-8-7-13a7 7 0 0 1 14 0c0 5-7 13-7 13z"/><circle cx="12" cy="8" r="2.5"/></>,
    check: <><path d="m5 12 5 5 9-11"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    chevronRight: <><path d="m9 6 6 6-6 6"/></>,
    chevronDown: <><path d="m6 9 6 6 6-6"/></>,
    swap: <><path d="M7 7h10v10"/><path d="M7 17 17 7"/></>,
    compareScale: <>
      <path d="M3.5 9.5 6 7l2.5 2.5v3.7H3.5z"/>
      <circle cx="6" cy="8.6" r="0.45" fill="currentColor" stroke="none"/>
      <path d="M15.5 6.5 18 4l2.5 2.5v3.7h-5z"/>
      <circle cx="18" cy="5.6" r="0.45" fill="currentColor" stroke="none"/>
      <path d="M2 13.2h8"/><path d="M3.5 14.6h5"/>
      <path d="M14 10.2h8"/><path d="M15.5 11.6h5"/>
      <path d="M12 6.5v13"/>
      <path d="M8.5 19.5h7"/><path d="M7.5 21.5h9"/>
    </>,
    waveform: <><path d="M3 12h2"/><path d="M19 12h2"/><path d="M7 8v8"/><path d="M11 5v14"/><path d="M15 8v8"/></>,
    star: <><path d="M12 3 14.5 9 21 9.5l-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5 9.5 9z"/></>,
    sparkles: <><path d="M12 3v6"/><path d="M12 15v6"/><path d="M3 12h6"/><path d="M15 12h6"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="9" cy="9" r="1.5"/><path d="m3 17 5-5 5 5 3-3 5 5"/></>,
    tag: <><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z"/><circle cx="8.5" cy="8.5" r="1.2"/></>,
    bag: <><path d="M5 8h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/></>,
    shirt: <><path d="M4 7 8 4l4 2 4-2 4 3-3 3v10H7V10z"/></>,
    sofa: <><path d="M3 11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3z"/><path d="M3 14v4"/><path d="M21 14v4"/><path d="M6 9V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/></>,
    fridge: <><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M6 10h12"/><path d="M9 6v2"/><path d="M9 14v2"/></>,
    ball: <><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M5 7c2 2 12 2 14 0"/><path d="M5 17c2-2 12-2 14 0"/></>,
    sparkle: <><path d="M12 3v6"/><path d="M12 15v6"/><path d="M3 12h6"/><path d="M15 12h6"/></>,
    book: <><path d="M4 4h6a2 2 0 0 1 2 2v15a3 3 0 0 0-3-3H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v15a3 3 0 0 1 3-3h5z"/></>,
    car: <><path d="M5 16V13l2-5a2 2 0 0 1 2-1h6a2 2 0 0 1 2 1l2 5v3"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/></>,
    shoe: <>
      <path d="M3 15h2l1-3h3l1 4h3l4 1c2 0 3 1 3 2v1H3z"/>
      <path d="M9 12 11 13"/>
      <path d="M11 14 13 15"/>
    </>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    refresh: <><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M21 3v5h-5"/><path d="M3 21v-5h5"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name]}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// PaletteWrapper — applies [data-palette] + bg-1 inside an iOS frame
// ─────────────────────────────────────────────────────────────
function PaletteWrapper({ palette = "clear-sky", children, style = {} }) {
  return (
    <div data-palette={palette} style={{
      minHeight: "100%",
      paddingTop: 56, /* leave room for iOS status bar */
      background: "var(--bg-1)",
      color: "var(--text-1)",
      fontFamily: "var(--font-sans)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Logo wordmark — inline (avoids svg loading)
// ─────────────────────────────────────────────────────────────
function LogoWordmark({ size = 22 }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: size * 0.32,
      fontFamily: "var(--font-sans)", fontWeight: 600,
      fontSize: size, letterSpacing: "-0.04em",
      color: "var(--text-1)",
    }}>
      <span>Snoop</span>
      {/* tiny paw-print mark in accent */}
      <svg width={size * 0.85} height={size * 0.7} viewBox="0 0 42 22"
        fill="var(--accent)" aria-hidden="true">
        <ellipse cx="6" cy="10" rx="3" ry="4" />
        <ellipse cx="14" cy="6" rx="3" ry="4" />
        <ellipse cx="22" cy="10" rx="3" ry="4" />
        <path d="M7 17 C 7 22, 23 22, 23 17 C 23 13, 19 12, 15 12 C 11 12, 7 13, 7 17 Z" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TopBar
// ─────────────────────────────────────────────────────────────
function TopBar({ left, right, title, height = 52 }) {
  return (
    <div style={{
      height, padding: "0 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
        {left}
        {title && <span className="t-title3" style={{ color: "var(--text-1)" }}>{title}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{right}</div>
    </div>
  );
}

function IconButton({ name, onClick, size = 22, style = {}, color = "var(--text-1)", bg = "transparent" }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 999, background: bg, border: "none",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      color, cursor: "pointer", padding: 0, ...style,
    }}>
      <Icon name={name} size={size} color={color} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// SearchBar
// ─────────────────────────────────────────────────────────────
function SearchBar({ value = "", placeholder = "Search any product…", onTap, focused = false, showIcons = true }) {
  return (
    <div onClick={onTap} style={{
      height: 52, borderRadius: 24,
      background: focused ? "var(--surface)" : "var(--bg-2)",
      border: focused ? "1.5px solid var(--accent)" : "1.5px solid transparent",
      boxShadow: focused ? "var(--shadow-card)" : "var(--shadow-rest)",
      display: "flex", alignItems: "center", padding: "0 16px", gap: 10,
      transition: "all 200ms",
    }}>
      <Icon name="search" size={20} color="var(--text-2)" />
      <div style={{
        flex: 1, font: "400 17px/1 var(--font-sans)",
        color: value ? "var(--text-1)" : "var(--text-2)",
        letterSpacing: "-0.005em",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{value || placeholder}</div>
      {showIcons && (
        <>
          <Icon name="mic" size={20} color="var(--text-1)" />
          <Icon name="camera" size={20} color="var(--text-1)" />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CategoryCard
// ─────────────────────────────────────────────────────────────
function CategoryCard({ icon, label, tint }) {
  return (
    <div style={{
      width: 80, flexShrink: 0, display: "flex", flexDirection: "column",
      alignItems: "center", gap: 8,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 16,
        background: tint || "var(--bg-2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-1)",
      }}>
        <Icon name={icon} size={32} strokeWidth={1.6} />
      </div>
      <div style={{ font: "500 12px/1.1 var(--font-sans)", color: "var(--text-1)", textAlign: "center" }}>
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Chip
// ─────────────────────────────────────────────────────────────
function RecentChip({ label }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
      height: 34, padding: "0 12px", borderRadius: 999,
      background: "var(--bg-2)", color: "var(--text-1)",
      font: "400 13.5px/1 var(--font-sans)",
    }}>
      <Icon name="clock" size={14} color="var(--text-2)" />
      <span>{label}</span>
      <Icon name="close" size={14} color="var(--text-2)" style={{ opacity: 0.6 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom nav
// ─────────────────────────────────────────────────────────────
function BottomNav({ active = "home", showPulse = false, onSelect, style = {} }) {
  const NAV_BG = "#0D0B61";                  // deep midnight blue
  const NAV_ACTIVE = "#FFF9D2";               // cream — ties to the camera button
  const NAV_INACTIVE = "rgba(255, 249, 210, 0.55)";
  const NAV_SHADOW =
    "0 2px 4px rgba(13, 11, 97, 0.10)," +
    "0 14px 28px rgba(13, 11, 97, 0.24)," +
    "0 28px 56px rgba(13, 11, 97, 0.22)";

  const tab = (key, icon, label) => {
    const isActive = active === key;
    return (
      <div key={key} onClick={() => onSelect && onSelect(key)} style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        color: isActive ? NAV_ACTIVE : NAV_INACTIVE,
        font: "500 10.5px/1 var(--font-sans)", cursor: "pointer", paddingTop: 4,
      }}>
        <Icon name={icon} size={22} color="currentColor" />
        {label}
      </div>
    );
  };
  return (
    <div style={{
      position: "absolute", left: 16, right: 16, bottom: 24,
      height: 66, borderRadius: 26,
      background: NAV_BG,
      boxShadow: NAV_SHADOW,
      display: "grid", gridTemplateColumns: "repeat(5, 1fr)", alignItems: "center",
      zIndex: 20, ...style,
    }}>
      {tab("home", "home", "Home")}
      {tab("saved", "bookmark", "Saved")}
      <div style={{
        position: "relative", height: "100%", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <div onClick={() => onSelect && onSelect("camera")} style={{
          position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)",
          width: 56, height: 56, borderRadius: 999, background: "#FFF9D2",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 22px rgba(13, 11, 97, 0.40), 0 0 0 1px rgba(13, 11, 97, 0.08)",
          border: `4px solid var(--bg-1)`,
          animation: showPulse ? "snoop-pulse 4s ease-in-out infinite" : "none",
        }}>
          <Icon name="camera" size={22} color="#0D0B61" />
        </div>
        <div style={{
          font: "500 10.5px/1 var(--font-sans)",
          color: active === "camera" ? NAV_ACTIVE : NAV_INACTIVE,
          marginTop: 24,
        }}>Camera</div>
      </div>
      {tab("alerts", "bell", "Alerts")}
      {tab("profile", "user", "Profile")}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Product cards
// ─────────────────────────────────────────────────────────────
function ProductImg({ tone = "accent", height = 160, radius = "16px 16px 0 0" }) {
  // Generative placeholder — abstract product silhouette
  const grad = tone === "accent"
    ? "linear-gradient(135deg, var(--bg-2), color-mix(in oklab, var(--accent) 22%, var(--bg-2)))"
    : tone === "warm"
    ? "linear-gradient(135deg, var(--bg-2), color-mix(in oklab, var(--secondary-accent) 25%, var(--bg-2)))"
    : tone === "dark"
    ? "linear-gradient(135deg, var(--bg-2), color-mix(in oklab, var(--text-1) 25%, var(--bg-2)))"
    : "linear-gradient(135deg, var(--bg-2), color-mix(in oklab, var(--character) 60%, var(--bg-2)))";
  const objColor = tone === "accent" ? "color-mix(in oklab, var(--accent) 50%, white)"
    : tone === "warm" ? "color-mix(in oklab, var(--secondary-accent) 55%, white)"
    : tone === "dark" ? "color-mix(in oklab, var(--text-1) 75%, white)"
    : "color-mix(in oklab, var(--character) 70%, white)";
  return (
    <div style={{
      width: "100%", height, borderRadius: radius, background: grad, position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: "20% 22%", borderRadius: 12,
        background: objColor, boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
      }}/>
    </div>
  );
}

function GridProductCard({ name, store, storeLogo = "S", price, oldPrice, discountPct, tone = "accent", saved = false, onAddPlus }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 16, overflow: "hidden",
      boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column",
    }}>
      <div style={{ position: "relative" }}>
        <ProductImg tone={tone} height={140} />
        {discountPct && (
          <span style={{
            position: "absolute", top: 10, left: 10,
            height: 24, padding: "0 9px", borderRadius: 8,
            background: "var(--savings)", color: "white",
            font: "700 11px/1 var(--font-sans)", letterSpacing: "-0.005em",
            display: "inline-flex", alignItems: "center",
          }}>−{discountPct}%</span>
        )}
        {/* bottom-left "+" — quick-add to comparison */}
        <button onClick={onAddPlus} aria-label="Add to comparison" style={{
          position: "absolute", bottom: 10, left: 10,
          width: 30, height: 30, borderRadius: 999, border: "none",
          background: "var(--text-1)", color: "#FFF9D2",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(30,43,77,0.30)",
        }}>
          <Icon name="plus" size={16} color="#FFF9D2" strokeWidth={2.4} />
        </button>
        {/* bookmark — saved fills with cream on a navy pill */}
        <span title="Save" style={{
          position: "absolute", top: 10, right: 10,
          width: 32, height: 32, borderRadius: 999,
          background: saved ? "var(--text-1)" : "rgba(255,249,210,0.92)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 1px 3px rgba(30,43,77,0.10)",
        }}>
          <Icon name="bookmark" size={16}
            color={saved ? "#FFF9D2" : "var(--text-1)"}
            strokeWidth={saved ? 0 : 2}
            style={saved ? { fill: "#FFF9D2" } : {}} />
        </span>
      </div>
      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          font: "500 12px/1 var(--font-sans)", color: "var(--text-2)",
        }}>
          <span style={{
            width: 16, height: 16, borderRadius: 4,
            background: "var(--bg-2)", color: "var(--text-1)",
            font: "700 9px/1 var(--font-sans)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>{storeLogo}</span>
          {store}
        </div>
        <div style={{
          font: "600 15px/1.25 var(--font-sans)", color: "var(--text-1)",
          letterSpacing: "-0.012em",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          minHeight: 38,
        }}>{name}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums",
            fontWeight: 600, fontSize: 19, lineHeight: 1, color: "var(--savings)",
            letterSpacing: "-0.005em",
          }}>{price}</span>
          {oldPrice && (
            <span style={{
              fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums",
              fontSize: 12, color: "var(--text-2)", textDecoration: "line-through",
            }}>{oldPrice}</span>
          )}
          {discountPct && (
            <span style={{ font: "700 11px/1 var(--font-sans)", color: "var(--savings)" }}>−{discountPct}%</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ListProductCard({ name, specs, priceRange, topStores, stores, tone = "accent" }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 16, padding: 12,
      display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 12,
      alignItems: "center", boxShadow: "var(--shadow-card)",
    }}>
      <ProductImg tone={tone} height={80} radius="12px" />
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{
          font: "600 15px/1.25 var(--font-sans)", color: "var(--text-1)",
          letterSpacing: "-0.012em",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{name}</div>
        <div className="t-footnote">{specs}</div>
        <div style={{
          fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums",
          fontWeight: 600, fontSize: 18, lineHeight: 1, color: "var(--savings)",
          letterSpacing: "-0.005em", marginTop: 4,
        }}>{priceRange}</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginTop: 2,
          font: "500 12px/1.2 var(--font-sans)", color: "var(--text-2)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {(topStores || []).map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span style={{ width: 3, height: 3, borderRadius: 999, background: "var(--text-2)", opacity: 0.5, flexShrink: 0 }}/>}
              <span>{s}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
      <span style={{
        font: "600 11px/1 var(--font-sans)", background: "var(--bg-2)",
        color: "var(--text-2)", padding: "5px 9px", borderRadius: 999,
      }}>{stores}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Primary CTA
// ─────────────────────────────────────────────────────────────
function PrimaryButton({ children, fullWidth = true, onClick, height = 54 }) {
  return (
    <button onClick={onClick} style={{
      width: fullWidth ? "100%" : "auto", height, padding: "0 28px",
      border: "none", borderRadius: 999,
      background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%), var(--text-1)",
      color: "white",
      font: "600 17px/1 var(--font-sans)", letterSpacing: "-0.01em",
      boxShadow:
        "0 1px 0 rgba(255,255,255,0.18) inset," +
        "0 -1px 0 rgba(0,0,0,0.25) inset," +
        "0 1px 2px rgba(0,0,0,0.18)," +
        "0 6px 14px rgba(0,0,0,0.22)," +
        "0 18px 34px rgba(0,0,0,0.22)",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      cursor: "pointer",
    }}>
      {children}
      <span style={{
        width: 22, height: 22, borderRadius: 999,
        background: "rgba(255,255,255,0.18)",
        display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 4,
      }}>
        <Icon name="forward" size={14} color="white" strokeWidth={2.4} />
      </span>
    </button>
  );
}

function SecondaryButton({ children, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      height: 48, padding: "0 20px", border: "1px solid var(--divider)",
      borderRadius: 999, background: "#fff", color: "var(--text-1)",
      font: "600 15px/1 var(--font-sans)", letterSpacing: "-0.005em",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 10px rgba(0,0,0,0.03)",
      display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
    }}>
      {icon && <Icon name={icon} size={16} color="var(--text-1)" />}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Compare pill — vertical sticky
// ─────────────────────────────────────────────────────────────
function ComparePill({ count, onClick, style = {} }) {
  return (
    <div onClick={onClick} style={{
      position: "absolute", right: 16, width: 36, height: 100,
      borderRadius: 999, background: "var(--accent)", color: "white",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
      boxShadow: "var(--shadow-cta)", cursor: "pointer", zIndex: 18,
      ...style,
    }}>
      <span style={{
        font: "600 13px/1 var(--font-sans)",
        writingMode: "vertical-rl", transform: "rotate(180deg)",
        letterSpacing: 0.5,
      }}>Compare</span>
      <span style={{
        minWidth: 22, height: 22, padding: "0 6px", borderRadius: 999,
        background: "rgba(255,255,255,0.25)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        font: "600 11px/1 var(--font-mono)",
      }}>{count}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────
function Toast({ children, icon = "check", iconColor = "var(--savings)" }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "8px 14px 8px 8px", borderRadius: 999,
      background: "var(--text-1)", color: "white",
      boxShadow: "var(--shadow-floating)",
      font: "500 14px/1.2 var(--font-sans)",
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: 999, background: iconColor,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={icon} size={14} color="white" strokeWidth={2.5} />
      </span>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Trending mini card — horizontally scrollable on home
// ─────────────────────────────────────────────────────────────
function TrendingMiniCard({ name, vendor, tone = "accent" }) {
  return (
    <div style={{
      width: 140, flexShrink: 0,
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <ProductImg tone={tone} height={100} radius="12px" />
      <div style={{
        font: "600 13px/1.25 var(--font-sans)", color: "var(--text-1)",
        letterSpacing: "-0.012em",
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden", minHeight: 32,
      }}>{name}</div>
      <div style={{ font: "500 11px/1 var(--font-sans)", color: "var(--text-2)" }}>{vendor}</div>
    </div>
  );
}

Object.assign(window, {
  Icon, PaletteWrapper, LogoWordmark, TopBar, IconButton, SearchBar,
  CategoryCard, RecentChip, BottomNav, ProductImg, GridProductCard,
  ListProductCard, PrimaryButton, SecondaryButton, ComparePill, Toast,
  TrendingMiniCard,
});
