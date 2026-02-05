import { Copy, X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useState } from 'react';

type SummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  summaryText: string;
};

export function SummaryModal({ isOpen, onClose, summaryText }: SummaryModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-brand p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            シミュレーション結果のまとめ
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-hidden flex flex-col min-h-0">
          <p className="text-sm text-gray-600 mb-2">
            以下のテキストは、現在の入力内容とシミュレーション結果をまとめたものです。
            コピーしてメモや相談用にお使いください。
          </p>
          <div className="flex-1 border rounded-md bg-gray-50 overflow-auto p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
            {summaryText}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors cursor-pointer"
          >
            閉じる
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-2 rounded font-bold text-white transition-all shadow cursor-pointer ${
              copied ? 'bg-green-600 hover:bg-green-700' : 'bg-brand hover:bg-blue-700'
            }`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'コピーしました' : 'テキストをコピー'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
