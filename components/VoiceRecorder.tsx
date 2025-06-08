import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import SpeechService, {
  AudioRecording,
  TherapyResponse,
} from "../services/SpeechService";
import { ThemedText } from "./ThemedText";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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
  placeholder = "What Can I Do for You Today?",
}: VoiceRecorderProps) {
  console.log("🎉 VoiceRecorder component rendered!");

  const { colors } = require("../contexts/ThemeContext").useTheme();

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

  // Animation values
  const pulseAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);
  const rotationAnimation = useSharedValue(0);

  // Initialize speech service
  const initialize = useCallback(async () => {
    console.log("🚀 Initializing speech service...");
    try {
      await SpeechService.initialize();
      console.log("✅ Speech service initialized successfully");
      setState((prev) => ({ ...prev, hasPermission: true, error: null }));
    } catch (error) {
      console.error("❌ Speech service initialization failed:", error);
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

  // Start animations based on state
  useEffect(() => {
    if (state.isRecording) {
      // Recording animations
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
      glowAnimation.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
      scaleAnimation.value = withSpring(1.1);
    } else if (state.isProcessing || state.isGeneratingResponse) {
      // Processing animations
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 800 }),
        -1,
        true
      );
      rotationAnimation.value = withRepeat(
        withTiming(360, { duration: 2000 }),
        -1,
        false
      );
      scaleAnimation.value = withSpring(1.05);
    } else if (state.isPlayingResponse) {
      // Playing animations
      glowAnimation.value = withRepeat(
        withTiming(1, { duration: 1200 }),
        -1,
        true
      );
      scaleAnimation.value = withSpring(1.08);
    } else {
      // Idle state
      pulseAnimation.value = withTiming(0, { duration: 500 });
      glowAnimation.value = withTiming(0, { duration: 500 });
      scaleAnimation.value = withSpring(1);
      rotationAnimation.value = withTiming(0, { duration: 500 });
    }
  }, [
    state.isRecording,
    state.isProcessing,
    state.isGeneratingResponse,
    state.isPlayingResponse,
  ]);

  // Animated styles
  const animatedCircleStyle = useAnimatedStyle(() => {
    const pulseScale = interpolate(pulseAnimation.value, [0, 1], [1, 1.2]);
    const glowOpacity = interpolate(glowAnimation.value, [0, 1], [0.3, 0.8]);

    return {
      transform: [
        { scale: scaleAnimation.value * pulseScale },
        { rotate: `${rotationAnimation.value}deg` },
      ],
      opacity: glowOpacity,
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    const glowScale = interpolate(glowAnimation.value, [0, 1], [1, 1.5]);
    const glowOpacity = interpolate(glowAnimation.value, [0, 1], [0.1, 0.4]);

    return {
      transform: [{ scale: glowScale }],
      opacity: glowOpacity,
    };
  });

  // Start recording
  const startRecording = useCallback(async () => {
    console.log("🎤 Starting recording...");
    try {
      setState((prev) => ({
        ...prev,
        isRecording: true,
        error: null,
        transcript: "",
        therapyResponse: null,
      }));
      await SpeechService.startRecording();
      console.log("✅ Recording started successfully");
    } catch (error) {
      console.error("❌ Recording error:", error);
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
    console.log(
      "🔄 Toggle called - isRecording:",
      state.isRecording,
      "hasPermission:",
      state.hasPermission
    );
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

  const getStatusText = () => {
    if (state.isRecording) return "Listening...";
    if (state.isProcessing) return "Transcribing...";
    if (state.isGeneratingResponse) return "Thinking...";
    if (state.isPlayingResponse) return "Speaking...";
    if (state.therapyResponse) return "Tap to speak again";
    return placeholder;
  };

  const getSubtitleText = () => {
    if (state.isRecording) return "Tap to stop recording";
    if (state.isProcessing || state.isGeneratingResponse)
      return "Processing your message";
    if (state.isPlayingResponse) return "Playing response";
    if (state.therapyResponse) return "Ready for your next message";
    return "Tap the circle to start";
  };

  const isProcessingAny =
    state.isProcessing || state.isGeneratingResponse || state.isPlayingResponse;

  return (
    <LinearGradient
      colors={colors.background.gradient}
      style={styles.container}
    >
      {/* Header Status */}
      <View style={styles.headerContainer}>
        <ThemedText style={styles.subtitleText}>{getSubtitleText()}</ThemedText>
        {/* Debug Info */}
        <ThemedText style={styles.debugText}>
          Permission: {state.hasPermission ? "✅" : "❌"} | Processing:{" "}
          {isProcessingAny ? "✅" : "❌"}
        </ThemedText>
        {/* Simple test button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => console.log("🧪 Test button works!")}
        >
          <ThemedText style={styles.testButtonText}>Test Touch</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Main Title */}
      <View style={styles.titleContainer}>
        <ThemedText style={styles.titleText}>{getStatusText()}</ThemedText>
      </View>

      {/* Central Circle Animation */}
      <View style={styles.circleContainer}>
        {/* Outer Glow */}
        <Animated.View style={[styles.outerGlow, animatedGlowStyle]} />

        {/* Inner Rings - Behind the button */}
        <View
          style={[styles.innerRing1, { position: "absolute", zIndex: 1 }]}
        />
        <View
          style={[styles.innerRing2, { position: "absolute", zIndex: 1 }]}
        />
        <View
          style={[styles.innerRing3, { position: "absolute", zIndex: 1 }]}
        />

        {/* Main Circle - Above the rings */}
        <TouchableOpacity
          style={[styles.mainCircleButton, { zIndex: 2 }]}
          onPress={() => {
            console.log(
              "🎯 Button tapped! hasPermission:",
              state.hasPermission,
              "isProcessingAny:",
              isProcessingAny
            );
            toggle();
          }}
          disabled={isProcessingAny}
          activeOpacity={0.9}
        >
          <Animated.View style={[styles.mainCircle, animatedCircleStyle]}>
            <LinearGradient
              colors={[
                colors.interactive.primary,
                colors.interactive.primaryPressed,
                "#047857",
              ]}
              style={styles.circleGradient}
            >
              <View style={styles.circleContent}>
                <Ionicons
                  name={state.isRecording ? "stop" : "mic"}
                  size={40}
                  color="white"
                />
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* User Transcript */}
      {state.transcript && (
        <View style={styles.transcriptContainer}>
          <ThemedText style={styles.transcriptLabel}>You said:</ThemedText>
          <View style={styles.messageBox}>
            <ThemedText style={styles.messageText}>
              {state.transcript}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Therapy Response */}
      {state.therapyResponse && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <ThemedText style={styles.responseLabel}>Therapist:</ThemedText>
            <TouchableOpacity
              onPress={state.isPlayingResponse ? stopAudio : replayResponse}
              style={styles.playButton}
            >
              <Ionicons
                name={state.isPlayingResponse ? "stop" : "play"}
                size={18}
                color="#10b981"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.messageBox}>
            <ThemedText style={styles.messageText}>
              {state.therapyResponse.text}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        {(state.transcript || state.therapyResponse) && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearConversation}
            disabled={isProcessingAny}
          >
            <ThemedText style={styles.clearButtonText}>New Session</ThemedText>
          </TouchableOpacity>
        )}

        {/* Error Display */}
        {state.error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={16} color="#ef4444" />
            <ThemedText style={styles.errorText}>{state.error}</ThemedText>
          </View>
        )}

        {/* Permission Warning */}
        {!state.hasPermission && (
          <View style={styles.permissionWarning}>
            <Ionicons name="mic-off" size={20} color="#f59e0b" />
            <ThemedText style={styles.permissionText}>
              Microphone access needed
            </ThemedText>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  subtitleText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
  },
  debugText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },
  testButton: {
    padding: 8,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    marginTop: 8,
  },
  testButtonText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "300",
    color: "#f1f5f9",
    textAlign: "center",
    lineHeight: 40,
    maxWidth: screenWidth * 0.8,
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  outerGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#10b981",
    opacity: 0.1,
  },
  mainCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    elevation: 20,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  circleGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  mainCircleButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  circleButton: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  circleContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  innerRing1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  innerRing2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  innerRing3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.1)",
  },
  transcriptContainer: {
    width: "100%",
    marginTop: 40,
    gap: 12,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 8,
  },
  responseContainer: {
    width: "100%",
    gap: 12,
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  messageBox: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#f1f5f9",
  },
  bottomContainer: {
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  clearButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  clearButtonText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    flex: 1,
  },
  permissionWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  permissionText: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "500",
  },
});
