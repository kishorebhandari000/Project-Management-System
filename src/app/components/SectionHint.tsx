import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './SectionHint.css';

type Side = 'top' | 'bottom' | 'left' | 'right';

interface SectionHintProps {
  /** Blurb shown in the popup. Pull this from src/app/lib/sectionHints.ts. */
  text: string;
  /** Preferred side to open on; flips automatically if there's no room. */
  side?: Side;
  /** Extra class on the trigger, e.g. to recolor it for a dark background. */
  className?: string;
}

const HOVER_DELAY_MS = 350;
const VIEWPORT_MARGIN = 8;

export default function SectionHint({ text, side = 'bottom', className = '' }: SectionHintProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, placement: side });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const viaPointer = useRef(false);
  const tooltipId = useId();

  const close = () => setOpen(false);

  const handleMouseEnter = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(true), HOVER_DELAY_MS);
  };

  const handleMouseLeave = () => {
    window.clearTimeout(hoverTimer.current);
    close();
  };

  const handlePointerDown = () => {
    viaPointer.current = true;
  };

  const handleFocus = () => {
    // Only auto-open for genuine keyboard focus; pointer clicks are handled by onClick.
    if (!viaPointer.current) setOpen(true);
  };

  const handleBlur = () => {
    viaPointer.current = false;
    close();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((o) => !o);
  };

  useEffect(() => {
    window.clearTimeout(hoverTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || bubbleRef.current?.contains(target)) return;
      close();
    };
    const handleResize = () => close();
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !bubbleRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const bubble = bubbleRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let placement = side;
    if (placement === 'bottom' && trigger.bottom + bubble.height + VIEWPORT_MARGIN > vh) placement = 'top';
    else if (placement === 'top' && trigger.top - bubble.height - VIEWPORT_MARGIN < 0) placement = 'bottom';
    else if (placement === 'right' && trigger.right + bubble.width + VIEWPORT_MARGIN > vw) placement = 'left';
    else if (placement === 'left' && trigger.left - bubble.width - VIEWPORT_MARGIN < 0) placement = 'right';

    // Neither side has room for a horizontally-placed bubble (e.g. a narrow drawer) —
    // fall back to stacking it above/below so it can never end up covering the trigger.
    if (
      (placement === 'left' || placement === 'right') &&
      bubble.width + VIEWPORT_MARGIN * 2 > vw
    ) {
      placement = trigger.bottom + bubble.height + VIEWPORT_MARGIN <= vh ? 'bottom' : 'top';
    }

    let top = 0;
    let left = 0;
    if (placement === 'bottom') {
      top = trigger.bottom + VIEWPORT_MARGIN;
      left = trigger.left + trigger.width / 2 - bubble.width / 2;
    } else if (placement === 'top') {
      top = trigger.top - bubble.height - VIEWPORT_MARGIN;
      left = trigger.left + trigger.width / 2 - bubble.width / 2;
    } else if (placement === 'right') {
      top = trigger.top + trigger.height / 2 - bubble.height / 2;
      left = trigger.right + VIEWPORT_MARGIN;
    } else {
      top = trigger.top + trigger.height / 2 - bubble.height / 2;
      left = trigger.left - bubble.width - VIEWPORT_MARGIN;
    }

    left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - bubble.width - VIEWPORT_MARGIN));
    top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - bubble.height - VIEWPORT_MARGIN));

    setPos({ top, left, placement });
  }, [open, side]);

  return (
    <span className="section-hint">
      <button
        type="button"
        ref={triggerRef}
        className={`section-hint__trigger ${className}`}
        aria-describedby={open ? tooltipId : undefined}
        aria-label="More info"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
      >
        i
      </button>
      {open &&
        createPortal(
          <div
            ref={bubbleRef}
            id={tooltipId}
            role="tooltip"
            className={`section-hint__bubble section-hint__bubble--${pos.placement}`}
            style={{ top: pos.top, left: pos.left }}
          >
            {text}
          </div>,
          document.body
        )}
    </span>
  );
}
