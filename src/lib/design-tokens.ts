// Apple HIG Design Tokens

export const colors = {
  // Primary
  primary: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',

  // Backgrounds
  background: '#F2F2F7',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#000000',
  textSecondary: '#8E8E93',

  // Borders
  separator: '#C6C6C8',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
}

export const shadows = {
  sm: '0 2px 4px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.12)',
  lg: '0 8px 24px rgba(0,0,0,0.16)',
}

export const touchTargets = {
  minimum: 44,
  preferred: 50,
  fab: 56,
}

export const animations = {
  navigationPush: '350ms ease-in-out',
  sheetPresent: '300ms spring',
  listItemTap: '150ms ease',
  cardHover: '200ms ease',
  loading: '1.5s loop',
}

export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
}