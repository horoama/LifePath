import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';

type TooltipProps = {
  content: React.ReactNode;
};

export function Tooltip({ content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLButtonElement>(null);

  const toggleVisibility = () => {
    if (!isVisible && iconRef.current) {
      updatePosition();
    }
    setIsVisible(!isVisible);
  };

  const updatePosition = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      // Position logic:
      // Default: show below the icon, aligned left or center?
      // Mobile check: ensure it doesn't go off screen.

      // Let's position it to the bottom-left of the icon by default,
      // but shift it if it's too close to the right edge.

      const scrollY = window.scrollY;
      const scrollX = window.scrollX; // Usually 0 for this app but just in case

      setCoords({
        top: rect.bottom + scrollY + 5, // 5px gap
        left: rect.left + scrollX
      });
    }
  };

  // Close on resize/scroll to avoid detached tooltips
  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) setIsVisible(false);
    };
    window.addEventListener('scroll', handleScroll, { capture: true }); // Capture needed for nested scrolls
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVisible]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (isVisible && iconRef.current && !iconRef.current.contains(e.target as Node)) {
        // We also need to check if the click was inside the tooltip content
        // But since the tooltip is in a portal, it's tricky.
        // Actually, if we use a backdrop or just check the portal ref...
        // Let's use a simpler approach: click on icon toggles. Click anywhere else closes.
        // We will need a ref for the tooltip content if we want to allow selecting text inside it.
        // For now, let's assume clicking anywhere outside the icon closes it (unless we click inside the tooltip).

        const tooltipEl = document.getElementById('tooltip-content');
        if (tooltipEl && tooltipEl.contains(e.target as Node)) {
          return;
        }
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <>
      <button
        ref={iconRef}
        type="button"
        onClick={toggleVisibility}
        className="text-gray-400 hover:text-blue-500 focus:outline-none ml-1 align-middle transition-colors"
        aria-label="Info"
      >
        <Info size={16} />
      </button>

      {isVisible && createPortal(
        <div
          id="tooltip-content"
          className="fixed z-50 bg-gray-800 text-white text-xs p-3 rounded shadow-lg max-w-[90vw] w-64 leading-relaxed"
          style={{
            top: coords.top,
            left: coords.left,
            // Adjust position if it goes off-screen right
            // We use standard CSS translation to handle "checking" edge?
            // Better to use JS to Clamp.
            // Let's use simple CSS logic:
            // If left is > 50% of screen, translate -100%?
            // Or just Clamp logic in Render?
          }}
        >
          {/*
            Simple positioning fix:
            If we are on the right side of the screen, shift left.
          */}
          <div
            style={{
               position: 'relative',
               left: coords.left > window.innerWidth / 2 ? 'auto' : 0,
               right: coords.left > window.innerWidth / 2 ? 0 : 'auto',
               transform: coords.left > window.innerWidth / 2 ? 'translateX(-80%)' : 'none'
               // Simple heuristic: if icon is on right half, shift tooltip left
            }}
          >
             {/* Close button for explicit dismissal on mobile */}
             <div className="flex justify-between items-start gap-2 mb-1">
                <span className="font-bold text-blue-200">説明</span>
                <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
                    <X size={14} />
                </button>
             </div>
             <div>{content}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
