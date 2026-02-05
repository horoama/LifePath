import { useState } from 'react';
import { X } from 'lucide-react';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(() => {
    // Check if the user has visited before
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('hasVisited');
      return !hasVisited;
    }
    return false;
  });

  const handleClose = () => {
    localStorage.setItem('hasVisited', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-brand p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="w-8 h-8 bg-white rounded-full p-1" />
            人生見えるくんへようこそ
          </h2>
          <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-gray-700 leading-relaxed">
          <p>
            「人生見えるくん」は、あなたの将来の資産推移をシミュレーションできるツールです。
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>入力は左側 (PC) / タブ切り替え (スマホ)</strong>: 現在の資産、収入、家族構成などを入力してください。
            </li>
            <li>
              <strong>リアルタイム反映</strong>: 入力内容は即座にグラフや表に反映されます。
            </li>
            <li>
              <strong>プライバシー重視</strong>: 入力データはブラウザ内でのみ処理され、サーバーには送信されません。
            </li>
          </ul>
          <p className="text-sm text-gray-500 mt-4 border-t border-gray-100 pt-4">
            ※ シミュレーション結果はあくまで目安です。インフレ率や投資リターンなど、不確実な要素を含んでいます。
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex justify-center border-t border-gray-100">
          <button
            onClick={handleClose}
            className="bg-brand hover:bg-brand-light text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            シミュレーションを始める
          </button>
        </div>
      </div>
    </div>
  );
}
