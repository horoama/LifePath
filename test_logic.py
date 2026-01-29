from simulation import calculate_simulation

def test_simulation():
    # Housing Plan Test
    # 0-8 years (9 years): Cost 8.
    # 9-18 years (10 years): Cost 15.
    # 19+ years: Cost 10 (Permanent).

    housing_plans = [
        {'cost': 8, 'duration': 9},
        {'cost': 15, 'duration': 10},
        {'cost': 10, 'duration': 'infinite'}
    ]

    df = calculate_simulation(
        current_age=32,
        current_assets=700,
        interest_rate=0.05,
        monthly_income=60,
        monthly_living_cost=30,
        housing_plans=housing_plans,
        child_birth_years_from_now=2,
        childcare_reduction=5,
        education_pattern="全公立",
        retirement_age=55,
        retirement_bonus=1500
    )

    # 1. Start (Year 0, Age 32)
    # Housing: 8.
    # Base Savings: 60 - 30 - 8 = 22.
    # Child: Not born.
    # Annual: 22 * 12 = 264.
    row_0 = df.iloc[0]
    print(f"Age {row_0['年齢']}: Housing={row_0['住居費(月)']}, Savings={row_0['年間積立額']}")

    # 2. Year 8 (Age 40) -> Last year of Plan 1
    # Housing: 8.
    row_8 = df.iloc[8]
    print(f"Age {row_8['年齢']}: Housing={row_8['住居費(月)']}")

    # 3. Year 9 (Age 41) -> First year of Plan 2
    # Housing: 15.
    # Base Savings: 60 - 30 - 15 = 15.
    # Child (born Year 2) is 7 -> Edu 40. Childcare deduction 5*12=60.
    # Annual: 15*12 - 60 = 180 - 60 = 120.
    row_9 = df.iloc[9]
    print(f"Age {row_9['年齢']}: Housing={row_9['住居費(月)']}, Savings={row_9['年間積立額']}")

    # 4. Year 18 (Age 50) -> Last year of Plan 2
    # Housing: 15.
    row_18 = df.iloc[18]
    print(f"Age {row_18['年齢']}: Housing={row_18['住居費(月)']}")

    # 5. Year 19 (Age 51) -> Plan 3 (Infinite) starts
    # Housing: 10.
    row_19 = df.iloc[19]
    print(f"Age {row_19['年齢']}: Housing={row_19['住居費(月)']}")

    # 6. Year 50 (Age 82) -> Still Plan 3
    # Housing: 10.
    row_50 = df.iloc[50]
    print(f"Age {row_50['年齢']}: Housing={row_50['住居費(月)']}")


if __name__ == "__main__":
    test_simulation()
