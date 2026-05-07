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
 *
 * All values are CSS variable references so theme overrides via
 * [data-theme="..."] wrapper elements work automatically.
 */

/** Content-zone color tokens — warm stone + deep violet (default) */
export const ws = {
  // Backgrounds
  page:         "var(--ws-page)",
  surface:      "var(--ws-surface)",
  elevated:     "var(--ws-elevated)",
  muted:        "var(--ws-muted)",
  hoverBg:      "var(--ws-hover-bg)",
  border:       "var(--ws-border)",
  divider:      "var(--ws-divider)",
  inputBorder:  "var(--ws-input-border)",

  // Text
  heading:      "var(--ws-heading)",
  body:         "var(--ws-body)",
  secondary:    "var(--ws-secondary)",
  muted_text:   "var(--ws-muted-text)",
  disabled:     "var(--ws-disabled)",

  // Brand
  brandLogo:    "var(--ws-brand-logo)",
  primary:      "var(--ws-primary)",
  primaryHover: "var(--ws-primary-hover)",
  primaryDark:  "var(--ws-primary-dark)",
  primaryLight: "var(--ws-primary-light)",

  // Semantic
  success:      "var(--ws-success)",
  successBg:    "var(--ws-success-bg)",
  successFg:    "var(--ws-success-fg)",
  warning:      "var(--ws-warning)",
  warningBg:    "var(--ws-warning-bg)",
  warningFg:    "var(--ws-warning-fg)",
  error:        "var(--ws-error)",
  errorBg:      "var(--ws-error-bg)",
  errorFg:      "var(--ws-error-fg)",
  errorBorder:  "var(--ws-error-border)",

  // Extra tokens for inline hex leaks
  errorHover:     "var(--ws-error-hover)",
  errorHoverBg:   "var(--ws-error-hover-bg)",
  errorTextHover: "var(--ws-error-text-hover)",
  toggleBg:       "var(--ws-toggle-bg)",
  onPrimary:      "var(--ws-on-primary)",

  // Effect tokens — CSS-var driven, no-op in :root, active under theme variants
  buttonInnerHighlight: "var(--ws-button-inner-highlight)",
  cardShadow:           "var(--ws-card-shadow)",
  cardBorder:           "var(--ws-card-border)",
  sidebarEdge:          "var(--ws-sidebar-edge)",
  searchShadow:         "var(--ws-search-shadow)",
  searchBorder:         "var(--ws-search-border)",
  focusRing:            "var(--ws-focus-ring)",

  // Sidebar-specific tokens (SettingsSidebar palette)
  sidebarBg:           "var(--ws-sidebar-bg)",
  sidebarZone:         "var(--ws-sidebar-zone)",
  sidebarDivider:      "var(--ws-sidebar-divider)",
  sidebarBody:         "var(--ws-sidebar-body)",
  sidebarIconRest:     "var(--ws-sidebar-icon-rest)",
  sidebarIconHover:    "var(--ws-sidebar-icon-hover)",
  sidebarKbHint:       "var(--ws-sidebar-kb-hint)",
  sidebarActiveBg:     "var(--ws-sidebar-active-bg)",
  sidebarActiveHoverBg:"var(--ws-sidebar-active-hover-bg)",
  sidebarHoverBg:      "var(--ws-sidebar-hover-bg)",
  sidebarFocusRing:    "var(--ws-sidebar-focus-ring)",
  sidebarScrollbar:    "var(--ws-sidebar-scrollbar)",
  sidebarScrollbarHover:"var(--ws-sidebar-scrollbar-hover)",
  sidebarSectionLabel: "var(--ws-sidebar-section-label)",
  sidebarIconBtnHover: "var(--ws-sidebar-icon-btn-hover)",

  // Active nav row text/icon — defaults to existing values, overridable per-theme
  sidebarActiveText:   "var(--ws-sidebar-active-text)",
  sidebarActiveIcon:   "var(--ws-sidebar-active-icon)",

  // Sidebar brand text and tooltip — default to page-context, inverted in E2 dark
  sidebarBrandText:    "var(--ws-sidebar-brand-text)",
  sidebarTooltipBg:    "var(--ws-sidebar-tooltip-bg)",
  sidebarTooltipText:  "var(--ws-sidebar-tooltip-text)",

  // Active pill — compound active state (sidebar micro-interaction)
  activePillBg:        "var(--ws-active-pill-bg)",
  activePillHover:     "var(--ws-active-pill-hover)",
};

/** Font family constant */
export const f = "Inter, sans-serif";

/** Spring easing for panel/sidebar animations */
export const spring = "cubic-bezier(0.22, 1, 0.36, 1)";

export type ContentTokens = typeof ws;
