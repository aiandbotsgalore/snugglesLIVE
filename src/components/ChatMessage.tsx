import { User, Bot } from 'lucide-react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

/**
 * Renders a single chat message, differentiating between user and AI messages.
 * It displays the sender's icon, name, the message content, and a timestamp.
 *
 * @param {ChatMessageProps} props - The props for the component.
 * @param {Message} props.message - The message object to display.
 * @returns {JSX.Element} The rendered chat message component.
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-icon">
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5" />
        )}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-sender">{isUser ? 'You' : 'Big Snuggles'}</span>
          <span className="message-time">{timestamp}</span>
        </div>
        <div className="message-text">{message.content}</div>
      </div>
    </div>
  );
}
