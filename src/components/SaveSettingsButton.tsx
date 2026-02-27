import { useState } from 'react';
import { Save } from 'lucide-react';
import type { SimulationInput } from '../logic/simulation';
import { saveSettings } from '../utils/storage';

type SaveSettingsButtonProps = {
  input: SimulationInput;
  targetAmount: number;
};

export function SaveSettingsButton({ input, targetAmount }: SaveSettingsButtonProps) {
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    const success = saveSettings(input, targetAmount);
    if (success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-2">
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
        >
          <Save size={18} />
          設定をブラウザに保存
        </button>
        <p className="text-xs text-gray-500 text-center">
          現在の入力内容を保存します。次回アクセス時に自動で復元されます。
        </p>
      </div>

      {/* Toast Notification */}
      <div
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-black/80 text-white text-sm rounded shadow-lg transition-all duration-300 pointer-events-none whitespace-nowrap ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        設定を保存しました
      </div>
    </div>
  );
}
