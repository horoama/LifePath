import type { SimulationInput, SimulationYearResult } from './simulation';

export function generateSimulationSummary(
  input: SimulationInput,
  data: SimulationYearResult[],
  targetAmount: number
): string {
  const lines: string[] = [];

  // --- 1. Input Summary ---
  lines.push('【シミュレーション条件】');
  lines.push(`現在の年齢: ${input.currentAge}歳`);
  lines.push(`シミュレーション終了年齢: ${input.deathAge}歳`);
  lines.push(`現在の資産: ${input.currentAssets.toLocaleString()}万円`);

  lines.push('');
  lines.push('■ 収入・資産運用');
  lines.push(`メインの就労収入: 月収${input.monthlyIncome.toLocaleString()}万円 / ボーナス年${input.annualBonus.toLocaleString()}万円`);
  if (input.incomeIncreaseRatePct > 0) {
    lines.push(`収入上昇率: 年${input.incomeIncreaseRatePct}%`);
  }
  lines.push(`定年退職: ${input.retirementAge}歳 (退職金 ${input.retirementBonus.toLocaleString()}万円)`);
  if (input.postRetirementJobs.length > 0) {
    lines.push('退職後の働き方: あり');
  }
  lines.push(`想定利回り: 年${input.interestRatePct}%`);

  lines.push('');
  lines.push('■ 支出・家族');

  lines.push('基本生活費:');
  if (input.livingCostPlans.length === 0) {
      lines.push('  - 設定なし');
  } else {
      input.livingCostPlans.forEach(plan => {
          lines.push(`  - 月${plan.cost.toLocaleString()}万円 (${formatEndAge(plan.endAge)})`);
      });
  }

  if (input.inflationRatePct > 0) {
    lines.push(`インフレ率: 年${input.inflationRatePct}%`);
  }

  // Housing
  lines.push('住居費:');
  if (input.housingPlans.length === 0) {
     lines.push('  - 設定なし');
  } else {
     input.housingPlans.forEach(plan => {
         lines.push(`  - 月${plan.cost.toLocaleString()}万円 (${formatEndAge(plan.endAge)})`);
     });
  }

  // Children
  if (input.children.length > 0) {
      lines.push(`子供: ${input.children.length}人`);
      input.children.forEach((child, idx) => {
          const age = child.birthYearOffset < 0 ? -child.birthYearOffset : 0; // rough current age or 0 if unborn
          const status = child.birthYearOffset > 0 ? `${child.birthYearOffset}年後誕生予定` : `${age}歳`;
          lines.push(`  - 第${idx+1}子 (${status}): ${child.educationPattern}`);
      });
  } else {
      lines.push('子供: なし');
  }

  lines.push('--------------------------------------------------');

  // --- 2. Result Summary ---
  lines.push('【シミュレーション結果】');

  // Target Reach
  const reachedRow = data.find(row => row.yearEndBalance >= targetAmount);
  if (reachedRow) {
      lines.push(`目標資産(${targetAmount.toLocaleString()}万円): ${reachedRow.age}歳で到達`);
  } else {
      lines.push(`目標資産(${targetAmount.toLocaleString()}万円): 到達せず`);
  }

  // Peak Assets
  let peakBalance = -Infinity;
  let peakAge = input.currentAge;
  data.forEach(d => {
      if (d.yearEndBalance > peakBalance) {
          peakBalance = d.yearEndBalance;
          peakAge = d.age;
      }
  });
  lines.push(`資産ピーク: ${peakAge}歳 (${peakBalance.toLocaleString()}万円)`);

  // Depletion or Final
  const depletionRow = data.find(row => row.yearEndBalance < 0);
  const finalRow = data[data.length - 1];

  if (depletionRow) {
      lines.push(`資産枯渇: ${depletionRow.age}歳でマイナスに転落`);
  } else if (finalRow) {
      lines.push(`最終資産(${finalRow.age}歳時点): ${finalRow.yearEndBalance.toLocaleString()}万円`);
  }

  // Retirement Point
  const retirementRow = data.find(r => r.age === input.retirementAge);
  if (retirementRow) {
      lines.push(`退職時(${input.retirementAge}歳)の資産: ${retirementRow.yearEndBalance.toLocaleString()}万円`);
  }

  lines.push('--------------------------------------------------');

  // --- 3. Detailed Financial Breakdown ---
  lines.push('【生涯収支・詳細】');

  // Initialize Accumulators
  const lifetime = createBreakdownStats();
  const working = createBreakdownStats();
  const retired = createBreakdownStats();

  const inflationRate = (input.inflationRatePct || 0) / 100.0;

  data.forEach(row => {
    const isWorking = row.age < input.retirementAge;
    const stats = isWorking ? working : retired;

    // Inflation Factor for Real Value calculation
    const factor = Math.pow(1 + inflationRate, row.yearsPassed);

    // --- Income ---
    // Salary
    add(lifetime.income.salary, row.incomeBreakdown.salary, factor);
    add(stats.income.salary, row.incomeBreakdown.salary, factor);

    // Bonus (Retirement Bonus)
    add(lifetime.income.bonus, row.incomeBreakdown.bonus, factor);
    add(stats.income.bonus, row.incomeBreakdown.bonus, factor);

    // Pension/Re-employment
    add(lifetime.income.pension, row.incomeBreakdown.pension, factor);
    add(stats.income.pension, row.incomeBreakdown.pension, factor);

    // One-time Income
    add(lifetime.income.oneTime, row.incomeBreakdown.oneTime, factor);
    add(stats.income.oneTime, row.incomeBreakdown.oneTime, factor);

    // Investment Income
    add(lifetime.income.investment, row.investmentIncome, factor);
    add(stats.income.investment, row.investmentIncome, factor);

    // Total Income (Annual Income + Investment Income)
    const annualTotalIncome = row.annualIncome + row.investmentIncome;
    add(lifetime.income.total, annualTotalIncome, factor);
    add(stats.income.total, annualTotalIncome, factor);


    // --- Expenses ---
    // Living
    add(lifetime.expense.living, row.expenseBreakdown.living, factor);
    add(stats.expense.living, row.expenseBreakdown.living, factor);

    // Housing
    add(lifetime.expense.housing, row.expenseBreakdown.housing, factor);
    add(stats.expense.housing, row.expenseBreakdown.housing, factor);

    // Education
    add(lifetime.expense.education, row.expenseBreakdown.education, factor);
    add(stats.expense.education, row.expenseBreakdown.education, factor);

    // One-time Expense
    add(lifetime.expense.oneTime, row.expenseBreakdown.oneTime, factor);
    add(stats.expense.oneTime, row.expenseBreakdown.oneTime, factor);

    // Total Expense
    add(lifetime.expense.total, row.annualExpenses, factor);
    add(stats.expense.total, row.annualExpenses, factor);
  });

  // Helper to format Amount
  const fmt = (amt: Amount) => `${Math.round(amt.nominal).toLocaleString()}万円 (実質: ${Math.round(amt.real).toLocaleString()}万円)`;

  // Output: Lifetime
  lines.push('■ 全期間合計');
  lines.push(`総収入: ${fmt(lifetime.income.total)}`);
  lines.push(`  - 給与・賞与: ${fmt(lifetime.income.salary)}`);
  if (lifetime.income.bonus.nominal > 0) lines.push(`  - 退職金: ${fmt(lifetime.income.bonus)}`);
  if (lifetime.income.pension.nominal > 0) lines.push(`  - 年金・再雇用: ${fmt(lifetime.income.pension)}`);
  if (lifetime.income.oneTime.nominal > 0) lines.push(`  - 一時収入: ${fmt(lifetime.income.oneTime)}`);
  lines.push(`  - 資産運用益: ${fmt(lifetime.income.investment)}`);

  lines.push('');
  lines.push(`総支出: ${fmt(lifetime.expense.total)}`);
  lines.push(`  - 基本生活費: ${fmt(lifetime.expense.living)}`);
  lines.push(`  - 住居費: ${fmt(lifetime.expense.housing)}`);
  if (lifetime.expense.education.nominal > 0) lines.push(`  - 教育費: ${fmt(lifetime.expense.education)}`);
  if (lifetime.expense.oneTime.nominal > 0) lines.push(`  - 一時支出: ${fmt(lifetime.expense.oneTime)}`);

  lines.push('');
  const netNominal = lifetime.income.total.nominal - lifetime.expense.total.nominal;
  const netReal = lifetime.income.total.real - lifetime.expense.total.real;
  lines.push(`生涯収支: ${netNominal > 0 ? '+' : ''}${Math.round(netNominal).toLocaleString()}万円 (実質: ${netReal > 0 ? '+' : ''}${Math.round(netReal).toLocaleString()}万円)`);

  lines.push('');
  lines.push('--------------------');

  // Output: Working Phase
  lines.push(`■ 現役期間 (〜${input.retirementAge - 1}歳)`);
  lines.push(`収入合計: ${fmt(working.income.total)}`);
  lines.push(`支出合計: ${fmt(working.expense.total)}`);
  const workNet = working.income.total.nominal - working.expense.total.nominal;
  const workNetReal = working.income.total.real - working.expense.total.real;
  lines.push(`期間収支: ${workNet > 0 ? '+' : ''}${Math.round(workNet).toLocaleString()}万円 (実質: ${workNetReal > 0 ? '+' : ''}${Math.round(workNetReal).toLocaleString()}万円)`);

  lines.push('');

  // Output: Retired Phase
  lines.push(`■ 老後期間 (${input.retirementAge}歳〜)`);
  lines.push(`収入合計: ${fmt(retired.income.total)}`);
  lines.push(`支出合計: ${fmt(retired.expense.total)}`);
  const retNet = retired.income.total.nominal - retired.expense.total.nominal;
  const retNetReal = retired.income.total.real - retired.expense.total.real;
  lines.push(`期間収支: ${retNet > 0 ? '+' : ''}${Math.round(retNet).toLocaleString()}万円 (実質: ${retNetReal > 0 ? '+' : ''}${Math.round(retNetReal).toLocaleString()}万円)`);

  return lines.join('\n');
}

