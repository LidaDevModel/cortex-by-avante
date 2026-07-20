// DEV-ONLY. Named palette + illustration "versions" for DialKit exploration.
//
// These are LAB ARTIFACTS, not shipped themes: the whole dev-palette layer is
// gated to non-production. To actually ship a version, its values get promoted
// into globals.css (`:root` / `.dark`) as a reviewed diff. The dev tool lets you
// DECIDE; globals.css is what SHIPS.
//
// "Cortex Default" is a faithful snapshot of today's tokens (captured per mode),
// so there's always a one-click return to the current look after experimenting.
// Add a new direction (e.g. "Gotham") by adding one more entry — no wiring change.

export type PaletteValues = Record<string, string>; // dial key → hex (keys match TOKENS in DevPalette)
export type IlloValues = { moduleHue: number; moduleBrightness: number; docHue: number; docBrightness: number };

/** Ambient/effect tokens that aren't simple colour dials (gradients + rgba).
 *  Written verbatim on Load so each version's glow/blobs/halo match its palette,
 *  not just the 31 core colours. Raw CSS values → CSS custom properties. */
export type FxValues = {
  blob1: string;          // --blob-1   (chat empty-state field)
  blob2: string;          // --blob-2
  canvasGlow: string;     // --canvas-glow (main canvas radial; "none" for flat)
  cardGlowShadow: string; // --card-glow-shadow (readiness card halo; "none" for flat)
  // Soft bloom behind module/library illustration art. The loader builds all four
  // --illustration-glow* gradients from these two stops so a version's card art
  // sits on a matching backdrop (not the default gray halo).
  illBloom: string;       // gradient centre colour
  illBloomEdge: string;   // gradient edge colour (non-card variants; card variants fade to transparent)
};

export type PaletteVersion = {
  palette: { light: PaletteValues; dark: PaletteValues };
  illustration: { light: IlloValues; dark: IlloValues };
  fx: { light: FxValues; dark: FxValues };
};

/** No hue-rotate / brightness shift — today's illustrations use no filter. */
const IDENTITY: IlloValues = { moduleHue: 0, moduleBrightness: 1, docHue: 0, docBrightness: 1 };

