import { describe, it, expect } from 'vitest';
import { calculateSimulation, type SimulationInput } from './simulation';

describe('calculateSimulation', () => {
  const baseInput: SimulationInput = {
    currentAge: 30,
    currentAssets: 1000,
    interestRatePct: 0, // Zero interest for easier calculation
    deathAge: 40,
    monthlyIncome: 30, // 360/year
    retirementAge: 60,
    retirementBonus: 1000,
    postRetirementJobs: [],
    monthlyLivingCost: 10, // 120/year
    housingPlans: [{ cost: 10, duration: 'infinite' }], // 120/year
    children: [],
    oneTimeEvents: []
  };

  it('calculates basic income and expenses correctly', () => {
    const result = calculateSimulation(baseInput);
    const firstYear = result[0];

    // Income: 30 * 12 = 360
    expect(firstYear.annualIncome).toBe(360);
    // Expenses: Living(120) + Housing(120) = 240
    expect(firstYear.annualExpenses).toBe(240);
    // Savings: 360 - 240 = 120
    expect(firstYear.annualSavings).toBe(120);
    // Balance: 1000 + 120 = 1120 (since interest is 0)
    expect(firstYear.yearEndBalance).toBe(1120);
  });

  it('applies interest rate correctly', () => {
    const inputWithInterest = { ...baseInput, interestRatePct: 5 }; // 5%
    const result = calculateSimulation(inputWithInterest);
    const firstYear = result[0];

    // Savings: 120
    // Balance Pre Interest: 1000 + 120 = 1120
    // Interest: 1120 * 0.05 = 56
    // Final Balance: 1120 + 56 = 1176
    expect(firstYear.investmentIncome).toBe(56);
    expect(firstYear.yearEndBalance).toBe(1176);
  });

  it('handles retirement bonus', () => {
    const inputRetire = { ...baseInput, currentAge: 59, retirementAge: 60, deathAge: 61 };
    const result = calculateSimulation(inputRetire);

    // Age 59: Working
    const age59 = result.find(r => r.age === 59)!;
    expect(age59.annualIncome).toBe(360); // Regular salary

    // Age 60: Retirement Year (Bonus added)
    // Note: Logic says if age < retirementAge add salary. if age === retirementAge add bonus.
    // So at age 60, NO salary, ONLY bonus.
    const age60 = result.find(r => r.age === 60)!;
    expect(age60.annualIncome).toBe(1000); // Only bonus
    expect(age60.event).toContain('退職金');
  });

  it('handles post-retirement jobs', () => {
    const inputPostJob: SimulationInput = {
        ...baseInput,
        currentAge: 60,
        retirementAge: 60,
        deathAge: 65,
        postRetirementJobs: [
            { startAge: 60, endAge: 65, monthlyIncome: 10, retirementBonus: 50 }
        ]
    };
    // Age 60:
    // Main Job: Retirement Age -> Bonus (1000)
    // Post Job: Age 60 >= startAge(60) && age 60 < endAge(65) -> Income (10 * 12 = 120)
    // Total Income: 1120
    const result = calculateSimulation(inputPostJob);
    const age60 = result.find(r => r.age === 60)!;
    expect(age60.annualIncome).toBe(1000 + 120);

    // Age 64: Job active
    const age64 = result.find(r => r.age === 64)!;
    expect(age64.annualIncome).toBe(120);

    // Age 65: Job ends. Code: if (age === job.endAge) add bonus.
    // Also Age 65 >= startAge(60) is true, but age 65 < endAge(65) is FALSE.
    // So no monthly income from this job. Only bonus.
    const age65 = result.find(r => r.age === 65)!;
    expect(age65.annualIncome).toBe(50);
    expect(age65.event).toContain('再雇用退職金');
  });

  it('handles housing plan transitions', () => {
      const inputHousing = {
          ...baseInput,
          housingPlans: [
              { cost: 10, duration: 5 }, // 5 years: age 30, 31, 32, 33, 34
              { cost: 5, duration: 'infinite' as const } // From age 35
          ]
      };
      const result = calculateSimulation(inputHousing);

      // Age 30 (Year 0): First plan
      expect(result[0].monthlyHousingCost).toBe(10);
      expect(result[4].monthlyHousingCost).toBe(10); // Age 34

      // Age 35 (Year 5): Second plan
      expect(result[5].monthlyHousingCost).toBe(5);
      expect(result[10].monthlyHousingCost).toBe(5);
  });
});
