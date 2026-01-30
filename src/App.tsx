import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Results } from './components/Results';
import { calculateSimulation } from './logic/simulation';
import type { SimulationInput } from './logic/simulation';

function App() {
  const [targetAmount, setTargetAmount] = useState<number>(5000);

  const [input, setInput] = useState<SimulationInput>({
    currentAge: 32,
    currentAssets: 700,
    interestRatePct: 5.0,
    monthlyIncome: 45,
    retirementAge: 60,
    retirementBonus: 1500,
    postRetirementJobs: [
      { startAge: 60, endAge: 65, monthlyIncome: 20, retirementBonus: 0 }
    ],
    monthlyLivingCost: 25,
    housingPlans: [
      { cost: 10, duration: 10 },
      { cost: 12, duration: 'infinite' }
    ],
    children: [
      { birthYearOffset: 2, educationPattern: '全公立', monthlyChildcareCost: 5 }
    ],
    oneTimeEvents: []
  });

  const simulationData = useMemo(() => {
    return calculateSimulation(input);
  }, [input]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 font-sans">
      <Sidebar
        input={input}
        setInput={setInput}
        targetAmount={targetAmount}
        setTargetAmount={setTargetAmount}
      />
      <Results
        data={simulationData}
        targetAmount={targetAmount}
        retirementAge={input.retirementAge}
      />
    </div>
  );
}

export default App;