function formatEndAge(endAge: number | 'infinite'): string {
    return endAge === 'infinite' ? '永続' : `${endAge}歳まで`;
}

// --- Helper Types & Functions for Breakdown ---

type Amount = { nominal: number; real: number };

type BreakdownStats = {
  income: {
    total: Amount;
    salary: Amount;
    bonus: Amount;
    pension: Amount;
    oneTime: Amount;
    investment: Amount;
  };
  expense: {
    total: Amount;
    living: Amount;
    housing: Amount;
    education: Amount;
    oneTime: Amount;
  };
};

function createBreakdownStats(): BreakdownStats {
  return {
    income: {
      total: { nominal: 0, real: 0 },
      salary: { nominal: 0, real: 0 },
      bonus: { nominal: 0, real: 0 },
      pension: { nominal: 0, real: 0 },
      oneTime: { nominal: 0, real: 0 },
      investment: { nominal: 0, real: 0 },
    },
    expense: {
      total: { nominal: 0, real: 0 },
      living: { nominal: 0, real: 0 },
      housing: { nominal: 0, real: 0 },
      education: { nominal: 0, real: 0 },
      oneTime: { nominal: 0, real: 0 },
    },
  };
}

function add(target: Amount, nominalVal: number, inflationFactor: number) {
  target.nominal += nominalVal;
  target.real += nominalVal / inflationFactor;
}
