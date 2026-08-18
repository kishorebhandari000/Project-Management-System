import { useEffect, useRef, useState } from 'react';

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '😢'];

interface Reaction {
  emoji: string;
  user: string;
}

interface ReactionBarProps {
  reactions: Reaction[];
  currentUserId: string | null;
  onToggle: (emoji: string) => void;
}

export default function ReactionBar({ reactions, currentUserId, onToggle }: ReactionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [pickerOpen]);

  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const r of reactions) {
    counts.set(r.emoji, (counts.get(r.emoji) || 0) + 1);
    if (currentUserId && r.user === currentUserId) mine.add(r.emoji);
  }
  const activeEmojis = REACTION_EMOJIS.filter((e) => counts.has(e));

  const pick = (emoji: string) => {
    setPickerOpen(false);
    onToggle(emoji);
  };

  return (
    <div ref={containerRef} className="relative flex flex-wrap items-center gap-1.5 mt-3">
      {activeEmojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => pick(emoji)}
          className={`flex items-center gap-1 text-sm px-2 py-0.5 rounded-full border transition-colors ${
            mine.has(emoji)
              ? 'bg-blue-50 border-[#2563a8] text-[#2563a8]'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>{emoji}</span>
          <span>{counts.get(emoji)}</span>
        </button>
      ))}

      <button
        type="button"
        onClick={() => setPickerOpen((o) => !o)}
        aria-label="Add reaction"
        aria-expanded={pickerOpen}
        className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm leading-none"
      >
        +
      </button>

      {pickerOpen && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 z-10">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => pick(emoji)}
              className="text-lg leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
