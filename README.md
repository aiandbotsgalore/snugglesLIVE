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

## Installation

1. Install dependencies:
```bash
npm install
```

2. The Supabase database is already configured with connection details in `.env`

3. Start the development server:
```bash
npm run dev
```

4. Open the application in your browser (typically http://localhost:5173)

5. On first launch, you'll be prompted to enter your Gemini API key

## Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Paste it into the application's setup screen

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

### Frontend Stack
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons

### AI & Voice Services
- Google Gemini 2.0 Flash for AI responses
- Web Speech API for voice I/O
- Custom speech service with queue management

### Database
- Supabase (PostgreSQL) for data persistence
- Three main tables: conversations, conversation_summaries, user_preferences
- Row Level Security policies for data protection

### State Management
- React hooks for local state
- Custom useConversation hook for conversation logic
- Service-based architecture for AI, speech, and database operations

## Performance Optimization

- Response caching to reduce API calls
- Lazy loading for conversation history
- GPU-accelerated CSS animations
- Debounced transcript processing
- Efficient database queries with indexes

## Privacy & Security

- API keys stored in browser localStorage only
- No data sent to third parties except Gemini API
- User can clear all data at any time
- Secure database connections via Supabase
- Optional memory disable for private sessions

## Development

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
