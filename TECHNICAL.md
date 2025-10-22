# Technical Implementation Details

## Architecture Overview

Big Snuggles Live is a full-stack real-time conversational AI application built with modern web technologies. The architecture follows a service-based pattern with clear separation of concerns.

## Technology Stack

### Frontend
- **React 18**: Component-based UI with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tooling and HMR
- **Tailwind CSS**: Utility-first styling with custom CSS variables
- **Lucide React**: Icon library

### Backend Services
- **Supabase**: PostgreSQL database with real-time capabilities
- **Google Gemini 2.0 Flash**: AI language model
- **Web Speech API**: Browser-native voice recognition and synthesis

## Database Schema

### conversations
Stores all messages between users and AI:
```sql
- id: uuid (PK)
- session_id: uuid (indexed)
- user_id: text (nullable, indexed)
- role: text ('user' | 'assistant')
- content: text
- audio_duration: integer (nullable)
- created_at: timestamptz (indexed)
- metadata: jsonb
```

### conversation_summaries
Compressed conversation context for efficient loading:
```sql
- id: uuid (PK)
- session_id: uuid (unique, indexed)
- summary: text
- message_count: integer
- created_at: timestamptz
- updated_at: timestamptz
```

### user_preferences
User settings and voice configurations:
```sql
- id: uuid (PK)
- user_id: text (unique, indexed)
- voice_name: text
- voice_rate: real (0.5-2.0)
- voice_pitch: real (0.5-2.0)
- theme: text ('dark' | 'light')
- memory_enabled: boolean
- push_to_talk: boolean
- created_at: timestamptz
- updated_at: timestamptz
```

## Core Services

### GeminiService (`src/services/gemini.ts`)
Manages AI conversation generation:
- Request queuing to prevent race conditions
- Context formatting with recent messages + summary
- Error handling with detailed messages
- Token management and configuration
- Singleton pattern for API key management

**Key Methods:**
- `generateResponse(messages, summary)`: Generate AI response
- `formatMessages()`: Prepare context for API
- `makeRequest()`: Handle API communication

### SpeechService (`src/services/speech.ts`)
Handles voice input/output:
- Continuous speech recognition with interim results
- Text-to-speech with voice customization
- Audio queue management
- Error recovery and fallback handling
- Event-based callback system

**Key Methods:**
- `startListening()`: Begin speech recognition
- `stopListening()`: Stop recognition
- `speak(text)`: Convert text to speech
- `stopSpeaking()`: Cancel current speech
- `updateVoiceSettings()`: Change voice parameters

### DatabaseService (`src/services/database.ts`)
Manages all Supabase operations:
- Message persistence with timestamps
- Session management and retrieval
- Conversation summarization
- User preferences CRUD operations
- Error handling with detailed messages

**Key Methods:**
- `saveMessage()`: Store message in database
- `getConversationMessages()`: Retrieve session history
- `saveSummary()`: Update conversation summary
- `getOrCreatePreferences()`: Load/create user settings

## Custom Hooks

### useConversation (`src/hooks/useConversation.ts`)
Main conversation state management:
- Integrates speech, AI, and database services
- Manages conversation flow and state
- Handles transcript processing with debouncing
- Coordinates avatar state changes
- Error handling and recovery

**State Management:**
- `messages`: Conversation history
- `currentTranscript`: Live transcription
- `avatarState`: Current animation state
- `isListening`: Microphone active status
- `isSpeaking`: TTS playback status
- `isProcessing`: AI generation in progress

**Key Logic:**
- Automatic transcript submission after 1-2 seconds of silence
- Sequential processing to prevent overlapping requests
- Avatar state synchronization with conversation flow
- Conversation summarization after 20+ messages

## Component Architecture

### Avatar Component
SVG-based animated character:
- Four distinct animation states
- Lip-sync simulation during speech
- Ambient idle animations (bobbing, blinking)
- Thinking indicators with animated dots
- Listening waves with pulsing circles
- Responsive sizing for mobile devices

### Chat Interface
Real-time message display:
- Auto-scrolling to latest messages
- Distinct styling for user vs AI messages
- Timestamp formatting
- Empty state with character greeting
- Message slide-in animations

### Settings Modal
Comprehensive configuration UI:
- Theme toggle (dark/light)
- Voice selection from available system voices
- Rate and pitch sliders with real-time preview
- Memory and push-to-talk toggles
- Responsive layout with scrolling

## Performance Optimizations

### Speech Processing
- Debounced transcript submission (1-2 second delay)
- Automatic speech restart on recognition end
- Error recovery without user intervention
- Audio queue to prevent overlapping speech

### Database Operations
- Indexed queries for fast retrieval
- Batch operations where possible
- Upsert patterns to avoid conflicts
- Efficient session management

