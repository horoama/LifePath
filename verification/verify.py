from playwright.sync_api import sync_playwright
import time

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for server to start
        print("Waiting for server...")
        max_retries = 30
        for i in range(max_retries):
            try:
                page.goto("http://localhost:8080")
                break
            except Exception as e:
                if i == max_retries - 1:
                    print(f"Server failed to start: {e}")
                    raise
                time.sleep(1)

        print("Server connected. Waiting for content...")
        # Wait for the app to be interactive
        page.wait_for_timeout(3000)

        # Screenshot the full page
        page.screenshot(path="verification/verification.png", full_page=True)
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_changes()
