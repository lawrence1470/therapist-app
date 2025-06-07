import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import SpeechService, { AudioRecording } from "../services/SpeechService";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface VoiceRecorderProps {
  onTranscriptReceived?: (transcript: string) => void;
  placeholder?: string;
}

interface RecorderState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
  hasPermission: boolean;
  currentRecording: AudioRecording | null;
}

export function VoiceRecorder({
  onTranscriptReceived,
  placeholder = "Tap to record your voice...",
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isProcessing: false,
    transcript: "",
    error: null,
    hasPermission: false,
    currentRecording: null,
  });

  // Initialize speech service
  const initialize = useCallback(async () => {
    try {
      await SpeechService.initialize();
      setState((prev) => ({ ...prev, hasPermission: true, error: null }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initialize speech recognition";
      setState((prev) => ({
        ...prev,
        hasPermission: false,
        error: errorMessage,
      }));
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isRecording: true, error: null }));
      await SpeechService.startRecording();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start recording";
      setState((prev) => ({
        ...prev,
        isRecording: false,
        error: errorMessage,
      }));
      Alert.alert("Recording Error", errorMessage);
    }
  }, []);

  // Stop recording and transcribe
  const stopRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isRecording: false, isProcessing: true }));
      const recording = await SpeechService.stopRecording();
      setState((prev) => ({ ...prev, currentRecording: recording }));

      const transcript = await SpeechService.transcribeWithWhisper(
        recording.uri
      );
      setState((prev) => ({
        ...prev,
        transcript,
        isProcessing: false,
        error: null,
      }));
      onTranscriptReceived?.(transcript);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process recording";
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));
      Alert.alert("Processing Error", errorMessage);
    }
  }, [onTranscriptReceived]);

  // Toggle recording
  const toggle = useCallback(async () => {
    if (state.isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [state.isRecording, stopRecording, startRecording]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: "",
      error: null,
      currentRecording: null,
    }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const getButtonColor = () => {
    if (state.isRecording) return "#ef4444"; // Red when recording
    if (state.isProcessing) return "#f59e0b"; // Orange when processing
    return "#3b82f6"; // Blue when idle
  };

  const getButtonIcon = () => {
    if (state.isProcessing) return "hourglass-outline";
    if (state.isRecording) return "stop";
    return "mic";
  };

  const getStatusText = () => {
    if (state.isProcessing) return "Processing with OpenAI Whisper...";
    if (state.isRecording) return "Recording... Tap to stop";
    if (state.transcript) return "Transcription complete";
    return placeholder;
  };

  const formatDuration = (durationMs: number) => {
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <ThemedView style={styles.container}>
      {/* Status Display */}
      <View style={styles.statusContainer}>
        <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>

        {state.error && (
          <ThemedText style={styles.errorText}>{state.error}</ThemedText>
        )}

        {state.currentRecording && (
          <ThemedText style={styles.durationText}>
            Duration: {formatDuration(state.currentRecording.duration)}
          </ThemedText>
        )}
      </View>

      {/* Record Button */}
      <TouchableOpacity
        style={[styles.recordButton, { backgroundColor: getButtonColor() }]}
        onPress={toggle}
        disabled={!state.hasPermission || state.isProcessing}
        activeOpacity={0.8}
      >
        <Ionicons name={getButtonIcon()} size={32} color="white" />
      </TouchableOpacity>

      {/* Transcript Display */}
      {state.transcript && (
        <View style={styles.transcriptContainer}>
          <ThemedText style={styles.transcriptLabel}>Transcript:</ThemedText>
          <View style={styles.transcriptBox}>
            <ThemedText style={styles.transcriptText}>
              {state.transcript}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearTranscript}
          >
            <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Permission Warning */}
      {!state.hasPermission && (
        <View style={styles.permissionWarning}>
          <Ionicons name="warning" size={20} color="#f59e0b" />
          <ThemedText style={styles.permissionText}>
            Microphone permission required for voice recording
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    gap: 20,
  },
  statusContainer: {
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
  },
  durationText: {
    fontSize: 12,
    opacity: 0.6,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  transcriptContainer: {
    width: "100%",
    gap: 12,
  },
  transcriptLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  transcriptBox: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
  },
  clearButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
  },
  permissionWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 8,
  },
  permissionText: {
    fontSize: 14,
    color: "#f59e0b",
  },
});
