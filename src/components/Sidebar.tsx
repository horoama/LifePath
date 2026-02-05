import type { SimulationInput } from '../logic/simulation';
import { BasicInfoSection } from './sidebar/BasicInfoSection';
import { IncomeSection } from './sidebar/IncomeSection';
import { PostRetirementJobSection } from './sidebar/PostRetirementJobSection';
import { ExpenseSection } from './sidebar/ExpenseSection';
import { HousingSection } from './sidebar/HousingSection';
import { FamilySection } from './sidebar/FamilySection';
import { LifeEventSection } from './sidebar/LifeEventSection';
import { ShareButton } from './ShareButton';

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

  return (
    <div className="w-full lg:w-96 bg-white p-6 shadow-lg overflow-y-auto h-screen sticky top-0 border-r border-gray-100">
      <div className="hidden lg:flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="w-12 h-12" />
          <span className="text-brand">人生見えるくん</span>
        </h2>
        <ShareButton input={input} targetAmount={targetAmount} />
      </div>

      <div className="space-y-8">
        <BasicInfoSection input={input} handleChange={handleChange} targetAmount={targetAmount} setTargetAmount={setTargetAmount} />
        <IncomeSection input={input} handleChange={handleChange} />
        <PostRetirementJobSection input={input} setInput={setInput} />
        <ExpenseSection input={input} setInput={setInput} />
        <HousingSection input={input} setInput={setInput} />
        <FamilySection input={input} setInput={setInput} />
        <LifeEventSection input={input} setInput={setInput} />
      </div>
    </div>
  );
}
