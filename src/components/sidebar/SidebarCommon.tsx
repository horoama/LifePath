import { useState, useId } from 'react';
import { Plus } from 'lucide-react';
import { Tooltip } from '../Tooltip';

// Helper components
export function NumberInput({
  label,
  value,
  onChange,
  step = 1,
  className = "",
  tooltipContent
}: {
  label: string,
  value: number,
  onChange: (v: number) => void,
  step?: number,
  className?: string,
  tooltipContent?: React.ReactNode
}) {
  const id = useId();
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Sync with prop value when not focused
  if (!isFocused && inputValue !== value.toString()) {
    setInputValue(value.toString());
  }

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue === '' || isNaN(parseFloat(inputValue))) {
      onChange(0);
      setInputValue('0');
    } else {
      onChange(parseFloat(inputValue));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val === '') {
        onChange(0);
    } else {
        const num = parseFloat(val);
        if (!isNaN(num)) {
            onChange(num);
        }
    }
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs text-gray-600 mb-1 flex items-center">
        {label}
        {tooltipContent && <Tooltip content={tooltipContent} />}
      </label>
      <input
        id={id}
        type="number"
        value={inputValue}
        step={step}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm transition-shadow"
      />
    </div>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-colors text-sm cursor-pointer"
    >
      <Plus size={16} /> {label}
    </button>
  );
}

// Section Header Component for consistency
export function SectionHeader({ title, tooltip }: { title: string, tooltip?: React.ReactNode }) {
  return (
    <h3 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1 flex items-center gap-1">
      {title}
      {tooltip && <Tooltip content={tooltip} />}
    </h3>
  );
}
