from simulation import calculate_simulation

def test_simulation():
    df = calculate_simulation(
        current_age=32,
        current_assets=700,
        interest_rate=0.05,
        monthly_savings=20, # 240/yr
        child_birth_years_from_now=2,
        childcare_reduction=5, # 60/yr
        education_pattern="大学のみ私立", # 7-18: 40, 19-22: 150
        housing_remaining_years=9,
        rent_increase=7, # 84/yr
        retirement_age=55,
        retirement_bonus=1500
    )

    # 1. Start (Year 0, Age 32)
    # Savings: 240. Edu: 0.
    # Balance: (700 + 240) * 1.05 = 987.
    row_0 = df.iloc[0]
    print(f"Age {row_0['年齢']}: Savings={row_0['年間積立額']}, Edu={row_0['教育費']}, Balance={row_0['年末残高']}")

    # 2. Child Born (Year 2, Age 34)
    # Savings: 240 - 60 = 180.
    row_2 = df.iloc[2]
    print(f"Age {row_2['年齢']} (Event:{row_2['イベント']}): Savings={row_2['年間積立額']}, Edu={row_2['教育費']}")

    # 3. Housing ends (Year 9, Age 41)
    # Child is 7 (Edu starts: 40).
    # Savings: 240 - 60 (Child) - 84 (Rent) = 96.
    row_9 = df.iloc[9]
    print(f"Age {row_9['年齢']}: Savings={row_9['年間積立額']}, Edu={row_9['教育費']}")

    # 4. Retirement (Age 55)
    # Child is 55 - 32 - 2 = 21 (Uni: 150).
    # Savings: 240 - 60 - 84 = 96.
    # Bonus: 1500.
    row_retirement = df[df['年齢'] == 55].iloc[0]
    print(f"Age {row_retirement['年齢']} (Event:{row_retirement['イベント']}): Savings={row_retirement['年間積立額']}, Edu={row_retirement['教育費']}, Balance={row_retirement['年末残高']}")

    # 5. Child > 22 (Age 57 -> Child 23)
    # Childcare reduction (60) stops.
    # Savings: 240 - 84 = 156.
    row_57 = df[df['年齢'] == 57].iloc[0]
    print(f"Age {row_57['年齢']}: Savings={row_57['年間積立額']}")

if __name__ == "__main__":
    test_simulation()
