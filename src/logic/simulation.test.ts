import { describe, it, expect } from 'vitest';
import { calculateSimulation, SimulationInput } from './simulation';

describe('calculateSimulation with Inflation', () => {
  const baseInput: SimulationInput = {
    currentAge: 30,
    currentAssets: 1000,
    interestRatePct: 5.0,
    inflationRatePct: 0.0,
    deathAge: 40, // Short duration for testing
    monthlyIncome: 30,
    retirementAge: 60,
    retirementBonus: 0,
    postRetirementJobs: [],
    monthlyLivingCost: 10,
    housingPlans: [{ cost: 5, duration: 'infinite' }],
    children: [],
    oneTimeEvents: []
  };

  it('should return same values for 0% inflation', () => {
    const result = calculateSimulation(baseInput);
    // 1st year (age 30, year 0): inflationFactor = 1.0
    // Annual Exp = (10 + 5) * 12 = 180
    // Annual Inc = 30 * 12 = 360
    // Net Savings = 180
    // Assets (Pre) = 1000 + 180 = 1180
    // Inv Inc = 1180 * 0.05 = 59
    // End Balance = 1239

    expect(result[0].annualExpenses).toBe(180);
    expect(result[0].yearEndBalance).toBe(1239);
  });

  it('should show constant REAL expenses but lower REAL assets for 2% inflation', () => {
    const inflatedInput = { ...baseInput, inflationRatePct: 2.0 };
    const result = calculateSimulation(inflatedInput);
    const baseResult = calculateSimulation(baseInput);

    // Year 0 (Current): Inflation factor 1.0. Should be identical to base.
    expect(result[0].annualExpenses).toBe(180);
    expect(result[0].yearEndBalance).toBe(1239);

    // Year 5 (Age 35):
    // Inflation factor = 1.02^5 ≈ 1.104
    // Nominal Expenses = 180 * 1.104
    // Real Expenses (Display) = Nominal / 1.104 = 180
    // Expect Real Expenses to be exactly same as base (or very close due to float precision)

    const year5_Base = baseResult[5];
    const year5_Inf = result[5];

    // Check Expenses: Should be constant in Real terms
    expect(year5_Inf.annualExpenses).toBeCloseTo(year5_Base.annualExpenses, 0);

    // Check Assets: Should be lower in Real terms because:
    // 1. Income (360) is constant in NOMINAL terms, so it decreases in REAL terms.
    // 2. Investment return (5%) is constant in NOMINAL terms, so real return is roughly 3%.

    expect(year5_Inf.yearEndBalance).toBeLessThan(year5_Base.yearEndBalance);

    // Check Income Real Value:
    // Nominal Income = 360
    // Real Income = 360 / (1.02^5) < 360
    expect(year5_Inf.annualIncome).toBeLessThan(360);
  });
});
