import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasVisited', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-300">

        {/* Header with decorative background */}
        <div className="bg-brand-50 p-6 flex flex-col items-center justify-center text-center border-b border-brand-100 relative">
            <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white/50"
            >
                <X size={20} />
            </button>

            <div className="bg-white p-3 rounded-full shadow-md mb-4">
                <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="w-16 h-16" />
            </div>

            <h2 className="text-2xl font-bold text-brand-700 mb-1">人生見えるくんへようこそ</h2>
            <p className="text-brand-600 text-sm font-medium">あなたの未来をシミュレーション</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-gray-600 text-sm leading-relaxed">
          <p>
            このアプリは、現在の収入や資産、将来のライフイベントを入力することで、
            <strong className="text-brand-600">将来の資産推移を見える化</strong>できるシミュレーションツールです。
          </p>

          <ul className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <li className="flex gap-2">
                <span className="text-brand-500 font-bold">1.</span>
                <span>左側のサイドバーで基本情報や収支を入力</span>
            </li>
            <li className="flex gap-2">
                <span className="text-brand-500 font-bold">2.</span>
                <span>リアルタイムでグラフが変化し、未来を予測</span>
            </li>
            <li className="flex gap-2">
                <span className="text-brand-500 font-bold">3.</span>
                <span>「結果」タブで詳細な内訳や推移を確認</span>
            </li>
          </ul>

          <p className="text-xs text-gray-400 mt-4">
            ※ 入力されたデータはブラウザ内にのみ保存され、外部サーバーに送信されることはありません。安心してお使いください。
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={handleClose}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 text-center cursor-pointer"
          >
            シミュレーションを始める
          </button>
        </div>
      </div>
    </div>
  );
}
