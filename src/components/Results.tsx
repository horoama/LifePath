import { useMemo, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Camera } from 'lucide-react';
import {
  Area, AreaChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download } from 'lucide-react';
import { Tooltip as InfoTooltip } from './Tooltip';
import type { SimulationYearResult } from '../logic/simulation';

type ResultsProps = {
  data: SimulationYearResult[];
  targetAmount: number;
  retirementAge: number;
};

// Brand-aligned chart colors
const COLORS = {
  assetNominal: "#2563eb", // brand-600
  assetReal: "#10b981",    // emerald-500
  target: "#f59e0b",       // accent-500

  incomeSalary: "#2563eb", // brand-600
  incomeBonus: "#60a5fa",  // brand-400
  incomePension: "#93c5fd",// brand-300
  incomeOneTime: "#22c55e",// green-500
  incomeInvest: "#f59e0b", // accent-500

  expenseLiving: "#f97316", // orange-500
  expenseHousing: "#ef4444", // red-500
  expenseEducation: "#ec4899", // pink-500
  expenseOneTime: "#eab308", // yellow-500
};

export function Results({ data, targetAmount, retirementAge }: ResultsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const metrics = useMemo(() => {
    // Target Reached Age (Using Nominal Balance)
    const reachedRow = data.find(row => row.yearEndBalance >= targetAmount);
    const targetAgeText = reachedRow ? `${reachedRow.age}歳` : "到達せず";

    // Asset at Retirement (Nominal)
    const retirementRow = data.find(row => row.age === retirementAge);
    const retirementAssetText = retirementRow
      ? `${retirementRow.yearEndBalance.toLocaleString()} 万円`
      : "データなし";

    // Income at Retirement (Nominal)
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

  const handleSaveImage = useCallback(() => {
    if (ref.current === null || tableContainerRef.current === null) {
      return;
    }

    // Save original styles
    const originalRootOverflow = ref.current.style.overflow;
    const originalTableMaxHeight = tableContainerRef.current.style.maxHeight;
    const originalTableOverflow = tableContainerRef.current.style.overflow;

    // Expand for capture
    ref.current.style.overflow = 'visible';
    tableContainerRef.current.style.maxHeight = 'none';
    tableContainerRef.current.style.overflow = 'visible';

    toPng(ref.current, {
        cacheBust: true,
        filter: (node) => {
            if (node instanceof HTMLElement && node.classList.contains('no-capture')) {
                return false;
            }
            return true;
        }
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'simulation-results.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to capture image', err);
      })
      .finally(() => {
        // Restore styles
        if (ref.current) ref.current.style.overflow = originalRootOverflow;
        if (tableContainerRef.current) {
          tableContainerRef.current.style.maxHeight = originalTableMaxHeight;
          tableContainerRef.current.style.overflow = originalTableOverflow;
        }
      });
  }, [ref]);

  const handleDownloadCSV = () => {
    // Define headers
    const headers = [
      '年齢',
      'イベント',
      '年間収入',
      '給与収入',
      '退職金',
      '再雇用・年金',
      '一時収入',
      '年間支出',
      '基本生活費',
      '住居費',
      '教育・養育費',
      '一時支出',
      '年間収支(貯蓄)',
      '運用益',
      '年末資産残高(名目)',
      '年末資産残高(実質)'
    ];

    // Map data to rows
    const rows = data.map(row => [
      row.age,
      `"${row.event || ''}"`, // Quote events to handle commas
      row.annualIncome,
      row.incomeBreakdown.salary,
      row.incomeBreakdown.bonus,
      row.incomeBreakdown.pension,
      row.incomeBreakdown.oneTime,
      row.annualExpenses,
      row.expenseBreakdown.living,
      row.expenseBreakdown.housing,
      row.expenseBreakdown.education,
      row.expenseBreakdown.oneTime,
      row.annualSavings,
      row.investmentIncome,
      row.yearEndBalance,
      row.yearEndBalanceReal
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download link (with BOM for Excel)
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'life_plan_simulation.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50" ref={ref}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ライフプラン・シミュレーション結果</h1>
        <button
            onClick={handleSaveImage}
            className="no-capture flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded shadow transition-colors cursor-pointer"
        >
            <Camera size={20} />
            <span>画像で保存</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          label={`目標${targetAmount}万円到達年齢`}
          value={metrics.targetAgeText}
          tooltipContent="資産額が目標金額（名目値）を初めて上回る年齢です。"
        />
        <MetricCard
          label={`${retirementAge}歳時点の資産額`}
          value={metrics.retirementAssetText}
          tooltipContent="メインの退職年齢時点での総資産額（名目値）です。"
        />
        <MetricCard
          label={`${retirementAge}歳時点の年間不労所得`}
          value={metrics.retirementIncomeText}
          tooltipContent="退職年齢時点で発生している不労所得（運用益など・名目値）の年間金額です。"
        />
      </div>

      {/* Charts Container */}
      <div className="space-y-8 mb-8">
        {/* Main Asset Chart (Total Assets vs Target) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            総資産推移
            <InfoTooltip content="毎年の年末時点での総資産額の推移です。「名目」は将来の金額そのもの、「実質」はインフレによる価値目減りを考慮した参考値です。" />
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5 }} unit="歳" />
                <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Tooltip formatter={(value: any) => typeof value === 'number' ? `${value.toLocaleString()} 万円` : value} />
                <Legend />
                <Area type="monotone" dataKey="yearEndBalance" name="総資産(名目)" stroke={COLORS.assetNominal} fill={COLORS.assetNominal} fillOpacity={0.6} />
                <Area type="monotone" dataKey="yearEndBalanceReal" name="総資産(実質)" stroke={COLORS.assetReal} fill="none" strokeDasharray="5 5" strokeWidth={2} />
                <Area type="monotone" dataKey="target" name="目標額" stroke={COLORS.target} fill="none" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Income Breakdown Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              年間収入内訳
              <InfoTooltip content="年間の収入内訳（名目値）です。「運用益」は資産運用による利益を表します。" />
            </h2>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5 }} unit="歳" />
                    <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Tooltip formatter={(value: any) => typeof value === 'number' ? `${value.toLocaleString()} 万円` : value} />
                    <Legend />
                    <Bar dataKey="incomeBreakdown.salary" name="給与収入" stackId="a" fill={COLORS.incomeSalary} />
                    <Bar dataKey="incomeBreakdown.bonus" name="退職金" stackId="a" fill={COLORS.incomeBonus} />
                    <Bar dataKey="incomeBreakdown.pension" name="再雇用・年金" stackId="a" fill={COLORS.incomePension} />
                    <Bar dataKey="incomeBreakdown.oneTime" name="一時収入" stackId="a" fill={COLORS.incomeOneTime} />
                    <Bar dataKey="investmentIncome" name="運用益" stackId="a" fill={COLORS.incomeInvest} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>

            {/* Expense Breakdown Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              年間支出内訳
              <InfoTooltip content="年間の支出内訳（名目値）です。インフレ率に応じて生活費や教育費が増加して表示されます。" />
            </h2>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5 }} unit="歳" />
                    <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Tooltip formatter={(value: any) => typeof value === 'number' ? `${value.toLocaleString()} 万円` : value} />
                    <Legend />
                    <Bar dataKey="expenseBreakdown.living" name="基本生活費" stackId="a" fill={COLORS.expenseLiving} />
                    <Bar dataKey="expenseBreakdown.housing" name="住居費" stackId="a" fill={COLORS.expenseHousing} />
                    <Bar dataKey="expenseBreakdown.education" name="教育・養育費" stackId="a" fill={COLORS.expenseEducation} />
                    <Bar dataKey="expenseBreakdown.oneTime" name="一時支出" stackId="a" fill={COLORS.expenseOneTime} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">年次収支データ</h2>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm cursor-pointer"
          >
            <Download size={16} /> CSVダウンロード
          </button>
        </div>
        <div className="overflow-x-auto max-h-[500px]" ref={tableContainerRef}>
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">年齢</th>
                <th className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    イベント
                    <InfoTooltip content="その年に発生する主なライフイベント（退職、子供の誕生・進学など）です。" />
                  </div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    年間収入
                    <InfoTooltip content="給与、ボーナス、年金、一時収入の合計です（運用益は含みません）。名目値で表示されています。" />
                  </div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    年間支出
                    <InfoTooltip content="基本生活費、住居費、教育費、一時支出の合計です。名目値で表示されています。" />
                  </div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    年間収支(貯蓄)
                    <InfoTooltip content="年間収入 － 年間支出 です。プラスなら資産増、マイナスなら資産取り崩しとなります。" />
                  </div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-right text-green-600">
                  <div className="flex items-center justify-end gap-1">
                    運用益
                    <InfoTooltip content="期首資産 × 想定年利 で計算された運用益です。全額再投資される前提です。" />
                  </div>
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-right font-bold">
                  <div className="flex items-center justify-end gap-1">
                    年末資産残高
                    <InfoTooltip content="運用益を加えた年末時点の総資産額です（名目値）。" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.age} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.age}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={row.event}>{row.event || '-'}</td>

                  <td className="px-4 py-3 text-right" title={`給与収入: ${row.incomeBreakdown.salary.toLocaleString()}
退職金: ${row.incomeBreakdown.bonus.toLocaleString()}
再雇用・年金: ${row.incomeBreakdown.pension.toLocaleString()}
一時収入: ${row.incomeBreakdown.oneTime.toLocaleString()}`}>
                    {row.annualIncome.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right" title={`基本生活費: ${row.expenseBreakdown.living.toLocaleString()}
住居費: ${row.expenseBreakdown.housing.toLocaleString()}
教育・養育費: ${row.expenseBreakdown.education.toLocaleString()}
一時支出: ${row.expenseBreakdown.oneTime.toLocaleString()}`}>
                    {row.annualExpenses.toLocaleString()}
                  </td>

                  <td className={`px-4 py-3 text-right ${row.annualSavings >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
                    {row.annualSavings.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600" title="運用益">+{row.investmentIncome.toLocaleString()}</td>
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

function MetricCard({ label, value, tooltipContent }: { label: string, value: string, tooltipContent?: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-500 hover:shadow-lg transition-shadow">
      <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
        {label}
        {tooltipContent && <InfoTooltip content={tooltipContent} />}
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
