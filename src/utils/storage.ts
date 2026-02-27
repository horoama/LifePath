import type { SimulationInput } from '../logic/simulation';

const STORAGE_KEY = 'simulation_settings';

type StoredSettings = {
  input: SimulationInput;
  targetAmount: number;
  timestamp: number;
};

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function saveSettings(input: SimulationInput, targetAmount: number): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available.');
    return false;
  }

  const settings: StoredSettings = {
    input,
    targetAmount,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
}

export function loadSettings(): { input: SimulationInput, targetAmount: number } | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      return null;
    }
    const settings = JSON.parse(json) as StoredSettings;
    return {
      input: settings.input,
      targetAmount: settings.targetAmount,
    };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return null;
  }
}
