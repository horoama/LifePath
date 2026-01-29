export type HousingPlan = {
  cost: number;
  duration: number | 'infinite';
};

export type Child = {
  birthYearOffset: number;
  educationPattern: '全公立' | '全私立' | '大学のみ私立';
};

export type PostRetirementJob = {
  startAge: number;
  endAge: number;
  monthlyIncome: number;
};

export type SimulationInput = {
  currentAge: number;
  currentAssets: number;
  interestRatePct: number;
  monthlyIncome: number;
  monthlyLivingCost: number;
  housingPlans: HousingPlan[];
  children: Child[];
  childcareReduction: number; // reduction per child
  retirementAge: number;
  retirementBonus: number;
  postRetirementJobs: PostRetirementJob[];
};

export type SimulationYearResult = {
  age: number;
  yearsPassed: number;
  event: string;
  monthlyHousingCost: number;
  annualSavings: number;
  educationCost: number;
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
    monthlyLivingCost,
    housingPlans,
    children,
    childcareReduction,
    retirementAge,
    retirementBonus,
    postRetirementJobs
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

    // --- 1. Calculate Education Cost and Childcare Reduction ---
    let totalEducationCost = 0;
    let totalChildcareReduction = 0;
    let birthEvent = false;

    for (const child of children) {
      let childAge = -1;
      if (yearsPassed >= child.birthYearOffset) {
        childAge = yearsPassed - child.birthYearOffset;
      }

      if (childAge === 0) {
        birthEvent = true;
      }

      // Education Cost
      const costs = EDU_COSTS_MAP[child.educationPattern] || EDU_COSTS_MAP["全公立"];
      if (childAge >= 7 && childAge <= 12) {
        totalEducationCost += costs.primary;
      } else if (childAge >= 13 && childAge <= 15) {
        totalEducationCost += costs.middle;
      } else if (childAge >= 16 && childAge <= 18) {
        totalEducationCost += costs.high;
      } else if (childAge >= 19 && childAge <= 22) {
        totalEducationCost += costs.uni;
      }

      // Childcare Reduction (from birth until 22)
      if (childAge >= 0 && childAge <= 22) {
        totalChildcareReduction += (childcareReduction * 12);
      }
    }

    // --- 2. Calculate Housing Cost ---
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

      // duration is number here
      const dur = duration as number;
      if (yearsPassed < cumulativeYears + dur) {
        currentHousingCost = cost;
        planFound = true;
        break;
      }

      cumulativeYears += dur;
    }

    if (!planFound && housingPlans.length > 0) {
      // Fallback to last plan's cost
      currentHousingCost = housingPlans[housingPlans.length - 1].cost;
    }

    // --- 3. Calculate Income (Active vs Retired/Jobs) ---
    let annualIncome = 0;
    if (age < retirementAge) {
      // Active Income
      annualIncome = monthlyIncome * 12;
    } else {
      // Post-Retirement Jobs
      let jobIncomeMonthly = 0;
      for (const job of postRetirementJobs) {
        if (age >= job.startAge && age <= job.endAge) {
          jobIncomeMonthly += job.monthlyIncome;
        }
      }
      annualIncome = jobIncomeMonthly * 12;
    }

    // --- 4. Calculate Savings ---
    // Savings = Income - Living Cost - Housing Cost - Childcare Reduction
    const annualLivingCost = monthlyLivingCost * 12;
    const annualHousingCost = currentHousingCost * 12;

    // Note: Childcare reduction reduces the amount we can save (it's a cost increase/saving decrease essentially)
    // The previous logic was: savings -= reduction. Yes, "reduction" means "reduction in ability to save".
    let annualSavings = annualIncome - annualLivingCost - annualHousingCost - totalChildcareReduction;

    // --- 5. Handle Retirement Bonus and Events ---
    let bonusThisYear = 0;
    let eventNote = "";

    if (age === retirementAge) {
      bonusThisYear = retirementBonus;
      eventNote += `退職金(+${retirementBonus}) `;
    }

    if (birthEvent) {
      eventNote += "出産 ";
    }

    // --- 6. Update Assets ---
    // Net Contribution = Savings - Education Cost + Bonus
    const netContribution = annualSavings - totalEducationCost + bonusThisYear;
    totalPrincipal += netContribution;

    // Balance before interest for this year's gain calculation
    const balancePreInterest = assets + netContribution;

    // Calculate Investment Income for this year
    const investmentIncome = balancePreInterest * interestRate;
    totalInvestmentIncome += investmentIncome;

    // Update Total Assets
    assets = balancePreInterest + investmentIncome;

    simulationData.push({
      age,
      yearsPassed,
      event: eventNote.trim(),
      monthlyHousingCost: currentHousingCost,
      annualSavings,
      educationCost: totalEducationCost,
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
