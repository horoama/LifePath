import LZString from 'lz-string';
import type { SimulationInput } from '../logic/simulation';

const SHARE_PARAM_KEY = 'data';

type SharedState = {
  input: SimulationInput;
  targetAmount: number;
};

export function compressSimulationState(input: SimulationInput, targetAmount: number): string {
  const state: SharedState = { input, targetAmount };
  const jsonString = JSON.stringify(state);
  return LZString.compressToEncodedURIComponent(jsonString);
}

export function decompressSimulationState(encoded: string): SharedState | null {
  try {
    const jsonString = LZString.decompressFromEncodedURIComponent(encoded);
    if (!jsonString) return null;
    return JSON.parse(jsonString) as SharedState;
  } catch (e) {
    console.error('Failed to parse shared state:', e);
    return null;
  }
}

export function getShareUrl(input: SimulationInput, targetAmount: number): string {
  const compressed = compressSimulationState(input, targetAmount);
  const url = new URL(window.location.href);
  url.searchParams.set(SHARE_PARAM_KEY, compressed);
  return url.toString();
}

export function getSharedStateFromUrl(): SharedState | null {
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get(SHARE_PARAM_KEY);
  if (!encoded) return null;
  return decompressSimulationState(encoded);
}

export function clearShareParamFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_PARAM_KEY);
  window.history.replaceState({}, '', url.toString());
}
