import { Trash2 } from 'lucide-react';
import type { SimulationInput, PostRetirementJob } from '../../logic/simulation';
import { NumberInput, AddButton } from './InputComponents';
import { TOOLTIPS } from './constants';
import { Tooltip } from '../Tooltip';

type Props = {
  input: SimulationInput;
  setInput: React.Dispatch<React.SetStateAction<SimulationInput>>;
};

export function PostRetirementJobSection({ input, setInput }: Props) {
  const addJob = () => {
    setInput(prev => ({
      ...prev,
      postRetirementJobs: [...prev.postRetirementJobs, { startAge: 60, endAge: 65, monthlyIncome: 20, retirementBonus: 0 }]
    }));
  };

  const removeJob = (index: number) => {
    setInput(prev => ({
      ...prev,
      postRetirementJobs: prev.postRetirementJobs.filter((_, i) => i !== index)
    }));
  };

  const updateJob = <K extends keyof PostRetirementJob>(index: number, field: K, value: PostRetirementJob[K]) => {
    setInput(prev => {
      const newJobs = [...prev.postRetirementJobs];
      newJobs[index] = { ...newJobs[index], [field]: value };
      return { ...prev, postRetirementJobs: newJobs };
    });
  };

  return (
    <section>
      <h3 className="font-bold text-brand mb-3 border-b border-gray-200 pb-1 flex items-center">
        退職後の仕事・再雇用・年金
        <Tooltip content={TOOLTIPS.postRetirementJob} />
      </h3>
      <div className="space-y-4">
        {input.postRetirementJobs.map((job, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">仕事 {i + 1}</span>
              <button onClick={() => removeJob(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <NumberInput label="開始年齢" value={job.startAge} onChange={v => updateJob(i, 'startAge', v)} tooltipContent={TOOLTIPS.postRetirementStartAge} />
              <div className="relative">
                <div className="absolute top-0 right-0 z-10">
                  <label className="flex items-center gap-1 cursor-pointer bg-gray-50 pl-1">
                    <input
                      type="checkbox"
                      checked={job.endAge === 'infinite'}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateJob(i, 'endAge', 'infinite');
                        } else {
                          updateJob(i, 'endAge', job.startAge + 5);
                        }
                      }}
                      className="w-3 h-3 text-brand rounded border-gray-300 focus:ring-brand"
                    />
                    <span className="text-[10px] text-gray-500">以降ずっと</span>
                  </label>
                </div>
                {job.endAge === 'infinite' ? (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 flex items-center">
                      終了年齢
                      <Tooltip content={TOOLTIPS.postRetirementEndAge} />
                    </label>
                    <div className="w-full p-2 border border-gray-200 bg-gray-100 rounded text-sm text-gray-500 h-[38px] flex items-center">
                      死ぬまで
                    </div>
                  </div>
                ) : (
                  <NumberInput
                    label="終了年齢"
                    value={job.endAge as number}
                    onChange={v => updateJob(i, 'endAge', v)}
                    tooltipContent={TOOLTIPS.postRetirementEndAge}
                  />
                )}
              </div>
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
