export type HousingPlan = {
  cost: number;
  duration: number | 'infinite';
};

export type SimulationInput = {
  currentAge: number;
  currentAssets: number;
  interestRatePct: number;
  monthlyIncome: number;
  monthlyLivingCost: number;
  housingPlans: HousingPlan[];
  childBirthYearsFromNow: number;
  childcareReduction: number;
  educationPattern: '全公立' | '全私立' | '大学のみ私立';
  retirementAge: number;
  retirementBonus: number;
};

export type SimulationYearResult = {
  age: number;
  yearsPassed: number;
  event: string;
  monthlyHousingCost: number;
  annualSavings: number;
  educationCost: number;
  yearEndBalance: number;
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
    childBirthYearsFromNow,
    childcareReduction,
    educationPattern,
    retirementAge,
    retirementBonus
  } = input;

  const interestRate = interestRatePct / 100.0;
  const selectedCosts = EDU_COSTS_MAP[educationPattern] || EDU_COSTS_MAP["全公立"];

  const simulationData: SimulationYearResult[] = [];

  let assets = currentAssets;
  let age = currentAge;
  let yearIndex = 0;

  // Simulation loop until age 100
  while (age <= 100) {
    const yearsPassed = yearIndex;

    // Determine Child Age and Education Cost
    let childAge = -1;
    if (yearsPassed >= childBirthYearsFromNow) {
      childAge = yearsPassed - childBirthYearsFromNow;
    }

    let educationCost = 0;
    if (childAge >= 7 && childAge <= 12) {
      educationCost = selectedCosts.primary;
    } else if (childAge >= 13 && childAge <= 15) {
      educationCost = selectedCosts.middle;
    } else if (childAge >= 16 && childAge <= 18) {
      educationCost = selectedCosts.high;
    } else if (childAge >= 19 && childAge <= 22) {
      educationCost = selectedCosts.uni;
    }

    // Determine Current Housing Cost
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

    // Determine Savings
    const baseMonthlySavings = monthlyIncome - monthlyLivingCost - currentHousingCost;
    let annualSavings = baseMonthlySavings * 12;

    // Childcare Reduction (from birth until 22)
    if (childAge >= 0 && childAge <= 22) {
      annualSavings -= (childcareReduction * 12);
    }

    // Add Retirement Bonus if applicable
    let bonusThisYear = 0;
    let eventNote = "";

    if (age === retirementAge) {
      bonusThisYear = retirementBonus;
      eventNote += `退職金(+${retirementBonus}) `;
    }

    if (childAge === 0) {
      eventNote += "出産 ";
    }

    // Apply Logic
    const balancePreInterest = assets + annualSavings - educationCost + bonusThisYear;

    // Apply Interest
    assets = balancePreInterest * (1 + interestRate);

    simulationData.push({
      age,
      yearsPassed,
      event: eventNote.trim(),
      monthlyHousingCost: currentHousingCost,
      annualSavings,
      educationCost,
      yearEndBalance: Math.floor(assets)
    });

    age += 1;
    yearIndex += 1;
  }

  return simulationData;
}
