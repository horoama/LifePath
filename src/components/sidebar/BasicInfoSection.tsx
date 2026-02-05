import type { SimulationInput } from '../../logic/simulation';
import { NumberInput } from './InputComponents';
import { TOOLTIPS } from './constants';

type Props = {
  input: SimulationInput;
  handleChange: <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => void;
  targetAmount: number;
  setTargetAmount: (val: number) => void;
};

export function BasicInfoSection({ input, handleChange, targetAmount, setTargetAmount }: Props) {
  const handleDeathAgeChange = (val: number) => {
    // Clamp between currentAge + 1 and 120
    const min = input.currentAge + 1;
    const max = 120;
    let newValue = val;
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    handleChange('deathAge', newValue);
  };

  return (
    <section>
      <h3 className="font-bold text-brand mb-3 border-b border-gray-200 pb-1">基本情報</h3>
      <div className="space-y-3">
        <NumberInput label="現在の年齢" value={input.currentAge} min={0} max={120} onChange={v => handleChange('currentAge', v)} tooltipContent={TOOLTIPS.currentAge} />
        <NumberInput label="想定寿命 (歳)" value={input.deathAge || 100} min={input.currentAge + 1} max={120} onChange={handleDeathAgeChange} tooltipContent={TOOLTIPS.deathAge} />
        <NumberInput label="現在の総資産 (万円)" value={input.currentAssets} min={0} step={10} onChange={v => handleChange('currentAssets', v)} tooltipContent={TOOLTIPS.currentAssets} />
        <NumberInput label="想定年利 (%)" value={input.interestRatePct} min={-10} step={0.1} onChange={v => handleChange('interestRatePct', v)} tooltipContent={TOOLTIPS.interestRate} />
        <NumberInput label="想定インフレ率 (%)" value={input.inflationRatePct ?? 0} min={-10} step={0.1} onChange={v => handleChange('inflationRatePct', v)} tooltipContent={TOOLTIPS.inflationRate} />
        <NumberInput label="目標資産額 (万円)" value={targetAmount} min={0} step={100} onChange={setTargetAmount} tooltipContent={TOOLTIPS.targetAmount} />
      </div>
    </section>
  );
}
