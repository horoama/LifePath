import { describe, it, expect } from 'vitest';
import { calculateSimulation } from './simulation';
import type { SimulationInput } from './simulation';

describe('Comprehensive Simulation Scenarios', () => {
  const baseInput: SimulationInput = {
    currentAge: 30,
    currentAssets: 1000,
    interestRatePct: 5.0,
    inflationRatePct: 0.0,
    incomeIncreaseRatePct: 0.0,
    deathAge: 40,
    monthlyIncome: 30,
    annualBonus: 0,
    retirementAge: 60,
    retirementBonus: 0,
    postRetirementJobs: [],
    livingCostPlans: [{ cost: 10, endAge: 'infinite' }],
    housingPlans: [{ cost: 5, endAge: 'infinite' }],
    children: [],
    oneTimeEvents: []
  };

  it('should verify detailed education costs over time', () => {
    // Child born at age 30 (yearsPassed = 0), All Public pattern
    const input: SimulationInput = {
      ...baseInput,
      deathAge: 55, // Simulate until 55 to cover child's education
      children: [{
        birthYearOffset: 0, // Born this year
        educationPattern: '全公立',
        monthlyChildcareCost: 3
      }]
    };
    const result = calculateSimulation(input);

    // Age 30 (Year 0): Born (0 y.o.)
    // Childcare: 3 * 12 = 36
    // Education: 0 (Preschool/Baby)
    expect(result[0].expenseBreakdown.education).toBe(36);

    // Age 36 (Year 6): 6 y.o. (Preschool/Baby)
    // Childcare: 3 * 12 = 36
    // Education: 0
    expect(result[6].expenseBreakdown.education).toBe(36);

    // Age 37 (Year 7): 7 y.o. (Primary School starts)
    // Childcare: 3 * 12 = 36
    // Education: Public Primary (40/yr)
    // Total: 36 + 40 = 76
    expect(result[7].expenseBreakdown.education).toBe(76);

    // Age 42 (Year 12): 12 y.o. (Primary School ends)
    // Total: 36 + 40 = 76
    expect(result[12].expenseBreakdown.education).toBe(76);

    // Age 43 (Year 13): 13 y.o. (Middle School starts)
    // Childcare: 3 * 12 = 36
    // Education: Public Middle (40/yr) - same cost in map, but logically distinct
    expect(result[13].expenseBreakdown.education).toBe(76);

    // Age 46 (Year 16): 16 y.o. (High School starts)
    // Childcare: 3 * 12 = 36
    // Education: Public High (40/yr)
    expect(result[16].expenseBreakdown.education).toBe(76);

    // Age 49 (Year 19): 19 y.o. (University starts)
    // Childcare: 3 * 12 = 36
    // Education: Public Uni (100/yr)
    // Total: 36 + 100 = 136
    expect(result[19].expenseBreakdown.education).toBe(136);

    // Age 52 (Year 22): 22 y.o. (University ends / Last year)
    // Total: 36 + 100 = 136
    expect(result[22].expenseBreakdown.education).toBe(136);

    // Age 53 (Year 23): 23 y.o. (Graduated)
    // Childcare: Ends at 22? "childAge >= 0 && childAge <= 22" -> includes 22.
    // So at 23, childcare is 0.
    // Education: 0
    expect(result[23].expenseBreakdown.education).toBe(0);
  });

  it('should verify variable living and housing costs across age boundaries', () => {
    // Current Age: 30.
    // Living Plans:
    // - Until 35: Cost 10
    // - Until 40: Cost 20
    // - Infinite: Cost 15
    const input: SimulationInput = {
      ...baseInput,
      deathAge: 45,
      livingCostPlans: [
        { cost: 10, endAge: 35 },
        { cost: 20, endAge: 40 },
        { cost: 15, endAge: 'infinite' }
      ]
    };
    const result = calculateSimulation(input);

    // Age 30-34 (Year 0-4): Cost 10 * 12 = 120
    for (let i = 0; i < 5; i++) {
      expect(result[i].expenseBreakdown.living).toBe(120);
    }

    // Age 35-39 (Year 5-9): Cost 20 * 12 = 240
    // Age 35 is strictly < 35? No, logic is usually `if (age < planEndAge)`.
    // Let's check logic:
    // for (plan of livingCostPlans) {
    //   if (age < plan.endAge) { use plan; break; }
    // }
    // At age 34: 34 < 35 (True) -> Plan 1 (Cost 10)
    // At age 35: 35 < 35 (False) -> Check next plan
    // Next plan: endAge 40. 35 < 40 (True) -> Plan 2 (Cost 20)
    for (let i = 5; i < 10; i++) {
      expect(result[i].expenseBreakdown.living).toBe(240);
    }

    // Age 40-45 (Year 10-15): Cost 15 * 12 = 180
    // At age 40: 40 < 40 (False) -> Check next plan
    // Next plan: endAge 'infinite'. (True) -> Plan 3 (Cost 15)
    for (let i = 10; i <= 15; i++) {
        expect(result[i].expenseBreakdown.living).toBe(180);
    }
  });

  it('should verify one-time income and expense events', () => {
    const input: SimulationInput = {
      ...baseInput,
      deathAge: 35,
      oneTimeEvents: [
        { age: 31, amount: 50, type: 'income', name: 'Gift' },
        { age: 32, amount: 200, type: 'expense', name: 'Car' },
        { age: 33, amount: 100, type: 'income', name: 'Bonus' },
        { age: 33, amount: 50, type: 'expense', name: 'Trip' } // Mixed year
      ]
    };
    const result = calculateSimulation(input);

    // Age 30: No events
    expect(result[0].incomeBreakdown.oneTime).toBe(0);
    expect(result[0].expenseBreakdown.oneTime).toBe(0);

    // Age 31: Income 50
    expect(result[1].incomeBreakdown.oneTime).toBe(50);
    expect(result[1].expenseBreakdown.oneTime).toBe(0);
    expect(result[1].event).toContain('Gift(+50)');

    // Age 32: Expense 200
    expect(result[2].incomeBreakdown.oneTime).toBe(0);
    expect(result[2].expenseBreakdown.oneTime).toBe(200);
    expect(result[2].event).toContain('Car(-200)');

    // Age 33: Income 100, Expense 50
    expect(result[3].incomeBreakdown.oneTime).toBe(100);
    expect(result[3].expenseBreakdown.oneTime).toBe(50);
    expect(result[3].event).toContain('Bonus(+100)');
    expect(result[3].event).toContain('Trip(-50)');
  });

  it('should verify complex macroeconomic scenario (Inflation + Growth + Interest)', () => {
    // Scenario:
    // Age 30
    // Assets: 1000
    // Income: 100/mo (1200/yr) -> Grows 3%
    // Expenses: 50/mo (600/yr) -> Inflates 2%
    // Interest: 5%
    const input: SimulationInput = {
      ...baseInput,
      currentAssets: 1000,
      monthlyIncome: 100,
      livingCostPlans: [{ cost: 50, endAge: 'infinite' }],
      housingPlans: [], // No housing for simplicity
      interestRatePct: 5.0,
      inflationRatePct: 2.0,
      incomeIncreaseRatePct: 3.0,
      deathAge: 32 // 3 years: 30, 31, 32
    };
    const result = calculateSimulation(input);

    // Year 0 (Age 30):
    // Inflation Factor: 1.0
    // Growth Factor: 1.0
    // Income: 1200
    // Expense: 600
    // Net Savings: 600
    // Pre-Interest Balance: 1000 + 600 = 1600
    // Investment Income: 1600 * 0.05 = 80
    // Year End Balance: 1680
    // Real Balance: 1680 / 1.0 = 1680

    const y0 = result[0];
    expect(y0.annualIncome).toBeCloseTo(1200, 1);
    expect(y0.annualExpenses).toBeCloseTo(600, 1);
    expect(y0.investmentIncome).toBeCloseTo(80, 1);
    expect(y0.yearEndBalance).toBeCloseTo(1680, 1);
    expect(y0.yearEndBalanceReal).toBeCloseTo(1680, 1);

    // Year 1 (Age 31):
    // Inflation Factor: 1.02
    // Growth Factor: 1.03
    // Income: 1200 * 1.03 = 1236
    // Expense: 600 * 1.02 = 612
    // Net Savings: 1236 - 612 = 624
    // Start Balance: 1680
    // Pre-Interest Balance: 1680 + 624 = 2304
    // Investment Income: 2304 * 0.05 = 115.2 -> Floor(115.2) = 115
    // Year End Balance: 2304 + 115.2 = 2419.2 -> Floor(2419.2) = 2419
    // Real Balance: 2419.2 / 1.02 = 2371.76 -> Floor(2371.76) = 2371

    const y1 = result[1];
    expect(y1.annualIncome).toBeCloseTo(1236, 1);
    expect(y1.annualExpenses).toBeCloseTo(612, 1);

    // Logic uses Math.floor for outputs
    expect(y1.investmentIncome).toBe(115);
    // Assets = 2419.2 -> Floor(2419.2) = 2419
    expect(y1.yearEndBalance).toBe(2419);

    // Real Balance: Floor(2419.2 / 1.02) = Floor(2371.76) = 2371
    expect(y1.yearEndBalanceReal).toBe(2371);

    // Year 2 (Age 32):
    // Inflation Factor: 1.02^2 = 1.0404
    // Growth Factor: 1.03^2 = 1.0609
    // Income: 1200 * 1.0609 = 1273.08
    // Expense: 600 * 1.0404 = 624.24
    // Net Savings: 1273.08 - 624.24 = 648.84
    // Start Balance: 2419.2 (keep precision internally)
    // Pre-Interest Balance: 2419.2 + 648.84 = 3068.04
    // Investment Income: 3068.04 * 0.05 = 153.402
    // Year End Balance: 3068.04 + 153.402 = 3221.442

    const y2 = result[2];
    expect(y2.annualIncome).toBeCloseTo(1273.08, 1);
    expect(y2.annualExpenses).toBeCloseTo(624.24, 1);
    // Investment Income: Floor(153.402) = 153
    expect(y2.investmentIncome).toBe(153);
    // Year End Balance: Floor(3221.442) = 3221
    expect(y2.yearEndBalance).toBe(3221);

    // Real Balance: Floor(3221.442 / 1.0404) = Floor(3096.35) = 3096
    expect(y2.yearEndBalanceReal).toBe(3096);
  });
});
