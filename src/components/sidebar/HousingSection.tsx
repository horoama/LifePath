import { Trash2 } from 'lucide-react';
import type { SimulationInput, HousingPlan } from '../../logic/simulation';
import { NumberInput, SectionHeader, AddButton } from './SidebarCommon';

type HousingSectionProps = {
  input: SimulationInput;
  handleChange: <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => void;
};

const TOOLTIPS = {
  housingCost: "家賃や住宅ローン返済額など、住居にかかる月額費用です。固定金利や賃貸契約を想定し、インフレ率の影響を受けない設定としています（固定費扱い）。",
  housingDuration: "その住居費が続く期間（年数）です。住宅ローンの残期間や、次の更新までの期間などを入力します。",
};

export function HousingSection({ input, handleChange }: HousingSectionProps) {

  const addHousingPlan = () => {
    const newPlans = [...input.housingPlans];
    // If there is an existing plan, ensure the last one (which was infinite) becomes finite
    if (newPlans.length > 0) {
        const lastIndex = newPlans.length - 1;
        if (newPlans[lastIndex].duration === 'infinite') {
            newPlans[lastIndex] = { ...newPlans[lastIndex], duration: 10 };
        }
    }
    // Add new permanent plan
    newPlans.push({ cost: 10, duration: 'infinite' });
    handleChange('housingPlans', newPlans);
  };

  const removeHousingPlan = (index: number) => {
    const filteredPlans = input.housingPlans.filter((_, i) => i !== index);
    // Ensure the new last plan is infinite
    if (filteredPlans.length > 0) {
        const lastIndex = filteredPlans.length - 1;
        filteredPlans[lastIndex] = { ...filteredPlans[lastIndex], duration: 'infinite' };
    }
    handleChange('housingPlans', filteredPlans);
  };

  const updateHousingPlan = <K extends keyof HousingPlan>(index: number, field: K, value: HousingPlan[K]) => {
    const newPlans = [...input.housingPlans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    handleChange('housingPlans', newPlans);
  };

  return (
    <section>
      <SectionHeader title="住居設定" />
      <p className="text-xs text-gray-500 mb-3">これからの住居プランを順に追加してください。末尾は必ず永住となります。</p>
      <div className="space-y-4">
        {input.housingPlans.map((plan, i) => {
          const isLast = i === input.housingPlans.length - 1;
          return (
            <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">プラン {i + 1}</span>
                {input.housingPlans.length > 1 && (
                  <button onClick={() => removeHousingPlan(i)} className="text-red-500 hover:text-red-700 cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <NumberInput label="住宅費 (月額・万円)" value={plan.cost} onChange={v => updateHousingPlan(i, 'cost', v)} className="mb-2" tooltipContent={TOOLTIPS.housingCost} />

              {isLast ? (
                <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded">
                   <span className="text-sm text-brand-700 font-bold">永住 (以降ずっと)</span>
                </div>
              ) : (
                <>
                    <NumberInput label="期間 (年)" value={plan.duration as number} onChange={v => updateHousingPlan(i, 'duration', v)} tooltipContent={TOOLTIPS.housingDuration} />
                </>
              )}
            </div>
          );
        })}
        <AddButton onClick={addHousingPlan} label="住居プランを追加" />
      </div>
    </section>
  );
}
