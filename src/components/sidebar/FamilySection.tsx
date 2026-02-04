import { Trash2 } from 'lucide-react';
import type { SimulationInput, Child } from '../../logic/simulation';
import { EDUCATION_PATTERNS, EDU_COSTS_MAP } from '../../logic/simulation';
import { NumberInput, AddButton } from './InputComponents';
import { TOOLTIPS } from './constants';
import { Tooltip } from '../Tooltip';

type Props = {
  input: SimulationInput;
  setInput: React.Dispatch<React.SetStateAction<SimulationInput>>;
};

export function FamilySection({ input, setInput }: Props) {
  const addChild = () => {
    setInput(prev => ({
      ...prev,
      children: [...prev.children, { birthYearOffset: 0, educationPattern: '全公立', monthlyChildcareCost: 0 }]
    }));
  };

  const removeChild = (index: number) => {
    setInput(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const updateChild = <K extends keyof Child>(index: number, field: K, value: Child[K]) => {
    setInput(prev => {
      const newChildren = [...prev.children];
      newChildren[index] = { ...newChildren[index], [field]: value };
      return { ...prev, children: newChildren };
    });
  };

  return (
    <section>
      <h3 className="font-bold text-brand mb-3 border-b border-gray-200 pb-1">子供・教育</h3>
      <div className="space-y-4">
        {input.children.map((child, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">子供 {i + 1}</span>
              <button onClick={() => removeChild(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <NumberInput label="誕生時期 (何年後)" value={child.birthYearOffset} onChange={v => updateChild(i, 'birthYearOffset', v)} className="mb-2" tooltipContent={TOOLTIPS.childBirth} />
            <NumberInput label="養育費 (22歳まで月額・万円)" value={child.monthlyChildcareCost} onChange={v => updateChild(i, 'monthlyChildcareCost', v)} className="mb-2" tooltipContent={TOOLTIPS.childCareCost} />
            <div>
              <label className="block text-xs text-gray-600 mb-1 flex items-center">
                進学コース
                <Tooltip content={TOOLTIPS.eduPattern} />
              </label>
              <select
                value={child.educationPattern}
                onChange={(e) => updateChild(i, 'educationPattern', e.target.value as Child['educationPattern'])}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand focus:outline-none transition-colors"
              >
                {EDUCATION_PATTERNS.map(p => {
                  const costs = EDU_COSTS_MAP[p];
                  const total = (costs.primary * 6) + (costs.middle * 3) + (costs.high * 3) + (costs.uni * 4);
                  const label = `${p} (小${costs.primary}/中${costs.middle}/高${costs.high}/大${costs.uni} 総額${total}万)`;
                  return (
                    <option key={p} value={p}>{label}</option>
                  );
                })}
              </select>
            </div>
          </div>
        ))}
        <AddButton onClick={addChild} label="子供を追加" />
      </div>
    </section>
  );
}
