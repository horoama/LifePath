import { Share2, Check, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { getShareUrl } from '../utils/urlShare';
import type { SimulationInput } from '../logic/simulation';

type ShareButtonProps = {
  input: SimulationInput;
  targetAmount: number;
  className?: string;
  variant?: 'icon' | 'text';
};

export function ShareButton({ input, targetAmount, className = '', variant = 'icon' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Warning confirmation
    const confirmed = window.confirm(
      'このURLには現在の入力内容が含まれます。\n\n個人情報（年齢、資産額、収入など）が第三者に知られる可能性があるため、共有先には十分ご注意ください。\n\nURLを発行しますか？'
    );

    if (!confirmed) return;

    const url = getShareUrl(input, targetAmount);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('URLのコピーに失敗しました。');
    }
  };

  return (
    <div className={`relative ${className}`}>
        <button
          onClick={handleShare}
          className={`flex items-center justify-center gap-2 p-2 rounded-full transition-colors ${
            copied
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="現在の状態をURLで共有"
        >
          {copied ? <Check size={20} /> : <Share2 size={20} />}
          {variant === 'text' && <span className="text-sm font-bold">{copied ? 'コピーしました' : '共有'}</span>}
        </button>
    </div>
  );
}
