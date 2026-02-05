import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'OK',
  cancelText = 'キャンセル',
  confirmButtonClass = 'bg-brand hover:bg-blue-700 text-white',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up flex flex-col">
        {/* Header */}
        <div className="bg-brand p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {title}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 rounded font-bold transition-all shadow cursor-pointer ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
