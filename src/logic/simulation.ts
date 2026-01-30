export type HousingPlan = {
  cost: number;
  duration: number | 'infinite';
};

export type PostRetirementJob = {
  startAge: number;
  endAge: number;
  monthlyIncome: number;
  retirementBonus: number;
};

export type Child = {
  birthYearOffset: number; // Years from now (negative for already born)
  educationPattern: '全公立' | '全私立' | '大学のみ私立';
  monthlyChildcareCost: number; // Until age 22
};

export type OneTimeEvent = {
  age: number;
  amount: number;
  type: 'income' | 'expense';
  name: string;
};

export type SimulationInput = {
  currentAge: number;
  currentAssets: number;
  interestRatePct: number;

  // Main Job
  monthlyIncome: number;
  retirementAge: number;
  retirementBonus: number;

  // Post-Retirement Jobs
  postRetirementJobs: PostRetirementJob[];

  // Expenses
  monthlyLivingCost: number;
  housingPlans: HousingPlan[];

  // Family
  children: Child[];

  // One-time Events
  oneTimeEvents: OneTimeEvent[];
};

export type SimulationYearResult = {
  age: number;
  yearsPassed: number;
  event: string;
  monthlyHousingCost: number;
  annualIncome: number; // Total income including bonuses
  annualExpenses: number; // Total expenses including housing, edu, events
  annualSavings: number; // Net
  yearEndBalance: number;
  investmentIncome: number;
  totalPrincipal: number;
  totalInvestmentIncome: number;
};

export const EDUCATION_PATTERNS = ['全公立', '全私立', '大学のみ私立'] as const;

const EDU_COSTS_MAP = {
  "全公立": {
    primary: 40,   // 7-12
    middle: 40,    // 13-15
    high: 40,      // 16-18
    uni: 100       // 19-22
  },
  "全私立": {
    primary: 120,
    middle: 120,
    high: 120,
    uni: 150
  },
  "大学のみ私立": {
    primary: 40,
    middle: 40,
    high: 40,
    uni: 150
  }
};

export function calculateSimulation(input: SimulationInput): SimulationYearResult[] {
  const {
    currentAge,
    currentAssets,
    interestRatePct,
    monthlyIncome,
    retirementAge,
    retirementBonus,
    postRetirementJobs,
    monthlyLivingCost,
    housingPlans,
    children,
    oneTimeEvents
  } = input;

  const interestRate = interestRatePct / 100.0;
  const simulationData: SimulationYearResult[] = [];

  let assets = currentAssets;
  let totalPrincipal = currentAssets;
  let totalInvestmentIncome = 0;

  let age = currentAge;
  let yearIndex = 0;

  // Simulation loop until age 100
  while (age <= 100) {
    const yearsPassed = yearIndex;
    const eventNotes: string[] = [];

    // --- Income Calculation ---
    let annualIncome = 0;
    let incomeFromJobs = 0;
    let bonuses = 0;
    let oneTimeIncome = 0;

    // 1. Main Job
    if (age < retirementAge) {
      incomeFromJobs += monthlyIncome * 12;
    }
    if (age === retirementAge) {
      bonuses += retirementBonus;
      eventNotes.push(`退職金(+${retirementBonus})`);
    }

    // 2. Post-Retirement Jobs
    postRetirementJobs.forEach(job => {
      if (age >= job.startAge && age < job.endAge) {
        incomeFromJobs += job.monthlyIncome * 12;
      }
      if (age === job.endAge) {
        bonuses += job.retirementBonus;
        eventNotes.push(`再雇用退職金(+${job.retirementBonus})`);
      }
    });

    // 3. One-time Income
    oneTimeEvents.forEach(evt => {
      if (evt.type === 'income' && evt.age === age) {
        oneTimeIncome += evt.amount;
        eventNotes.push(`${evt.name}(+${evt.amount})`);
      }
    });

    annualIncome = incomeFromJobs + bonuses + oneTimeIncome;

    // --- Expense Calculation ---
    let annualExpenses = 0;

    // 1. Basic Living Cost
    annualExpenses += monthlyLivingCost * 12;

    // 2. Housing Cost
    let currentHousingCost = 0;
    let cumulativeYears = 0;
    let planFound = false;

    for (const plan of housingPlans) {
      const { duration, cost } = plan;
      if (duration === 'infinite') {
        currentHousingCost = cost;
        planFound = true;
        break;
      }
      const dur = duration as number;
      if (yearsPassed < cumulativeYears + dur) {
        currentHousingCost = cost;
        planFound = true;
        break;
      }
      cumulativeYears += dur;
    }
    if (!planFound && housingPlans.length > 0) {
      currentHousingCost = housingPlans[housingPlans.length - 1].cost;
    }
    annualExpenses += currentHousingCost * 12;

    // 3. Children Expenses (Education + Childcare)
    let totalChildExpenses = 0;
    children.forEach((child, index) => {
      const childAge = yearsPassed - child.birthYearOffset;
      const costs = EDU_COSTS_MAP[child.educationPattern] || EDU_COSTS_MAP["全公立"];

      if (childAge === 0) {
        eventNotes.push(`第${index + 1}子誕生`);
      }

      // Childcare (0-22)
      if (childAge >= 0 && childAge <= 22) {
        totalChildExpenses += child.monthlyChildcareCost * 12;
      }

      // Education
      let eduCost = 0;
      if (childAge >= 7 && childAge <= 12) eduCost = costs.primary;
      else if (childAge >= 13 && childAge <= 15) eduCost = costs.middle;
      else if (childAge >= 16 && childAge <= 18) eduCost = costs.high;
      else if (childAge >= 19 && childAge <= 22) eduCost = costs.uni;

      totalChildExpenses += eduCost;
    });
    annualExpenses += totalChildExpenses;

    // 4. One-time Expenses
    oneTimeEvents.forEach(evt => {
      if (evt.type === 'expense' && evt.age === age) {
        annualExpenses += evt.amount;
        eventNotes.push(`${evt.name}(-${evt.amount})`);
      }
    });

    // --- Balance Update ---
    const netSavings = annualIncome - annualExpenses;
    totalPrincipal += netSavings;

    const balancePreInterest = assets + netSavings;
    const investmentIncome = balancePreInterest * interestRate;
    totalInvestmentIncome += investmentIncome;
    assets = balancePreInterest + investmentIncome;

    simulationData.push({
      age,
      yearsPassed,
      event: eventNotes.join(', '),
      monthlyHousingCost: currentHousingCost,
      annualIncome,
      annualExpenses,
      annualSavings: netSavings,
      yearEndBalance: Math.floor(assets),
      investmentIncome: Math.floor(investmentIncome),
      totalPrincipal: Math.floor(totalPrincipal),
      totalInvestmentIncome: Math.floor(totalInvestmentIncome)
    });

    age += 1;
    yearIndex += 1;
  }

  return simulationData;
}
