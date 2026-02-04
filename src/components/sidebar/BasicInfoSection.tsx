import type { SimulationInput } from '../../logic/simulation';
import { NumberInput, SectionHeader } from './SidebarCommon';

type BasicInfoSectionProps = {
  input: SimulationInput;
  handleChange: <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => void;
  targetAmount: number;
  setTargetAmount: (val: number) => void;
};

const TOOLTIPS = {
  currentAge: "シミュレーションを開始する現在の年齢です。ここを起点に将来の収支を計算します。",
  deathAge: "シミュレーションを終了する年齢です。デフォルトは100歳ですが、ご自身の想定に合わせて調整してください。",
  currentAssets: "現在保有している金融資産の総額（現金、預金、株式、投資信託など）を入力してください。不動産などの流動性の低い資産は含めないことを推奨します。",
  interestRate: "保有資産全体の想定リターン（年利）です。リスク資産と安全資産の割合を考慮して設定してください（例: 株式中心なら3-5%、預金中心なら0.01-0.1%など）。インフレ率を含まない名目利回りを設定してください。",
  inflationRate: "生活費や教育費の毎年の上昇率です。将来の購買力を考慮するために設定します（例: 日本政府の目標は2%）。シミュレーション結果は原則として名目値（将来価値）で表示されますが、総資産についてはインフレ調整後の価値も確認できます。",
  targetAmount: "老後資金として確保したい目標金額です。グラフ上に目標ラインとして表示され、達成度を確認できます。",
};

export function BasicInfoSection({ input, handleChange, targetAmount, setTargetAmount }: BasicInfoSectionProps) {

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
      <SectionHeader title="基本情報" />
      <div className="space-y-3">
        <NumberInput label="現在の年齢" value={input.currentAge} onChange={v => handleChange('currentAge', v)} tooltipContent={TOOLTIPS.currentAge} />
        <NumberInput label="想定寿命 (歳)" value={input.deathAge || 100} onChange={handleDeathAgeChange} tooltipContent={TOOLTIPS.deathAge} />
        <NumberInput label="現在の総資産 (万円)" value={input.currentAssets} step={10} onChange={v => handleChange('currentAssets', v)} tooltipContent={TOOLTIPS.currentAssets} />
        <NumberInput label="想定年利 (%)" value={input.interestRatePct} step={0.1} onChange={v => handleChange('interestRatePct', v)} tooltipContent={TOOLTIPS.interestRate} />
        <NumberInput label="想定インフレ率 (%)" value={input.inflationRatePct ?? 0} step={0.1} onChange={v => handleChange('inflationRatePct', v)} tooltipContent={TOOLTIPS.inflationRate} />
        <NumberInput label="目標資産額 (万円)" value={targetAmount} step={100} onChange={setTargetAmount} tooltipContent={TOOLTIPS.targetAmount} />
      </div>
    </section>
  );
}
