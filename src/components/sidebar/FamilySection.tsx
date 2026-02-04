import { Trash2 } from 'lucide-react';
import { EDUCATION_PATTERNS, EDU_COSTS_MAP } from '../../logic/simulation';
import type { SimulationInput, Child } from '../../logic/simulation';
import { NumberInput, SectionHeader, AddButton } from './SidebarCommon';
import { Tooltip } from '../Tooltip';

type FamilySectionProps = {
  input: SimulationInput;
  handleChange: <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => void;
};

const TOOLTIPS = {
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
};

export function FamilySection({ input, handleChange }: FamilySectionProps) {

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

  return (
    <section>
      <SectionHeader title="子供・教育" />
      <div className="space-y-4">
        {input.children.map((child, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">子供 {i + 1}</span>
              <button onClick={() => removeChild(i)} className="text-red-500 hover:text-red-700 cursor-pointer">
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
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
  );
}
