from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Visit page
        try:
            page.goto("http://localhost:3000")
            page.wait_for_selector("h1", timeout=10000)
            print("Page loaded")
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        # 2. Check for Death Age Input
        try:
            # Assuming the label is "想定寿命 (歳)"
            death_age_input = page.get_by_label("想定寿命 (歳)")
            expect(death_age_input).to_be_visible()
            expect(death_age_input).to_have_value("90")
            print("Death age input visible with default value 90")

            # Change value to 80
            death_age_input.fill("80")
            death_age_input.blur()
            expect(death_age_input).to_have_value("80")
            print("Death age changed to 80")

        except Exception as e:
            print(f"Death age input check failed: {e}")

        # 3. Check Chart X-Axis (indirectly) or table rows
        # We can check if the table has rows up to age 80
        try:
            # Wait for table to update? React should be fast.
            # Check last row in the table
            last_row = page.locator("tbody tr").last
            last_age_cell = last_row.locator("td").first
            expect(last_age_cell).to_have_text("80")
            print("Simulation updated to end at age 80")
        except Exception as e:
             print(f"Simulation end age check failed: {e}")

        # 4. Check Validation Logic (Min/Max)
        try:
            death_age_input = page.get_by_label("想定寿命 (歳)")
            current_age_val = 32 # Default

            # Try setting below min (current age + 1)
            death_age_input.fill("20")
            death_age_input.blur()
            # Should revert to min (33)
            expect(death_age_input).to_have_value("33")
            print("Min age validation passed")

            # Try setting above max (120)
            death_age_input.fill("150")
            death_age_input.blur()
            expect(death_age_input).to_have_value("120")
            print("Max age validation passed")

            # Set back to 100 for screenshot
            death_age_input.fill("100")
            death_age_input.blur()

        except Exception as e:
            print(f"Validation logic check failed: {e}")

        # Screenshot
        page.screenshot(path="verification/verification_death_age.png", full_page=True)
        print("Screenshot saved to verification/verification_death_age.png")

        browser.close()

if __name__ == "__main__":
    run()
