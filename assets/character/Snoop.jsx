/* Snoop — the recurring mascot.
   ------------------------------------------------------------------
   A friendly cartoon dog with floppy ears, a curious snout, and a
   magnifying glass for "thinking". 6 expressions; body color and
   outline pull from the active CSS palette. Pass `body` / `outline`
   to override (e.g. in static previews).
*/

const SNOOP_EXPRESSIONS = [
  "neutral",
  "happy",
  "thinking",
  "listening",
  "surprised",
  "waving",
];

function Snoop({ expression = "neutral", size = 120, body, outline, ear, highlight, style = {} }) {
  const fill = body || "var(--character)";            // white
  const stroke = outline || "var(--character-ink)";   // navy
  const earColor = ear || "#FFEBCC";                  // peach patches
  const accent = highlight || "var(--accent)";        // palette blue
  const blush = "rgba(252, 165, 165, 0.55)";
  const noseColor = stroke;
  const tongue = "#F08AA0";

  const sw = 3.2;

  // ── Body: small rounded bottom + 2 floppy ears + head + snout ──
  const Body = (
    <g>
      {/* contact shadow */}
      <ellipse cx="100" cy="186" rx="52" ry="5.5" fill={stroke} opacity="0.10" />
      {/* lower body */}
      <path
        d="M50 152
           C 50 178, 150 178, 150 152
           L 150 138
           Q 100 156 50 138 Z"
        fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      />
      {/* left ear (hangs lower than head) */}
      <g transform="rotate(-12 42 110)">
        <ellipse cx="42" cy="118" rx="22" ry="40" fill={earColor} stroke={stroke} strokeWidth={sw} />
      </g>
      {/* right ear */}
      <g transform="rotate(12 158 110)">
        <ellipse cx="158" cy="118" rx="22" ry="40" fill={earColor} stroke={stroke} strokeWidth={sw} />
      </g>
      {/* head — drawn over the ears */}
      <ellipse cx="100" cy="98" rx="56" ry="54" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* peach ear-patch peeking on the head crown (subtle continuity) */}
      <path
        d="M55 78 Q 70 60 95 62 Q 80 75 70 88 Z"
        fill={earColor} stroke="none" opacity="0.55"
      />
      <path
        d="M145 78 Q 130 60 105 62 Q 120 75 130 88 Z"
        fill={earColor} stroke="none" opacity="0.55"
      />
      {/* snout */}
      <ellipse cx="100" cy="116" rx="28" ry="20" fill={fill} stroke={stroke} strokeWidth={sw - 0.4} />
    </g>
  );

  let face;
  let extras;

  if (expression === "neutral") {
    face = (
      <>
        {/* eyes — gentle dots */}
        <circle cx="82" cy="92" r="4.2" fill={stroke} />
        <circle cx="118" cy="92" r="4.2" fill={stroke} />
        {/* nose */}
        <ellipse cx="100" cy="108" rx="5.5" ry="4" fill={noseColor} />
        {/* mouth — small inverted Y */}
        <path d="M100 113 V 120" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <path d="M100 120 Q 94 124 90 121" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <path d="M100 120 Q 106 124 110 121" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <ellipse cx="68" cy="118" rx="7" ry="4" fill={blush} />
        <ellipse cx="132" cy="118" rx="7" ry="4" fill={blush} />
      </>
    );
  } else if (expression === "happy") {
    face = (
      <>
        {/* eyes — closed happy arches */}
        <path d="M76 92 Q 82 84 88 92" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <path d="M112 92 Q 118 84 124 92" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <ellipse cx="100" cy="108" rx="5.5" ry="4" fill={noseColor} />
        {/* big open smile with tongue */}
        <path
          d="M100 113 V 118
             M 100 118 Q 86 132 80 124
             M 100 118 Q 114 132 120 124"
          stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round"
        />
        <path
          d="M93 125 Q 100 134 107 125 Q 100 130 93 125 Z"
          fill={tongue} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"
        />
        <ellipse cx="68" cy="120" rx="8" ry="4.5" fill={blush} />
        <ellipse cx="132" cy="120" rx="8" ry="4.5" fill={blush} />
      </>
    );
    extras = (
      <>
        {/* wagging tail */}
        <g transform="rotate(-20 160 154)">
          <path d="M150 156 Q 168 138 172 148 Q 174 156 162 158"
            fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </g>
        {/* sparkles */}
        <g stroke={stroke} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M26 56 L 26 64 M 22 60 L 30 60" />
          <path d="M178 50 L 178 58 M 174 54 L 182 54" />
        </g>
      </>
    );
  } else if (expression === "thinking") {
    face = (
      <>
        {/* eyes look up-and-right */}
        <circle cx="78" cy="90" r="4.5" fill={stroke} />
        <circle cx="114" cy="90" r="4.5" fill={stroke} />
        <ellipse cx="100" cy="108" rx="5.5" ry="4" fill={noseColor} />
        {/* thoughtful mouth */}
        <path d="M100 113 V 119" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <path d="M93 122 L 107 122" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <ellipse cx="68" cy="118" rx="7" ry="4" fill={blush} />
        <ellipse cx="132" cy="118" rx="7" ry="4" fill={blush} />
      </>
    );
    extras = (
      <>
        {/* magnifying glass — held up to the right side */}
        <g>
          <circle cx="172" cy="74" r="20" fill={accent} fillOpacity="0.22" stroke={stroke} strokeWidth={sw} />
          <circle cx="172" cy="74" r="20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
          <line x1="186" y1="90" x2="200" y2="106" stroke={stroke} strokeWidth={sw + 1.2} strokeLinecap="round" />
        </g>
      </>
    );
  } else if (expression === "listening") {
    face = (
      <>
        {/* eyes focused */}
        <circle cx="82" cy="92" r="4.2" fill={stroke} />
        <circle cx="118" cy="92" r="4.2" fill={stroke} />
        <ellipse cx="100" cy="108" rx="5.5" ry="4" fill={noseColor} />
        {/* mouth — small "o" */}
        <ellipse cx="100" cy="122" rx="5" ry="6" fill={stroke} />
        <ellipse cx="68" cy="118" rx="7" ry="4" fill={blush} />
        <ellipse cx="132" cy="118" rx="7" ry="4" fill={blush} />
        {/* perked-up ear hint — small triangle at ear tops */}
      </>
    );
    extras = (
      <>
        {/* sound waves both sides */}
        <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round">
          <path d="M10 96 Q 4 108 10 120" />
          <path d="M22 88 Q 12 108 22 128" opacity="0.55" />
          <path d="M190 96 Q 196 108 190 120" />
          <path d="M178 88 Q 188 108 178 128" opacity="0.55" />
        </g>
      </>
    );
  } else if (expression === "surprised") {
    face = (
      <>
        {/* wide eyes with whites */}
        <circle cx="82" cy="90" r="8" fill="#fff" stroke={stroke} strokeWidth="2" />
        <circle cx="118" cy="90" r="8" fill="#fff" stroke={stroke} strokeWidth="2" />
        <circle cx="82" cy="91" r="3.5" fill={stroke} />
        <circle cx="118" cy="91" r="3.5" fill={stroke} />
        <ellipse cx="100" cy="108" rx="5.5" ry="4" fill={noseColor} />
        {/* surprised mouth — round "o" */}
        <ellipse cx="100" cy="126" rx="6.5" ry="8" fill={stroke} />
      </>
    );
    extras = (
      <>
        {/* exclamation mark */}
        <g fill={accent}>
          <rect x="178" y="36" width="6" height="22" rx="3" />
          <circle cx="181" cy="66" r="3.5" />
        </g>
      </>
    );
  } else if (expression === "waving") {
    face = (
      <>
        {/* happy eyes */}
        <path d="M76 92 Q 82 84 88 92" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <path d="M112 92 Q 118 84 124 92" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <ellipse cx="100" cy="108" rx="5.5" ry="4" fill={noseColor} />
        {/* smile */}
        <path d="M100 113 V 118 M 100 118 Q 88 130 84 124 M 100 118 Q 112 130 116 124"
          stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <ellipse cx="68" cy="120" rx="8" ry="4.5" fill={blush} />
        <ellipse cx="132" cy="120" rx="8" ry="4.5" fill={blush} />
      </>
    );
    extras = (
      <>
        {/* waving paw — extends from upper right of body */}
        <g>
          <path
            d="M160 138
               C 178 124, 196 130, 192 148
               C 198 156, 192 170, 180 168
               C 174 176, 158 172, 156 158 Z"
            fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
          />
          {/* paw pads */}
          <circle cx="180" cy="142" r="2.5" fill={stroke} />
          <circle cx="188" cy="148" r="2.5" fill={stroke} />
          <circle cx="184" cy="156" r="2.5" fill={stroke} />
          {/* motion lines */}
          <g stroke={stroke} strokeWidth="2.4" strokeLinecap="round" opacity="0.55">
            <path d="M198 118 L 206 112" />
            <path d="M190 110 L 194 100" />
          </g>
        </g>
      </>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Snoop — ${expression}`}
      role="img"
      style={style}
    >
      {Body}
      {face}
      {extras}
    </svg>
  );
}

// Back-compat: previous code used `Lume` and `LUME_EXPRESSIONS`. Alias them
// so existing screen renders keep working through the rename.
const Lume = Snoop;
const LUME_EXPRESSIONS = SNOOP_EXPRESSIONS;

Object.assign(window, { Snoop, SNOOP_EXPRESSIONS, Lume, LUME_EXPRESSIONS });
