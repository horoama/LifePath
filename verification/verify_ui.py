from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Access the app
        print("Navigating to app...")
        try:
            page.goto("http://localhost:5173", timeout=30000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        # Wait for content to load
        page.wait_for_load_state("networkidle")

        # 1. Verify Welcome Modal
        print("Verifying Welcome Modal...")
        try:
            # Check for modal title
            modal_title = page.get_by_text("人生見えるくんへようこそ")
            modal_title.wait_for(state="visible", timeout=5000)
            print("Modal visible.")

            # Take screenshot of modal
            page.screenshot(path="verification/modal.png")

            # Close modal
            start_button = page.get_by_role("button", name="シミュレーションを始める")
            start_button.click()

            # Wait for modal to disappear
            modal_title.wait_for(state="hidden", timeout=2000)
            print("Modal closed.")

        except Exception as e:
            print(f"Modal verification failed: {e}")
            # Continue to verify sidebar even if modal fails (maybe localStorage persisted?)

        # 2. Verify Sidebar and Main Content
        print("Verifying Main UI...")
        try:
            # Check for Sidebar header
            sidebar_header = page.get_by_role("heading", name="基本情報")
            sidebar_header.wait_for(state="visible", timeout=5000)

            # Check for Results header
            results_header = page.get_by_role("heading", name="ライフプラン・シミュレーション結果")
            results_header.wait_for(state="visible")

            # Take screenshot of main UI
            page.screenshot(path="verification/main_ui.png")
            print("Main UI verified.")

        except Exception as e:
            print(f"Main UI verification failed: {e}")

        browser.close()

if __name__ == "__main__":
    run()
