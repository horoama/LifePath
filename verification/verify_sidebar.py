from playwright.sync_api import Page, expect, sync_playwright
import time

def test_sidebar_changes(page: Page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")

    # Wait for app to load - using a safer check
    try:
        page.wait_for_selector("text=人生見えるくん", timeout=5000)
    except:
        print("Wait timeout, but proceeding if element exists...")

    print("App loaded (or timeout bypassed).")

    # --- 1. Verify Education Options ---
    print("Verifying education options...")

    # Ensure Children section is open/visible
    # (It's always visible in Sidebar)

    # Check for select element
    if page.locator("select").count() == 0:
        print("No children found, adding one...")
        # Try adding a child if button exists
        add_btn = page.get_by_role("button", name="子供を追加")
        if add_btn.count() > 0:
            add_btn.click()
        else:
            print("Could not find 'Add Child' button.")

    # Give React a moment to render
    time.sleep(1)

    selects = page.locator("select")
    if selects.count() > 0:
        select = selects.first
        select.scroll_into_view_if_needed()

        # Check the options text
        options_text = select.inner_text()
        print(f"Options text snippet: {options_text[:100]}...")

        if "総額" in options_text and "万円" in options_text:
            print("SUCCESS: Education option text likely updated correctly.")
        else:
            print("FAILURE: Education option text NOT updated correctly.")
    else:
        print("FAILURE: No select element found even after attempt to add child.")

    # Screenshot of Education Options
    page.screenshot(path="verification/education_options.png")


    # --- 2. Verify Tooltips ---
    print("Verifying tooltips...")

    # Scroll to Event Name
    # We look for "イベント名" label
    # Note: If no events exist, we might need to add one.
    # Default state usually has one event or none? Let's check.

    event_inputs = page.locator("input[value='旅行']") # default event name is '旅行'
    if event_inputs.count() == 0:
        print("No events found, adding one...")
        add_event_btn = page.get_by_role("button", name="イベントを追加")
        if add_event_btn.count() > 0:
            add_event_btn.click()
            time.sleep(0.5)

    event_name_label = page.locator("label").filter(has_text="イベント名").first
    event_name_label.scroll_into_view_if_needed()

    tooltip_btn = event_name_label.get_by_role("button", name="Info")

    if tooltip_btn.count() > 0:
        tooltip_btn.hover()
        time.sleep(1) # Wait for tooltip to appear

        # Screenshot with tooltip
        page.screenshot(path="verification/tooltip_event_name.png")
        print("Captured Event Name tooltip screenshot.")
    else:
        print("FAILURE: Could not find tooltip button for Event Name.")

    # Also verify "Event Type" tooltip
    print("Verifying Event Type tooltip...")
    # "タイプ" label
    event_type_div = page.locator("div").filter(has_text="タイプ").first
    tooltip_btn_type = event_type_div.get_by_role("button", name="Info")

    if tooltip_btn_type.count() > 0:
        tooltip_btn_type.scroll_into_view_if_needed()
        tooltip_btn_type.hover()
        time.sleep(1)
        page.screenshot(path="verification/tooltip_event_type.png")
        print("Captured Event Type tooltip screenshot.")
    else:
        print("Warning: Could not find tooltip button for Event Type.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_sidebar_changes(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
