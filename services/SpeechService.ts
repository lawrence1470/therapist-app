import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import OpenAI from "openai";
import { SPEECH_CONFIG, SPEECH_ERRORS } from "../constants/Speech";

export interface AudioRecording {
  uri: string;
  duration: number;
}

class SpeechRecognitionService {
  private openai: OpenAI;
  private recording: Audio.Recording | null = null;
  private isInitialized = false;

  constructor() {
    this.openai = new OpenAI({
      apiKey: SPEECH_CONFIG.OPENAI_API_KEY,
    });
  }

  // Initialize audio permissions and settings
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request microphone permissions using expo-av
      const permission = await Audio.requestPermissionsAsync();
      const granted = permission.status === "granted";
      if (!granted) {
        throw new Error(SPEECH_ERRORS.PERMISSION_DENIED);
      }

      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Initialization failed: ${error}`);
    }
  }

  // OpenAI Whisper API transcription
  async transcribeWithWhisper(audioUri: string): Promise<string> {
    try {
      if (!SPEECH_CONFIG.OPENAI_API_KEY) {
        throw new Error(SPEECH_ERRORS.INVALID_API_KEY);
      }

      // Verify the file exists
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error("Audio file does not exist");
      }

      // For React Native, we need to use FormData and fetch directly
      // because the OpenAI client library doesn't handle React Native file uploads correctly
      const formData = new FormData();

      // Create the file object in the format React Native expects
      formData.append("file", {
        uri: audioUri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);

      formData.append("model", SPEECH_CONFIG.WHISPER_MODEL);
      formData.append("language", "en");
      formData.append("response_format", "json");

      // Make the API call directly using fetch
      // Note: Don't set Content-Type header when using FormData - browser/React Native will set it automatically with boundary
      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SPEECH_CONFIG.OPENAI_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error("Whisper transcription error:", error);
      throw new Error(SPEECH_ERRORS.TRANSCRIPTION_FAILED);
    }
  }

  // Start audio recording for Whisper API using expo-av
  async startRecording(): Promise<void> {
    try {
      await this.initialize();

      // Ensure audio mode allows recording on iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // High-quality preset (expo-av)
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
    } catch (error) {
      console.error("Recording start error:", error);
      throw new Error(SPEECH_ERRORS.RECORDING_FAILED);
    }
  }

  // Stop audio recording and return the recording details
  async stopRecording(): Promise<AudioRecording> {
    try {
      if (!this.recording) {
        throw new Error("No active recording");
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      if (!uri) {
        throw new Error("Recording URI not available");
      }

      // Duration is available in status
      const status = await this.recording.getStatusAsync();

      const result: AudioRecording = {
        uri,
        duration: (status as any).durationMillis ?? 0,
      };

      this.recording = null;
      return result;
    } catch (error) {
      console.error("Recording stop error:", error);
      throw new Error(SPEECH_ERRORS.RECORDING_FAILED);
    }
  }

  // Cleanup resources
  async cleanup(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      this.isInitialized = false;
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }
}

// Export singleton instance
export const speechService = new SpeechRecognitionService();
export default speechService;
