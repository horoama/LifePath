from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Visit page
        try:
            page.goto("http://localhost:3000")
            page.wait_for_selector("h1", timeout=10000) # Wait for app to load
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        print("Page loaded")

        # 2. Check Housing Plan
        # Find the housing section.
        # Check if the last plan has text "永住 (以降ずっと)" and duration input is hidden.
        # We can look for the text.
        try:
            permanent_label = page.get_by_text("永住 (以降ずっと)")
            expect(permanent_label).to_be_visible()
            print("Housing plan permanent label visible")
        except Exception as e:
            print(f"Housing plan check failed: {e}")

        # 3. Check Input Behavior
        # Find "手取り月収 (万円)" input.
        try:
            # The label is "手取り月収 (万円)", followed by an input.
            income_input = page.get_by_label("手取り月収 (万円)")
            income_input.fill("45") # Ensure initial value

            # Clear it
            income_input.fill("")
            # Blur
            income_input.blur()

            # Expect value to be 0 or "0"
            expect(income_input).to_have_value("0")
            print("Input behavior check passed: Cleared input became 0 on blur")

            # Restore value
            income_input.fill("45")
            income_input.blur()
        except Exception as e:
            print(f"Input behavior check failed: {e}")

        # 4. Check Charts existence
        try:
            expect(page.get_by_text("総資産推移")).to_be_visible()
            expect(page.get_by_text("年間収入内訳")).to_be_visible()
            expect(page.get_by_text("年間支出内訳")).to_be_visible()
            print("Chart titles visible")
        except Exception as e:
            print(f"Chart titles check failed: {e}")

        # 5. Check Table Tooltip
        try:
            # Table row for age 32
            row = page.get_by_role("row").filter(has_text="32").first
            # Income cell is 3rd td.
            income_cell = row.get_by_role("cell").nth(2)

            # Verify title attribute contains breakdown text
            title = income_cell.get_attribute("title")
            if title and "給与収入" in title and "退職金" in title:
                print(f"Income tooltip verified: {title}")
            else:
                print(f"Income tooltip missing or incorrect: {title}")

            # Expense cell is 4th td.
            expense_cell = row.get_by_role("cell").nth(3)
            title_exp = expense_cell.get_attribute("title")
            if title_exp and "基本生活費" in title_exp and "住居費" in title_exp:
                print(f"Expense tooltip verified: {title_exp}")
            else:
                print(f"Expense tooltip missing or incorrect: {title_exp}")

        except Exception as e:
            print(f"Table tooltip check failed: {e}")

        # Screenshot
        page.screenshot(path="verification/verification.png", full_page=True)
        print("Screenshot saved to verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run()
