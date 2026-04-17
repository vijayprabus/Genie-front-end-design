/**
 * Canonical design tokens for content-zone pages.
 *
 * This is the SINGLE SOURCE OF TRUTH for all inline-styled pages
 * (Settings, Instructions, Home, etc.). Import this instead of
 * defining a local `const ws = {...}`.
 *
 * Sidebar has its own extended palette in SettingsSidebar.tsx — that's
 * intentional (different bg zone). But sidebar tokens that overlap
 * with content (primary, success, error, etc.) must match these values.
 */

/** Content-zone color tokens — warm stone + deep violet */
export const ws = {
  // Backgrounds
  page:         "#FAF8F5",
  surface:      "#FFFDF9",
  elevated:     "#F5F0EB",
  muted:        "#F0EBE4",   // also used as accent/divider bg
  hoverBg:      "#EDE8E3",
  border:       "#E7E0D8",
  divider:      "#F0EBE4",
  inputBorder:  "#D6D3D1",

  // Text
  heading:      "#292524",
  body:         "#44403C",
  secondary:    "#78716C",
  muted_text:   "#A8A29E",
  disabled:     "#D6D3D1",

  // Brand
  primary:      "#7C3AED",
  primaryHover: "#6D28D9",
  primaryDark:  "#5B21B6",
  primaryLight: "#EDE9FE",

  // Semantic
  success:      "#10B981",
  successBg:    "#ECFDF5",
  successFg:    "#065F46",
  warning:      "#F59E0B",
  warningBg:    "#FFFBEB",
  warningFg:    "#92400E",
  error:        "#E11D48",
  errorBg:      "#FFF1F2",
  errorFg:      "#9F1239",
  errorBorder:  "#FECACA",
} as const;

/** Font family constant */
export const f = "Inter, sans-serif";

/** Spring easing for panel/sidebar animations */
export const spring = "cubic-bezier(0.22, 1, 0.36, 1)";

export type ContentTokens = typeof ws;
