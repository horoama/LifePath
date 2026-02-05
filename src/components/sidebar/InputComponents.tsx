import { useState, useId, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Tooltip } from '../Tooltip';

export function NumberInput({ label, value, onChange, step = 1, className = "", tooltipContent, suffix }: { label: string, value: number, onChange: (v: number) => void, step?: number, className?: string, tooltipContent?: React.ReactNode, suffix?: React.ReactNode }) {
  const id = useId();
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  if (!isFocused && inputValue !== value.toString()) {
    setInputValue(value.toString());
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    // Clear any pending debounce update to avoid double update
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    const currentVal = e.target.value;
    if (currentVal === '' || isNaN(parseFloat(currentVal))) {
      onChange(0);
      setInputValue('0');
    } else {
      onChange(parseFloat(currentVal));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
        if (val === '') {
            onChange(0);
        } else {
            const num = parseFloat(val);
            if (!isNaN(num)) {
                onChange(num);
            }
        }
        debounceTimer.current = null;
    }, 500);
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs text-gray-600 mb-1 flex items-center">
        {label}
        {tooltipContent && <Tooltip content={tooltipContent} />}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          value={inputValue}
          step={step}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onChange={handleChange}
          className="flex-1 min-w-0 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand focus:outline-none text-sm transition-colors"
        />
        {suffix && <span className="shrink-0 text-sm text-gray-600">{suffix}</span>}
      </div>
    </div>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-brand hover:text-brand transition-colors text-sm cursor-pointer"
    >
      <Plus size={16} /> {label}
    </button>
  );
}
