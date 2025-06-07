# Speech Therapy Assistant Setup Guide

This guide will help you set up OpenAI Whisper API for high-accuracy speech transcription in your therapist app.

## Features Implemented

### OpenAI Whisper API (High Accuracy Transcription)

- **File**: `components/VoiceRecorder.tsx`
- **Use Case**: Speech therapy sessions, voice exercises, patient recordings
- **Processing**: Async, audio securely processed by OpenAI
- **Accuracy**: Very high (~95%+ accuracy)
- **Languages**: Multiple languages and accents supported
- **Audio Quality**: High-quality recording with automatic transcription

## Setup Instructions

### 1. OpenAI Whisper API Setup

1. **Get an OpenAI API Key**:

   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account or sign in
   - Go to API Keys section
   - Create a new API key

2. **Add Environment Variable**:
   Create a `.env` file in your project root:

   ```bash
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Test the Integration**:
   - Open the app
   - Tap the record button and speak
   - Wait for processing to complete
   - View your accurate transcription

### 2. Permissions Setup

1. **Grant Microphone Access**:
   - The app will request microphone permissions automatically
   - Allow access when prompted for voice recording

## Code Structure

### Services

- `services/SpeechService.ts` - Core Whisper API integration and recording service
- `constants/Speech.ts` - Configuration and constants

### Components

- `components/VoiceRecorder.tsx` - Main recording and transcription component

### Screens

- `app/(tabs)/index.tsx` - Main therapy assistant interface

## Usage Examples

### Using the VoiceRecorder Component

```tsx
import { VoiceRecorder } from "@/components/VoiceRecorder";

function TherapySession() {
  return (
    <VoiceRecorder
      onTranscriptReceived={(transcript) => {
        console.log("Patient speech:", transcript);
        // Save to session notes, analyze speech patterns, etc.
      }}
      placeholder="Record patient's speech exercise..."
    />
  );
}
```

### Using the Service Directly

```tsx
import SpeechService from "@/services/SpeechService";

async function recordPatientSpeech() {
  try {
    // Start recording
    await SpeechService.startRecording();

    // User speaks...

    // Stop and get recording
    const recording = await SpeechService.stopRecording();

    // Transcribe with Whisper
    const transcript = await SpeechService.transcribeWithWhisper(recording.uri);

    console.log("Transcription:", transcript);
  } catch (error) {
    console.error("Recording error:", error);
  }
}
```

## Configuration Options

### Audio Quality Settings

Configure in `constants/Speech.ts`:

- Sample rate: 44100 Hz
- Channels: 2 (stereo)
- Format: M4A (optimized for speech)
- Quality: High-quality preset for clear speech recognition

### Whisper Model Settings

- Model: `whisper-1` (latest OpenAI model)
- Language: English (configurable)
- Response format: JSON with transcript text

## Speech Therapy Use Cases

### 1. Speech Exercise Recording

- Record patient practicing specific sounds or words
- Get accurate transcription for progress tracking
- Compare with target pronunciation

### 2. Session Documentation

- Record therapy session notes by voice
- Convert spoken observations to text
- Maintain detailed patient records

### 3. Voice Journaling

- Patients can record their thoughts and feelings
- Therapists can review transcribed entries
- Track emotional and speech progress over time

### 4. Pronunciation Assessment

- Record patient speech samples
- Analyze transcription accuracy vs. intended words
- Identify areas needing improvement

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**:

   - Ensure your OpenAI API key is correct
   - Check that the environment variable is properly set
   - Restart the development server after adding the key

2. **"Permission Denied" Error**:

   - Grant microphone permissions in device settings
   - Restart the app after granting permissions

3. **"Transcription Failed" Error**:

   - Check internet connection (Whisper API requires connectivity)
   - Ensure audio file is not corrupted
   - Try recording a shorter sample

4. **Audio Recording Fails**:
   - Check microphone hardware
   - Ensure no other apps are using the microphone
   - Try restarting the app

### Performance Tips

1. **For Best Transcription Results**:

   - Keep recordings under 25MB for optimal processing
   - Speak clearly and avoid background noise
   - Record in quiet environments when possible
   - Wait for processing to complete before starting new recording

2. **For Therapy Sessions**:
   - Position device/microphone close to speaker
   - Use external microphone for better audio quality
   - Record in rooms with minimal echo

## Customization

### Theming

The components use your app's themed components (`ThemedText`, `ThemedView`) and automatically adapt to light/dark modes.

### Styling

All styles are defined in the component files and can be customized by modifying the `StyleSheet` objects.

### Error Handling

Customize error messages in `constants/Speech.ts` under the `SPEECH_ERRORS` object.

## Production Considerations

1. **API Costs**: Monitor OpenAI API usage - Whisper pricing is $0.006 per minute
2. **Privacy**: Audio is processed by OpenAI - ensure HIPAA compliance if needed
3. **Data Storage**: Consider local storage of transcriptions for patient privacy
4. **Internet Dependency**: Whisper requires internet connection for processing
5. **Session Management**: Implement transcript storage and patient record integration

## Next Steps for Therapy App

- Integrate transcripts with patient records
- Add speech pattern analysis features
- Implement progress tracking over time
- Add support for additional therapeutic languages
- Consider adding audio playback for review
- Implement session notes and therapy plan integration

## Security & Privacy

- Audio files are temporarily stored locally during processing
- Consider implementing end-to-end encryption for sensitive patient data
- Review OpenAI's data handling policies for healthcare compliance
- Implement secure transcript storage and access controls
