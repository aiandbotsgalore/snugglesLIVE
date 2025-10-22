interface TranscriptionDisplayProps {
  text: string;
  isListening: boolean;
}

export function TranscriptionDisplay({ text, isListening }: TranscriptionDisplayProps) {
  if (!isListening && !text) {
    return null;
  }

  return (
    <div className="transcription-display">
      <div className="transcription-label">
        {isListening ? 'Listening...' : 'Processing...'}
      </div>
      <div className="transcription-text">
        {text || <span className="transcription-placeholder">Start speaking...</span>}
        {isListening && <span className="transcription-cursor">|</span>}
      </div>
    </div>
  );
}
