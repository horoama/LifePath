import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

type TooltipProps = {
  content: React.ReactNode;
};

export function Tooltip({ content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  // We use standard React state to hold the calculated position
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // If content is empty, render nothing
  if (!content) return null;

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Calculate position when visibility becomes true
  useLayoutEffect(() => {
    if (isVisible && iconRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Default: 5px below the icon
      let top = iconRect.bottom + scrollY + 5;
      let left = iconRect.left + scrollX;

      // Adjust based on tooltip size (assumed or measured)
      // Since we can't measure the tooltip before it renders in this pass easily without flickering,
      // we use the max-width logic or a "safe" measure.
      // Or we can render it off-screen, measure, then move.
      // A simpler robust approach for this app:
      // The tooltip has w-64 (256px).
      const TOOLTIP_WIDTH = 256;
      const PADDING = 10;
      const windowWidth = window.innerWidth;

      // Check right edge
      if (iconRect.left + TOOLTIP_WIDTH + PADDING > windowWidth) {
        // Shift left
        left = windowWidth - TOOLTIP_WIDTH - PADDING;
      }

      // Ensure it's not off-screen left
      if (left < PADDING) {
        left = PADDING;
      }

      setPosition({ top, left });
    }
  }, [isVisible]);

  return (
    <>
      <button
        ref={iconRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-gray-400 hover:text-blue-500 focus:outline-none ml-1 align-middle transition-colors cursor-help"
        aria-label="Info"
      >
        <Info size={16} />
      </button>

      {isVisible && position && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-800 text-white text-xs p-3 rounded shadow-lg w-64 leading-relaxed pointer-events-none"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {/* Header */}
          <div className="font-bold text-blue-200 mb-1 border-b border-gray-600 pb-1">
            説明
          </div>
          <div>{content}</div>
        </div>,
        document.body
      )}
    </>
  );
}
