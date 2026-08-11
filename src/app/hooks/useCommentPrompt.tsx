import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import CommentDialog from '../components/CommentDialog';

interface CommentPromptOptions {
  title?: string;
  message?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  required?: boolean;
}

// Resolves with the trimmed comment on submit, or null if cancelled.
type PromptCommentFn = (options?: CommentPromptOptions) => Promise<string | null>;

const CommentPromptContext = createContext<PromptCommentFn | null>(null);

export function CommentPromptProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<CommentPromptOptions | null>(null);
  const resolveRef = useRef<((value: string | null) => void) | null>(null);

  const promptComment = useCallback<PromptCommentFn>((opts) => {
    return new Promise<string | null>((resolve) => {
      resolveRef.current = resolve;
      setOptions(opts ?? {});
    });
  }, []);

  const settle = (result: string | null) => {
    setOptions(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  };

  return (
    <CommentPromptContext.Provider value={promptComment}>
      {children}
      {options && (
        <CommentDialog
          title={options.title}
          message={options.message}
          placeholder={options.placeholder}
          confirmLabel={options.confirmLabel}
          cancelLabel={options.cancelLabel}
          variant={options.variant}
          required={options.required}
          onSubmit={(comment) => settle(comment)}
          onCancel={() => settle(null)}
        />
      )}
    </CommentPromptContext.Provider>
  );
}

export function useCommentPrompt() {
  const ctx = useContext(CommentPromptContext);
  if (!ctx) throw new Error('useCommentPrompt must be used within a CommentPromptProvider');
  return ctx;
}
