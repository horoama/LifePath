import { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Camera, FileText, Download } from 'lucide-react';
import {
  Area, AreaChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Tooltip as InfoTooltip } from './Tooltip';
import { SummaryModal } from './SummaryModal';
import { generateSimulationSummary } from '../logic/summaryGenerator';
import type { SimulationYearResult, SimulationInput } from '../logic/simulation';

const formatCurrency = (value: number) => {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
};

const CHART_COLORS = {
  normal: {
    assetNominal: "#8884d8",
    assetReal: "#82ca9d",
    assetPrincipal: "#9ca3af",
    target: "#ff7f0e",
    incomeSalary: "#3b82f6",
    incomeBonus: "#0ea5e9",
    incomePension: "#8b5cf6",
    incomeOneTime: "#22c55e",
    incomeInvestment: "#f59e0b",
    expenseLiving: "#f97316",
    expenseHousing: "#ef4444",
    expenseEdu: "#ec4899",
    expenseOneTime: "#eab308",
  },
  dark: {
    assetNominal: "#ef4444", // Red
    assetReal: "#b91c1c",     // Dark Red
    assetPrincipal: "#4b5563", // Gray
    target: "#7f1d1d",        // Darkest Red
    incomeSalary: "#6b7280",  // Gray
    incomeBonus: "#4b5563",   // Dark Gray
    incomePension: "#374151", // Darker Gray
    incomeOneTime: "#1f2937", // Very Dark Gray
    incomeInvestment: "#991b1b", // Red (Loss)
    expenseLiving: "#ef4444", // Red
    expenseHousing: "#dc2626", // Red
    expenseEdu: "#b91c1c",    // Dark Red
    expenseOneTime: "#7f1d1d", // Darkest Red
  }
};

type ResultsProps = {
  data: SimulationYearResult[];
  targetAmount: number;
  retirementAge: number;
  input: SimulationInput;
  isDarkLife: boolean;
};

