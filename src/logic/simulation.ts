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
  inflationRatePct: number; // New field for inflation rate
  deathAge: number;

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
    inflationRatePct = 0, // Default to 0 if undefined
    deathAge = 100,
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
  const inflationRate = inflationRatePct / 100.0;

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

    const eventNotes: string[] = [];

    // --- Income Calculation (Nominal) ---
    // Income is NOT inflated based on user requirements (only expenses)
    let mainJobIncome = 0;
    let mainJobBonus = 0;
    let postRetirementIncome = 0;
    let oneTimeIncome = 0;

    // 1. Main Job
    if (age < retirementAge) {
      mainJobIncome += monthlyIncome * 12;
    }
    if (age === retirementAge) {
      mainJobBonus += retirementBonus;
      eventNotes.push(`退職金(+${retirementBonus})`);
    }

    // 2. Post-Retirement Jobs
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
    // User requested inflation on: Housing, Education, Living Cost

    let basicLivingExpense = 0;
    let housingExpense = 0;
    let childExpense = 0;
    let oneTimeExpense = 0;

    // 1. Basic Living Cost (Inflated)
    // nominal = base * inflationFactor
    basicLivingExpense += (monthlyLivingCost * 12) * inflationFactor;

    // 2. Housing Cost (Inflated)
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
    // Apply inflation to housing cost
    const currentHousingCostNominal = currentHousingCostBase * inflationFactor;
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

    // 4. One-time Expenses (Not Inflated per requirements/assumption)
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
    const investmentIncomeNominal = balancePreInterest * interestRate;
    totalInvestmentIncome += investmentIncomeNominal;

    assets = balancePreInterest + investmentIncomeNominal;

    // --- Convert to Real Values (Present Value) for Display ---
    // Rule: Real Value = Nominal Value / Inflation Factor
    // This allows the user to see the simulation in "today's money"

    simulationData.push({
      age,
      yearsPassed,
      event: eventNotes.join(', '),
      monthlyHousingCost: currentHousingCostNominal / inflationFactor, // Should match input cost
      annualIncome: annualIncomeNominal / inflationFactor,
      annualExpenses: annualExpensesNominal / inflationFactor,
      annualSavings: netSavingsNominal / inflationFactor,
      yearEndBalance: Math.floor(assets / inflationFactor),
      investmentIncome: Math.floor(investmentIncomeNominal / inflationFactor),
      totalPrincipal: Math.floor(totalPrincipal / inflationFactor),
      totalInvestmentIncome: Math.floor(totalInvestmentIncome / inflationFactor),
      incomeBreakdown: {
        salary: mainJobIncome / inflationFactor,
        bonus: mainJobBonus / inflationFactor,
        pension: postRetirementIncome / inflationFactor,
        oneTime: oneTimeIncome / inflationFactor
      },
      expenseBreakdown: {
        living: basicLivingExpense / inflationFactor,
        housing: housingExpense / inflationFactor,
        education: childExpense / inflationFactor,
        oneTime: oneTimeExpense / inflationFactor
      }
    });

    age += 1;
    yearIndex += 1;
  }

  return simulationData;
}
