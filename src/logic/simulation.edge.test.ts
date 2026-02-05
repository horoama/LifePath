import { describe, it, expect } from 'vitest';
import { calculateSimulation } from './simulation';
import type { SimulationInput } from './simulation';

describe('calculateSimulation Edge Cases', () => {
  const baseInput: SimulationInput = {
    currentAge: 30,
    currentAssets: 1000,
    interestRatePct: 3.0,
    inflationRatePct: 1.0,
    incomeIncreaseRatePct: 0.0,
    deathAge: 90,
    monthlyIncome: 30,
    annualBonus: 100,
    retirementAge: 60,
    retirementBonus: 1500,
    postRetirementJobs: [],
    livingCostPlans: [{ cost: 15, endAge: 'infinite' }],
    housingPlans: [{ cost: 10, endAge: 'infinite' }],
    children: [],
    oneTimeEvents: []
  };

  it('should handle deathAge < currentAge gracefully (return empty or single year)', () => {
    // If deathAge is earlier than currentAge, the loop condition (age <= deathAge) might be false immediately.
    const input = { ...baseInput, currentAge: 30, deathAge: 29 };
    const result = calculateSimulation(input);
    // Should return empty array or handle it without crashing
    expect(result).toBeDefined();
    expect(result.length).toBe(0);
  });

  it('should handle negative currentAge', () => {
    // Ideally UI prevents this, but logic should be robust.
    const input = { ...baseInput, currentAge: -5, deathAge: 10 };
    const result = calculateSimulation(input);
    expect(result).toBeDefined();
    // Should simulate from -5 to 10
    expect(result[0].age).toBe(-5);
    expect(result[result.length - 1].age).toBe(10);
  });

  it('should handle negative amounts (Income/Expense/Assets)', () => {
    // Negative income = debt increase? Negative expense = refund?
    // Logic simply adds/subtracts.
    const input: SimulationInput = {
      ...baseInput,
      monthlyIncome: -10, // Losing money every month
      livingCostPlans: [{ cost: -5, endAge: 'infinite' }] // Negative cost = Income?
    };
    const result = calculateSimulation(input);

    // Income: -10 * 12 = -120 (plus bonus 100) = -20
    // Expenses: -5 * 12 = -60 (Housing 10*12=120) => Total Exp = 60
    // Net: -20 - 60 = -80

    // Checking first year
    // Inflation factor 1.0
    // Income: -120 + 100 = -20
    // Expense: (-5 * 12) + (10 * 12) = -60 + 120 = 60
    // Net: -20 - 60 = -80

    const year0 = result[0];
    expect(year0.annualIncome).toBe(-20);
    expect(year0.annualExpenses).toBe(60);
    expect(year0.annualSavings).toBe(-80);
  });

  it('should handle extreme interest rates', () => {
    const input = { ...baseInput, interestRatePct: 1000, deathAge: 35 }; // 1000% interest
    const result = calculateSimulation(input);
    expect(result).toBeDefined();
    // Balance should grow massively
    expect(result[result.length - 1].yearEndBalance).toBeGreaterThan(baseInput.currentAssets);
  });

  it('should handle negative interest rates', () => {
    const input = { ...baseInput, interestRatePct: -50, deathAge: 35 }; // -50% interest
    const result = calculateSimulation(input);
    expect(result).toBeDefined();
    // Balance should shrink
    expect(result[result.length - 1].yearEndBalance).toBeLessThan(baseInput.currentAssets);
  });

  it('should handle infinite loop risks (e.g. if loop condition was buggy)', () => {
      // Just a normal run, but ensuring it terminates
      const input = { ...baseInput, deathAge: 30 + 1000 }; // 1000 years
      const start = performance.now();
      const result = calculateSimulation(input);
      const end = performance.now();
      expect(result.length).toBe(1001);
      expect(end - start).toBeLessThan(1000); // Should be fast
  });

  it('should handle NaN inputs gracefully (if they slip through)', () => {
      // If validation fails and NaN gets in
      const input = { ...baseInput, monthlyIncome: NaN };
      const result = calculateSimulation(input);
      // Math with NaN results in NaN
      expect(result[0].annualIncome).toBeNaN();
      // Code shouldn't throw
  });
});
