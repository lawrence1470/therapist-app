import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SpeechHeader } from "@/components/speech/header";
import { HistoryList } from "@/components/speech/history-list";
import { ThemedView } from "@/components/ThemedView";
import { VoiceRecorder } from "@/components/VoiceRecorder";

export default function SpeechScreen() {
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);

  const handleTranscriptReceived = (transcript: string) => {
    if (transcript.trim()) {
      setTranscriptHistory((prev) => [transcript, ...prev].slice(0, 10)); // Keep last 10 transcripts
    }
  };

  const clearHistory = () => {
    setTranscriptHistory([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <SpeechHeader />

        {/* Voice Recorder */}
        <ThemedView style={styles.speechContainer}>
          <VoiceRecorder
            onTranscriptReceived={handleTranscriptReceived}
            placeholder="Tap the microphone to start recording your speech exercises"
          />
        </ThemedView>

        {/* Transcript History */}
        <HistoryList transcripts={transcriptHistory} onClear={clearHistory} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  speechContainer: {
    minHeight: 300,
  },
  historyContainer: {
    gap: 12,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
  },
  clearHistoryText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "500",
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    padding: 12,
    backgroundColor: "rgba(107, 114, 128, 0.05)",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  historyItemText: {
    fontSize: 14,
    lineHeight: 18,
  },
  setupContainer: {
    gap: 12,
  },
  setupContent: {
    gap: 16,
  },
  setupText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  setupBold: {
    fontWeight: "600",
    opacity: 1,
  },
});
