import { Trash2 } from 'lucide-react';
import type { SimulationInput, HousingPlan } from '../../logic/simulation';
import { NumberInput, AddButton } from './InputComponents';
import { TOOLTIPS } from './constants';

type Props = {
  input: SimulationInput;
  setInput: React.Dispatch<React.SetStateAction<SimulationInput>>;
};

export function HousingSection({ input, setInput }: Props) {
  const addHousingPlan = () => {
    setInput(prev => {
      const newPlans = [...prev.housingPlans];
      if (newPlans.length > 0) {
          const lastIndex = newPlans.length - 1;
          const prevEndAge = newPlans.length > 1 && typeof newPlans[lastIndex - 1].endAge === 'number'
            ? newPlans[lastIndex - 1].endAge as number
            : prev.currentAge;

          if (newPlans[lastIndex].endAge === 'infinite') {
              const newEndAge = Math.max(prevEndAge, prev.currentAge) + 10;
              newPlans[lastIndex] = { ...newPlans[lastIndex], endAge: newEndAge };
          }
      }
      newPlans.push({ cost: 10, endAge: 'infinite' });
      return { ...prev, housingPlans: newPlans };
    });
  };

  const removeHousingPlan = (index: number) => {
    setInput(prev => {
        const filteredPlans = prev.housingPlans.filter((_, i) => i !== index);
        if (filteredPlans.length > 0) {
            const lastIndex = filteredPlans.length - 1;
            filteredPlans[lastIndex] = { ...filteredPlans[lastIndex], endAge: 'infinite' };
        }
        return { ...prev, housingPlans: filteredPlans };
    });
  };

  const updateHousingPlan = <K extends keyof HousingPlan>(index: number, field: K, value: HousingPlan[K]) => {
    setInput(prev => {
      const newPlans = [...prev.housingPlans];
      newPlans[index] = { ...newPlans[index], [field]: value };
      return { ...prev, housingPlans: newPlans };
    });
  };

  return (
    <section>
      <h3 className="font-bold text-brand mb-3 border-b border-gray-200 pb-1">住居設定</h3>
      <p className="text-xs text-gray-500 mb-3">これからの住居プランを順に追加してください。末尾は必ず永住となります。</p>
      <div className="space-y-4">
        {input.housingPlans.map((plan, i) => {
          const isLast = i === input.housingPlans.length - 1;

          const startAge = i === 0
            ? input.currentAge
            : (input.housingPlans[i - 1].endAge as number);

          return (
            <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">プラン {i + 1}</span>
                {input.housingPlans.length > 1 && (
                  <button onClick={() => removeHousingPlan(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <NumberInput label="住宅費 (月額・万円)" value={plan.cost} onChange={v => updateHousingPlan(i, 'cost', v)} className="mb-2" tooltipContent={TOOLTIPS.housingCost} />

              {isLast ? (
                <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 border border-blue-100 rounded">
                   <span className="text-sm text-brand font-bold">永住 (以降ずっと)</span>
                </div>
              ) : (
                <NumberInput
                    label="期間 (年)"
                    value={(plan.endAge as number) - startAge}
                    onChange={v => updateHousingPlan(i, 'endAge', startAge + Math.max(1, v))}
                    tooltipContent={TOOLTIPS.housingDuration}
                    suffix={`(〜${plan.endAge}歳)`}
                />
              )}
            </div>
          );
        })}
        <AddButton onClick={addHousingPlan} label="住居プランを追加" />
      </div>
    </section>
  );
}
