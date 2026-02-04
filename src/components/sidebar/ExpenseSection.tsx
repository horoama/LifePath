import type { SimulationInput } from '../../logic/simulation';
import { NumberInput } from './InputComponents';
import { TOOLTIPS } from './constants';

type Props = {
  input: SimulationInput;
  handleChange: <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => void;
};

export function ExpenseSection({ input, handleChange }: Props) {
  return (
    <section>
      <h3 className="font-bold text-brand mb-3 border-b border-gray-200 pb-1">基本支出</h3>
      <NumberInput label="基本生活費 (住居・教育除く月額・万円)" value={input.monthlyLivingCost} onChange={v => handleChange('monthlyLivingCost', v)} tooltipContent={TOOLTIPS.monthlyLivingCost} />
    </section>
  );
}
