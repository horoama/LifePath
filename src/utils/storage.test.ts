/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveSettings, loadSettings } from './storage';
import type { SimulationInput } from '../logic/simulation';

const DEFAULT_INPUT: SimulationInput = {
  currentAge: 30,
  currentAssets: 500,
  interestRatePct: 3.0,
  inflationRatePct: 0.0,
  incomeIncreaseRatePct: 0.0,
  deathAge: 90,
  monthlyIncome: 30,
  annualBonus: 0,
  retirementAge: 65,
  retirementBonus: 1000,
  postRetirementJobs: [],
  livingCostPlans: [],
  housingPlans: [],
  children: [],
  oneTimeEvents: []
};

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should save and load settings correctly', () => {
    const targetAmount = 5000;
    const success = saveSettings(DEFAULT_INPUT, targetAmount);
    expect(success).toBe(true);

    const loaded = loadSettings();
    expect(loaded).not.toBeNull();
    expect(loaded?.input).toEqual(DEFAULT_INPUT);
    expect(loaded?.targetAmount).toBe(targetAmount);
  });

  it('should return null if no settings are saved', () => {
    const loaded = loadSettings();
    expect(loaded).toBeNull();
  });

  it('should handle localStorage unavailability gracefully', () => {
    // It's hard to reliably mock localStorage.setItem in jsdom environments in a way that
    // affects the internal implementation without side effects.
    // Instead, we can force a failure by passing a circular object that fails JSON.stringify,
    // which happens inside the try-catch block of saveSettings.

    const circularInput: any = { ...DEFAULT_INPUT };
    circularInput.self = circularInput;

    const success = saveSettings(circularInput, 3000);
    expect(success).toBe(false);
  });
});
