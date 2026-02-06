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
    livingCostPlans: [{ cost: 15, endAge: 'infinite' }],
    housingPlans: [
      { cost: 10, endAge: 'infinite' }
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

  it('should include detailed financial breakdown', () => {
    const summary = generateSimulationSummary(baseInput, mockData, 3000);

    expect(summary).toContain('【生涯収支・詳細】');

    // Check Lifetime Total Section
    expect(summary).toContain('■ 全期間合計');
    // Total Income Calculation based on mockData:
    // Income: 460 + 500 + 550 + 1500 + 200 + 200 = 3410
    // Inv Income: 0 + 50 + 100 + 200 + 100 + 0 = 450
    // Total = 3860
    expect(summary).toContain('総収入: 3,860万円');
    expect(summary).toContain('給与・賞与: 2,010万円'); // 460+500+550+500
    expect(summary).toContain('退職金: 1,000万円'); // 1000 (at age 65)
    expect(summary).toContain('年金・再雇用: 400万円'); // 200 + 200 (at 80, 90)
    expect(summary).toContain('資産運用益: 450万円');

    // Check Working Phase
    expect(summary).toContain('■ 前半期間 (〜64歳)');
    // Working rows: age 30, 40, 50
    // Income: 460 + 500 + 550 = 1510
    // Inv Income: 0 + 50 + 100 = 150
    // Total = 1660
    expect(summary).toContain('収入合計: 1,660万円');

    // Check Retired Phase
    expect(summary).toContain('■ 後半期間 (65歳〜)');
    // Retired rows: 65, 80, 90
    // Income: 1500 + 200 + 200 = 1900
    // Inv Income: 200 + 100 + 0 = 300
    // Total = 2200
    expect(summary).toContain('収入合計: 2,200万円');

    // Check Real Value formatting exists
    expect(summary).toMatch(/実質: .*?万円/);
  });

  it('should list all living and housing plans', () => {
     const multiPlanInput: SimulationInput = {
         ...baseInput,
         livingCostPlans: [
             { cost: 20, endAge: 60 },
             { cost: 15, endAge: 'infinite' }
         ],
         housingPlans: [
             { cost: 10, endAge: 40 },
             { cost: 5, endAge: 'infinite' }
         ]
     };
     const summary = generateSimulationSummary(multiPlanInput, mockData, 3000);

     expect(summary).toContain('基本生活費:');
     expect(summary).toContain('月20万円 (60歳まで)');
     expect(summary).toContain('月15万円 (永続)');

     expect(summary).toContain('住居費:');
     expect(summary).toContain('月10万円 (40歳まで)');
     expect(summary).toContain('月5万円 (永続)');
  });

  it('should list all jobs chronologically and avoid "retirement age" wording', () => {
    const jobInput: SimulationInput = {
      ...baseInput,
      retirementAge: 60,
      postRetirementJobs: [
        { startAge: 60, endAge: 65, monthlyIncome: 20, retirementBonus: 50 },
        { startAge: 65, endAge: 'infinite', monthlyIncome: 10, retirementBonus: 0 }
      ]
    };
    const summary = generateSimulationSummary(jobInput, mockData, 3000);

    expect(summary).toContain('■ 収入・働き方');
    expect(summary).not.toContain('定年退職'); // Should not use "Teinen"

    // Main Job
    expect(summary).toContain('メインの仕事 (30歳〜60歳):');
    expect(summary).toContain('月収30万円');

    // Post Retirement Jobs
    expect(summary).toContain('その他の仕事1 (60歳〜65歳):');
    expect(summary).toContain('月収20万円');
    expect(summary).toContain('退職一時金: 50万円');

    expect(summary).toContain('その他の仕事2 (65歳〜永続):');
    expect(summary).toContain('月収10万円');
  });
});
