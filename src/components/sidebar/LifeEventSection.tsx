import { Trash2 } from 'lucide-react';
import type { SimulationInput, OneTimeEvent } from '../../logic/simulation';
import { NumberInput, AddButton } from './InputComponents';
import { TOOLTIPS } from './constants';
import { Tooltip } from '../Tooltip';

type Props = {
  input: SimulationInput;
  setInput: React.Dispatch<React.SetStateAction<SimulationInput>>;
};

export function LifeEventSection({ input, setInput }: Props) {
  const addEvent = () => {
    setInput(prev => ({
      ...prev,
      oneTimeEvents: [...prev.oneTimeEvents, { age: input.currentAge, amount: 100, type: 'expense', name: '旅行' }]
    }));
  };

  const removeEvent = (index: number) => {
    setInput(prev => ({
      ...prev,
      oneTimeEvents: prev.oneTimeEvents.filter((_, i) => i !== index)
    }));
  };

  const updateEvent = <K extends keyof OneTimeEvent>(index: number, field: K, value: OneTimeEvent[K]) => {
    setInput(prev => {
      const newEvents = [...prev.oneTimeEvents];
      newEvents[index] = { ...newEvents[index], [field]: value };
      return { ...prev, oneTimeEvents: newEvents };
    });
  };

  return (
    <section>
      <h3 className="font-bold text-brand mb-3 border-b border-gray-200 pb-1">ライフイベント (特別収支)</h3>
      <div className="space-y-4">
        {input.oneTimeEvents.map((evt, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">イベント {i + 1}</span>
              <button onClick={() => removeEvent(i)} className="text-gray-400 hover:text-red-500 transition-colors">
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
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand focus:outline-none transition-colors"
                />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
                <NumberInput label="年齢" value={evt.age} min={0} onChange={v => updateEvent(i, 'age', v)} tooltipContent={TOOLTIPS.eventAge} />
                <NumberInput label="金額 (万円)" value={evt.amount} min={0} onChange={v => updateEvent(i, 'amount', v)} tooltipContent={TOOLTIPS.eventAmount} />
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">タイプ</span>
                    <Tooltip content={TOOLTIPS.eventType} />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                        type="radio"
                        checked={evt.type === 'expense'}
                        onChange={() => updateEvent(i, 'type', 'expense')}
                        className="text-red-600 focus:ring-red-500"
                    /> 支出
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
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
  );
}
