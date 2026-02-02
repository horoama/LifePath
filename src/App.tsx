import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Results } from './components/Results';
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
    retirementAge: 65,
    retirementBonus: 1000,
    postRetirementJobs: [
      { startAge: 65, endAge: 70, monthlyIncome: 15, retirementBonus: 0 }
    ],
    monthlyLivingCost: 15,
    housingPlans: [
      { cost: 10, duration: 'infinite' }
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
      {/* Mobile Toggle Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white shadow-md flex">
        <button
          onClick={() => setActiveTab('input')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'input'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Settings size={18} /> 入力
        </button>
        <button
          onClick={() => setActiveTab('result')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'result'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
          }`}
        >
          <BarChart3 size={18} /> 結果
        </button>
      </div>

      {/* Sidebar (Input) */}
      <div className={`w-full lg:w-auto ${activeTab === 'input' ? 'block' : 'hidden lg:block'}`}>
         {/*
            On mobile, Sidebar is full width.
            On desktop, it keeps its internal width (lg:w-96) defined in Sidebar.tsx.
            However, Sidebar.tsx has 'sticky top-0 h-screen' which might conflict with our new mobile header sticky.
            On mobile, we probably want Sidebar to NOT be sticky if the header is sticky, or adjust 'top'.
            Let's rely on Sidebar's internal styling but we might need to adjust top padding if header is present.
            Actually, the Sidebar component has 'sticky top-0'.
            On mobile, the header is also sticky top-0.
            Sidebar will stick below it? Or overlap?
            'sticky' elements stack. But Sidebar's 'top-0' means it will try to be at top of viewport.
            The header is height ~48px.
            So Sidebar top might need adjustment on mobile?
            Or we just let it scroll normally on mobile (remove sticky).
            Sidebar.tsx has: `h-screen sticky top-0`.
            This is good for desktop.
            For mobile, we might want to override this via a wrapper or prop?
            Or just let it be. If it's sticky top-0, it will stick to the top of the viewport, potentially under the header.

            Let's check Sidebar.tsx content again.
            It has `w-full lg:w-96 ... sticky top-0`.

            If we wrap it here, the wrapper controls visibility.

            Issue: On mobile, if Sidebar is sticky top-0, and we have a sticky header,
            the Sidebar will stick to top 0, potentially obscured by header?
            Actually, if the header is in normal flow before sidebar, and both are sticky...
            They might stack if z-indices are right, but usually `top` needs to accommodate.

            Let's just wrap Sidebar in a div that handles the mobile toggle visibility.
            We can rely on the fact that Sidebar is already styled.
         */}
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
