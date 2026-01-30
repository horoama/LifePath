import { useMemo } from 'react';
import {
  Area, AreaChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
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

    // Income at Retirement (Post-retirement job income starts appearing, or investment income)
    // The previous code showed investment income. Let's keep it or show total income?
    // Let's show Investment Income as "Annual Passive Income"
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
    <div className="flex-1 p-8 overflow-y-auto bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">ライフプラン・シミュレーション結果</h1>

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
        {/* Main Asset Chart (Total Assets vs Target) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">総資産推移</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5 }} unit="歳" />
                <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number | string) => typeof value === 'number' ? `${value.toLocaleString()} 万円` : value} />
                <Legend />
                <Area type="monotone" dataKey="yearEndBalance" name="総資産" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="target" name="目標額" stroke="#ff7f0e" fill="none" strokeDasharray="5 5" />
              </AreaChart>
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
                <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5 }} unit="歳" />
                <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number | string) => typeof value === 'number' ? `${value.toLocaleString()} 万円` : value} />
                <Legend />
                <Bar dataKey="investmentIncome" name="年間運用益" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">年次収支データ</h2>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">年齢</th>
                <th className="px-4 py-3 whitespace-nowrap">イベント</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">年間収入</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">年間支出</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">年間収支(貯蓄)</th>
                <th className="px-4 py-3 whitespace-nowrap text-right text-green-600">運用益</th>
                <th className="px-4 py-3 whitespace-nowrap text-right font-bold">年末資産残高</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.age} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.age}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={row.event}>{row.event || '-'}</td>
                  <td className="px-4 py-3 text-right">{row.annualIncome.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{row.annualExpenses.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right ${row.annualSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {row.annualSavings.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">+{row.investmentIncome.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{row.yearEndBalance.toLocaleString()}</td>
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
