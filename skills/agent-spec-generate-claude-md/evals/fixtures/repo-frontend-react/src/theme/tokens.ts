// Fonte única de design tokens. Componentes NÃO usam valores mágicos — referenciam estes.
// Ritmo de espaçamento: múltiplos de 8px.
export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  pill: 9999,
} as const;

export const color = {
  bg: "#0B0D12",
  surface: "#161922",
  text: "#E6E8EC",
  accent: "#5B8DEF",
  danger: "#EF5B5B",
} as const;
