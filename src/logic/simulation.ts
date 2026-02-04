export type HousingPlan = {
  cost: number;
  duration: number | 'infinite';
};

export type ExpensePlan = {
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
  inflationRatePct: number;
  incomeIncreaseRatePct: number; // New field for income growth
  deathAge: number;

  // Main Job
  monthlyIncome: number;
  annualBonus: number;
  retirementAge: number;
  retirementBonus: number;

  // Post-Retirement Jobs
  postRetirementJobs: PostRetirementJob[];

  // Expenses
  livingCostPlans: ExpensePlan[];
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
  yearEndBalanceReal: number; // New field for Real (Inflation-Adjusted) Value
  investmentIncome: number;
  totalPrincipal: number;
  totalInvestmentIncome: number;
  incomeBreakdown: {
    salary: number;
    bonus: number;
    pension: number;
    oneTime: number;
  };
  expenseBreakdown: {
    living: number;
    housing: number;
    education: number;
    oneTime: number;
  };
};

export const EDUCATION_PATTERNS = ['全公立', '全私立', '大学のみ私立'] as const;

export const EDU_COSTS_MAP = {
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
    inflationRatePct = 0, // Default to 0 if undefined
    incomeIncreaseRatePct = 0, // Default to 0 if undefined
    deathAge = 100,
    monthlyIncome,
    annualBonus = 0,
    retirementAge,
    retirementBonus,
    postRetirementJobs,
    livingCostPlans,
    housingPlans,
    children,
    oneTimeEvents
  } = input;

  const interestRate = interestRatePct / 100.0;
  const inflationRate = inflationRatePct / 100.0;
  const incomeIncreaseRate = incomeIncreaseRatePct / 100.0;

  const simulationData: SimulationYearResult[] = [];

  let assets = currentAssets;
  let totalPrincipal = currentAssets;
  let totalInvestmentIncome = 0;

  let age = currentAge;
  let yearIndex = 0;

  // Simulation loop until deathAge
  while (age <= deathAge) {
    const yearsPassed = yearIndex;
    // Calculate inflation factor for the current year: (1 + r)^n
    const inflationFactor = Math.pow(1 + inflationRate, yearsPassed);

    // Calculate income growth factor (for nominal calculation)
    const incomeGrowthFactor = Math.pow(1 + incomeIncreaseRate, yearsPassed);

    const eventNotes: string[] = [];

    // --- Income Calculation (Nominal with Growth) ---
    // Apply income growth only to Main Job Income and Bonus
    let mainJobIncome = 0;
    let mainJobBonus = 0;
    let postRetirementIncome = 0;
    let oneTimeIncome = 0;

    // 1. Main Job
    if (age < retirementAge) {
      // Monthly income increases annually by growth rate
      mainJobIncome += (monthlyIncome * 12) * incomeGrowthFactor;
      // Annual bonus (fixed nominal as per requirements)
      mainJobIncome += annualBonus;
    }
    if (age === retirementAge) {
      // Retirement bonus is fixed nominal (not affected by income growth rate per user request)
      mainJobBonus += retirementBonus;
      eventNotes.push(`退職金(+${Math.floor(mainJobBonus)})`);
    }

    // 2. Post-Retirement Jobs (Assume fixed nominal for now unless specified)
    postRetirementJobs.forEach(job => {
      if (age >= job.startAge && age < job.endAge) {
        postRetirementIncome += job.monthlyIncome * 12;
      }
      if (age === job.endAge) {
        postRetirementIncome += job.retirementBonus;
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

    const annualIncomeNominal = mainJobIncome + mainJobBonus + postRetirementIncome + oneTimeIncome;

    // --- Expense Calculation (Nominal with Inflation) ---
    // Inflation applies to: Living Cost, Education
    // NOT Housing (fixed contract assumption)

    let basicLivingExpense = 0;
    let housingExpense = 0;
    let childExpense = 0;
    let oneTimeExpense = 0;

    // 1. Basic Living Cost (Inflated)
    // nominal = base * inflationFactor
    let currentLivingCostBase = 0;
    let livingCumulativeYears = 0;
    let livingPlanFound = false;

    for (const plan of livingCostPlans) {
      const { duration, cost } = plan;
      if (duration === 'infinite') {
        currentLivingCostBase = cost;
        livingPlanFound = true;
        break;
      }
      const dur = duration as number;
      if (yearsPassed < livingCumulativeYears + dur) {
        currentLivingCostBase = cost;
        livingPlanFound = true;
        break;
      }
      livingCumulativeYears += dur;
    }
    if (!livingPlanFound && livingCostPlans.length > 0) {
        currentLivingCostBase = livingCostPlans[livingCostPlans.length - 1].cost;
    }

    basicLivingExpense += (currentLivingCostBase * 12) * inflationFactor;

    // 2. Housing Cost (NOT Inflated - Fixed Nominal)
    let currentHousingCostBase = 0;
    let cumulativeYears = 0;
    let planFound = false;

    for (const plan of housingPlans) {
      const { duration, cost } = plan;
      if (duration === 'infinite') {
        currentHousingCostBase = cost;
        planFound = true;
        break;
      }
      const dur = duration as number;
      if (yearsPassed < cumulativeYears + dur) {
        currentHousingCostBase = cost;
        planFound = true;
        break;
      }
      cumulativeYears += dur;
    }
    if (!planFound && housingPlans.length > 0) {
        currentHousingCostBase = housingPlans[housingPlans.length - 1].cost;
    }
    // No inflation factor applied to housing
    const currentHousingCostNominal = currentHousingCostBase;
    housingExpense += currentHousingCostNominal * 12;

    // 3. Children Expenses (Inflated)
    children.forEach((child, index) => {
      const childAge = yearsPassed - child.birthYearOffset;
      const costs = EDU_COSTS_MAP[child.educationPattern] || EDU_COSTS_MAP["全公立"];

      if (childAge === 0) {
        eventNotes.push(`第${index + 1}子誕生`);
      }

      // Childcare (0-22)
      if (childAge >= 0 && childAge <= 22) {
        childExpense += (child.monthlyChildcareCost * 12) * inflationFactor;
      }

      // Education
      let eduCostBase = 0;
      if (childAge >= 7 && childAge <= 12) eduCostBase = costs.primary;
      else if (childAge >= 13 && childAge <= 15) eduCostBase = costs.middle;
      else if (childAge >= 16 && childAge <= 18) eduCostBase = costs.high;
      else if (childAge >= 19 && childAge <= 22) eduCostBase = costs.uni;

      childExpense += eduCostBase * inflationFactor;
    });

    // 4. One-time Expenses (Not Inflated)
    oneTimeEvents.forEach(evt => {
      if (evt.type === 'expense' && evt.age === age) {
        oneTimeExpense += evt.amount;
        eventNotes.push(`${evt.name}(-${evt.amount})`);
      }
    });

    const annualExpensesNominal = basicLivingExpense + housingExpense + childExpense + oneTimeExpense;

    // --- Balance Update (Nominal) ---
    const netSavingsNominal = annualIncomeNominal - annualExpensesNominal;

    // Principal update (nominal)
    totalPrincipal += netSavingsNominal;

    const balancePreInterest = assets + netSavingsNominal;
    // Investment income is 0 if balance is negative (no interest on debt in this simplified model)
    const investmentIncomeNominal = balancePreInterest > 0 ? balancePreInterest * interestRate : 0;
    totalInvestmentIncome += investmentIncomeNominal;

    assets = balancePreInterest + investmentIncomeNominal;

    // --- Output (Nominal Values) ---
    // We return Nominal values for the main interface, but also include
    // Real (Inflation-Adjusted) Balance for reference.

    simulationData.push({
      age,
      yearsPassed,
      event: eventNotes.join(', '),
      monthlyHousingCost: currentHousingCostNominal, // Nominal (Face Value)
      annualIncome: annualIncomeNominal, // Nominal
      annualExpenses: annualExpensesNominal, // Nominal
      annualSavings: netSavingsNominal, // Nominal
      yearEndBalance: Math.floor(assets), // Nominal
      yearEndBalanceReal: Math.floor(assets / inflationFactor), // Real (Reference)
      investmentIncome: Math.floor(investmentIncomeNominal), // Nominal
      totalPrincipal: Math.floor(totalPrincipal), // Nominal
      totalInvestmentIncome: Math.floor(totalInvestmentIncome), // Nominal
      incomeBreakdown: {
        salary: mainJobIncome, // Nominal
        bonus: mainJobBonus, // Nominal
        pension: postRetirementIncome, // Nominal
        oneTime: oneTimeIncome // Nominal
      },
      expenseBreakdown: {
        living: basicLivingExpense, // Nominal
        housing: housingExpense, // Nominal
        education: childExpense, // Nominal
        oneTime: oneTimeExpense // Nominal
      }
    });

    age += 1;
    yearIndex += 1;
  }

  return simulationData;
}
