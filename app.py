import streamlit as st
import pandas as pd
from simulation import calculate_simulation

st.set_page_config(page_title="Side FIRE Simulator", layout="wide")

st.title("家族構成と住居変動を考慮したサイドFIREシミュレーター")

# --- Sidebar Inputs ---
st.sidebar.header("入力パラメータ")

# 1. Basic Info
st.sidebar.subheader("基本情報")
current_age = st.sidebar.number_input("現在の年齢", value=32, step=1)
current_assets = st.sidebar.number_input("現在の総資産 (万円)", value=700, step=10)
interest_rate_pct = st.sidebar.number_input("想定年利 (%)", value=5.0, step=0.1)
interest_rate = interest_rate_pct / 100.0

# 2. Income/Expense
st.sidebar.subheader("収支設定")
monthly_savings = st.sidebar.number_input("基本の月間積立額 (万円)", value=20, step=1)

# 3. Life Events
st.sidebar.subheader("ライフイベント")
child_birth_years = st.sidebar.number_input("子供が生まれる時期 (何年後)", value=2, step=1)
childcare_reduction = st.sidebar.number_input("育児による積立減額 (月額・万円)", value=5, step=1)
education_pattern = st.sidebar.selectbox(
    "教育費パターン",
    ["全公立", "全私立", "大学のみ私立"],
    index=0
)

# 4. Housing
st.sidebar.subheader("住居設定")
housing_remaining = st.sidebar.number_input("社宅の残り期間 (年)", value=9, step=1)
rent_increase = st.sidebar.number_input("社宅終了後の家賃上昇分 (月額・万円)", value=7, step=1)

# 5. Exit Strategy
st.sidebar.subheader("出口戦略")
retirement_age = st.sidebar.number_input("退職年齢", value=55, step=1)
retirement_bonus = st.sidebar.number_input("退職金 (万円)", value=1500, step=100)


# --- Calculation ---
df = calculate_simulation(
    current_age=current_age,
    current_assets=current_assets,
    interest_rate=interest_rate,
    monthly_savings=monthly_savings,
    child_birth_years_from_now=child_birth_years,
    childcare_reduction=childcare_reduction,
    education_pattern=education_pattern,
    housing_remaining_years=housing_remaining,
    rent_increase=rent_increase,
    retirement_age=retirement_age,
    retirement_bonus=retirement_bonus
)

# --- Summary ---
target_amount = 5000

# Find age reaching target
reached_target_rows = df[df["年末残高"] >= target_amount]
if not reached_target_rows.empty:
    target_age = reached_target_rows.iloc[0]["年齢"]
    target_text = f"{target_age}歳"
else:
    target_text = "到達せず"

# Asset at Retirement Age
asset_at_retirement_rows = df[df["年齢"] == retirement_age]
if not asset_at_retirement_rows.empty:
    asset_at_retirement = asset_at_retirement_rows.iloc[0]["年末残高"]
    retirement_text = f"{asset_at_retirement:,} 万円"
else:
    retirement_text = "データなし"

col1, col2 = st.columns(2)
with col1:
    st.metric("目標5000万円到達年齢", target_text)
with col2:
    st.metric(f"{retirement_age}歳時点の資産額", retirement_text)

# --- Main Graph ---
st.subheader("資産残高推移")

# Prepare data for chart: Asset Line + Target Line
chart_df = df[["年齢", "年末残高"]].copy()
chart_df["目標額"] = target_amount

# Create a line chart using Altair for better control (or st.line_chart)
# Using st.line_chart for simplicity with the new column
st.line_chart(chart_df, x="年齢", y=["年末残高", "目標額"], color=["#1f77b4", "#ff7f0e"])

# --- Detailed Data ---
st.subheader("詳細データ")
st.dataframe(df.set_index("年齢"))
