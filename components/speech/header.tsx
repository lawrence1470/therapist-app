import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet } from "react-native";

interface SpeechHeaderProps {
  title?: string;
  subtitle?: string;
}

export function SpeechHeader({
  title = "Speech Therapy Assistant",
  subtitle = "Record your voice to get accurate transcriptions",
}: SpeechHeaderProps) {
  return (
    <ThemedView style={styles.header}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {subtitle ? (
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    gap: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
});
