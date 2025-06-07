export const SPEECH_CONFIG = {
  // OpenAI API Configuration
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "", // Set this in your .env file
  WHISPER_MODEL: "whisper-1",

  // Voice Recognition Configuration
  VOICE_RECOGNITION_LANGUAGE: "en-US",
  VOICE_RECOGNITION_TIMEOUT: 5000,

  // Audio Recording Configuration
  AUDIO_QUALITY: {
    android: {
      extension: ".m4a",
      outputFormat: 2, // MPEG_4
      audioEncoder: 3, // AAC
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".m4a",
      outputFormat: "ios_mpeg4AAC",
      audioQuality: 1, // Medium quality
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  },
};

export const SPEECH_ERRORS = {
  PERMISSION_DENIED: "Microphone permission denied",
  NO_SPEECH_DETECTED: "No speech detected",
  NETWORK_ERROR: "Network error occurred",
  TRANSCRIPTION_FAILED: "Transcription failed",
  RECORDING_FAILED: "Recording failed",
  INVALID_API_KEY: "Invalid OpenAI API key",
};
