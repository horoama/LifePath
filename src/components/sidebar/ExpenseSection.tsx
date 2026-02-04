import type { SimulationInput } from '../../logic/simulation';
import { NumberInput, SectionHeader } from './SidebarCommon';

type ExpenseSectionProps = {
  input: SimulationInput;
  handleChange: <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => void;
};

const TOOLTIPS = {
  monthlyLivingCost: "住居費と教育費を除いた、毎月の基本的な生活費（食費、光熱費、通信費、被服費、趣味など）です。この金額はインフレ率に応じて毎年増加（名目額が増加）します。",
};

export function ExpenseSection({ input, handleChange }: ExpenseSectionProps) {
  return (
    <section>
      <SectionHeader title="基本支出" />
      <NumberInput label="基本生活費 (住居・教育除く月額・万円)" value={input.monthlyLivingCost} onChange={v => handleChange('monthlyLivingCost', v)} tooltipContent={TOOLTIPS.monthlyLivingCost} />
    </section>
  );
}
