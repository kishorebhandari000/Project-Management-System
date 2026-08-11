import { useState } from 'react';

interface CommentDialogProps {
  title?: string;
  message?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  required?: boolean;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
}

export default function CommentDialog({
  title,
  message,
  placeholder = 'Add a comment...',
  confirmLabel = 'Submit',
  cancelLabel = 'Cancel',
  variant = 'default',
  required = false,
  onSubmit,
  onCancel,
}: CommentDialogProps) {
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);

  const trimmed = comment.trim();
  const showError = required && touched && !trimmed;

  const handleSubmit = () => {
    if (required && !trimmed) {
      setTouched(true);
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {title && <h2 className="text-lg mb-2">{title}</h2>}
        {message && <p className="text-gray-600 text-sm mb-4">{message}</p>}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          rows={4}
          autoFocus
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none resize-none ${
            showError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-[#2563a8]'
          }`}
        />
        {showError && <p className="text-red-600 text-xs mt-1">A comment is required.</p>}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex-1 px-5 py-2 rounded-md text-white ${
              variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2563a8] hover:bg-[#1e4a8a]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
