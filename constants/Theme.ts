/**
 * Comprehensive Theme System for Therapist App
 * Inspired by the VoiceRecorder's beautiful dark aesthetic
 */

// Base color palette inspired by the VoiceRecorder
export const BaseColors = {
  // Primary dark slate palette (from VoiceRecorder gradients)
  slate: {
    950: "#0f172a", // Darkest
    900: "#1e293b", // Medium dark
    800: "#334155", // Medium
    700: "#475569",
    600: "#64748b",
    500: "#94a3b8",
    400: "#cbd5e1",
    300: "#e2e8f0",
    200: "#f1f5f9",
    100: "#f8fafc",
    50: "#fdfdfe",
  },

  // Emerald/green accent (from VoiceRecorder circle)
  emerald: {
    900: "#047857",
    800: "#059669",
    700: "#10b981", // Primary emerald
    600: "#34d399",
    500: "#6ee7b7",
    400: "#a7f3d0",
    300: "#d1fae5",
    200: "#ecfdf5",
    100: "#f0fdf4",
    50: "#f7fee7",
  },

  // Status colors
  red: {
    600: "#ef4444",
    500: "#f87171",
    400: "#fca5a5",
    300: "#fecaca",
    200: "#fef2f2",
  },

  amber: {
    600: "#f59e0b",
    500: "#f0bc4e",
    400: "#fbbf24",
    300: "#fcd34d",
    200: "#fef3c7",
  },

  blue: {
    600: "#3b82f6",
    500: "#60a5fa",
    400: "#93c5fd",
    300: "#dbeafe",
    200: "#eff6ff",
  },

  // Pure colors
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
} as const;

// Typography system
export const Typography = {
  families: {
    sans: "System", // Use system font for React Native
    mono: "Menlo", // Monospace for code
  },

  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
  },

  weights: {
    light: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing system (based on 4px grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  "7xl": 80,
  "8xl": 96,
} as const;

// Border radius system
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999,
} as const;

// Shadow system
export const Shadows = {
  sm: {
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: BaseColors.emerald[700],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
} as const;

// Animation durations
export const Animations = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

// Semantic color themes
export const LightTheme = {
  colors: {
    // Text colors
    text: {
      primary: BaseColors.slate[900],
      secondary: BaseColors.slate[600],
      muted: BaseColors.slate[500],
      inverse: BaseColors.white,
      accent: BaseColors.emerald[700],
    },

    // Background colors
    background: {
      primary: BaseColors.white,
      secondary: BaseColors.slate[50],
      tertiary: BaseColors.slate[100],
      card: BaseColors.white,
      overlay: "rgba(15, 23, 42, 0.5)",
      gradient: [
        BaseColors.slate[50],
        BaseColors.slate[100],
        BaseColors.slate[200],
      ],
    },

    // Interactive colors
    interactive: {
      primary: BaseColors.emerald[700],
      primaryHover: BaseColors.emerald[800],
      primaryPressed: BaseColors.emerald[900],
      secondary: BaseColors.slate[200],
      secondaryHover: BaseColors.slate[300],
      secondaryPressed: BaseColors.slate[400],
      disabled: BaseColors.slate[300],
    },

    // Status colors
    status: {
      success: BaseColors.emerald[700],
      warning: BaseColors.amber[600],
      error: BaseColors.red[600],
      info: BaseColors.blue[600],
    },

    // Border colors
    border: {
      primary: BaseColors.slate[200],
      secondary: BaseColors.slate[300],
      accent: BaseColors.emerald[700],
      focus: BaseColors.emerald[500],
    },

    // Surface colors
    surface: {
      primary: BaseColors.white,
      secondary: BaseColors.slate[50],
      tertiary: BaseColors.slate[100],
      overlay: BaseColors.slate[900],
    },
  },

  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animations: Animations,
} as const;

export const DarkTheme = {
  colors: {
    // Text colors (inspired by VoiceRecorder)
    text: {
      primary: BaseColors.slate[200], // #f1f5f9
      secondary: BaseColors.slate[500], // #94a3b8
      muted: BaseColors.slate[600], // #64748b
      inverse: BaseColors.slate[900],
      accent: BaseColors.emerald[700],
    },

    // Background colors (from VoiceRecorder gradient)
    background: {
      primary: BaseColors.slate[950], // #0f172a
      secondary: BaseColors.slate[900], // #1e293b
      tertiary: BaseColors.slate[800], // #334155
      card: BaseColors.slate[900],
      overlay: "rgba(0, 0, 0, 0.7)",
      gradient: [
        BaseColors.slate[950],
        BaseColors.slate[900],
        BaseColors.slate[800],
      ], // VoiceRecorder gradient
    },

    // Interactive colors (emerald accent from VoiceRecorder)
    interactive: {
      primary: BaseColors.emerald[700], // #10b981
      primaryHover: BaseColors.emerald[600],
      primaryPressed: BaseColors.emerald[800],
      secondary: BaseColors.slate[700],
      secondaryHover: BaseColors.slate[600],
      secondaryPressed: BaseColors.slate[800],
      disabled: BaseColors.slate[700],
    },

    // Status colors
    status: {
      success: BaseColors.emerald[700],
      warning: BaseColors.amber[500],
      error: BaseColors.red[500],
      info: BaseColors.blue[500],
    },

    // Border colors
    border: {
      primary: BaseColors.slate[700],
      secondary: BaseColors.slate[600],
      accent: BaseColors.emerald[700],
      focus: BaseColors.emerald[500],
    },

    // Surface colors
    surface: {
      primary: BaseColors.slate[900],
      secondary: BaseColors.slate[800],
      tertiary: BaseColors.slate[700],
      overlay: BaseColors.slate[950],
    },
  },

  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animations: Animations,
} as const;

// Theme types
export type LightThemeType = typeof LightTheme;
export type DarkThemeType = typeof DarkTheme;
export type Theme = LightThemeType | DarkThemeType;
export type ColorName = keyof DarkThemeType["colors"];
export type ColorVariant = keyof DarkThemeType["colors"]["text"];

// Utility functions
export const ThemeUtils = {
  withOpacity: (color: string, opacity: number) => {
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },

  getElevationStyle: (elevation: keyof typeof Shadows) => {
    return Shadows[elevation];
  },

  // Gradient utility for VoiceRecorder-style backgrounds
  createGradientBackground: (colors: string[]) => ({
    colors,
    style: { flex: 1 },
  }),
} as const;

// Predefined gradients inspired by VoiceRecorder
export const Gradients = {
  primary: [
    BaseColors.slate[950],
    BaseColors.slate[900],
    BaseColors.slate[800],
  ], // VoiceRecorder main
  emerald: [
    BaseColors.emerald[700],
    BaseColors.emerald[800],
    BaseColors.emerald[900],
  ], // VoiceRecorder circle
  subtle: [BaseColors.slate[900], BaseColors.slate[800]],
  glow: [
    ThemeUtils.withOpacity(BaseColors.emerald[700], 0.1),
    ThemeUtils.withOpacity(BaseColors.emerald[700], 0.3),
  ],
} as const;

// Component-specific theme tokens
export const ComponentTokens = {
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 56,
    },
    padding: {
      sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
      md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
      lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
    },
  },

  input: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },

  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },

  // VoiceRecorder-inspired circle dimensions
  circle: {
    sm: 80,
    md: 120,
    lg: 160,
    xl: 200, // VoiceRecorder size
    xxl: 240,
  },
} as const;

export default DarkTheme;
