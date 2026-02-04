from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Navigating...")
        try:
            page.goto("http://localhost:5173", timeout=60000)
            page.wait_for_timeout(5000) # Wait 5 seconds blindly

            print("Taking screenshot...")
            page.screenshot(path="verification/debug.png")

            # Print page title
            print(f"Page Title: {page.title()}")

            # Check for modal content
            content = page.content()
            if "人生見えるくんへようこそ" in content:
                print("Modal text found in HTML.")
            else:
                print("Modal text NOT found in HTML.")

        except Exception as e:
            print(f"Error: {e}")

        browser.close()

if __name__ == "__main__":
    run()
