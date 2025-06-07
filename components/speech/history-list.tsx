import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface HistoryListProps {
  transcripts: string[];
  onClear?: () => void;
}

export function HistoryList({ transcripts, onClear }: HistoryListProps) {
  if (transcripts.length === 0) return null;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>History</ThemedText>
        <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
          <Ionicons name="trash" size={16} color="#ef4444" />
          <ThemedText style={styles.clearText}>Clear</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {transcripts.map((t, idx) => (
          <View key={idx} style={styles.item}>
            <ThemedText style={styles.itemText}>{t}</ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
  },
  clearText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "500",
  },
  list: {
    gap: 8,
  },
  item: {
    padding: 12,
    backgroundColor: "rgba(107, 114, 128, 0.05)",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  itemText: {
    fontSize: 14,
    lineHeight: 18,
  },
});
