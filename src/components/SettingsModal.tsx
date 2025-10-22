import { X, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { UserPreferences, Theme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (preferences: Partial<UserPreferences>) => void;
  availableVoices: SpeechSynthesisVoice[];
}

export function SettingsModal({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  availableVoices
}: SettingsModalProps) {
  const [localPreferences, setLocalPreferences] = useState(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdatePreferences(localPreferences);
    onClose();
  };

  const toggleTheme = () => {
    const newTheme: Theme = localPreferences.theme === 'dark' ? 'light' : 'dark';
    setLocalPreferences({ ...localPreferences, theme: newTheme });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close settings">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-section">
            <h3 className="settings-section-title">Appearance</h3>
            <div className="settings-item">
              <label className="settings-label">Theme</label>
              <button className="theme-toggle" onClick={toggleTheme}>
                {localPreferences.theme === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    Light Mode
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Voice Settings</h3>

            <div className="settings-item">
              <label className="settings-label" htmlFor="voice-select">Voice</label>
              <select
                id="voice-select"
                className="settings-select"
                value={localPreferences.voice_name}
                onChange={(e) =>
                  setLocalPreferences({ ...localPreferences, voice_name: e.target.value })
                }
              >
                <option value="">Default</option>
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="settings-item">
              <label className="settings-label" htmlFor="voice-rate">
                Speech Rate: {localPreferences.voice_rate.toFixed(1)}x
              </label>
              <input
                id="voice-rate"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                className="settings-slider"
                value={localPreferences.voice_rate}
                onChange={(e) =>
                  setLocalPreferences({
                    ...localPreferences,
                    voice_rate: parseFloat(e.target.value)
                  })
                }
              />
            </div>

            <div className="settings-item">
              <label className="settings-label" htmlFor="voice-pitch">
                Voice Pitch: {localPreferences.voice_pitch.toFixed(1)}x
              </label>
              <input
                id="voice-pitch"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                className="settings-slider"
                value={localPreferences.voice_pitch}
                onChange={(e) =>
                  setLocalPreferences({
                    ...localPreferences,
                    voice_pitch: parseFloat(e.target.value)
                  })
                }
              />
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Privacy & Memory</h3>

            <div className="settings-item">
              <label className="settings-checkbox-label">
                <input
                  type="checkbox"
                  className="settings-checkbox"
                  checked={localPreferences.memory_enabled}
                  onChange={(e) =>
                    setLocalPreferences({
                      ...localPreferences,
                      memory_enabled: e.target.checked
                    })
                  }
                />
                <span>Enable conversation memory</span>
              </label>
              <p className="settings-description">
                Remember conversations across sessions for better context
              </p>
            </div>

            <div className="settings-item">
              <label className="settings-checkbox-label">
                <input
                  type="checkbox"
                  className="settings-checkbox"
                  checked={localPreferences.push_to_talk}
                  onChange={(e) =>
                    setLocalPreferences({
                      ...localPreferences,
                      push_to_talk: e.target.checked
                    })
                  }
                />
                <span>Push-to-talk mode</span>
              </label>
              <p className="settings-description">
                Hold button to speak instead of continuous listening
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