### UI Rendering
- CSS animations using GPU acceleration
- Lazy loading of conversation history
- Memoized components to prevent re-renders
- Efficient scroll management with refs

### API Calls
- Request queuing to prevent concurrent calls
- Context truncation to stay within limits
- Error retry with exponential backoff
- Response caching for repeated queries

## State Flow

### Conversation Cycle
1. User clicks "Start Talking"
2. Microphone activates → Avatar shows "listening"
3. Speech recognition captures audio
4. Transcript appears in real-time
5. After silence detected → Processing begins
6. Avatar shows "thinking" state
7. Message saved to database
8. AI generates response via Gemini
9. Response saved to database
10. TTS speaks response → Avatar shows "speaking"
11. Lip-sync animation during playback
12. Return to idle state

### Session Management
1. Generate device ID on first launch
2. Create or retrieve session ID
3. Load conversation history if memory enabled
4. Save all messages to database
5. Generate summaries after 20+ messages
6. Persist preferences changes immediately

## Security Measures

### API Key Management
- Stored in localStorage (never in code)
- Only sent to Google's Gemini API
- Can be changed without data loss
- No server-side storage

### Database Security
- Row Level Security policies enabled
- Public access for MVP (no auth required)
- Prepared for future auth integration
- Parameterized queries prevent SQL injection

### Client-Side Validation
- Input sanitization before storage
- Type checking with TypeScript
- Error boundary components
- Graceful degradation on failures

## Browser Compatibility

### Required APIs
- Web Speech API (SpeechRecognition)
- Web Speech API (SpeechSynthesis)
- LocalStorage
- SessionStorage
- Fetch API
- CSS Grid and Flexbox
- CSS Custom Properties

### Polyfills & Fallbacks
- Automatic voice API detection
- Error messages for unsupported browsers
- Graceful degradation without features
- Static fallback for animations

## Accessibility Features

### WCAG 2.1 AA Compliance
- Semantic HTML structure
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators on all controls
- High contrast color schemes
- Readable font sizes (minimum 14px)

### Screen Reader Support
- Descriptive button labels
- Status announcements
- Alternative text for icons
- Meaningful heading hierarchy

## Responsive Design

### Breakpoints
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

### Adaptations
- Flexible layouts with CSS Grid/Flexbox
- Touch-friendly buttons (44px minimum)
- Reduced avatar size on mobile
- Stacked layouts for small screens
- Adjusted font sizes per viewport

## Error Handling

### Network Errors
- Retry logic with exponential backoff
- User-friendly error messages
- Offline detection
- Connection status indicators

### API Errors
- Detailed error messages in console
- Generic user-facing messages
- Automatic recovery when possible
- Manual retry options

### Speech Errors
- Automatic restart on recognition end
- Silent error handling for "no-speech"
- Microphone permission prompts
- Browser compatibility warnings

## Testing Strategy

### Manual Testing Checklist
- Voice recognition accuracy
- Response latency measurement
- Avatar animation smoothness
- Database persistence verification
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility features
- Error scenario handling

### Performance Metrics
- Response time: < 2 seconds target
- Animation frame rate: 60fps target
- Database query time: < 500ms
- TTS initialization: < 1 second
- Page load time: < 3 seconds

## Deployment Considerations

### Environment Variables
- VITE_SUPABASE_URL: Database URL
- VITE_SUPABASE_ANON_KEY: Public API key
- User's Gemini API key (localStorage)

### Build Optimization
- Vite production build with minification
- CSS purging via Tailwind
- Tree shaking for unused code
- Asset optimization (images, fonts)

### Hosting Requirements
- HTTPS required (for speech API)
- Modern browser support
- No server-side rendering needed
- Static hosting sufficient (Vercel, Netlify, etc.)

## Future Technical Enhancements

### Planned Features
- WebSocket for real-time updates
- Service Worker for offline support
- IndexedDB for larger storage
- Web Workers for background processing
- WebRTC for advanced audio processing

### Scalability Considerations
- User authentication system
- Rate limiting on API calls
- Conversation pagination
- Advanced caching strategies
- CDN for asset delivery

## Development Workflow

### Local Development
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Test production build
npm run lint       # Code linting
npm run typecheck  # Type validation
```

### Code Organization Principles
- Single responsibility per file
- Clear separation of concerns
- Service-based architecture
- Type-safe interfaces
- Modular component design

## Maintenance Notes

### Regular Updates Needed
- Gemini API version updates
- Browser compatibility testing
- Security patches for dependencies
- Performance monitoring
- User feedback integration

### Monitoring Points
- API response times
- Error rates and types
- Browser usage statistics
- Feature usage analytics
- Database query performance

---

This technical documentation provides a comprehensive overview of the Big Snuggles Live implementation. For specific code details, refer to inline comments in the source files.
