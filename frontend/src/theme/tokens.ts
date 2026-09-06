/**
 * Design token constants that mirror the CSS custom properties
 * defined in globals.css. Use for programmatic access (e.g.
 * chart colours, canvas rendering) where Tailwind classes
 * cannot be applied directly.
 */

export const RADIUS = {
  sm: "calc(var(--radius) - 4px)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) + 4px)",
  full: "9999px",
} as const;

export const TRANSITION = {
  fast: "150ms ease",
  base: "200ms ease",
  slow: "300ms ease",
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
