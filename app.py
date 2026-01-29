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
monthly_income = st.sidebar.number_input("手取り月収 (世帯合計・万円)", value=60, step=1)
monthly_living_cost = st.sidebar.number_input("基本生活費 (住宅費・教育費除く・万円)", value=30, step=1)

# 3. Housing Settings (Dynamic List)
st.sidebar.subheader("住居設定")
st.sidebar.markdown("これからの住居プランを順に追加してください。")

# Initialize session state for housing plans if not exists
if "housing_plans_list" not in st.session_state:
    st.session_state.housing_plans_list = [{"cost": 8, "duration": 9}]

def add_plan():
    st.session_state.housing_plans_list.append({"cost": 10, "duration": 10})

def remove_plan(index):
    st.session_state.housing_plans_list.pop(index)

# Display and edit plans
plans_to_pass = []
for i, plan in enumerate(st.session_state.housing_plans_list):
    with st.sidebar.expander(f"住居プラン {i+1}", expanded=True):
        cost = st.number_input(f"住宅費 (万円) #{i+1}", value=plan["cost"], key=f"cost_{i}")

        # Duration selection: Number or Infinite
        is_infinite = st.checkbox("永住 (以降ずっと)", value=(plan["duration"] == "infinite"), key=f"inf_{i}")

        if is_infinite:
            duration = "infinite"
            st.info("このプランが最後の期間となります。")
        else:
            # Handle existing 'infinite' value in number input gracefully
            default_duration = plan["duration"] if isinstance(plan["duration"], int) else 10
            duration = st.number_input(f"期間 (年) #{i+1}", value=default_duration, min_value=1, key=f"dur_{i}")

        # Update session state (implicit via key, but let's be explicit for safety in lists)
        st.session_state.housing_plans_list[i]["cost"] = cost
        st.session_state.housing_plans_list[i]["duration"] = duration

        plans_to_pass.append({"cost": cost, "duration": duration})

        if len(st.session_state.housing_plans_list) > 1:
            if st.button(f"削除 #{i+1}", key=f"del_{i}"):
                remove_plan(i)
                st.rerun()

if st.sidebar.button("住居プランを追加"):
    add_plan()
    st.rerun()


# 4. Life Events
st.sidebar.subheader("ライフイベント")
child_birth_years = st.sidebar.number_input("子供が生まれる時期 (何年後)", value=2, step=1)
childcare_reduction = st.sidebar.number_input("育児による積立減額 (月額・万円)", value=5, step=1)
education_pattern = st.sidebar.selectbox(
    "教育費パターン",
    ["全公立", "全私立", "大学のみ私立"],
    index=0
)

# 5. Exit Strategy
st.sidebar.subheader("出口戦略")
retirement_age = st.sidebar.number_input("退職年齢", value=55, step=1)
retirement_bonus = st.sidebar.number_input("退職金 (万円)", value=1500, step=100)


# --- Calculation ---
df = calculate_simulation(
    current_age=current_age,
    current_assets=current_assets,
    interest_rate=interest_rate,
    monthly_income=monthly_income,
    monthly_living_cost=monthly_living_cost,
    housing_plans=plans_to_pass,
    child_birth_years_from_now=child_birth_years,
    childcare_reduction=childcare_reduction,
    education_pattern=education_pattern,
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

st.line_chart(chart_df, x="年齢", y=["年末残高", "目標額"], color=["#1f77b4", "#ff7f0e"])

# --- Detailed Data ---
st.subheader("詳細データ")
st.dataframe(df.set_index("年齢"))
