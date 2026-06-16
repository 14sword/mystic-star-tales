import os
import time
import http.server
import socketserver
import threading
from playwright.sync_api import sync_playwright

PORT = 8888
DIRECTORY = "/Users/xieqing/Desktop/后期/小案例/mystic-star-tales"
OUTPUT_DIR = os.path.join(DIRECTORY, "screenshots")
ARTIFACT_DIR = "/Users/xieqing/.gemini/antigravity/brain/8d5b43a5-e048-45f3-9d6d-03664a28beb7"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

# Start a local HTTP server in a separate thread
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server started at port {PORT}")
        httpd.serve_forever()

server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()

# Give server a moment to start
time.sleep(1)

def capture_screenshots():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        
        # 1. Desktop Screenshots (1280x800)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        url = f"http://localhost:{PORT}/"
        print(f"Navigating to {url} (Desktop)...")
        page.goto(url)
        
        # Wait for the loader to fade out (the class 'page-loaded' will be added to body)
        page.wait_for_selector("body.page-loaded", timeout=10000)
        time.sleep(1.5) # Wait for entry animations to settle
        
        # Take Screenshot 1: Desktop Homepage
        desktop_home_path = os.path.join(OUTPUT_DIR, "desktop_home.png")
        page.screenshot(path=desktop_home_path)
        print(f"Captured: {desktop_home_path}")
        
        # Click on East Asia filter
        print("Filtering by East Asia...")
        page.click('.filter-btn[data-filter="east-asia"]', force=True)
        time.sleep(1.0) # Wait for filtering animations to complete
        
        # Take Screenshot 2: Desktop Filtered State
        desktop_filter_path = os.path.join(OUTPUT_DIR, "desktop_filtered.png")
        page.screenshot(path=desktop_filter_path)
        print(f"Captured: {desktop_filter_path}")
        
        # Click on Tiger story card to open modal
        print("Opening Tiger story modal...")
        page.click('.mystic-card[data-id="tiger"]', force=True)
        page.wait_for_selector(".modal-overlay.active", timeout=5000)
        time.sleep(1.5) # Wait for modal open animation
        
        # Take Screenshot 3: Desktop Story Modal
        desktop_modal_path = os.path.join(OUTPUT_DIR, "desktop_modal.png")
        page.screenshot(path=desktop_modal_path)
        print(f"Captured: {desktop_modal_path}")
        
        # Close the modal
        print("Closing modal...")
        page.click("#modal-close", force=True)
        time.sleep(0.5)
        
        # Close Desktop context
        context.close()
        
        # 2. Mobile Screenshots (iPhone 12/13 Viewport: 390x844)
        print("Creating Mobile Context...")
        mobile_context = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True
        )
        mobile_page = mobile_context.new_page()
        
        print(f"Navigating to {url} (Mobile)...")
        mobile_page.goto(url)
        mobile_page.wait_for_selector("body.page-loaded", timeout=10000)
        time.sleep(1.5) # Wait for animations
        
        # Take Screenshot 4: Mobile Homepage
        mobile_home_path = os.path.join(OUTPUT_DIR, "mobile_home.png")
        mobile_page.screenshot(path=mobile_home_path)
        print(f"Captured: {mobile_home_path}")
        
        # Click on Anubis story card on mobile
        print("Opening Anubis story modal on mobile...")
        mobile_page.click('.mystic-card[data-id="anubis"]', force=True)
        mobile_page.wait_for_selector(".modal-overlay.active", timeout=5000)
        time.sleep(1.5) # Wait for modal open
        
        # Take Screenshot 5: Mobile Story Modal
        mobile_modal_path = os.path.join(OUTPUT_DIR, "mobile_modal.png")
        mobile_page.screenshot(path=mobile_modal_path)
        print(f"Captured: {mobile_modal_path}")
        
        mobile_context.close()
        browser.close()
        
    # Copy screenshots to artifact folder for embedding in chat UI
    import shutil
    for name in ["desktop_home.png", "desktop_filtered.png", "desktop_modal.png", "mobile_home.png", "mobile_modal.png"]:
        src = os.path.join(OUTPUT_DIR, name)
        dst = os.path.join(ARTIFACT_DIR, name)
        shutil.copy2(src, dst)
        print(f"Copied {name} to artifacts directory: {dst}")

if __name__ == "__main__":
    capture_screenshots()
    print("Screenshot process finished successfully!")
