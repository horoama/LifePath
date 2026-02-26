import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-100 p-4 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">利用規約・免責事項</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-gray-700 leading-relaxed text-sm overflow-y-auto">
          <section>
            <h3 className="font-bold text-gray-900 mb-2">1. シミュレーション結果について</h3>
            <p>
              本ツール「人生見えるくん」によるシミュレーション結果は、ユーザーが入力した条件に基づく概算値であり、将来の資産状況や経済状況を正確に予測・保証するものではありません。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">2. リスクと不確実性</h3>
            <p>
              実際の運用成果は、市場環境、経済情勢、税制の変更など、様々な要因により変動します。シミュレーション結果と実際の結果が大きく異なる可能性があります。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">3. 自己責任の原則</h3>
            <p>
              本ツールの利用および本ツールに基づく投資・金融判断は、利用者ご自身の責任において行ってください。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-2">4. 免責事項</h3>
            <p>
              本ツールの利用により生じたいかなる損害（直接的・間接的を問わず）についても、開発者および運営者は一切の責任を負いません。また、本ツールは予告なく変更・停止・終了することがあります。
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex justify-end border-t border-gray-100">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
