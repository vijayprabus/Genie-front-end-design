/**
 * Violet light-mode color system — stress-test variant for /settings/apps-a
 * Mirrors the structure of contentTokens.ts (ws) so the Apps page can
 * be ported between systems by swapping the import.
 */
export const vs = {
  // Surfaces
  page: "var(--genie-gray-50)",            // page bg
  surface: "var(--genie-gray-0)",          // card surface, modal bg
  elevated: "var(--genie-gray-100)",       // elevated bg
  muted: "var(--genie-gray-100)",
  hoverBg: "var(--genie-fill-secondary)",  // translucent hover

  // Borders
  border: "var(--genie-gray-200)",
  divider: "var(--genie-gray-100)",
  inputBorder: "var(--genie-gray-300)",

  // Text (Apple HIG label hierarchy)
  heading: "var(--genie-label-primary)",
  body: "var(--genie-label-primary)",
  secondary: "var(--genie-label-secondary)",
  muted_text: "var(--genie-label-tertiary)",
  disabled: "var(--genie-label-quaternary)",

  // Brand
  primary: "var(--genie-violet-500)",
  primaryHover: "var(--genie-violet-600)",
  primaryDark: "var(--genie-violet-700)",
  primaryLight: "var(--genie-violet-50)",
  onPrimary: "#FFFFFF",

  // Semantics — three tiers each
  success: "var(--genie-success)",
  successBg: "var(--genie-success-bg)",
  successFg: "var(--genie-success-fg)",
  warning: "var(--genie-warning)",
  warningBg: "var(--genie-warning-bg)",
  warningFg: "var(--genie-warning-fg)",
  error: "var(--genie-danger)",
  errorBg: "var(--genie-danger-bg)",
  errorFg: "var(--genie-danger-fg)",
  errorBorder: "var(--genie-danger-bg)",
  errorHover: "var(--genie-danger-fg)",
  errorHoverBg: "var(--genie-danger-bg)",
  errorTextHover: "var(--genie-danger-fg)",

  // Toggle
  toggleBg: "var(--genie-gray-200)",

  // Effects (reuse existing ws shadows, they're neutral)
  cardShadow: "var(--ws-card-shadow)",
  cardBorder: "var(--ws-card-border)",
  searchShadow: "var(--ws-search-shadow)",
  searchBorder: "var(--ws-search-border)",
  buttonInnerHighlight: "var(--ws-button-inner-highlight)",
  focusRing: "0 0 0 3px var(--genie-violet-100)",
} as const;

// Same font constant as contentTokens.ts
export const f = "Inter, sans-serif";
