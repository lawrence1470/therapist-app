import { StyleSheet, Text, type TextProps } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export type ThemedTextProps = TextProps & {
  color?: "primary" | "secondary" | "muted" | "inverse" | "accent";
  type?:
    | "default"
    | "title"
    | "subtitle"
    | "caption"
    | "link"
    | "body"
    | "headline";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
};

export function ThemedText({
  style,
  color = "primary",
  type = "default",
  weight,
  ...rest
}: ThemedTextProps) {
  const { colors, typography } = useTheme();

  const textColor = colors.text[color];
  const typeStyle = styles[type];
  const weightStyle = weight
    ? { fontWeight: typography.weights[weight] }
    : undefined;

  return (
    <Text
      style={[{ color: textColor }, typeStyle, weightStyle, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
  },
  headline: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    textDecorationLine: "underline",
  },
});
