import os
from playwright.sync_api import sync_playwright, expect

def verify_layout(page):
    # Setup local storage to skip welcome modal
    page.goto("http://localhost:5173/")
    page.evaluate("localStorage.setItem('hasVisited', 'true')")
    page.reload()

    # Wait for sidebar title
    # Desktop uses h2, Mobile uses h1. Since we are 1280px, h2 should be visible.
    page.wait_for_selector("h2:has-text('人生見えるくん')")

    # Scroll to "イベントを追加" button and click it
    add_btn = page.get_by_role("button", name="イベントを追加")

    # Ensure button is ready
    add_btn.scroll_into_view_if_needed()
    add_btn.click()

    # Find the input for event name. It has value "旅行" by default.
    event_input = page.locator('input[value="旅行"]')
    event_input.fill("あ" * 100) # Very long string

    # Wait a bit for React to update state and recalc results
    page.wait_for_timeout(2000)

    # Check for horizontal scroll on the body/html
    dimensions = page.evaluate("""() => {
        return {
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            bodyScrollWidth: document.body.scrollWidth
        }
    }""")

    print(f"Dimensions: {dimensions}")

    # Take screenshot
    page.screenshot(path="verification/layout_issue.png", full_page=True)

    if dimensions['scrollWidth'] > dimensions['innerWidth']:
        print("FAIL: Horizontal scroll detected on page.")
    else:
        print("PASS: No horizontal scroll detected.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        try:
            verify_layout(page)
        finally:
            browser.close()
