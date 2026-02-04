import { Trash2 } from 'lucide-react';
import type { SimulationInput, PostRetirementJob } from '../../logic/simulation';
import { NumberInput, SectionHeader, AddButton } from './SidebarCommon';

type PostRetirementSectionProps = {
  input: SimulationInput;
  handleChange: <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => void;
};

const TOOLTIPS = {
  postRetirementJob: "定年退職後の再雇用、アルバイト、または公的年金などの収入源を設定します。複数の収入源を追加可能です。",
  postRetirementStartAge: "この収入（仕事や年金）が始まる年齢です。",
  postRetirementEndAge: "この収入（仕事や年金）が終わる年齢です。年金の場合は想定寿命と同じか、それ以上の年齢を設定してください。",
  postRetirementIncome: "受取時点での月額収入（額面または手取り）です。年金の場合は受給予定額を入力します。インフレ率は考慮されず、入力額がそのまま加算されます。",
  postRetirementBonus: "この仕事を辞める際に受け取る一時金があれば入力します。なければ0で構いません。",
};

export function PostRetirementSection({ input, handleChange }: PostRetirementSectionProps) {

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

  return (
    <section>
      <SectionHeader
        title="退職後の仕事・再雇用・年金"
        tooltip={TOOLTIPS.postRetirementJob}
      />
      <div className="space-y-4">
        {input.postRetirementJobs.map((job, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">仕事 {i + 1}</span>
              <button onClick={() => removeJob(i)} className="text-red-500 hover:text-red-700 cursor-pointer">
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
  );
}
