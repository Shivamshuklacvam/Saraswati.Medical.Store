// Design tokens for Saraswati Medical Store
export const COLORS = {
    // Brand Palette from Design Reference
    primary: '#A8B5A0',      // Sage Green
    onPrimary: '#FFFFFF',
    secondary: '#D4A5A5',    // Dusty Rose
    onSecondary: '#FFFFFF',
    tertiary: '#E8DCC4',     // Beige
    onTertiary: '#1A1710',
    background: '#FAF7F2',   // Warm Off-white
    surface: '#FFFFFF',
    surfaceAlt: '#F7F3EF',
    successLight: '#E8F5E9',

    // Derived/Legacy compatibility
    primaryLight: '#C3CEBD',
    primaryDark: '#7D8C75',
    primarySurface: '#F0F4EF',

    // Emphasis & Common
    black: '#1A1710',
    white: '#FFFFFF',

    // Text
    textPrimary: '#1A1710',
    textSecondary: '#5A5854',
    textMuted: '#9A9894',
    textOnPrimary: '#FFFFFF',

    // Status
    error: '#C14B4B',
    success: '#6B8E6F',
    warning: '#F4A226',

    // UI Elements
    border: '#E8E2DD',
    borderLight: '#F3EFEC',
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
};

export const RADIUS = {
    none: 0,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    full: 9999,
    round: 9999, // Alias for legacy 'round'
};

export const SPACING = {
    none: 0,
    xs: 6,
    sm: 12,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
    xxxl: 96,
};

export const TYPOGRAPHY = {
    display_large: 57,
    display_medium: 45,
    display_small: 36,
    headline_large: 32,
    headline_medium: 28,
    headline_small: 24,
    title_large: 22,
    title_medium: 16,
    title_small: 14,
    body_large: 16,
    body_medium: 14,
    body_small: 12,
    label_large: 14,
    label_medium: 12,
    label_small: 11,
};

export const SHADOW = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    strong: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
};
