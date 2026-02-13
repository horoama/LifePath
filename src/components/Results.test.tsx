// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Results } from './Results';
import type { SimulationYearResult, SimulationInput } from '../logic/simulation';

// Mock Recharts to avoid complex SVG rendering issues in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.mock('recharts', async (importOriginal: any) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Area: ({ name }: { name: string }) => <div data-testid={`area-${name}`}>{name}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Bar: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
  };
});

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn(),
}));

const mockInput: SimulationInput = {
    currentAge: 30,
    currentAssets: 1000,
    interestRatePct: 3,
    inflationRatePct: 1,
    incomeIncreaseRatePct: 1,
    deathAge: 90,
    monthlyIncome: 30,
    annualBonus: 100,
    retirementAge: 60,
    retirementBonus: 1000,
    postRetirementJobs: [],
    livingCostPlans: [],
    housingPlans: [],
    children: [],
    oneTimeEvents: []
};

const mockData: SimulationYearResult[] = [
  {
    age: 30,
    yearsPassed: 0,
    event: '',
    monthlyHousingCost: 10,
    annualIncome: 500,
    annualExpenses: 300,
    annualSavings: 200,
    yearEndBalance: 1200,
    yearEndBalanceReal: 1200,
    investmentIncome: 0,
    totalPrincipal: 1200, // Important for test
    totalInvestmentIncome: 0,
    incomeBreakdown: { salary: 500, bonus: 0, pension: 0, oneTime: 0 },
    expenseBreakdown: { living: 200, housing: 100, education: 0, oneTime: 0 }
  }
];

describe('Results Component', () => {
  it('renders without crashing', () => {
    render(<Results data={mockData} targetAmount={2000} retirementAge={60} input={mockInput} />);
    expect(screen.getByText('ライフプラン・シミュレーション結果')).not.toBeNull();
  });

  it('renders principal line', () => {
    render(<Results data={mockData} targetAmount={2000} retirementAge={60} input={mockInput} />);

    // "元本" area should be visible unconditionally.
    // There are 2 instances: one for display and one for printing (hidden).
    const principalAreas = screen.getAllByTestId('area-元本');
    expect(principalAreas.length).toBeGreaterThan(0);

    // Toggle switch should not exist
    expect(screen.queryByLabelText('元本を表示')).toBeNull();
  });
});
