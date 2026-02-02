import { describe, it, expect } from 'vitest';
import { calculateSimulation, SimulationInput } from './simulation';

describe('calculateSimulation with Inflation and Growth', () => {
  const baseInput: SimulationInput = {
    currentAge: 30,
    currentAssets: 1000,
    interestRatePct: 5.0,
    inflationRatePct: 0.0,
    incomeIncreaseRatePct: 0.0,
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

  it('should return same values for 0% inflation and 0% growth', () => {
    const result = calculateSimulation(baseInput);
    // Annual Exp = (10 + 5) * 12 = 180
    // Annual Inc = 30 * 12 = 360
    expect(result[0].annualExpenses).toBe(180);
    expect(result[0].annualIncome).toBe(360);
  });

  it('should decrease REAL housing cost when inflation > 0', () => {
    // Housing cost is fixed in nominal terms (contract).
    // So in real terms, it should decrease by inflation rate.
    const inflatedInput = { ...baseInput, inflationRatePct: 2.0 };
    const result = calculateSimulation(inflatedInput);

    // Year 0 (Factor 1.0)
    expect(result[0].monthlyHousingCost).toBe(5);

    // Year 5 (Age 35)
    // Inflation Factor = 1.02^5 ≈ 1.104
    // Nominal Housing = 5
    // Real Housing = 5 / 1.104 < 5
    expect(result[5].monthlyHousingCost).toBeLessThan(5);
    expect(result[5].monthlyHousingCost).toBeCloseTo(5 / Math.pow(1.02, 5), 4);
  });

  it('should keep REAL living cost constant when inflation > 0', () => {
    // Living cost grows with inflation nominally.
    // So in real terms, it should stay constant.
    const inflatedInput = { ...baseInput, inflationRatePct: 2.0 };
    const result = calculateSimulation(inflatedInput);

    // Year 5
    // Nominal Living = 10 * 12 * 1.02^5
    // Real Living = Nominal / 1.02^5 = 10 * 12 = 120
    expect(result[5].expenseBreakdown.living).toBeCloseTo(120, 0);
  });

  it('should increase REAL income when Growth > Inflation', () => {
    const growthInput = {
        ...baseInput,
        inflationRatePct: 2.0,
        incomeIncreaseRatePct: 3.0
    };
    const result = calculateSimulation(growthInput);

    // Year 5
    // Nominal Income = 360 * 1.03^5
    // Real Income = (360 * 1.03^5) / 1.02^5 = 360 * (1.03/1.02)^5
    // Should be greater than 360
    expect(result[5].annualIncome).toBeGreaterThan(360);
  });

  it('should decrease REAL income when Growth < Inflation', () => {
    const growthInput = {
        ...baseInput,
        inflationRatePct: 3.0,
        incomeIncreaseRatePct: 1.0
    };
    const result = calculateSimulation(growthInput);

    // Year 5
    // Nominal Income = 360 * 1.01^5
    // Real Income = (360 * 1.01^5) / 1.03^5
    // Should be less than 360
    expect(result[5].annualIncome).toBeLessThan(360);
  });
});
