import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Results } from './components/Results';
import { WelcomeModal } from './components/WelcomeModal';
import { calculateSimulation } from './logic/simulation';
import type { SimulationInput } from './logic/simulation';
import { Settings, BarChart3 } from 'lucide-react';

function App() {
  const [targetAmount, setTargetAmount] = useState<number>(3000);
  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input');

  const [input, setInput] = useState<SimulationInput>({
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
      { cost: 15, duration: 'infinite' }
    ],
    housingPlans: [
      { cost: 10, duration: 'infinite' }
    ],
    children: [],
    oneTimeEvents: []
  });

  const simulationData = useMemo(() => {
    return calculateSimulation(input);
  }, [input]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 font-sans">
      <WelcomeModal />

      {/* Mobile Sticky Header Container */}
      <div className="lg:hidden sticky top-0 z-40 bg-white shadow-md">
        {/* Mobile Branding Header */}
        <div className="flex items-center gap-2 p-4 bg-brand text-white shadow-sm">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Logo" className="w-8 h-8 bg-white rounded-full p-1" />
          <h1 className="text-lg font-bold">人生見えるくん</h1>
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
      <div className={`w-full lg:w-auto ${activeTab === 'input' ? 'block' : 'hidden lg:block'}`}>
         <Sidebar
            input={input}
            setInput={setInput}
            targetAmount={targetAmount}
            setTargetAmount={setTargetAmount}
         />
      </div>

      {/* Results (Graph) */}
      <div className={`flex-1 ${activeTab === 'result' ? 'block' : 'hidden lg:block'}`}>
        <Results
          data={simulationData}
          targetAmount={targetAmount}
          retirementAge={input.retirementAge}
        />
      </div>
    </div>
  );
}

export default App;
