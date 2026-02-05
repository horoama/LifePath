import { describe, it, expect } from 'vitest';
import { compressSimulationState, decompressSimulationState } from './urlShare';
import type { SimulationInput } from '../logic/simulation';

describe('urlShare', () => {
  const mockInput: SimulationInput = {
    currentAge: 35,
    currentAssets: 1000,
    interestRatePct: 4.5,
    inflationRatePct: 1.2,
    incomeIncreaseRatePct: 1.0,
    deathAge: 95,
    monthlyIncome: 40,
    annualBonus: 100,
    retirementAge: 60,
    retirementBonus: 2000,
    postRetirementJobs: [
      { startAge: 60, endAge: 65, monthlyIncome: 20, retirementBonus: 0 }
    ],
    livingCostPlans: [
      { cost: 20, endAge: 'infinite' }
    ],
    housingPlans: [
      { cost: 12, endAge: 'infinite' }
    ],
    children: [
      { birthYearOffset: -2, educationPattern: '全公立', monthlyChildcareCost: 1 }
    ],
    oneTimeEvents: [
        { age: 40, amount: 500, type: 'expense', name: 'Car' }
    ]
  };
  const mockTargetAmount = 5000;

  it('should compress and decompress simulation state correctly', () => {
    const compressed = compressSimulationState(mockInput, mockTargetAmount);
    expect(typeof compressed).toBe('string');
    expect(compressed.length).toBeGreaterThan(0);

    const decompressed = decompressSimulationState(compressed);
    expect(decompressed).not.toBeNull();
    expect(decompressed?.input).toEqual(mockInput);
    expect(decompressed?.targetAmount).toEqual(mockTargetAmount);
  });

  it('should return null for invalid compressed string', () => {
    const decompressed = decompressSimulationState('invalid-string');
    expect(decompressed).toBeNull();
  });
});
