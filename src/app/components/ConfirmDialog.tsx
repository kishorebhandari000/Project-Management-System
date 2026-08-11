interface ConfirmDialogProps {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        {title && <h2 className="text-lg mb-2">{title}</h2>}
        <p className="text-gray-600 text-sm mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
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
