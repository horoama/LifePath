import type { SimulationInput } from '../logic/simulation';
import { BasicInfoSection } from './sidebar/BasicInfoSection';
import { IncomeSection } from './sidebar/IncomeSection';
import { PostRetirementSection } from './sidebar/PostRetirementSection';
import { ExpenseSection } from './sidebar/ExpenseSection';
import { HousingSection } from './sidebar/HousingSection';
import { FamilySection } from './sidebar/FamilySection';
import { LifeEventSection } from './sidebar/LifeEventSection';

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
    <div className="w-full lg:w-96 bg-white p-6 shadow-lg overflow-y-auto h-screen sticky top-0 font-sans">
      <h2 className="hidden lg:flex text-xl font-bold mb-6 text-brand-700 items-center gap-2">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="w-12 h-12" />
        人生見えるくん
      </h2>

      <div className="space-y-8 pb-10">
        <BasicInfoSection
            input={input}
            handleChange={handleChange}
            targetAmount={targetAmount}
            setTargetAmount={setTargetAmount}
        />
        <IncomeSection input={input} handleChange={handleChange} />
        <PostRetirementSection input={input} handleChange={handleChange} />
        <ExpenseSection input={input} handleChange={handleChange} />
        <HousingSection input={input} handleChange={handleChange} />
        <FamilySection input={input} handleChange={handleChange} />
        <LifeEventSection input={input} handleChange={handleChange} />
      </div>
    </div>
  );
}
