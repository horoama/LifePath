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
  lines.push(`基本生活費: 月${input.monthlyLivingCost.toLocaleString()}万円`);
  if (input.inflationRatePct > 0) {
    lines.push(`インフレ率: 年${input.inflationRatePct}%`);
  }

  // Housing
  const currentHousing = input.housingPlans[0];
  if (currentHousing) {
     lines.push(`現在の住居費: 月${currentHousing.cost.toLocaleString()}万円 (${formatDuration(currentHousing.duration)})`);
     if (input.housingPlans.length > 1) {
        lines.push(`※ 以降、${input.housingPlans.length - 1}回の住居変更プランあり`);
     }
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

  return lines.join('\n');
}

function formatDuration(duration: number | 'infinite'): string {
    return duration === 'infinite' ? '永続' : `${duration}年間`;
}