export const CORTEX_VERSIONS: Record<string, PaletteVersion> = {
  "Cortex Default": {
    palette: {
      light: {
        primary: "#003912", onPrimary: "#ffffff", accent: "#c6eca1", accentGlow: "#d0f3d0", ring: "#003912",
        cursorGlow: "#e0e773", ink: "#090e12", inkMuted: "#606468", background: "#f7faf7", surface: "#fbfdfb",
        surfaceRaised: "#f5f7f5", surfaceLifted: "#fbfdfb", surfaceChip: "#ffffff", muted: "#e6f8e6", secondary: "#e6f8e6",
        border: "#e3e5e8", cardBorder: "#dee7e4", inputBorder: "#cfe9d4", controlBorder: "#d1d5db", input: "#e3e5e8",
        navActive: "#e0eeba", sidebarAccent: "#f3f8e3", sidebarBorder: "#e3e5e8", danger: "#e7000b", warning: "#af5504", success: "#003912",
        docPage: "#ffffff", docText: "#333333", docTextMuted: "#555555", docCalloutBg: "#f5f5f0", docCalloutBorder: "#d4e897",
      },
      dark: {
        primary: "#6baa99", onPrimary: "#030303", accent: "#20392c", accentGlow: "#3d3d3d", ring: "#80bda7",
        cursorGlow: "#77b493", ink: "#ffffff", inkMuted: "#c1c1c1", background: "#0f0f0f", surface: "#1c1c1c",
        surfaceRaised: "#2e2e2e", surfaceLifted: "#383838", surfaceChip: "#3d3d3d", muted: "#1c1c1c", secondary: "#20392c",
        border: "#424242", cardBorder: "#264837", inputBorder: "#264837", controlBorder: "#d1d5db", input: "#424242",
        navActive: "#20392c", sidebarAccent: "#25312a", sidebarBorder: "#264837", danger: "#ff6467", warning: "#f9b73f", success: "#6baa99",
        docPage: "#262626", docText: "#e8e8e8", docTextMuted: "#a3a3a3", docCalloutBg: "#888d8b", docCalloutBorder: "#20392c",
      },
    },
    illustration: { light: IDENTITY, dark: IDENTITY },
    fx: {
      light: {
        blob1: "rgba(247,255,226,0.55)", blob2: "rgba(239,255,235,0.55)",
        canvasGlow: "radial-gradient(ellipse 60% 50% at 50% 35%, color-mix(in srgb, var(--accent) 30%, transparent), transparent)",
        cardGlowShadow: "0 0 50px 1px rgba(184,214,96,0.20), 0 0 20px -6px rgba(151,215,198,0.30)",
        illBloom: "rgba(255,255,255,0.92)", illBloomEdge: "transparent",
      },
      dark: {
        blob1: "rgba(113,183,162,0.18)", blob2: "rgba(53,94,80,0.28)",
        canvasGlow: "none", cardGlowShadow: "none",
        illBloom: "rgba(72,72,72,1)", illBloomEdge: "rgba(43,43,43,1)",
      },
    },
  },

  // EXPLORATION — "Gotham": dark-first, special-agent / SOC command-centre.
  // Graphite surfaces tinted cool, a sharp night-ops green for ACTION, a rare
  // signal-amber accent, mint-green for SUCCESS. Light is the daylight variant
  // (cool steel, not the current warm green-white). A lab candidate only — to
  // ship it, VISION's "dark is flat" rule would need amending first.
  "Gotham": {
    palette: {
      light: {
        primary: "#0f7a43", onPrimary: "#ffffff", accent: "#c9e8d3", accentGlow: "#d6efdd", ring: "#0f7a43",
        cursorGlow: "#e8c34a", ink: "#0e1418", inkMuted: "#5a636b", background: "#eef1f3", surface: "#f7f9fa",
        surfaceRaised: "#eef1f3", surfaceLifted: "#f7f9fa", surfaceChip: "#ffffff", muted: "#e6ebee", secondary: "#dcefe2",
        border: "#d3dade", cardBorder: "#cfe0d6", inputBorder: "#c4ddcc", controlBorder: "#c0c8ce", input: "#d3dade",
        navActive: "#dcf2e2", sidebarAccent: "#e6f2ea", sidebarBorder: "#d3dade", danger: "#d92d20", warning: "#af5504", success: "#0b7040",
        docPage: "#ffffff", docText: "#1a2024", docTextMuted: "#5a636b", docCalloutBg: "#eef4f0", docCalloutBorder: "#cfe0a8",
      },
      dark: {
        primary: "#46bd79", onPrimary: "#06120b", accent: "#1f2a22", accentGlow: "#1e2a24", ring: "#6fcf9d",
        cursorGlow: "#e0b23a", ink: "#e9edf0", inkMuted: "#8b949e", background: "#0c0f0d", surface: "#161a18",
        surfaceRaised: "#1d221f", surfaceLifted: "#242a27", surfaceChip: "#2b322e", muted: "#161a18", secondary: "#173021",
        border: "#2c322e", cardBorder: "#2c322e", inputBorder: "#2c322e", controlBorder: "#3a423d", input: "#2c322e",
        navActive: "#1d3826", sidebarAccent: "#141a16", sidebarBorder: "#2c322e", danger: "#ff5f56", warning: "#f0b429", success: "#6fd0ab",
        docPage: "#151816", docText: "#e2e6e9", docTextMuted: "#9aa2ab", docCalloutBg: "#1c2a20", docCalloutBorder: "#46bd79",
      },
    },
    illustration: { light: IDENTITY, dark: { moduleHue: 0, moduleBrightness: 0.9, docHue: 0, docBrightness: 0.9 } },
    fx: {
      light: {
        blob1: "rgba(210,236,217,0.55)", blob2: "rgba(224,242,228,0.55)",
        canvasGlow: "radial-gradient(ellipse 60% 50% at 50% 35%, color-mix(in srgb, var(--accent) 34%, transparent), transparent)",
        cardGlowShadow: "0 0 50px 1px rgba(15,122,67,0.14), 0 0 20px -6px rgba(15,122,67,0.20)",
        illBloom: "rgba(255,255,255,0.92)", illBloomEdge: "transparent",
      },
      dark: {
        blob1: "rgba(70,189,121,0.08)", blob2: "rgba(30,56,45,0.30)",
        canvasGlow: "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(70,189,121,0.05), transparent)",
        cardGlowShadow: "0 0 50px 1px rgba(70,189,121,0.10)",
        illBloom: "rgba(44,50,45,1)", illBloomEdge: "rgba(26,30,27,1)",
      },
    },
  },

  // EXPLORATION — "Cyber": neon HUD, TWO hues only — green ACTION + cyan signal.
  // Cool near-black base (dark) / cool steel (light), neon bloom, red+amber kept
  // as the only functional semantics. Lab candidate only.
  "Cyber": {
    palette: {
      light: {
        primary: "#0f7a43", onPrimary: "#ffffff", accent: "#0891b2", accentGlow: "#cfe9d4", ring: "#0f7a43",
        cursorGlow: "#0891b2", ink: "#0c1319", inkMuted: "#556069", background: "#eef2f5", surface: "#f8fbfc",
        surfaceRaised: "#eef2f5", surfaceLifted: "#f8fbfc", surfaceChip: "#ffffff", muted: "#e5ebee", secondary: "#d8efdf",
        border: "#d2dade", cardBorder: "#cfe0d6", inputBorder: "#c4ddcc", controlBorder: "#c0c8ce", input: "#d2dade",
        navActive: "#dcf2e2", sidebarAccent: "#e6f4ee", sidebarBorder: "#d2dade", danger: "#e11d48", warning: "#af5504", success: "#0e7a44",
        docPage: "#ffffff", docText: "#161d23", docTextMuted: "#556069", docCalloutBg: "#eef4f0", docCalloutBorder: "#0f7a43",
      },
      dark: {
        primary: "#37e07a", onPrimary: "#04120a", accent: "#0e333d", accentGlow: "#1a2a33", ring: "#5fe39a",
        cursorGlow: "#22d3ee", ink: "#e6ebf2", inkMuted: "#8a94a4", background: "#0c0e11", surface: "#15181d",
        surfaceRaised: "#1c2027", surfaceLifted: "#232830", surfaceChip: "#2a3039", muted: "#15181d", secondary: "#142a1e",
        border: "#2c313a", cardBorder: "#2c313a", inputBorder: "#2c313a", controlBorder: "#3b414c", input: "#2c313a",
        navActive: "#123528", sidebarAccent: "#12181f", sidebarBorder: "#2c313a", danger: "#ff4d5e", warning: "#f5b93f", success: "#7ef0a8",
        docPage: "#0f1216", docText: "#dfe5ea", docTextMuted: "#8f99a2", docCalloutBg: "#152a1e", docCalloutBorder: "#37e07a",
      },
    },
    illustration: { light: IDENTITY, dark: { moduleHue: 30, moduleBrightness: 0.95, docHue: 30, docBrightness: 0.95 } },
    fx: {
      light: {
        blob1: "rgba(210,240,224,0.50)", blob2: "rgba(215,238,242,0.50)",
        canvasGlow: "radial-gradient(ellipse 60% 50% at 50% 35%, color-mix(in srgb, var(--accent) 30%, transparent), transparent)",
        cardGlowShadow: "0 0 50px 1px rgba(15,122,67,0.14), 0 0 20px -6px rgba(8,145,178,0.20)",
        illBloom: "rgba(255,255,255,0.92)", illBloomEdge: "transparent",
      },
      dark: {
        blob1: "rgba(55,224,122,0.10)", blob2: "rgba(34,211,238,0.10)",
        canvasGlow: "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(55,224,122,0.06), transparent)",
        cardGlowShadow: "0 0 50px 1px rgba(55,224,122,0.12), 0 0 24px -6px rgba(34,211,238,0.18)",
        illBloom: "rgba(44,50,60,1)", illBloomEdge: "rgba(26,30,38,1)",
      },
    },
  },
};

export const VERSION_NAMES = Object.keys(CORTEX_VERSIONS);
