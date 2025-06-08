import { View, type ViewProps } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export type ThemedViewProps = ViewProps & {
  background?: "primary" | "secondary" | "tertiary" | "card" | "overlay";
  surface?: "primary" | "secondary" | "tertiary" | "overlay";
};

export function ThemedView({
  style,
  background = "primary",
  surface,
  ...otherProps
}: ThemedViewProps) {
  const { colors } = useTheme();

  const backgroundColor = surface
    ? colors.surface[surface]
    : colors.background[background];

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
