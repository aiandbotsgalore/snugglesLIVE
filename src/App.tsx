import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Settings, Trash2, Download, Key } from 'lucide-react';
import { Avatar } from './components/Avatar';
import { ChatMessage } from './components/ChatMessage';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';
import { SettingsModal } from './components/SettingsModal';
import { useConversation } from './hooks/useConversation';
import { databaseService } from './services/database';
import { initializeGeminiService } from './services/gemini';
import { generateDeviceId, clearCurrentSession } from './utils/session';
import type { UserPreferences } from './types';

function App() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey) {
      initializeGeminiService(storedApiKey);
      setIsApiKeySet(true);
    }
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      const deviceId = generateDeviceId();
      const prefs = await databaseService.getOrCreatePreferences(deviceId);
      setPreferences(prefs);

      if (prefs.theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
    };

    loadPreferences();
  }, []);

  const conversation = useConversation(
    preferences || {
      id: '',
      user_id: '',
      voice_name: '',
      voice_rate: 1.0,
      voice_pitch: 1.0,
      theme: 'dark',
      memory_enabled: true,
      push_to_talk: false,
      created_at: '',
      updated_at: ''
    }
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation.messages, conversation.currentTranscript]);

  const handleUpdatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!preferences) return;

    const deviceId = generateDeviceId();
    const updated = await databaseService.savePreferences({
      ...preferences,
      ...updates,
      user_id: deviceId
    });

    setPreferences(updated);

    if (updates.theme) {
      if (updates.theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
    }
  };

  const handleClearConversation = async () => {
    if (!confirm('Are you sure you want to clear this conversation?')) {
      return;
    }

    try {
      await databaseService.deleteSession(conversation.sessionId);
      clearCurrentSession();
      window.location.reload();
    } catch (err) {
      console.error('Failed to clear conversation:', err);
    }
  };

  const handleExportConversation = () => {
    const exportData = {
      session_id: conversation.sessionId,
      messages: conversation.messages,
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `big-snuggles-conversation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSetApiKey = () => {
    if (!apiKeyInput.trim()) {
      alert('Please enter a valid API key');
      return;
    }

    localStorage.setItem('gemini_api_key', apiKeyInput.trim());
    initializeGeminiService(apiKeyInput.trim());
    setIsApiKeySet(true);
    setApiKeyInput('');
  };

  if (!preferences) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Big Snuggles...</p>
      </div>
    );
  }

  if (!isApiKeySet) {
    return (
      <div className="api-key-setup">
        <div className="api-key-card">
          <div className="api-key-icon">
            <Key className="w-12 h-12" />
          </div>
          <h1 className="api-key-title">Welcome to Big Snuggles Live</h1>
          <p className="api-key-description">
            To get started, you need a Gemini API key. Get yours for free at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="api-key-link"
            >
              Google AI Studio
            </a>
          </p>
          <div className="api-key-input-group">
            <input
              type="password"
              className="api-key-input"
              placeholder="Enter your Gemini API key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSetApiKey()}
            />
            <button className="btn-primary" onClick={handleSetApiKey}>
              Start
            </button>
          </div>
          <p className="api-key-note">
            Your API key is stored locally and never sent anywhere except Google's Gemini API
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Big Snuggles Live</h1>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={handleExportConversation}
            aria-label="Export conversation"
            title="Export conversation"
            disabled={conversation.messages.length === 0}
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            className="icon-button"
            onClick={handleClearConversation}
            aria-label="Clear conversation"
            title="Clear conversation"
            disabled={conversation.messages.length === 0}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            className="icon-button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="avatar-section">
          <Avatar state={conversation.avatarState} audioLevel={0.5} />
        </div>

        <div className="chat-section">
          <div className="chat-container" ref={chatContainerRef}>
            {conversation.messages.length === 0 && !conversation.currentTranscript && (
              <div className="empty-state">
                <p className="empty-state-title">Yo, what's good!</p>
                <p className="empty-state-description">
                  Big Snuggles here, straight outta Compton. Hit that mic button and let's talk!
                </p>
              </div>
            )}

            {conversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {conversation.currentTranscript && (
              <TranscriptionDisplay
                text={conversation.currentTranscript}
                isListening={conversation.isListening}
              />
            )}
          </div>
        </div>

        {conversation.error && (
          <div className="error-banner">
            <p>{conversation.error}</p>
            <button onClick={conversation.clearError} className="error-close">
              ✕
            </button>
          </div>
        )}

        <div className="controls-section">
          <button
            className={`mic-button ${conversation.isListening ? 'listening' : ''}`}
            onClick={
              conversation.isListening
                ? conversation.stopListening
                : conversation.startListening
            }
            disabled={conversation.isProcessing}
            aria-label={conversation.isListening ? 'Stop listening' : 'Start listening'}
          >
            {conversation.isListening ? (
              <>
                <MicOff className="w-8 h-8" />
                <span className="mic-button-text">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8" />
                <span className="mic-button-text">
                  {conversation.isProcessing ? 'Processing...' : 'Start Talking'}
                </span>
              </>
            )}
          </button>

          {conversation.isSpeaking && (
            <button
              className="stop-speaking-button"
              onClick={conversation.stopSpeaking}
              aria-label="Stop speaking"
            >
              Stop Speaking
            </button>
          )}
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        availableVoices={availableVoices}
      />
    </div>
  );
}

export default App;