type MetricData = {
  targetAgeText: string;
  retirementAssetText: string;
  retirementIncomeText: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartData = any[];

type ResultsBodyProps = {
  data: SimulationYearResult[];
  metrics: MetricData;
  chartData: ChartData;
  targetAmount: number;
  retirementAge: number;
  isPrinting: boolean;
  onOpenSummary: () => void;
  onSaveImage: () => void;
  onDownloadCSV: () => void;
  isDarkLife: boolean;
};

function ResultsBody({
  data,
  metrics,
  chartData,
  targetAmount,
  retirementAge,
  isPrinting,
  onOpenSummary,
  onSaveImage,
  onDownloadCSV,
  isDarkLife
}: ResultsBodyProps) {
  const colors = isDarkLife ? CHART_COLORS.dark : CHART_COLORS.normal;
  const textColor = isDarkLife ? 'text-gray-100' : 'text-gray-900';
  const subTextColor = isDarkLife ? 'text-gray-400' : 'text-gray-500';
  const bgColor = isDarkLife ? 'bg-gray-800' : 'bg-white';

  return (
    <div className={`flex-1 p-8 transition-colors duration-500 ${isDarkLife ? 'bg-gray-900' : 'bg-gray-100'} ${isPrinting ? '' : 'overflow-y-auto'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold transition-colors duration-500 ${isDarkLife ? 'text-red-500' : 'text-gray-800'}`}>
          {isDarkLife ? 'ダークライフプラン・シミュレーション結果' : 'ライフプラン・シミュレーション結果'}
        </h1>
        {!isPrinting && (
          <div className="flex gap-2">
            <button
              onClick={onOpenSummary}
              className={`flex items-center gap-2 font-bold py-2 px-4 rounded shadow transition-colors cursor-pointer ${isDarkLife ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
              <FileText size={20} />
              <span>結果をまとめる</span>
            </button>
            <button
              onClick={onSaveImage}
              className={`flex items-center gap-2 font-bold py-2 px-4 rounded shadow transition-colors cursor-pointer ${isDarkLife ? 'bg-red-900 hover:bg-red-800 text-red-100' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              <Camera size={20} />
              <span>画像で保存</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className={`grid grid-cols-1 gap-6 mb-8 ${isPrinting ? 'grid-cols-3' : 'md:grid-cols-3'}`}>
        <MetricCard
          label={`目標${targetAmount}万円到達年齢`}
          value={metrics.targetAgeText}
          tooltipContent="資産額が目標金額（名目値）を初めて上回る年齢です。"
          isDarkLife={isDarkLife}
        />
        <MetricCard
          label={`${retirementAge}歳時点の資産額`}
          value={metrics.retirementAssetText}
          tooltipContent="メインの退職年齢時点での総資産額（名目値）です。"
          isDarkLife={isDarkLife}
        />
        <MetricCard
          label={`${retirementAge}歳時点の年間不労所得`}
          value={metrics.retirementIncomeText}
          tooltipContent="退職年齢時点で発生している不労所得（運用益など・名目値）の年間金額です。"
          isDarkLife={isDarkLife}
        />
      </div>

      {/* Charts Container */}
      <div className="space-y-8 mb-8">
        {/* Main Asset Chart (Total Assets vs Target) */}
        <div className={`p-6 rounded-lg shadow-md transition-colors duration-500 ${bgColor}`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDarkLife ? 'text-gray-200' : 'text-gray-700'}`}>
            総資産推移
            <InfoTooltip content="毎年の年末時点での総資産額の推移です。「名目」は将来の金額そのもの、「実質」はインフレによる価値目減りを考慮した参考値です。" />
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkLife ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5, fill: isDarkLife ? '#9ca3af' : '#666' }} unit="歳" stroke={isDarkLife ? '#9ca3af' : '#666'} />
                <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft', fill: isDarkLife ? '#9ca3af' : '#666' }} stroke={isDarkLife ? '#9ca3af' : '#666'} />
                <Tooltip
                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                   formatter={(value: any) => typeof value === 'number' ? `${formatCurrency(value)} 万円` : value}
                   contentStyle={{ backgroundColor: isDarkLife ? '#1f2937' : '#fff', borderColor: isDarkLife ? '#374151' : '#ccc', color: isDarkLife ? '#f3f4f6' : '#333' }}
                />
                <Legend wrapperStyle={{ color: isDarkLife ? '#e5e7eb' : '#333' }} />
                <Area
                    type="monotone"
                    dataKey="yearEndBalance"
                    name="総資産(名目)"
                    stroke={colors.assetNominal}
                    fill={colors.assetNominal}
                    fillOpacity={0.6}
                    isAnimationActive={!isPrinting}
                />
                <Area
                    type="monotone"
                    dataKey="yearEndBalanceReal"
                    name="総資産(実質)"
                    stroke={colors.assetReal}
                    fill="none"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    isAnimationActive={!isPrinting}
                />
                <Area
                  type="monotone"
                  dataKey="totalPrincipal"
                  name="元本"
                  stroke={colors.assetPrincipal}
                  fill="none"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  isAnimationActive={!isPrinting}
                />
                <Area
                    type="monotone"
                    dataKey="target"
                    name="目標額"
                    stroke={colors.target}
                    fill="none"
                    strokeDasharray="5 5"
                    isAnimationActive={!isPrinting}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-8 ${isPrinting ? 'grid-cols-2' : 'xl:grid-cols-2'}`}>
          {/* Income Breakdown Chart */}
          <div className={`p-6 rounded-lg shadow-md transition-colors duration-500 ${bgColor}`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDarkLife ? 'text-gray-200' : 'text-gray-700'}`}>
              年間収入内訳
              <InfoTooltip content="年間の収入内訳（名目値）です。「運用益」は資産運用による利益を表します。" />
            </h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkLife ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5, fill: isDarkLife ? '#9ca3af' : '#666' }} unit="歳" stroke={isDarkLife ? '#9ca3af' : '#666'} />
                  <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft', fill: isDarkLife ? '#9ca3af' : '#666' }} stroke={isDarkLife ? '#9ca3af' : '#666'} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => typeof value === 'number' ? `${formatCurrency(value)} 万円` : value}
                    contentStyle={{ backgroundColor: isDarkLife ? '#1f2937' : '#fff', borderColor: isDarkLife ? '#374151' : '#ccc', color: isDarkLife ? '#f3f4f6' : '#333' }}
                  />
                  <Legend />
                  <Bar dataKey="incomeBreakdown.salary" name="給与収入" stackId="a" fill={colors.incomeSalary} isAnimationActive={!isPrinting} />
                  <Bar dataKey="incomeBreakdown.bonus" name="退職金" stackId="a" fill={colors.incomeBonus} isAnimationActive={!isPrinting} />
                  <Bar dataKey="incomeBreakdown.pension" name="再雇用・年金" stackId="a" fill={colors.incomePension} isAnimationActive={!isPrinting} />
                  <Bar dataKey="incomeBreakdown.oneTime" name="一時収入" stackId="a" fill={colors.incomeOneTime} isAnimationActive={!isPrinting} />
                  <Bar dataKey="investmentIncome" name="運用益" stackId="a" fill={colors.incomeInvestment} isAnimationActive={!isPrinting} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Breakdown Chart */}
          <div className={`p-6 rounded-lg shadow-md transition-colors duration-500 ${bgColor}`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDarkLife ? 'text-gray-200' : 'text-gray-700'}`}>
              年間支出内訳
              <InfoTooltip content="年間の支出内訳（名目値）です。インフレ率に応じて生活費や教育費が増加して表示されます。" />
            </h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkLife ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5, fill: isDarkLife ? '#9ca3af' : '#666' }} unit="歳" stroke={isDarkLife ? '#9ca3af' : '#666'} />
                  <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft', fill: isDarkLife ? '#9ca3af' : '#666' }} stroke={isDarkLife ? '#9ca3af' : '#666'} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => typeof value === 'number' ? `${formatCurrency(value)} 万円` : value}
                    contentStyle={{ backgroundColor: isDarkLife ? '#1f2937' : '#fff', borderColor: isDarkLife ? '#374151' : '#ccc', color: isDarkLife ? '#f3f4f6' : '#333' }}
                  />
                  <Legend />
                  <Bar dataKey="expenseBreakdown.living" name="基本生活費" stackId="a" fill={colors.expenseLiving} isAnimationActive={!isPrinting} />
                  <Bar dataKey="expenseBreakdown.housing" name="住居費" stackId="a" fill={colors.expenseHousing} isAnimationActive={!isPrinting} />
                  <Bar dataKey="expenseBreakdown.education" name="教育・養育費" stackId="a" fill={colors.expenseEdu} isAnimationActive={!isPrinting} />
                  <Bar dataKey="expenseBreakdown.oneTime" name="一時支出" stackId="a" fill={colors.expenseOneTime} isAnimationActive={!isPrinting} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`p-6 rounded-lg shadow-md transition-colors duration-500 ${bgColor}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${isDarkLife ? 'text-gray-200' : 'text-gray-700'}`}>年次収支データ</h2>
          {!isPrinting && (
            <button
              onClick={onDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              <Download size={16} /> CSVダウンロード
            </button>
          )}
        </div>
        <div className={isPrinting ? '' : "overflow-x-auto max-h-[500px]"}>
          <table className={`min-w-full text-sm text-left ${subTextColor}`}>
            <thead className={`text-xs uppercase ${isDarkLife ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'} ${isPrinting ? '' : 'sticky top-0 z-10'}`}>
              <tr>
                <th className="px-4 py-3">年齢</th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    イベント
                    <InfoTooltip content="その年に発生する主なライフイベント（退職、子供の誕生・進学など）です。" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    収入
                    <InfoTooltip content="給与、ボーナス、年金、一時収入の合計です（運用益は含みません）。名目値で表示されています。" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    支出
                    <InfoTooltip content="基本生活費、住居費、教育費、一時支出の合計です。名目値で表示されています。" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    収支
                    <InfoTooltip content="年間収入 － 年間支出 です。プラスなら資産増、マイナスなら資産取り崩しとなります。" />
                  </div>
                </th>
                <th className={`px-4 py-3 text-right ${isDarkLife ? 'text-red-400' : 'text-green-600'}`}>
                  <div className="flex items-center justify-end gap-1">
                    運用益
                    <InfoTooltip content="期首資産 × 想定年利 で計算された運用益です。全額再投資される前提です。" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right font-bold">
                  <div className="flex items-center justify-end gap-1">
                    資産残高
                    <InfoTooltip content="運用益を加えた年末時点の総資産額です（名目値）。" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.age} className={`border-b transition-colors duration-200 ${isDarkLife ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 font-medium ${textColor}`}>{row.age}</td>
                  <td className="px-4 py-3">
                    <div title={row.event}>{row.event || '-'}</div>
                  </td>

                  <td className="px-4 py-3 text-right" title={`給与収入: ${formatCurrency(row.incomeBreakdown.salary)}
退職金: ${formatCurrency(row.incomeBreakdown.bonus)}
再雇用・年金: ${formatCurrency(row.incomeBreakdown.pension)}
一時収入: ${formatCurrency(row.incomeBreakdown.oneTime)}`}>
                    {formatCurrency(row.annualIncome)}
                  </td>

                  <td className="px-4 py-3 text-right" title={`基本生活費: ${formatCurrency(row.expenseBreakdown.living)}
住居費: ${formatCurrency(row.expenseBreakdown.housing)}
教育・養育費: ${formatCurrency(row.expenseBreakdown.education)}
一時支出: ${formatCurrency(row.expenseBreakdown.oneTime)}`}>
                    {formatCurrency(row.annualExpenses)}
                  </td>

                  <td className={`px-4 py-3 text-right ${row.annualSavings >= 0 ? (isDarkLife ? 'text-blue-400' : 'text-blue-600') : (isDarkLife ? 'text-red-500 font-bold' : 'text-red-600')}`}>
                    {formatCurrency(row.annualSavings)}
                  </td>
                  <td className={`px-4 py-3 text-right ${isDarkLife ? 'text-red-400' : 'text-green-600'}`} title="運用益">+{formatCurrency(row.investmentIncome)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${textColor}`}>{formatCurrency(row.yearEndBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Results({ data, targetAmount, retirementAge, input, isDarkLife }: ResultsProps) {
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const metrics = useMemo(() => {
    // Target Reached Age (Using Nominal Balance)
    const reachedRow = data.find(row => row.yearEndBalance >= targetAmount);
    const targetAgeText = reachedRow ? `${reachedRow.age}歳` : "到達せず";

    // Asset at Retirement (Nominal)
    const retirementRow = data.find(row => row.age === retirementAge);
    const retirementAssetText = retirementRow
      ? `${formatCurrency(retirementRow.yearEndBalance)} 万円`
      : "データなし";

    // Income at Retirement (Nominal)
    const retirementIncomeText = retirementRow
      ? `${formatCurrency(retirementRow.investmentIncome)} 万円`
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

  const summaryText = useMemo(() => {
    return generateSimulationSummary(input, data, targetAmount);
  }, [input, data, targetAmount]);

  const handleSaveImage = () => {
    setIsCapturing(true);

    // Wait for the hidden view to render and charts to adjust
    setTimeout(() => {
      if (printRef.current === null) {
        setIsCapturing(false);
        return;
      }

      toPng(printRef.current, {
        cacheBust: true,
        width: 1280, // Force desktop width
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
          setIsCapturing(false);
        });
    }, 1000); // 1 second delay to ensure Recharts rendering
  };

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
    <>
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summaryText={summaryText}
      />

      {/* Visible Component (Interactive, Responsive) */}
      <ResultsBody
        data={data}
        metrics={metrics}
        chartData={chartData}
        targetAmount={targetAmount}
        retirementAge={retirementAge}
        isPrinting={false}
        onOpenSummary={() => setIsSummaryModalOpen(true)}
        onSaveImage={handleSaveImage}
        onDownloadCSV={handleDownloadCSV}
        isDarkLife={isDarkLife}
      />

      {/* Hidden Component for Capture (Fixed Desktop Width) */}
      {isCapturing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: -2000,
            width: 1280,
            zIndex: -50,
            opacity: 1 // Must be visible for html-to-image
          }}
        >
          <div ref={printRef}>
            <ResultsBody
              data={data}
              metrics={metrics}
              chartData={chartData}
              targetAmount={targetAmount}
              retirementAge={retirementAge}
              isPrinting={true}
              onOpenSummary={() => {}} // No-op
              onSaveImage={() => {}} // No-op
              onDownloadCSV={() => {}} // No-op
              isDarkLife={isDarkLife}
            />
          </div>
        </div>
      )}
    </>
  );
}

function MetricCard({ label, value, tooltipContent, isDarkLife }: { label: string, value: string, tooltipContent?: React.ReactNode, isDarkLife: boolean }) {
  return (
    <div className={`p-6 rounded-lg shadow-md border-l-4 transition-colors duration-500 ${isDarkLife ? 'bg-gray-800 border-red-700' : 'bg-white border-blue-500'}`}>
      <div className={`text-sm mb-1 flex items-center gap-1 ${isDarkLife ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
        {tooltipContent && <InfoTooltip content={tooltipContent} />}
      </div>
      <div className={`text-3xl font-bold transition-colors duration-500 ${isDarkLife ? 'text-red-500' : 'text-gray-800'}`}>{value}</div>
    </div>
  );
}
