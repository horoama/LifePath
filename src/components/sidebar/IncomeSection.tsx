import type { SimulationInput } from '../../logic/simulation';
import { NumberInput } from './InputComponents';
import { TOOLTIPS } from './constants';

type Props = {
  input: SimulationInput;
  handleChange: <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => void;
};

export function IncomeSection({ input, handleChange }: Props) {
  return (
    <section>
      <h3 className="font-bold text-brand mb-3 border-b border-gray-200 pb-1">現在の収入 (メイン)</h3>
      <div className="space-y-3">
        <NumberInput label="手取り月収 (万円)" value={input.monthlyIncome} onChange={v => handleChange('monthlyIncome', v)} tooltipContent={TOOLTIPS.monthlyIncome} />
        <NumberInput label="年間ボーナス (万円)" value={input.annualBonus} onChange={v => handleChange('annualBonus', v)} tooltipContent="年間のボーナス支給額（手取り）を入力してください。インフレ率や昇給率の影響を受けず、固定額として加算されます。" />
        <NumberInput label="想定昇給率 (%)" value={input.incomeIncreaseRatePct ?? 0} step={0.1} onChange={v => handleChange('incomeIncreaseRatePct', v)} tooltipContent={TOOLTIPS.incomeIncreaseRate} />
        <NumberInput label="退職年齢" value={input.retirementAge} onChange={v => handleChange('retirementAge', v)} tooltipContent={TOOLTIPS.retirementAge} />
        <NumberInput label="退職金 (万円)" value={input.retirementBonus} step={100} onChange={v => handleChange('retirementBonus', v)} tooltipContent={TOOLTIPS.retirementBonus} />
      </div>
    </section>
  );
}
