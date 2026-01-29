import { useMemo } from 'react';
import {
  Line, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';
import type { SimulationYearResult } from '../logic/simulation';

type ResultsProps = {
  data: SimulationYearResult[];
  targetAmount: number;
  retirementAge: number;
};

export function Results({ data, targetAmount, retirementAge }: ResultsProps) {

  const metrics = useMemo(() => {
    // Target Reached Age
    const reachedRow = data.find(row => row.yearEndBalance >= targetAmount);
    const targetAgeText = reachedRow ? `${reachedRow.age}歳` : "到達せず";

    // Asset at Retirement
    const retirementRow = data.find(row => row.age === retirementAge);
    const retirementAssetText = retirementRow
      ? `${retirementRow.yearEndBalance.toLocaleString()} 万円`
      : "データなし";

    const retirementIncomeText = retirementRow
      ? `${retirementRow.investmentIncome.toLocaleString()} 万円`
      : "データなし";

    return { targetAgeText, retirementAssetText, retirementIncomeText };
  }, [data, targetAmount, retirementAge]);

  // Prepare chart data with target line
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      target: targetAmount
    }));
  }, [data, targetAmount]);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">家族構成と住居変動を考慮したサイドFIREシミュレーター</h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          label={`目標${targetAmount}万円到達年齢`}
          value={metrics.targetAgeText}
        />
        <MetricCard
          label={`${retirementAge}歳時点の資産額`}
          value={metrics.retirementAssetText}
        />
        <MetricCard
          label={`${retirementAge}歳時点の年間不労所得`}
          value={metrics.retirementIncomeText}
        />
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Main Asset Chart (Stacked) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">資産内訳推移 (元本 + 運用益)</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value} />
                <Legend />
                <Area type="monotone" dataKey="totalPrincipal" name="元本累計" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="totalInvestmentIncome" name="運用益累計" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Line type="monotone" dataKey="target" name="目標額" stroke="#ff7f0e" strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Annual Investment Income Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">年間不労所得 (運用益) 推移</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value} />
                <Legend />
                <Bar dataKey="investmentIncome" name="年間運用益" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">詳細データ</h2>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3">年齢</th>
                <th className="px-4 py-3">経過年数</th>
                <th className="px-4 py-3">イベント</th>
                <th className="px-4 py-3">住居費(月)</th>
                <th className="px-4 py-3">年間積立額</th>
                <th className="px-4 py-3">教育費</th>
                <th className="px-4 py-3 text-green-600">運用益(年)</th>
                <th className="px-4 py-3 text-gray-500">元本累計</th>
                <th className="px-4 py-3 text-green-600">運用益累計</th>
                <th className="px-4 py-3">年末残高</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.age} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.age}</td>
                  <td className="px-4 py-3">{row.yearsPassed}</td>
                  <td className="px-4 py-3">{row.event || '-'}</td>
                  <td className="px-4 py-3">{row.monthlyHousingCost}</td>
                  <td className="px-4 py-3">{row.annualSavings}</td>
                  <td className="px-4 py-3">{row.educationCost}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">+{row.investmentIncome.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{row.totalPrincipal.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-600">+{row.totalInvestmentIncome.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold">{row.yearEndBalance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
