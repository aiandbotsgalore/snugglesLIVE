# Big Snuggles Live - Real-Time Conversational AI

A production-ready web application featuring real-time voice conversations with Big Snuggles, an AI character with personality. This app combines speech recognition, AI responses, text-to-speech, animated avatars, and persistent memory for an engaging conversational experience.

## Features

### Real-Time Voice Communication
- Continuous speech-to-text using Web Speech API
- Natural text-to-speech with customizable voice, rate, and pitch
- Sub-2-second response latency from speech end to AI response
- Voice activity detection for seamless conversation flow
- Real-time transcription display during conversations

### Animated Avatar
- Custom gangster teddy bear character
- Synchronized lip-sync animations during speech
- Multiple visual states: idle, listening, thinking, speaking
- Smooth transitions and ambient animations

### Persistent Memory
- Conversation history stored in Supabase database
- Cross-session memory for continuous context
- Conversation summaries for efficient context loading
- Export conversations to JSON format
- Clear individual sessions or all history

### Big Snuggles Character
- Comedic street thug persona from Compton
- Uses hood slang and energetic conversational style
- Over-the-top storytelling with wild tales
- Freestyle rhymes and cosmic references
- Powered by Google Gemini 2.0 Flash

### User Experience
- Dark mode (default) and light mode themes
- Fully responsive design (mobile to desktop)
- Real-time error feedback and recovery
- Customizable voice settings
- Conversation management and export
- Accessibility features (WCAG 2.1 AA compliant)

## Prerequisites

- Node.js 18+ and npm
- Modern web browser with Web Speech API support (Chrome, Edge, Safari)
- Google Gemini API key (free at [Google AI Studio](https://aistudio.google.com/app/apikey))
- Supabase project (already configured in this project)

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 3: Start the Application
```bash
npm run dev
```

### Step 4: Configure API Key

1. Open the app in your browser (http://localhost:5173)
2. Paste your Gemini API key in the setup screen
3. Click "Start"

### Step 5: Grant Microphone Access

1. Click "Start Talking"
2. Allow microphone access when prompted
3. Start speaking!

Your API key is stored locally in your browser and never sent anywhere except Google's Gemini API.

## Usage

### Starting a Conversation

1. Click the "Start Talking" button
2. Grant microphone permissions when prompted
3. Speak naturally - the app will transcribe your speech in real-time
4. Big Snuggles will respond with voice and text
5. The conversation continues until you click "Stop"

### Settings

Access settings via the gear icon in the header:

- **Theme**: Toggle between dark and light modes
- **Voice**: Select from available system voices
- **Speech Rate**: Adjust talking speed (0.5x to 2.0x)
- **Voice Pitch**: Adjust voice pitch (0.5x to 2.0x)
- **Memory**: Enable/disable conversation persistence
- **Push-to-Talk**: Toggle between continuous listening and button-press mode

### Managing Conversations

- **Export**: Download conversation history as JSON
- **Clear**: Delete current conversation and start fresh
- **History**: All conversations are automatically saved (if memory is enabled)

## Browser Compatibility

### Fully Supported
- Google Chrome 80+
- Microsoft Edge 80+
- Safari 14.1+

### Partial Support
- Firefox 89+ (speech recognition may be limited)

### Required Features
- Web Speech API (SpeechRecognition and SpeechSynthesis)
- Local Storage for preferences
- Modern CSS features (CSS Grid, Flexbox, CSS Variables)

## Technical Architecture

Big Snuggles Live is a full-stack real-time conversational AI application built with modern web technologies. The architecture follows a service-based pattern with clear separation of concerns.

### Technology Stack

#### Frontend
- **React 18**: Component-based UI with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tooling and HMR
- **Tailwind CSS**: Utility-first styling with custom CSS variables
- **Lucide React**: Icon library

#### Backend Services
- **Supabase**: PostgreSQL database with real-time capabilities
- **Google Gemini 2.0 Flash**: AI language model
- **Web Speech API**: Browser-native voice recognition and synthesis

### Project Structure
```
src/
├── components/          # React components
│   ├── Avatar.tsx      # Animated character
│   ├── ChatMessage.tsx # Message bubbles
│   ├── SettingsModal.tsx
│   └── TranscriptionDisplay.tsx
├── services/           # Business logic
│   ├── gemini.ts      # AI integration
│   ├── speech.ts      # Voice I/O
│   └── database.ts    # Supabase queries
├── hooks/             # Custom React hooks
│   └── useConversation.ts
├── types/             # TypeScript definitions
├── utils/             # Helper functions
├── config/            # Configuration
└── lib/               # Third-party setup
```

### Core Services

#### GeminiService (`src/services/gemini.ts`)
Manages AI conversation generation:
- Request queuing to prevent race conditions
- Context formatting with recent messages + summary
- Error handling with detailed messages
- Token management and configuration
- Singleton pattern for API key management

#### SpeechService (`src/services/speech.ts`)
Handles voice input/output:
- Continuous speech recognition with interim results
- Text-to-speech with voice customization
- Audio queue management
- Error recovery and fallback handling
- Event-based callback system

#### DatabaseService (`src/services/database.ts`)
Manages all Supabase operations:
- Message persistence with timestamps
- Session management and retrieval
- Conversation summarization
- User preferences CRUD operations
- Error handling with detailed messages

### Custom Hooks

#### useConversation (`src/hooks/useConversation.ts`)
Main conversation state management:
- Integrates speech, AI, and database services
- Manages conversation flow and state
- Handles transcript processing with debouncing
- Coordinates avatar state changes
- Error handling and recovery

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

## Troubleshooting

### Microphone Not Working
- Check browser permissions for microphone access
- Ensure HTTPS is enabled (required for Web Speech API)
- Try a different browser (Chrome recommended)

### AI Not Responding
- Verify your Gemini API key is correct
- Check browser console for API errors
- Ensure you have an active internet connection

### Voice Not Speaking
- Check system volume settings
- Verify browser has permission to play audio
- Try selecting a different voice in settings

### Conversation Not Saving
- Check that memory is enabled in settings
- Verify Supabase connection in browser console
- Clear browser cache and try again

## Customization

### Changing the Character Personality
Edit `src/config/character.ts` to modify the system prompt:
- Adjust personality traits
- Change conversational style
- Modify content guidelines

### Adjusting Voice Settings
Default voice settings can be modified in `src/services/database.ts`:
- Change default voice rate
- Adjust pitch settings
- Set preferred voice name

### Styling
All styles are in `src/index.css` using CSS variables:
- Modify color schemes
- Adjust animation speeds
- Change responsive breakpoints

## Known Limitations

- Web Speech API may have accuracy issues with accents or background noise
- Speech recognition timeout is browser-dependent (typically 2-3 seconds of silence)
- Some mobile browsers have limited speech API support
- Maximum conversation length limited by API context window

## Future Enhancements

- Multi-language support
- Custom voice training
- Advanced conversation analytics
- Social sharing features
- Mobile app versions
- Additional character personalities

## License

This project is provided as-is for educational and personal use.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify all prerequisites are met
4. Ensure API keys are valid

## Credits

- Character concept: Big Snuggles from Compton
- AI powered by Google Gemini
- Voice technology via Web Speech API
- Database by Supabase
- Built with React, TypeScript, and Vite
