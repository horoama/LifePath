from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Bypass Welcome Modal
        page.add_init_script("localStorage.setItem('hasVisited', 'true');")

        # Access the app
        page.goto("http://localhost:5173")

        # Wait for the chart to load
        page.wait_for_selector(".recharts-responsive-container")
        time.sleep(2) # Wait for animation

        # Scroll to the chart section
        chart_section = page.locator("text=総資産推移")
        chart_section.scroll_into_view_if_needed()

        # Take screenshot of initial state (Toggle OFF)
        page.screenshot(path="verification/toggle_off.png")
        print("Captured toggle_off.png")

        # Find and click the toggle
        toggle = page.get_by_label("元本を表示")
        if not toggle.is_visible():
             print("Toggle not visible, trying to scroll")
             toggle.scroll_into_view_if_needed()

        toggle.click()

        # Wait for chart update (animation)
        time.sleep(1)

        # Take screenshot of toggled state (Toggle ON)
        page.screenshot(path="verification/toggle_on.png")
        print("Captured toggle_on.png")

        browser.close()

if __name__ == "__main__":
    run()
