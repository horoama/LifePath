import type { SimulationInput } from '../../logic/simulation';
import { NumberInput, SectionHeader } from './SidebarCommon';

type IncomeSectionProps = {
  input: SimulationInput;
  handleChange: <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => void;
};

const TOOLTIPS = {
  monthlyIncome: "現在の手取り月収（ボーナスを除く）です。将来の昇給率は別途設定できます。",
  incomeIncreaseRate: "給与の毎年の上昇率（昇給率）です。0%の場合は現在の給与が続くと仮定します。将来の収入増を見込む場合に設定します。",
  retirementAge: "メインの仕事を退職する年齢です。この年齢以降はメインの給与収入がなくなります。",
  retirementBonus: "退職時に受け取る退職金（手取り額）です。ない場合は0を入力してください。",
};

export function IncomeSection({ input, handleChange }: IncomeSectionProps) {
  return (
    <section>
      <SectionHeader title="現在の収入 (メイン)" />
      <div className="space-y-3">
        <NumberInput label="手取り月収 (万円)" value={input.monthlyIncome} onChange={v => handleChange('monthlyIncome', v)} tooltipContent={TOOLTIPS.monthlyIncome} />
        <NumberInput label="想定昇給率 (%)" value={input.incomeIncreaseRatePct ?? 0} step={0.1} onChange={v => handleChange('incomeIncreaseRatePct', v)} tooltipContent={TOOLTIPS.incomeIncreaseRate} />
        <NumberInput label="退職年齢" value={input.retirementAge} onChange={v => handleChange('retirementAge', v)} tooltipContent={TOOLTIPS.retirementAge} />
        <NumberInput label="退職金 (万円)" value={input.retirementBonus} step={100} onChange={v => handleChange('retirementBonus', v)} tooltipContent={TOOLTIPS.retirementBonus} />
      </div>
    </section>
  );
}
