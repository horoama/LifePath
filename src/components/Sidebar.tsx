import { useState, useEffect, useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SimulationInput, HousingPlan, PostRetirementJob, Child, OneTimeEvent } from '../logic/simulation';
import { EDUCATION_PATTERNS, EDU_COSTS_MAP } from '../logic/simulation';
import { Tooltip } from './Tooltip';

type SidebarProps = {
  input: SimulationInput;
  setInput: React.Dispatch<React.SetStateAction<SimulationInput>>;
  targetAmount: number;
  setTargetAmount: (val: number) => void;
};

export function Sidebar({ input, setInput, targetAmount, setTargetAmount }: SidebarProps) {
  const handleChange = <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const handleDeathAgeChange = (val: number) => {
    // Clamp between currentAge + 1 and 120
    const min = input.currentAge + 1;
    const max = 120;
    let newValue = val;
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    handleChange('deathAge', newValue);
  };

  // --- Helper Functions for Arrays ---

  // Post-Retirement Jobs
  const addJob = () => {
    handleChange('postRetirementJobs', [...input.postRetirementJobs, { startAge: 60, endAge: 65, monthlyIncome: 20, retirementBonus: 0 }]);
  };
  const removeJob = (index: number) => {
    handleChange('postRetirementJobs', input.postRetirementJobs.filter((_, i) => i !== index));
  };
  const updateJob = <K extends keyof PostRetirementJob>(index: number, field: K, value: PostRetirementJob[K]) => {
    const newJobs = [...input.postRetirementJobs];
    newJobs[index] = { ...newJobs[index], [field]: value };
    handleChange('postRetirementJobs', newJobs);
  };

  // Housing Plans
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

  // Children
  const addChild = () => {
    handleChange('children', [...input.children, { birthYearOffset: 0, educationPattern: '全公立', monthlyChildcareCost: 0 }]);
  };
  const removeChild = (index: number) => {
    handleChange('children', input.children.filter((_, i) => i !== index));
  };
  const updateChild = <K extends keyof Child>(index: number, field: K, value: Child[K]) => {
    const newChildren = [...input.children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    handleChange('children', newChildren);
  };

  // One-Time Events
  const addEvent = () => {
    handleChange('oneTimeEvents', [...input.oneTimeEvents, { age: input.currentAge, amount: 100, type: 'expense', name: '旅行' }]);
  };
  const removeEvent = (index: number) => {
    handleChange('oneTimeEvents', input.oneTimeEvents.filter((_, i) => i !== index));
  };
  const updateEvent = <K extends keyof OneTimeEvent>(index: number, field: K, value: OneTimeEvent[K]) => {
    const newEvents = [...input.oneTimeEvents];
    newEvents[index] = { ...newEvents[index], [field]: value };
    handleChange('oneTimeEvents', newEvents);
  };

  // Tooltip Content Constants
  const TOOLTIPS = {
    currentAge: "シミュレーションを開始する現在の年齢です。ここを起点に将来の収支を計算します。",
    deathAge: "シミュレーションを終了する年齢です。デフォルトは100歳ですが、ご自身の想定に合わせて調整してください。",
    currentAssets: "現在保有している金融資産の総額（現金、預金、株式、投資信託など）を入力してください。不動産などの流動性の低い資産は含めないことを推奨します。",
    interestRate: "保有資産全体の想定リターン（年利）です。リスク資産と安全資産の割合を考慮して設定してください（例: 株式中心なら3-5%、預金中心なら0.01-0.1%など）。インフレ率を含まない名目利回りを設定してください。",
    inflationRate: "生活費や教育費の毎年の上昇率です。将来の購買力を考慮するために設定します（例: 日本政府の目標は2%）。シミュレーション結果は原則として名目値（将来価値）で表示されますが、総資産についてはインフレ調整後の価値も確認できます。",
    targetAmount: "老後資金として確保したい目標金額です。グラフ上に目標ラインとして表示され、達成度を確認できます。",
    monthlyIncome: "現在の手取り月収（ボーナスを除く）です。将来の昇給率は別途設定できます。",
    incomeIncreaseRate: "給与の毎年の上昇率（昇給率）です。0%の場合は現在の給与が続くと仮定します。将来の収入増を見込む場合に設定します。",
    retirementAge: "メインの仕事を退職する年齢です。この年齢以降はメインの給与収入がなくなります。",
    retirementBonus: "退職時に受け取る退職金（手取り額）です。ない場合は0を入力してください。",
    postRetirementJob: "定年退職後の再雇用、アルバイト、または公的年金などの収入源を設定します。複数の収入源を追加可能です。",
    monthlyLivingCost: "住居費と教育費を除いた、毎月の基本的な生活費（食費、光熱費、通信費、被服費、趣味など）です。この金額はインフレ率に応じて毎年増加（名目額が増加）します。",
    housingCost: "家賃や住宅ローン返済額など、住居にかかる月額費用です。固定金利や賃貸契約を想定し、インフレ率の影響を受けない設定としています（固定費扱い）。",
    housingDuration: "その住居費が続く期間（年数）です。住宅ローンの残期間や、次の更新までの期間などを入力します。",
    childBirth: "現在から何年後に子供が生まれるか（または生まれたか）を設定します。過去（既にお子さんがいる場合）はマイナス値を入力してください（例: 5歳のお子さんがいる場合は -5）。",
    childCareCost: "子供1人あたりの毎月の養育費（食費・被服費・医療費・お小遣いなど）です。学費とは別に発生する費用です。インフレ率の影響を受けます。",
    eduPattern: (
      <div className="space-y-2">
        <p>進路ごとの年間教育費目安（学校納付金＋学校外活動費）</p>
        <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-1">コース</th>
              <th className="py-1">小</th>
              <th className="py-1">中</th>
              <th className="py-1">高</th>
              <th className="py-1">大</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700">
              <td className="py-1">全公立</td>
              <td>40</td>
              <td>40</td>
              <td>40</td>
              <td>100</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="py-1">全私立</td>
              <td>120</td>
              <td>120</td>
              <td>120</td>
              <td>150</td>
            </tr>
            <tr>
              <td className="py-1">大のみ私</td>
              <td>40</td>
              <td>40</td>
              <td>40</td>
              <td>150</td>
            </tr>
          </tbody>
        </table>
        <p className="text-[10px] text-gray-300">※単位: 万円/年。これとは別に上記の「養育費」がかかります。</p>
      </div>
    ),
    eventName: "イベントの内容を識別するための名前を入力してください（例: 車購入、リフォーム、遺産相続など）。",
    eventAge: "イベントが発生する年齢です。現在の年齢より未来の年齢を設定してください。",
    eventAmount: "イベントにかかる費用（支出）、または臨時収入の金額です。",
    eventType: "このイベントが支出（お金が出ていく）か、収入（お金が入ってくる）かを選択してください。",
    postRetirementStartAge: "この収入（仕事や年金）が始まる年齢です。",
    postRetirementEndAge: "この収入（仕事や年金）が終わる年齢です。年金の場合は想定寿命と同じか、それ以上の年齢を設定してください。",
    postRetirementIncome: "受取時点での月額収入（額面または手取り）です。年金の場合は受給予定額を入力します。インフレ率は考慮されず、入力額がそのまま加算されます。",
    postRetirementBonus: "この仕事を辞める際に受け取る一時金があれば入力します。なければ0で構いません。",
  };

  return (
    <div className="w-full lg:w-96 bg-white p-6 shadow-lg overflow-y-auto h-screen sticky top-0">
      <h2 className="hidden lg:flex text-xl font-bold mb-6 text-gray-800 items-center gap-2">
        <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
        人生見えるくん
      </h2>

      <div className="space-y-8">
        {/* 1. Basic Info */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">基本情報</h3>
          <div className="space-y-3">
            <NumberInput label="現在の年齢" value={input.currentAge} onChange={v => handleChange('currentAge', v)} tooltipContent={TOOLTIPS.currentAge} />
            <NumberInput label="想定寿命 (歳)" value={input.deathAge || 100} onChange={handleDeathAgeChange} tooltipContent={TOOLTIPS.deathAge} />
            <NumberInput label="現在の総資産 (万円)" value={input.currentAssets} step={10} onChange={v => handleChange('currentAssets', v)} tooltipContent={TOOLTIPS.currentAssets} />
            <NumberInput label="想定年利 (%)" value={input.interestRatePct} step={0.1} onChange={v => handleChange('interestRatePct', v)} tooltipContent={TOOLTIPS.interestRate} />
            <NumberInput label="想定インフレ率 (%)" value={input.inflationRatePct ?? 0} step={0.1} onChange={v => handleChange('inflationRatePct', v)} tooltipContent={TOOLTIPS.inflationRate} />
            <NumberInput label="目標資産額 (万円)" value={targetAmount} step={100} onChange={setTargetAmount} tooltipContent={TOOLTIPS.targetAmount} />
          </div>
        </section>

        {/* 2. Income */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">現在の収入 (メイン)</h3>
          <div className="space-y-3">
            <NumberInput label="手取り月収 (万円)" value={input.monthlyIncome} onChange={v => handleChange('monthlyIncome', v)} tooltipContent={TOOLTIPS.monthlyIncome} />
            <NumberInput label="想定昇給率 (%)" value={input.incomeIncreaseRatePct ?? 0} step={0.1} onChange={v => handleChange('incomeIncreaseRatePct', v)} tooltipContent={TOOLTIPS.incomeIncreaseRate} />
            <NumberInput label="退職年齢" value={input.retirementAge} onChange={v => handleChange('retirementAge', v)} tooltipContent={TOOLTIPS.retirementAge} />
            <NumberInput label="退職金 (万円)" value={input.retirementBonus} step={100} onChange={v => handleChange('retirementBonus', v)} tooltipContent={TOOLTIPS.retirementBonus} />
          </div>
        </section>

        {/* 3. Post-Retirement Jobs */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1 flex items-center">
            退職後の仕事・再雇用・年金
            <Tooltip content={TOOLTIPS.postRetirementJob} />
          </h3>
          <div className="space-y-4">
            {input.postRetirementJobs.map((job, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">仕事 {i + 1}</span>
                  <button onClick={() => removeJob(i)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <NumberInput label="開始年齢" value={job.startAge} onChange={v => updateJob(i, 'startAge', v)} tooltipContent={TOOLTIPS.postRetirementStartAge} />
                  <NumberInput label="終了年齢" value={job.endAge} onChange={v => updateJob(i, 'endAge', v)} tooltipContent={TOOLTIPS.postRetirementEndAge} />
                </div>
                <NumberInput label="月収 (万円)" value={job.monthlyIncome} onChange={v => updateJob(i, 'monthlyIncome', v)} className="mb-2" tooltipContent={TOOLTIPS.postRetirementIncome} />
                <NumberInput label="退職金 (万円)" value={job.retirementBonus} onChange={v => updateJob(i, 'retirementBonus', v)} tooltipContent={TOOLTIPS.postRetirementBonus} />
              </div>
            ))}
            <AddButton onClick={addJob} label="仕事を追加" />
          </div>
        </section>

        {/* 4. Basic Expenses */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">基本支出</h3>
          <NumberInput label="基本生活費 (住居・教育除く月額・万円)" value={input.monthlyLivingCost} onChange={v => handleChange('monthlyLivingCost', v)} tooltipContent={TOOLTIPS.monthlyLivingCost} />
        </section>

        {/* 5. Housing */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">住居設定</h3>
          <p className="text-xs text-gray-500 mb-3">これからの住居プランを順に追加してください。末尾は必ず永住となります。</p>
          <div className="space-y-4">
            {input.housingPlans.map((plan, i) => {
              const isLast = i === input.housingPlans.length - 1;
              return (
                <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">プラン {i + 1}</span>
                    {input.housingPlans.length > 1 && (
                      <button onClick={() => removeHousingPlan(i)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <NumberInput label="住宅費 (月額・万円)" value={plan.cost} onChange={v => updateHousingPlan(i, 'cost', v)} className="mb-2" tooltipContent={TOOLTIPS.housingCost} />

                  {isLast ? (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded">
                       <span className="text-sm text-blue-800 font-bold">永住 (以降ずっと)</span>
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

        {/* 6. Children */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">子供・教育</h3>
          <div className="space-y-4">
            {input.children.map((child, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">子供 {i + 1}</span>
                  <button onClick={() => removeChild(i)} className="text-red-500 hover:text-red-700">
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
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

        {/* 7. One-Time Events */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">ライフイベント (特別収支)</h3>
          <div className="space-y-4">
            {input.oneTimeEvents.map((evt, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">イベント {i + 1}</span>
                  <button onClick={() => removeEvent(i)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1 flex items-center">
                      イベント名
                      <Tooltip content={TOOLTIPS.eventName} />
                    </label>
                    <input
                        type="text"
                        value={evt.name}
                        onChange={(e) => updateEvent(i, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <NumberInput label="年齢" value={evt.age} onChange={v => updateEvent(i, 'age', v)} tooltipContent={TOOLTIPS.eventAge} />
                    <NumberInput label="金額 (万円)" value={evt.amount} onChange={v => updateEvent(i, 'amount', v)} tooltipContent={TOOLTIPS.eventAmount} />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">タイプ</span>
                        <Tooltip content={TOOLTIPS.eventType} />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="radio"
                            checked={evt.type === 'expense'}
                            onChange={() => updateEvent(i, 'type', 'expense')}
                            className="text-red-600 focus:ring-red-500"
                        /> 支出
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="radio"
                            checked={evt.type === 'income'}
                            onChange={() => updateEvent(i, 'type', 'income')}
                            className="text-green-600 focus:ring-green-500"
                        /> 収入
                    </label>
                </div>
              </div>
            ))}
            <AddButton onClick={addEvent} label="イベントを追加" />
          </div>
        </section>
      </div>
    </div>
  );
}

// Helper components
function NumberInput({ label, value, onChange, step = 1, className = "", tooltipContent }: { label: string, value: number, onChange: (v: number) => void, step?: number, className?: string, tooltipContent?: React.ReactNode }) {
  const id = useId();
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue === '' || isNaN(parseFloat(inputValue))) {
      onChange(0);
      setInputValue('0');
    } else {
      onChange(parseFloat(inputValue));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val === '') {
        onChange(0);
    } else {
        const num = parseFloat(val);
        if (!isNaN(num)) {
            onChange(num);
        }
    }
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs text-gray-600 mb-1 flex items-center">
        {label}
        {tooltipContent && <Tooltip content={tooltipContent} />}
      </label>
      <input
        id={id}
        type="number"
        value={inputValue}
        step={step}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
      />
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors text-sm"
    >
      <Plus size={16} /> {label}
    </button>
  );
}
