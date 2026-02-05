import { Share2, Check, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { getShareUrl } from '../utils/urlShare';
import type { SimulationInput } from '../logic/simulation';
import { ConfirmationModal } from './ConfirmationModal';

type ShareButtonProps = {
  input: SimulationInput;
  targetAmount: number;
  className?: string;
  variant?: 'icon' | 'text';
};

export function ShareButton({ input, targetAmount, className = '', variant = 'icon' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShareClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmShare = async () => {
    setIsModalOpen(false);
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
          onClick={handleShareClick}
          className={`cursor-pointer flex items-center justify-center gap-2 p-2 rounded-full transition-colors ${
            copied
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="現在の状態をURLで共有"
        >
          {copied ? <Check size={20} /> : <Share2 size={20} />}
          {variant === 'text' && <span className="text-sm font-bold">{copied ? 'コピーしました' : '共有'}</span>}
        </button>

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmShare}
          title="共有リンクの作成"
          confirmText="URLを発行"
        >
          <div className="flex flex-col gap-4 text-gray-700">
             <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
               <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={24} />
               <div className="space-y-2">
                 <h3 className="font-bold text-amber-800">ご注意ください</h3>
                 <p className="text-sm text-amber-900 leading-relaxed">
                   このURLには<strong>現在の入力内容（年齢、資産額、収入など）</strong>が含まれます。
                   <br/>
                   第三者に知られる可能性があるため、共有先には十分ご注意ください。
                 </p>
               </div>
             </div>
             <p className="text-center font-medium">
               URLを発行（コピー）しますか？
             </p>
          </div>
        </ConfirmationModal>
    </div>
  );
}
