import type { SimulationInput } from '../logic/simulation';
import { BasicInfoSection } from './sidebar/BasicInfoSection';
import { IncomeSection } from './sidebar/IncomeSection';
import { PostRetirementJobSection } from './sidebar/PostRetirementJobSection';
import { ExpenseSection } from './sidebar/ExpenseSection';
import { HousingSection } from './sidebar/HousingSection';
import { FamilySection } from './sidebar/FamilySection';
import { LifeEventSection } from './sidebar/LifeEventSection';
import { ShareButton } from './ShareButton';
import { Skull } from 'lucide-react';

type SidebarProps = {
  input: SimulationInput;
  setInput: React.Dispatch<React.SetStateAction<SimulationInput>>;
  targetAmount: number;
  setTargetAmount: (val: number) => void;
  isDarkLife: boolean;
  setIsDarkLife: (val: boolean) => void;
};

export function Sidebar({ input, setInput, targetAmount, setTargetAmount, isDarkLife, setIsDarkLife }: SidebarProps) {
  const handleChange = <K extends keyof SimulationInput>(field: K, value: SimulationInput[K]) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  // Override brand color for Dark Life mode
  const style = isDarkLife ? { '--color-brand': '#ef4444' } as React.CSSProperties : {};

  return (
    <div
      className={`w-full lg:w-96 p-6 shadow-lg overflow-y-auto h-screen sticky top-0 border-r transition-colors duration-500 ${isDarkLife ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-100'}`}
      style={style}
    >
      <div className="hidden lg:flex justify-between items-center mb-6">
        <h2 className={`text-xl font-bold flex items-center gap-2 transition-colors duration-500 ${isDarkLife ? 'text-red-500' : 'text-gray-800'}`}>
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className={`w-12 h-12 transition-all duration-500 ${isDarkLife ? 'grayscale opacity-70' : ''}`} />
          <span className="text-brand transition-colors duration-500">人生見えるくん</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkLife(!isDarkLife)}
            className={`p-2 rounded-full transition-colors ${isDarkLife ? 'bg-red-900/50 text-red-500 hover:bg-red-900/70' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            title={isDarkLife ? "通常モードに戻る" : "ダークライフモードへ"}
          >
            <Skull size={20} />
          </button>
          <ShareButton input={input} targetAmount={targetAmount} className={isDarkLife ? "bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-full" : undefined} />
        </div>
      </div>

      <div className="space-y-8">
        <BasicInfoSection input={input} handleChange={handleChange} targetAmount={targetAmount} setTargetAmount={setTargetAmount} />
        <IncomeSection input={input} handleChange={handleChange} />
        <PostRetirementJobSection input={input} setInput={setInput} />
        <ExpenseSection input={input} setInput={setInput} />
        <HousingSection input={input} setInput={setInput} />
        <FamilySection input={input} setInput={setInput} />
        <LifeEventSection input={input} setInput={setInput} />

        <div className="pt-6 border-t border-gray-100 text-center">
          <a
            href="https://forms.gle/NRh4gBUFodRkW8jb8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-brand underline"
          >
            お問い合わせ・ご意見はこちら
          </a>
        </div>
      </div>
    </div>
  );
}
