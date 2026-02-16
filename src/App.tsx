import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Results } from './components/Results';
import { WelcomeModal } from './components/WelcomeModal';
import { calculateSimulation } from './logic/simulation';
import { getSharedStateFromUrl, clearShareParamFromUrl } from './utils/urlShare';
import type { SimulationInput } from './logic/simulation';
import { Settings, BarChart3, Skull } from 'lucide-react';
import { ShareButton } from './components/ShareButton';

const DEFAULT_INPUT: SimulationInput = {
  currentAge: 30,
  currentAssets: 500,
  interestRatePct: 3.0,
  inflationRatePct: 0.0,
  incomeIncreaseRatePct: 0.0,
  deathAge: 90,
  monthlyIncome: 30,
  annualBonus: 0,
  retirementAge: 65,
  retirementBonus: 1000,
  postRetirementJobs: [],
  livingCostPlans: [
    { cost: 15, endAge: 'infinite' }
  ],
  housingPlans: [
    { cost: 10, endAge: 'infinite' }
  ],
  children: [],
  oneTimeEvents: []
};

function App() {
  const [targetAmount, setTargetAmount] = useState<number>(() => {
    const sharedState = getSharedStateFromUrl();
    return sharedState ? sharedState.targetAmount : 3000;
  });

  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input');
  const [isDarkLife, setIsDarkLife] = useState(false);

  const [input, setInput] = useState<SimulationInput>(() => {
    const sharedState = getSharedStateFromUrl();
    if (sharedState) {
      return sharedState.input;
    }
    return DEFAULT_INPUT;
  });

  // Clear URL param after initialization
  useEffect(() => {
    if (getSharedStateFromUrl()) {
      clearShareParamFromUrl();
    }
  }, []);

  const simulationData = useMemo(() => {
    return calculateSimulation(input, isDarkLife);
  }, [input, isDarkLife]);

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen font-sans transition-colors duration-500 ${isDarkLife ? 'bg-gray-900 text-gray-100' : 'bg-gray-100'}`}>
      <WelcomeModal />

      {/* Mobile Sticky Header Container */}
      <div className={`lg:hidden sticky top-0 z-40 shadow-md ${isDarkLife ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Mobile Branding Header */}
        <div className={`flex items-center justify-between p-4 shadow-sm transition-colors duration-500 ${isDarkLife ? 'bg-gray-900 text-red-500 border-b border-red-900' : 'bg-brand text-white'}`}>
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className={`w-8 h-8 rounded-full p-1 ${isDarkLife ? 'bg-red-900 grayscale' : 'bg-white'}`} />
            <h1 className="text-lg font-bold">人生見えるくん</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkLife(!isDarkLife)}
              className={`p-2 rounded-full transition-colors ${isDarkLife ? 'bg-red-900/50 text-red-500 hover:bg-red-900/70' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              title={isDarkLife ? "通常モードに戻る" : "ダークライフモードへ"}
            >
              <Skull size={20} />
            </button>
            <ShareButton input={input} targetAmount={targetAmount} className={isDarkLife ? "bg-gray-800 text-gray-300" : "bg-white/20 hover:bg-white/30 rounded-full text-white"} />
          </div>
        </div>

        {/* Mobile Toggle Buttons */}
        <div className="flex">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'input'
                ? 'border-brand text-brand bg-blue-50'
                : 'border-transparent text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Settings size={18} /> 入力
          </button>
          <button
            onClick={() => setActiveTab('result')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'result'
                ? 'border-brand text-brand bg-blue-50'
                : 'border-transparent text-gray-500 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={18} /> 結果
          </button>
        </div>
      </div>

      {/* Sidebar (Input) */}
      <div className={`w-full lg:w-96 lg:flex-none ${activeTab === 'input' ? 'block' : 'hidden lg:block'}`}>
         <Sidebar
            input={input}
            setInput={setInput}
            targetAmount={targetAmount}
            setTargetAmount={setTargetAmount}
            isDarkLife={isDarkLife}
            setIsDarkLife={setIsDarkLife}
         />
      </div>

      {/* Results (Graph) */}
      <div className={`flex-1 min-w-0 ${activeTab === 'result' ? 'block' : 'hidden lg:block'}`}>
        <Results
          data={simulationData}
          targetAmount={targetAmount}
          retirementAge={input.retirementAge}
          input={input}
          isDarkLife={isDarkLife}
        />
      </div>
    </div>
  );
}

export default App;
