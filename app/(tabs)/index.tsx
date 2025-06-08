import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SpeechHeader } from "@/components/speech/header";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Ionicons } from "@expo/vector-icons";

interface ConversationEntry {
  id: string;
  userMessage: string;
  therapistResponse: string;
  timestamp: Date;
}

export default function SpeechScreen() {
  const [conversationHistory, setConversationHistory] = useState<
    ConversationEntry[]
  >([]);

  const handleConversationUpdate = (
    userMessage: string,
    therapistResponse: string
  ) => {
    if (userMessage.trim() && therapistResponse.trim()) {
      const newEntry: ConversationEntry = {
        id: Date.now().toString(),
        userMessage,
        therapistResponse,
        timestamp: new Date(),
      };
      setConversationHistory((prev) => [newEntry, ...prev].slice(0, 5)); // Keep last 5 conversations
    }
  };

  const clearHistory = () => {
    setConversationHistory([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
            onConversationUpdate={handleConversationUpdate}
            placeholder="Tap the microphone to start your therapy session"
          />
        </ThemedView>

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <ThemedView style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <ThemedText style={styles.sectionTitle}>
                Recent Sessions
              </ThemedText>
              <TouchableOpacity
                style={styles.clearHistoryButton}
                onPress={clearHistory}
              >
                <Ionicons name="trash-outline" size={12} color="#ef4444" />
                <ThemedText style={styles.clearHistoryText}>
                  Clear History
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.historyList}>
              {conversationHistory.map((conversation) => (
                <View key={conversation.id} style={styles.conversationItem}>
                  <View style={styles.conversationHeader}>
                    <ThemedText style={styles.conversationTime}>
                      {formatTime(conversation.timestamp)}
                    </ThemedText>
                  </View>

                  {/* User Message */}
                  <View style={styles.userMessageContainer}>
                    <ThemedText style={styles.messageLabel}>You:</ThemedText>
                    <ThemedText style={styles.userMessage}>
                      {conversation.userMessage}
                    </ThemedText>
                  </View>

                  {/* Therapist Response */}
                  <View style={styles.therapistMessageContainer}>
                    <ThemedText style={styles.messageLabel}>
                      Therapist:
                    </ThemedText>
                    <ThemedText style={styles.therapistMessage}>
                      {conversation.therapistResponse}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </ThemedView>
        )}
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
    minHeight: 350,
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
    gap: 16,
  },
  conversationItem: {
    padding: 16,
    backgroundColor: "rgba(107, 114, 128, 0.05)",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    gap: 12,
  },
  conversationHeader: {
    alignItems: "flex-end",
  },
  conversationTime: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: "500",
  },
  userMessageContainer: {
    gap: 4,
  },
  therapistMessageContainer: {
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(107, 114, 128, 0.1)",
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  userMessage: {
    fontSize: 14,
    lineHeight: 18,
    paddingLeft: 8,
  },
  therapistMessage: {
    fontSize: 14,
    lineHeight: 18,
    paddingLeft: 8,
    fontStyle: "italic",
  },
});
