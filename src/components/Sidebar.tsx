import { useState, useEffect, useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SimulationInput, HousingPlan, PostRetirementJob, Child, OneTimeEvent } from '../logic/simulation';
import { EDUCATION_PATTERNS } from '../logic/simulation';

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

  return (
    <div className="w-full lg:w-96 bg-white p-6 shadow-lg overflow-y-auto h-screen sticky top-0">
      <h2 className="text-xl font-bold mb-6 text-gray-800">シミュレーション設定</h2>

      <div className="space-y-8">
        {/* 1. Basic Info */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">基本情報</h3>
          <div className="space-y-3">
            <NumberInput label="現在の年齢" value={input.currentAge} onChange={v => handleChange('currentAge', v)} />
            <NumberInput label="現在の総資産 (万円)" value={input.currentAssets} step={10} onChange={v => handleChange('currentAssets', v)} />
            <NumberInput label="想定年利 (%)" value={input.interestRatePct} step={0.1} onChange={v => handleChange('interestRatePct', v)} />
            <NumberInput label="目標資産額 (万円)" value={targetAmount} step={100} onChange={setTargetAmount} />
          </div>
        </section>

        {/* 2. Income */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">現在の収入 (メイン)</h3>
          <div className="space-y-3">
            <NumberInput label="手取り月収 (万円)" value={input.monthlyIncome} onChange={v => handleChange('monthlyIncome', v)} />
            <NumberInput label="退職年齢" value={input.retirementAge} onChange={v => handleChange('retirementAge', v)} />
            <NumberInput label="退職金 (万円)" value={input.retirementBonus} step={100} onChange={v => handleChange('retirementBonus', v)} />
          </div>
        </section>

        {/* 3. Post-Retirement Jobs */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">退職後の仕事・再雇用・年金</h3>
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
                  <NumberInput label="開始年齢" value={job.startAge} onChange={v => updateJob(i, 'startAge', v)} />
                  <NumberInput label="終了年齢" value={job.endAge} onChange={v => updateJob(i, 'endAge', v)} />
                </div>
                <NumberInput label="月収 (万円)" value={job.monthlyIncome} onChange={v => updateJob(i, 'monthlyIncome', v)} className="mb-2" />
                <NumberInput label="退職金 (万円)" value={job.retirementBonus} onChange={v => updateJob(i, 'retirementBonus', v)} />
              </div>
            ))}
            <AddButton onClick={addJob} label="仕事を追加" />
          </div>
        </section>

        {/* 4. Basic Expenses */}
        <section>
          <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">基本支出</h3>
          <NumberInput label="基本生活費 (住居・教育除く月額・万円)" value={input.monthlyLivingCost} onChange={v => handleChange('monthlyLivingCost', v)} />
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
                    {/* Only allow removing if not the last one, or if we want to remove the last one and make previous one infinite?
                        Logic: removeHousingPlan handles making the new last one infinite.
                        But if there's only 1 plan, we shouldn't delete it? Or if we delete it, we have 0 plans?
                        Logic in simulation.ts handles 0 plans (cost 0? or crash?).
                        Usually we should keep at least 1 plan.
                    */}
                    {input.housingPlans.length > 1 && (
                      <button onClick={() => removeHousingPlan(i)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <NumberInput label="住宅費 (月額・万円)" value={plan.cost} onChange={v => updateHousingPlan(i, 'cost', v)} className="mb-2" />

                  {isLast ? (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded">
                       <span className="text-sm text-blue-800 font-bold">永住 (以降ずっと)</span>
                    </div>
                  ) : (
                    <>
                        <div className="flex items-center gap-2 mb-2 hidden">
                           {/* Hidden checkbox for non-last items, they are strictly finite duration */}
                        </div>
                        <NumberInput label="期間 (年)" value={plan.duration as number} onChange={v => updateHousingPlan(i, 'duration', v)} />
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
                <NumberInput label="誕生時期 (何年後)" value={child.birthYearOffset} onChange={v => updateChild(i, 'birthYearOffset', v)} className="mb-2" />
                <NumberInput label="養育費 (22歳まで月額・万円)" value={child.monthlyChildcareCost} onChange={v => updateChild(i, 'monthlyChildcareCost', v)} className="mb-2" />
                <div>
                  <label className="block text-xs text-gray-600 mb-1">進学コース</label>
                  <select
                    value={child.educationPattern}
                    onChange={(e) => updateChild(i, 'educationPattern', e.target.value as Child['educationPattern'])}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {EDUCATION_PATTERNS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
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
                    <label className="block text-xs text-gray-600 mb-1">イベント名</label>
                    <input
                        type="text"
                        value={evt.name}
                        onChange={(e) => updateEvent(i, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <NumberInput label="年齢" value={evt.age} onChange={v => updateEvent(i, 'age', v)} />
                    <NumberInput label="金額 (万円)" value={evt.amount} onChange={v => updateEvent(i, 'amount', v)} />
                </div>
                <div className="flex items-center gap-4">
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
function NumberInput({ label, value, onChange, step = 1, className = "" }: { label: string, value: number, onChange: (v: number) => void, step?: number, className?: string }) {
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
      <label htmlFor={id} className="block text-xs text-gray-600 mb-1">{label}</label>
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
