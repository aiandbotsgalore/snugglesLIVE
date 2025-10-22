# Quick Setup Guide - Big Snuggles Live

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

## That's It!

You're now ready to have conversations with Big Snuggles. The app will:
- Listen to your voice
- Transcribe in real-time
- Generate AI responses
- Speak back to you
- Remember your conversation

## Browser Requirements

**Recommended:** Google Chrome or Microsoft Edge (latest version)

**Required Features:**
- Microphone access
- Web Speech API support
- JavaScript enabled

## Need Help?

- Check that your microphone is working
- Ensure you're using HTTPS (required for speech API)
- Try a different browser if issues persist
- Review the full README.md for detailed troubleshooting

## Database

The Supabase database is already configured and ready to use. Your conversations will be automatically saved and available across sessions.

## Privacy Note

- Your API key is stored only in your browser
- Conversations are stored in your Supabase database
- No data is shared with third parties except Google's Gemini API
- You can clear all data anytime via the settings

Enjoy chatting with Big Snuggles!
