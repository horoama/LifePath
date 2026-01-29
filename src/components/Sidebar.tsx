import { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SimulationInput, HousingPlan, Child, PostRetirementJob } from '../logic/simulation';
import { EDUCATION_PATTERNS } from '../logic/simulation';

type SidebarProps = {
  input: SimulationInput;
  setInput: React.Dispatch<React.SetStateAction<SimulationInput>>;
  targetAmount: number;
  setTargetAmount: (val: number) => void;
};

export function Sidebar({ input, setInput, targetAmount, setTargetAmount }: SidebarProps) {
  const handleChange = (field: keyof SimulationInput, value: any) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  // Housing Plan Handlers
  const updateHousingPlan = (index: number, field: keyof HousingPlan, value: any) => {
    const newPlans = [...input.housingPlans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    handleChange('housingPlans', newPlans);
  };
  const addHousingPlan = () => {
    handleChange('housingPlans', [...input.housingPlans, { cost: 10, duration: 10 }]);
  };
  const removeHousingPlan = (index: number) => {
    const newPlans = input.housingPlans.filter((_, i) => i !== index);
    handleChange('housingPlans', newPlans);
  };

  // Child Handlers
  const updateChild = (index: number, field: keyof Child, value: any) => {
    const newChildren = [...input.children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    handleChange('children', newChildren);
  };
  const addChild = () => {
    handleChange('children', [...input.children, { birthYearOffset: 0, educationPattern: '全公立' }]);
  };
  const removeChild = (index: number) => {
    const newChildren = input.children.filter((_, i) => i !== index);
    handleChange('children', newChildren);
  };

  // Post-Retirement Job Handlers
  const updateJob = (index: number, field: keyof PostRetirementJob, value: any) => {
    const newJobs = [...input.postRetirementJobs];
    newJobs[index] = { ...newJobs[index], [field]: value };
    handleChange('postRetirementJobs', newJobs);
  };
  const addJob = () => {
    handleChange('postRetirementJobs', [...input.postRetirementJobs, { startAge: 65, endAge: 70, monthlyIncome: 10 }]);
  };
  const removeJob = (index: number) => {
    const newJobs = input.postRetirementJobs.filter((_, i) => i !== index);
    handleChange('postRetirementJobs', newJobs);
  };

  return (
    <div className="w-full lg:w-80 bg-white p-6 shadow-lg overflow-y-auto h-screen sticky top-0">
      <h2 className="text-xl font-bold mb-6 text-gray-800">入力パラメータ</h2>

      <div className="space-y-6">
        {/* 1. Basic Info */}
        <section>
          <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">基本情報</h3>
          <div className="space-y-3">
            <InputGroup label="現在の年齢" value={input.currentAge} onChange={v => handleChange('currentAge', v)} />
            <InputGroup label="現在の総資産 (万円)" value={input.currentAssets} step={10} onChange={v => handleChange('currentAssets', v)} />
            <InputGroup label="想定年利 (%)" value={input.interestRatePct} step={0.1} onChange={v => handleChange('interestRatePct', v)} />
            <InputGroup label="目標資産額 (万円)" value={targetAmount} step={100} onChange={setTargetAmount} />
          </div>
        </section>

        {/* 2. Income & Retirement */}
        <section>
          <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">収入・退職設定</h3>
          <div className="space-y-3 mb-4">
            <InputGroup label="現在の月収 (手取り・万円)" value={input.monthlyIncome} onChange={v => handleChange('monthlyIncome', v)} />
            <InputGroup label="退職年齢" value={input.retirementAge} onChange={v => handleChange('retirementAge', v)} />
            <InputGroup label="退職金 (万円)" value={input.retirementBonus} step={100} onChange={v => handleChange('retirementBonus', v)} />
          </div>

          <p className="text-xs text-gray-500 mb-2">退職後の仕事 (複数追加可)</p>
          <div className="space-y-3">
             {input.postRetirementJobs.map((job, i) => (
               <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">仕事 {i + 1}</span>
                    <button onClick={() => removeJob(i)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <InputGroup label="開始年齢" value={job.startAge} onChange={v => updateJob(i, 'startAge', v)} />
                    <InputGroup label="終了年齢" value={job.endAge} onChange={v => updateJob(i, 'endAge', v)} />
                  </div>
                  <InputGroup label="月収 (万円)" value={job.monthlyIncome} onChange={v => updateJob(i, 'monthlyIncome', v)} />
               </div>
             ))}
             <button
              onClick={addJob}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Plus size={16} /> 退職後の仕事を追加
            </button>
          </div>
        </section>

        {/* 3. Expenses */}
        <section>
          <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">基本支出</h3>
          <div className="space-y-3">
             <InputGroup label="基本生活費 (住居・教育除く・万円)" value={input.monthlyLivingCost} onChange={v => handleChange('monthlyLivingCost', v)} />
          </div>
        </section>

        {/* 4. Housing Settings */}
        <section>
          <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">住居設定</h3>
          <div className="space-y-4">
            {input.housingPlans.map((plan, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">プラン {i + 1}</span>
                  {input.housingPlans.length > 1 && (
                    <button onClick={() => removeHousingPlan(i)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <InputGroup
                  label="住宅費 (万円)"
                  value={plan.cost}
                  onChange={v => updateHousingPlan(i, 'cost', v)}
                  className="mb-2"
                />

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id={`inf_${i}`}
                    checked={plan.duration === 'infinite'}
                    onChange={(e) => updateHousingPlan(i, 'duration', e.target.checked ? 'infinite' : 10)}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor={`inf_${i}`} className="text-sm text-gray-600">永住 (以降ずっと)</label>
                </div>

                {plan.duration !== 'infinite' && (
                  <InputGroup
                    label="期間 (年)"
                    value={plan.duration as number}
                    onChange={v => updateHousingPlan(i, 'duration', v)}
                  />
                )}
              </div>
            ))}

            <button
              onClick={addHousingPlan}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Plus size={16} /> 住居プランを追加
            </button>
          </div>
        </section>

        {/* 5. Family & Education */}
        <section>
          <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">家族・教育</h3>

          <div className="mb-4">
             <InputGroup label="育児による積立減額 (1人あたり/月・万円)" value={input.childcareReduction} onChange={v => handleChange('childcareReduction', v)} />
          </div>

          <p className="text-xs text-gray-500 mb-2">子供リスト</p>
          <div className="space-y-3">
             {input.children.map((child, i) => (
               <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">子供 {i + 1}</span>
                    <button onClick={() => removeChild(i)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <InputGroup
                    label="何年後に誕生？"
                    value={child.birthYearOffset}
                    onChange={v => updateChild(i, 'birthYearOffset', v)}
                    className="mb-2"
                  />

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">教育費パターン</label>
                    <select
                      value={child.educationPattern}
                      onChange={(e) => updateChild(i, 'educationPattern', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    >
                      {EDUCATION_PATTERNS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
               </div>
             ))}
             <button
              onClick={addChild}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Plus size={16} /> 子供を追加
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

// Helper component for inputs
function InputGroup({ label, value, onChange, step = 1, className = "" }: { label: string, value: number, onChange: (v: number) => void, step?: number, className?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        id={id}
        type="number"
        value={value}
        step={step}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange(isNaN(val) ? 0 : val);
        }}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
      />
    </div>
  );
}
