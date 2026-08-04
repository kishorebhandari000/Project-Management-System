import './SendButton.css';
import { useState } from 'react';

interface SendButtonProps {
  onSend: () => Promise<void> | void;
  disabled?: boolean;
}

export default function SendButton({ onSend, disabled }: SendButtonProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleClick = async () => {
    if (disabled || status === 'sending') return;
    setStatus('sending');
    try {
      await onSend();
      setStatus('sent');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <button
      type="button"
      className={`send-btn ${status === 'sent' ? 'is-sent' : ''}`}
      onClick={handleClick}
      disabled={disabled || status === 'sending'}
    >
      <span className="outline" aria-hidden="true" />
      <span className="state state--default">
        <span className="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2 15 22 11 13 2 9 22 2Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p>
          {'Send'.split('').map((l, i) => (
            <span key={i} style={{ ['--i' as any]: i }}>{l}</span>
          ))}
        </p>
      </span>
      <span className="state state--sent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p>
          {'Sent'.split('').map((l, i) => (
            <span key={i} style={{ ['--i' as any]: i }}>{l}</span>
          ))}
        </p>
      </span>
    </button>
  );
}