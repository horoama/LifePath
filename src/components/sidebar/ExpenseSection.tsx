import { Trash2 } from 'lucide-react';
import type { SimulationInput, ExpensePlan } from '../../logic/simulation';
import { NumberInput, AddButton } from './InputComponents';
import { TOOLTIPS } from './constants';

type Props = {
  input: SimulationInput;
  setInput: React.Dispatch<React.SetStateAction<SimulationInput>>;
};

export function ExpenseSection({ input, setInput }: Props) {
  const addLivingCostPlan = () => {
    setInput(prev => {
      const newPlans = [...prev.livingCostPlans];
      if (newPlans.length > 0) {
          const lastIndex = newPlans.length - 1;
          if (newPlans[lastIndex].duration === 'infinite') {
              newPlans[lastIndex] = { ...newPlans[lastIndex], duration: 10 };
          }
      }
      newPlans.push({ cost: 15, duration: 'infinite' });
      return { ...prev, livingCostPlans: newPlans };
    });
  };

  const removeLivingCostPlan = (index: number) => {
    setInput(prev => {
        const filteredPlans = prev.livingCostPlans.filter((_, i) => i !== index);
        if (filteredPlans.length > 0) {
            const lastIndex = filteredPlans.length - 1;
            filteredPlans[lastIndex] = { ...filteredPlans[lastIndex], duration: 'infinite' };
        }
        return { ...prev, livingCostPlans: filteredPlans };
    });
  };

  const updateLivingCostPlan = <K extends keyof ExpensePlan>(index: number, field: K, value: ExpensePlan[K]) => {
    setInput(prev => {
      const newPlans = [...prev.livingCostPlans];
      newPlans[index] = { ...newPlans[index], [field]: value };
      return { ...prev, livingCostPlans: newPlans };
    });
  };

  return (
    <section>
      <h3 className="font-bold text-brand mb-3 border-b border-gray-200 pb-1">基本支出</h3>
      <p className="text-xs text-gray-500 mb-3">生活費のプランを順に追加してください。末尾は必ず永続となります。<br/>※各期間の金額はインフレ率に応じて調整されます。</p>
      <div className="space-y-4">
        {input.livingCostPlans.map((plan, i) => {
          const isLast = i === input.livingCostPlans.length - 1;
          return (
            <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">プラン {i + 1}</span>
                {input.livingCostPlans.length > 1 && (
                  <button onClick={() => removeLivingCostPlan(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <NumberInput
                label="基本生活費 (住居・教育除く月額・万円)"
                value={plan.cost}
                onChange={v => updateLivingCostPlan(i, 'cost', v)}
                className="mb-2"
                tooltipContent={TOOLTIPS.monthlyLivingCost}
              />

              {isLast ? (
                <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 border border-blue-100 rounded">
                   <span className="text-sm text-brand font-bold">永続 (以降ずっと)</span>
                </div>
              ) : (
                <>
                    <NumberInput label="期間 (年)" value={plan.duration as number} onChange={v => updateLivingCostPlan(i, 'duration', v)} tooltipContent={TOOLTIPS.housingDuration} />
                </>
              )}
            </div>
          );
        })}
        <AddButton onClick={addLivingCostPlan} label="生活費プランを追加" />
      </div>
    </section>
  );
}
