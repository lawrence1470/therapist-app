import React, { createContext, ReactNode, useContext } from "react";
import { useColorScheme } from "react-native";
import { DarkTheme, LightTheme, type Theme } from "../constants/Theme";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: Theme["colors"];
  typography: Theme["typography"];
  spacing: Theme["spacing"];
  borderRadius: Theme["borderRadius"];
  shadows: Theme["shadows"];
  animations: Theme["animations"];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  forceDark?: boolean; // Option to force dark mode
}

export function ThemeProvider({ children, forceDark }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const isDark = forceDark ?? systemColorScheme === "dark";
  const theme = isDark ? DarkTheme : LightTheme;

  const value: ThemeContextType = {
    theme,
    isDark,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows,
    animations: theme.animations,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Convenience hooks for specific theme parts
export function useColors() {
  return useTheme().colors;
}

export function useTypography() {
  return useTheme().typography;
}

export function useSpacing() {
  return useTheme().spacing;
}

export function useShadows() {
  return useTheme().shadows;
}
