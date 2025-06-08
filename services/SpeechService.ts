import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import OpenAI from "openai";
import { SPEECH_CONFIG, SPEECH_ERRORS } from "../constants/Speech";

export interface AudioRecording {
  uri: string;
  duration: number;
}

export interface TherapyResponse {
  text: string;
  audioUri?: string;
}

class SpeechRecognitionService {
  private openai: OpenAI;
  private recording: Audio.Recording | null = null;
  private playbackObject: Audio.Sound | null = null;
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

  // Step 2: Send text to OpenAI for therapy response
  async getChatResponse(userMessage: string): Promise<string> {
    try {
      if (!SPEECH_CONFIG.OPENAI_API_KEY) {
        throw new Error(SPEECH_ERRORS.INVALID_API_KEY);
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a calming, empathetic AI therapist. Your role is to:
            - Listen actively and validate the user's feelings
            - Ask thoughtful follow-up questions to encourage deeper reflection
            - Provide gentle guidance and coping strategies
            - Use a warm, non-judgmental tone
            - Keep responses concise but meaningful (2-3 sentences)
            - Never provide medical diagnoses or replace professional mental health care
            - Encourage professional help when appropriate`,
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return (
        response.choices[0].message.content ||
        "I'm here to listen. Could you tell me more about what's on your mind?"
      );
    } catch (error) {
      console.error("Chat completion error:", error);
      throw new Error("Failed to get therapy response. Please try again.");
    }
  }

  // Step 3: Convert text to speech using OpenAI TTS
  async textToSpeech(text: string): Promise<string> {
    try {
      if (!SPEECH_CONFIG.OPENAI_API_KEY) {
        throw new Error(SPEECH_ERRORS.INVALID_API_KEY);
      }

      // Use fetch directly for better React Native compatibility
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SPEECH_CONFIG.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          voice: "nova", // Calm, soothing voice perfect for therapy
          input: text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `TTS API request failed: ${response.status} ${errorData}`
        );
      }

      // Get the audio data as array buffer
      const arrayBuffer = await response.arrayBuffer();

      // Convert ArrayBuffer to base64 string for React Native
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64String = btoa(binaryString);

      // Save to temporary file
      const audioUri = `${
        FileSystem.documentDirectory
      }therapy_response_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(audioUri, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return audioUri;
    } catch (error) {
      console.error("Text-to-speech error:", error);
      throw new Error("Failed to generate speech. Please try again.");
    }
  }

  // Play audio response
  async playAudio(audioUri: string): Promise<void> {
    try {
      // Stop any current playback
      await this.stopAudio();

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      this.playbackObject = sound;

      await sound.playAsync();
    } catch (error) {
      console.error("Audio playback error:", error);
      throw new Error("Failed to play audio response.");
    }
  }

  // Stop audio playback
  async stopAudio(): Promise<void> {
    try {
      if (this.playbackObject) {
        await this.playbackObject.stopAsync();
        await this.playbackObject.unloadAsync();
        this.playbackObject = null;
      }
    } catch (error) {
      console.error("Stop audio error:", error);
    }
  }

  // Complete therapy conversation flow
  async processTherapyConversation(
    userMessage: string
  ): Promise<TherapyResponse> {
    try {
      // Step 2: Get therapy response from OpenAI
      const therapyText = await this.getChatResponse(userMessage);

      // Step 3: Convert to speech
      const audioUri = await this.textToSpeech(therapyText);

      return {
        text: therapyText,
        audioUri: audioUri,
      };
    } catch (error) {
      console.error("Therapy conversation error:", error);
      throw new Error(
        "Failed to process therapy conversation. Please try again."
      );
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

      await this.stopAudio();

      this.isInitialized = false;
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }
}

// Export singleton instance
export const speechService = new SpeechRecognitionService();
export default speechService;
