import { useEffect, useState } from 'react';
import type { AvatarState } from '../types';

interface AvatarProps {
  state: AvatarState;
  audioLevel?: number;
}

/**
 * Renders an animated SVG avatar that reflects the application's state.
 * The avatar is a gangster teddy bear character named "Big Snuggles".
 * It features blinking, mouth movement when speaking, and visual state indicators
 * for listening, thinking, and speaking.
 *
 * @param {AvatarProps} props - The props for the component.
 * @param {AvatarState} props.state - The current state of the avatar, which determines its animation.
 * @param {number} [props.audioLevel=0] - The current audio level from the microphone, used to animate the avatar's scale while speaking.
 * @returns {JSX.Element} The rendered SVG avatar component.
 */
export function Avatar({ state, audioLevel = 0 }: AvatarProps) {
  const [blinkState, setBlinkState] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (state === 'speaking') {
      const mouthInterval = setInterval(() => {
        setMouthOpen(Math.random() * 0.7 + 0.3);
      }, 100);
      return () => clearInterval(mouthInterval);
    } else {
      setMouthOpen(0);
    }
  }, [state]);

  const getAnimationClass = () => {
    switch (state) {
      case 'listening':
        return 'avatar-listening';
      case 'thinking':
        return 'avatar-thinking';
      case 'speaking':
        return 'avatar-speaking';
      default:
        return 'avatar-idle';
    }
  };

  const scale = state === 'speaking' ? 1 + audioLevel * 0.1 : 1;

  return (
    <div className={`avatar-container ${getAnimationClass()}`}>
      <svg
        viewBox="0 0 200 200"
        className="avatar-svg"
        style={{ transform: `scale(${scale})` }}
      >
        <defs>
          <radialGradient id="bearGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#654321" />
          </radialGradient>
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        <circle cx="100" cy="100" r="80" fill="url(#bearGradient)" filter="url(#shadow)" />

        <circle cx="60" cy="40" r="25" fill="#654321" />
        <circle cx="140" cy="40" r="25" fill="#654321" />

        <circle cx="75" cy="85" r="12" fill="white" />
        <circle cx="125" cy="85" r="12" fill="white" />

        <circle
          cx="75"
          cy="85"
          r="8"
          fill="black"
          className={blinkState ? 'eye-blink' : ''}
        />
        <circle
          cx="125"
          cy="85"
          r="8"
          fill="black"
          className={blinkState ? 'eye-blink' : ''}
        />

        <circle cx="78" cy="82" r="3" fill="white" opacity="0.8" />
        <circle cx="128" cy="82" r="3" fill="white" opacity="0.8" />

        <ellipse cx="100" cy="110" rx="8" ry="6" fill="#4a3728" />

        <path
          d={`M 70 125 Q 100 ${125 + mouthOpen * 20} 130 125`}
          stroke="#2d1f1a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        <ellipse
          cx="100"
          cy={125 + mouthOpen * 15}
          rx={20 * (1 + mouthOpen * 0.5)}
          ry={10 * mouthOpen}
          fill="#ff6b6b"
          opacity={mouthOpen > 0.3 ? '0.8' : '0'}
        />

        <rect x="85" y="50" width="30" height="3" fill="#444" opacity="0.6" />

        <circle cx="45" cy="120" r="3" fill="#ffd700" className="chain-link" />
        <circle cx="50" cy="125" r="3" fill="#ffd700" className="chain-link" />
        <circle cx="55" cy="130" r="3" fill="#ffd700" className="chain-link" />

        {state === 'thinking' && (
          <g className="thinking-dots">
            <circle cx="160" cy="60" r="4" fill="#fff" opacity="0.8">
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="1.5s"
                repeatCount="indefinite"
                begin="0s"
              />
            </circle>
            <circle cx="170" cy="55" r="3" fill="#fff" opacity="0.6">
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="1.5s"
                repeatCount="indefinite"
                begin="0.5s"
              />
            </circle>
            <circle cx="178" cy="50" r="2" fill="#fff" opacity="0.4">
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="1.5s"
                repeatCount="indefinite"
                begin="1s"
              />
            </circle>
          </g>
        )}

        {state === 'listening' && (
          <g className="listening-waves">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.4">
              <animate attributeName="r" values="85;95;85" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="100" r="95" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.2">
              <animate attributeName="r" values="90;100;90" dur="2s" repeatCount="indefinite" begin="0.5s" />
              <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </circle>
          </g>
        )}
      </svg>

      <div className="avatar-label">
        {state === 'idle' && 'Big Snuggles'}
        {state === 'listening' && 'Listening...'}
        {state === 'thinking' && 'Thinking...'}
        {state === 'speaking' && 'Speaking'}
      </div>
    </div>
  );
}
