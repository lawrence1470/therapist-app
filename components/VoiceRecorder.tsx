import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import SpeechService, {
  AudioRecording,
  TherapyResponse,
} from "../services/SpeechService";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface VoiceRecorderProps {
  onConversationUpdate?: (userMessage: string, therapyResponse: string) => void;
  placeholder?: string;
}

interface RecorderState {
  isRecording: boolean;
  isProcessing: boolean;
  isGeneratingResponse: boolean;
  isPlayingResponse: boolean;
  transcript: string;
  therapyResponse: TherapyResponse | null;
  error: string | null;
  hasPermission: boolean;
  currentRecording: AudioRecording | null;
}

export function VoiceRecorder({
  onConversationUpdate,
  placeholder = "Tap to start your therapy session...",
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isProcessing: false,
    isGeneratingResponse: false,
    isPlayingResponse: false,
    transcript: "",
    therapyResponse: null,
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
      setState((prev) => ({
        ...prev,
        isRecording: true,
        error: null,
        transcript: "",
        therapyResponse: null,
      }));
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

  // Stop recording and process therapy conversation
  const stopRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isRecording: false, isProcessing: true }));

      // Step 1: Stop recording and transcribe
      const recording = await SpeechService.stopRecording();
      setState((prev) => ({ ...prev, currentRecording: recording }));

      const transcript = await SpeechService.transcribeWithWhisper(
        recording.uri
      );
      setState((prev) => ({
        ...prev,
        transcript,
        isProcessing: false,
        isGeneratingResponse: true,
      }));

      // Step 2 & 3: Get therapy response and convert to speech
      const therapyResponse = await SpeechService.processTherapyConversation(
        transcript
      );
      setState((prev) => ({
        ...prev,
        therapyResponse,
        isGeneratingResponse: false,
        isPlayingResponse: true,
        error: null,
      }));

      // Step 4: Play the audio response
      if (therapyResponse.audioUri) {
        await SpeechService.playAudio(therapyResponse.audioUri);
      }

      setState((prev) => ({
        ...prev,
        isPlayingResponse: false,
      }));

      // Notify parent component
      onConversationUpdate?.(transcript, therapyResponse.text);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process recording";
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        isGeneratingResponse: false,
        isPlayingResponse: false,
        error: errorMessage,
      }));
      Alert.alert("Processing Error", errorMessage);
    }
  }, [onConversationUpdate]);

  // Toggle recording
  const toggle = useCallback(async () => {
    if (state.isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [state.isRecording, stopRecording, startRecording]);

  // Replay therapy response
  const replayResponse = useCallback(async () => {
    if (state.therapyResponse?.audioUri) {
      try {
        setState((prev) => ({ ...prev, isPlayingResponse: true, error: null }));
        await SpeechService.playAudio(state.therapyResponse.audioUri!);
        setState((prev) => ({ ...prev, isPlayingResponse: false }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to replay audio";
        setState((prev) => ({
          ...prev,
          isPlayingResponse: false,
          error: errorMessage,
        }));
      }
    }
  }, [state.therapyResponse]);

  // Stop audio playback
  const stopAudio = useCallback(async () => {
    try {
      await SpeechService.stopAudio();
      setState((prev) => ({ ...prev, isPlayingResponse: false }));
    } catch (error) {
      console.error("Stop audio error:", error);
    }
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    SpeechService.stopAudio();
    setState((prev) => ({
      ...prev,
      transcript: "",
      therapyResponse: null,
      error: null,
      currentRecording: null,
      isPlayingResponse: false,
    }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const getButtonColor = () => {
    if (state.isRecording) return "#ef4444"; // Red when recording
    if (state.isProcessing || state.isGeneratingResponse) return "#f59e0b"; // Orange when processing
    return "#3b82f6"; // Blue when idle
  };

  const getButtonIcon = () => {
    if (state.isProcessing || state.isGeneratingResponse)
      return "hourglass-outline";
    if (state.isRecording) return "stop";
    return "mic";
  };

  const getStatusText = () => {
    if (state.isRecording) return "Recording... Tap to stop";
    if (state.isProcessing) return "Transcribing with OpenAI Whisper...";
    if (state.isGeneratingResponse) return "Generating therapy response...";
    if (state.isPlayingResponse) return "Playing therapy response...";
    if (state.therapyResponse) return "Therapy response ready";
    return placeholder;
  };

  const formatDuration = (durationMs: number) => {
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isProcessingAny =
    state.isProcessing || state.isGeneratingResponse || state.isPlayingResponse;

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
        disabled={!state.hasPermission || isProcessingAny}
        activeOpacity={0.8}
      >
        <Ionicons name={getButtonIcon()} size={32} color="white" />
      </TouchableOpacity>

      {/* User Transcript */}
      {state.transcript && (
        <View style={styles.transcriptContainer}>
          <ThemedText style={styles.transcriptLabel}>You said:</ThemedText>
          <View style={styles.transcriptBox}>
            <ThemedText style={styles.transcriptText}>
              {state.transcript}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Therapy Response */}
      {state.therapyResponse && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <ThemedText style={styles.responseLabel}>
              Therapist response:
            </ThemedText>
            <View style={styles.audioControls}>
              {state.isPlayingResponse ? (
                <TouchableOpacity
                  onPress={stopAudio}
                  style={styles.audioButton}
                >
                  <Ionicons name="stop" size={20} color="#ef4444" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={replayResponse}
                  style={styles.audioButton}
                >
                  <Ionicons name="play" size={20} color="#3b82f6" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.responseBox}>
            <ThemedText style={styles.responseText}>
              {state.therapyResponse.text}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Clear Button */}
      {(state.transcript || state.therapyResponse) && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearConversation}
          disabled={isProcessingAny}
        >
          <ThemedText style={styles.clearButtonText}>
            Start New Session
          </ThemedText>
        </TouchableOpacity>
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
  responseContainer: {
    width: "100%",
    gap: 12,
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  responseBox: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  clearButton: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    marginTop: 8,
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
