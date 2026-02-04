import { describe, it, expect } from 'vitest';
import { generateSimulationSummary } from './summaryGenerator';
import type { SimulationInput, SimulationYearResult } from './simulation';

describe('generateSimulationSummary', () => {
  const baseInput: SimulationInput = {
    currentAge: 30,
    currentAssets: 500,
    interestRatePct: 3.0,
    inflationRatePct: 1.0,
    incomeIncreaseRatePct: 2.0,
    deathAge: 90,
    monthlyIncome: 30,
    annualBonus: 100,
    retirementAge: 65,
    retirementBonus: 1000,
    postRetirementJobs: [],
    monthlyLivingCost: 15,
    housingPlans: [
      { cost: 10, duration: 'infinite' }
    ],
    children: [],
    oneTimeEvents: []
  };

  const mockData: SimulationYearResult[] = [
      {
          age: 30, yearEndBalance: 600, yearsPassed: 0, event: '', monthlyHousingCost: 10,
          annualIncome: 460, annualExpenses: 300, annualSavings: 160, yearEndBalanceReal: 600,
          investmentIncome: 0, totalPrincipal: 500, totalInvestmentIncome: 0,
          incomeBreakdown: { salary: 460, bonus: 0, pension: 0, oneTime: 0 },
          expenseBreakdown: { living: 180, housing: 120, education: 0, oneTime: 0 }
      },
      {
          age: 40, yearEndBalance: 2000, yearsPassed: 10, event: '', monthlyHousingCost: 10,
          annualIncome: 500, annualExpenses: 350, annualSavings: 150, yearEndBalanceReal: 1800,
          investmentIncome: 50, totalPrincipal: 1500, totalInvestmentIncome: 500,
          incomeBreakdown: { salary: 500, bonus: 0, pension: 0, oneTime: 0 },
          expenseBreakdown: { living: 200, housing: 120, education: 0, oneTime: 0 }
      },
      {
          age: 50, yearEndBalance: 4000, yearsPassed: 20, event: '', monthlyHousingCost: 10,
          annualIncome: 550, annualExpenses: 400, annualSavings: 150, yearEndBalanceReal: 3200,
          investmentIncome: 100, totalPrincipal: 3000, totalInvestmentIncome: 1000,
          incomeBreakdown: { salary: 550, bonus: 0, pension: 0, oneTime: 0 },
          expenseBreakdown: { living: 250, housing: 120, education: 0, oneTime: 0 }
      },
      {
          age: 65, yearEndBalance: 6000, yearsPassed: 35, event: 'Retirement', monthlyHousingCost: 10,
          annualIncome: 1500, annualExpenses: 450, annualSavings: 1050, yearEndBalanceReal: 4000,
          investmentIncome: 200, totalPrincipal: 4500, totalInvestmentIncome: 1500,
          incomeBreakdown: { salary: 500, bonus: 1000, pension: 0, oneTime: 0 },
          expenseBreakdown: { living: 300, housing: 120, education: 0, oneTime: 0 }
      },
      {
          age: 80, yearEndBalance: 3000, yearsPassed: 50, event: '', monthlyHousingCost: 10,
          annualIncome: 200, annualExpenses: 500, annualSavings: -300, yearEndBalanceReal: 1500,
          investmentIncome: 100, totalPrincipal: 3000, totalInvestmentIncome: 2000,
          incomeBreakdown: { salary: 0, bonus: 0, pension: 200, oneTime: 0 },
          expenseBreakdown: { living: 350, housing: 120, education: 0, oneTime: 0 }
      },
      {
          age: 90, yearEndBalance: -500, yearsPassed: 60, event: '', monthlyHousingCost: 10,
          annualIncome: 200, annualExpenses: 550, annualSavings: -350, yearEndBalanceReal: -300,
          investmentIncome: 0, totalPrincipal: 2000, totalInvestmentIncome: 2000,
          incomeBreakdown: { salary: 0, bonus: 0, pension: 200, oneTime: 0 },
          expenseBreakdown: { living: 400, housing: 120, education: 0, oneTime: 0 }
      }
  ];

  it('should generate basic summary', () => {
    const summary = generateSimulationSummary(baseInput, mockData, 3000);

    expect(summary).toContain('現在の年齢: 30歳');
    expect(summary).toContain('現在の資産: 500万円');
    expect(summary).toContain('目標資産(3,000万円): 50歳で到達'); // Based on mockData
    expect(summary).toContain('資産ピーク: 65歳 (6,000万円)');
    expect(summary).toContain('資産枯渇: 90歳でマイナスに転落');
  });

  it('should handle target not reached', () => {
    const summary = generateSimulationSummary(baseInput, mockData, 10000);
    expect(summary).toContain('目標資産(10,000万円): 到達せず');
  });

  it('should include children info if present', () => {
      const childInput: SimulationInput = {
          ...baseInput,
          children: [
              { birthYearOffset: -5, educationPattern: '全公立', monthlyChildcareCost: 1 },
              { birthYearOffset: 2, educationPattern: '全私立', monthlyChildcareCost: 2 }
          ]
      };
      const summary = generateSimulationSummary(childInput, mockData, 3000);
      expect(summary).toContain('子供: 2人');
      expect(summary).toContain('第1子 (5歳): 全公立');
      expect(summary).toContain('第2子 (2年後誕生予定): 全私立');
  });
});
