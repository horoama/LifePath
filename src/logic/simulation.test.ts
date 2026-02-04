import { describe, it, expect } from 'vitest';
import { calculateSimulation } from './simulation';
import type { SimulationInput } from './simulation';

describe('calculateSimulation with Inflation and Growth (Nominal Output)', () => {
  const baseInput: SimulationInput = {
    currentAge: 30,
    currentAssets: 1000,
    interestRatePct: 5.0,
    inflationRatePct: 0.0,
    incomeIncreaseRatePct: 0.0,
    deathAge: 40, // Short duration for testing
    monthlyIncome: 30,
    annualBonus: 0,
    retirementAge: 60,
    retirementBonus: 0,
    postRetirementJobs: [],
    livingCostPlans: [{ cost: 10, duration: 'infinite' }],
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
    expect(result[0].yearEndBalance).toBe(result[0].yearEndBalanceReal); // 0% inflation
  });

  it('should keep NOMINAL housing cost constant when inflation > 0', () => {
    // Housing cost is fixed in nominal terms (contract).
    const inflatedInput = { ...baseInput, inflationRatePct: 2.0 };
    const result = calculateSimulation(inflatedInput);

    // Year 0 (Factor 1.0)
    expect(result[0].monthlyHousingCost).toBe(5);

    // Year 5 (Age 35)
    // Nominal Housing should still be 5
    expect(result[5].monthlyHousingCost).toBe(5);
  });

  it('should increase NOMINAL living cost when inflation > 0', () => {
    // Living cost grows with inflation nominally.
    const inflatedInput = { ...baseInput, inflationRatePct: 2.0 };
    const result = calculateSimulation(inflatedInput);

    // Year 5
    // Nominal Living = 10 * 12 * 1.02^5
    // 10 * 12 * 1.10408 = 132.49
    expect(result[5].expenseBreakdown.living).toBeCloseTo(120 * Math.pow(1.02, 5), 4);
    expect(result[5].expenseBreakdown.living).toBeGreaterThan(120);
  });

  it('should calculate Real Asset Value correctly', () => {
    const inflatedInput = { ...baseInput, inflationRatePct: 2.0 };
    const result = calculateSimulation(inflatedInput);

    // Year 5
    // Nominal Assets should be whatever they grew to
    // Real Assets should be Nominal / 1.02^5
    const nominal = result[5].yearEndBalance;
    const real = result[5].yearEndBalanceReal;
    const expectedReal = Math.floor(nominal / Math.pow(1.02, 5));

    expect(real).toBe(expectedReal);
    expect(real).toBeLessThan(nominal);
  });

  it('should increase NOMINAL income when Growth > 0', () => {
    const growthInput = {
        ...baseInput,
        inflationRatePct: 2.0, // Inflation doesn't affect Income directly, only Growth Rate does
        incomeIncreaseRatePct: 3.0
    };
    const result = calculateSimulation(growthInput);

    // Year 5
    // Nominal Income = 360 * 1.03^5
    expect(result[5].annualIncome).toBeCloseTo(360 * Math.pow(1.03, 5), 4);
  });

  it('should NOT apply income growth to retirement bonus (Nominal)', () => {
    // Retirement Age = 35 (5 years from start)
    const bonusInput = {
        ...baseInput,
        currentAge: 30,
        retirementAge: 35,
        retirementBonus: 1000,
        incomeIncreaseRatePct: 5.0, // Significant growth
        inflationRatePct: 0.0
    };

    const result = calculateSimulation(bonusInput);
    const retirementYear = result.find(r => r.age === 35);

    // Bonus should be exactly 1000 (Nominal)
    expect(retirementYear).toBeDefined();
    expect(retirementYear?.incomeBreakdown.bonus).toBe(1000);
  });

  it('should stop generating investment income when balance becomes negative', () => {
    // Scenario: High expenses, low income, eventually debt
    const debtInput: SimulationInput = {
        ...baseInput,
        currentAssets: 100, // Low initial
        monthlyIncome: 10,  // 120/yr
        livingCostPlans: [{ cost: 50, duration: 'infinite' }], // 600/yr (Deficit 480/yr)
        interestRatePct: 10.0, // High interest
        deathAge: 35
    };

    const result = calculateSimulation(debtInput);

    // Year 0: Start 100. Deficit 480. End = 100 - 480 = -380 (approx)
    // Pre-interest balance = -380.
    // Interest should be 0 (NOT -38).

    // Check first year where it goes negative
    const negativeYear = result.find(r => r.yearEndBalance < 0);
    expect(negativeYear).toBeDefined();

    // Ensure investment income is 0 for that year and subsequent
    if (negativeYear) {
        expect(negativeYear.investmentIncome).toBe(0);

        // Check next year too
        const nextYear = result.find(r => r.age === negativeYear.age + 1);
        if (nextYear) {
            expect(nextYear.investmentIncome).toBe(0);
        }
    }
  });

  it('should switch living cost plans at correct time', () => {
    const multiPlanInput: SimulationInput = {
      ...baseInput,
      deathAge: 40,
      livingCostPlans: [
        { cost: 10, duration: 2 }, // Age 30, 31
        { cost: 20, duration: 'infinite' } // Age 32+
      ],
      inflationRatePct: 0.0 // Keep 0 to verify base switching logic first
    };
    const result = calculateSimulation(multiPlanInput);

    // Age 30 (Year 0)
    expect(result[0].expenseBreakdown.living).toBe(10 * 12);
    // Age 31 (Year 1)
    expect(result[1].expenseBreakdown.living).toBe(10 * 12);
    // Age 32 (Year 2)
    expect(result[2].expenseBreakdown.living).toBe(20 * 12);
    // Age 33 (Year 3)
    expect(result[3].expenseBreakdown.living).toBe(20 * 12);
  });

  it('should apply inflation to switched living cost plans', () => {
    const multiPlanInput: SimulationInput = {
      ...baseInput,
      deathAge: 40,
      livingCostPlans: [
        { cost: 10, duration: 2 }, // Age 30, 31
        { cost: 20, duration: 'infinite' } // Age 32+
      ],
      inflationRatePct: 10.0 // 10% easy math
    };
    const result = calculateSimulation(multiPlanInput);

    // Age 30 (Year 0): 10 * 12 * 1.0^0 = 120
    expect(result[0].expenseBreakdown.living).toBeCloseTo(120, 2);

    // Age 31 (Year 1): 10 * 12 * 1.1^1 = 132
    expect(result[1].expenseBreakdown.living).toBeCloseTo(132, 2);

    // Age 32 (Year 2): 20 * 12 * 1.1^2 = 240 * 1.21 = 290.4
    expect(result[2].expenseBreakdown.living).toBeCloseTo(290.4, 2);
  });
});
