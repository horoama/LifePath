import pandas as pd

def calculate_simulation(
    current_age=32,
    current_assets=700,
    interest_rate=0.05,
    monthly_savings=20,
    child_birth_years_from_now=2,
    childcare_reduction=5,
    education_pattern="全公立",
    housing_remaining_years=9,
    rent_increase=7,
    retirement_age=55,
    retirement_bonus=1500
):

    # Education Costs (Man Yen / Year)
    # 7-12 (6 yrs), 13-15 (3 yrs), 16-18 (3 yrs), 19-22 (4 yrs)

    edu_costs_map = {
        "全公立": {
            "primary": 40,   # 7-12
            "middle": 40,    # 13-15
            "high": 40,      # 16-18
            "uni": 100       # 19-22
        },
        "全私立": {
            "primary": 120,
            "middle": 120,
            "high": 120,
            "uni": 150
        },
        "大学のみ私立": {
            "primary": 40,
            "middle": 40,
            "high": 40,
            "uni": 150
        }
    }

    selected_costs = edu_costs_map.get(education_pattern, edu_costs_map["全公立"])

    simulation_data = []

    assets = current_assets
    age = current_age
    year_index = 0

    # Simulation loop until age 100
    while age <= 100:
        years_passed = year_index

        # Determine Child Age and Education Cost
        # Child born in `child_birth_years_from_now` years.
        # If years_passed == child_birth_years_from_now, child is 0 (born).

        child_age = -1
        if years_passed >= child_birth_years_from_now:
            child_age = years_passed - child_birth_years_from_now

        education_cost = 0
        if child_age >= 7 and child_age <= 12:
            education_cost = selected_costs["primary"]
        elif child_age >= 13 and child_age <= 15:
            education_cost = selected_costs["middle"]
        elif child_age >= 16 and child_age <= 18:
            education_cost = selected_costs["high"]
        elif child_age >= 19 and child_age <= 22:
            education_cost = selected_costs["uni"]

        # Determine Savings
        # Base
        annual_savings = monthly_savings * 12

        # Childcare Reduction (from birth until 22)
        if child_age >= 0 and child_age <= 22:
            annual_savings -= (childcare_reduction * 12)

        # Housing Reduction (after remaining years)
        # If years_passed > remaining, rent increases (savings decrease)
        # e.g. remaining = 9. Year 0..8 (9 years) is safe. Year 9 (10th year) -> Phase 3?
        # Prompt: "Phase 3 (社宅終了以降)"
        # "社宅の残り期間（初期値9年）" -> 9 years from now.
        # So after 9 years pass.
        if years_passed >= housing_remaining_years:
             annual_savings -= (rent_increase * 12)

        # Calculate Asset Growth
        # Formula: (Previous Balance + Annual Savings - Education Costs) * (1 + Interest Rate)
        # Note: "Annual Savings" could be negative if deductions are high.

        # Add Retirement Bonus if applicable
        # "At retirement age (55)"
        bonus_this_year = 0
        event_note = ""

        if age == retirement_age:
            bonus_this_year = retirement_bonus
            event_note += f"退職金(+{retirement_bonus}) "

        if child_age == 0:
            event_note += "出産 "

        # Apply Logic
        # Balance before interest
        balance_pre_interest = assets + annual_savings - education_cost + bonus_this_year

        # Apply Interest
        assets = balance_pre_interest * (1 + interest_rate)

        simulation_data.append({
            "年齢": age,
            "経過年数": years_passed,
            "イベント": event_note.strip(),
            "年間積立額": annual_savings,
            "教育費": education_cost,
            "年末残高": int(assets) # Convert to int for cleaner display
        })

        age += 1
        year_index += 1

    return pd.DataFrame(simulation_data)
