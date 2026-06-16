#!/usr/bin/env python3
"""
Scrape real product images from Amazon for verified ASINs.
Uses Playwright (headless Chromium) for reliable extraction.
Stores results in product_images.json for the catalog generator to use.
"""
import json
import os
import re
import time
from datetime import datetime
from playwright.sync_api import sync_playwright

PROJECT_DIR = r"C:\Users\Admin\Downloads\Alaya Insider Product"
OUTPUT_PATH = os.path.join(PROJECT_DIR, "product_images.json")

# All verified ASINs from the pipeline
VERIFIED_ASINS = {
    "B07SLKNXD8": "Brooklinen Luxe Core Sheet Set",
    "B008Q5PKOW": "Cozy Earth Bamboo Sheet Set",
    "B00005UP2P": "KitchenAid Artisan Stand Mixer 5-Quart",
    "B0979R48CX": "Dyson V15 Detect",
    "B0C1J7Z3XF": "Parachute Linen Venice Sheet Set",
    "B0B61XH5YT": "Dyson Airwrap Complete Long",
    "B07XXPHQZK": "Laneige Lip Sleeping Mask",
    "B00SNM5US4": "Olaplex No 3 Hair Perfector",
    "B0BQZCHFK4": "Stanley Quencher 40oz Tumbler",
    "B0FM2SLQN6": "Nike Air Force 1 Womens",
    "B0CHWRXH8B": "Apple AirPods Pro 2",
    "B07K6P2JLF": "Lululemon Align Leggings",
    "B0758JHZM3": "Vitamix E310 Explorian Blender",
    "B0B6RVQQG3": "Theragun Mini 2.0",
    "B0F9ZRJVKX": "YETI Rambler 26oz Bottle",
    "B07934S6WK": "Drunk Elephant Protini Polypeptide Cream",
    "B0FNQD9666": "Tatcha The Water Cream",
    "B0037LRZHA": "Sunday Riley Good Genes Lactic Acid",
    "B00BVO9V9A": "La Mer Creme de la Mer",
    "B07L4Q9Z7Q": "Charlotte Tilbury Pillow Talk Lipstick",
    "B074Q6V73W": "Fenty Beauty Pro Filt'r Foundation",
    "B08XY6T9T8": "Rare Beauty Soft Pinch Liquid Blush",
    "B078W5673G": "Glow Recipe Watermelon Glow Sleeping Mask",
    "B07DWJ6J46": "Summer Fridays Jet Lag Mask",
    "B06Y465F8W": "CeraVe Hydrating Facial Cleanser",
    "B01N47V566": "The Ordinary Niacinamide 10% + Zinc",
    "B0762XJ8Q3": "Supergoop Unseen Sunscreen SPF 40",
    "B0822K67X4": "Hydro Flask Wide Mouth 32oz",
    "B01F7V69PC": "Sol de Janeiro Brazilian Bum Bum Cream",
    "B01C0P0VUE": "ColourPop Super Shock Shadow",
    "B09MR9W5P5": "Everlane The Cashmere Crew",
    "B09N2L52K7": "Madewell Transport Tote",
    "B0BHZ7P1V4": "Reformation Juliette Dress",
    "B0000Y3FGW": "Levi's 501 Original Fit Jeans",
    "B07D2BXX5L": "Girlfriend Collective Compressive Leggings",
    "B0B94LTVYX": "UGG Classic Ultra Mini Boot",
    "B081T2M6V6": "Veja Campo Sneakers",
    "B009L7X9B4": "Patagonia Better Sweater Fleece",
    "B001GNYFKS": "Ray-Ban Aviator Classic Sunglasses",
    "B0C73S937T": "Lululemon Define Jacket",
    "B00L5JVW6Y": "Calvin Klein Modern Cotton Bralette",
    "B07Y9K7Z5S": "The North Face Nuptse 1996 Jacket",
    "B000G33W3O": "Birkenstock Arizona Sandals",
    "B000W1W0LC": "Dr. Martens 1460 Boots",
    "B003V32M5K": "Carhartt Beanie",
    "B0BHZSJ4QK": "Boll & Branch Signature Hemmed Sheet Set",
    "B07FPRBMVP": "Buffy Cloud Comforter",
    "B0CQDB4HHG": "Saatva Latex Pillow",
    "B078P5F988": "Slip Pure Silk Pillowcase",
    "B0C1FF8K58": "Bearaby Cotton Napper Weighted Blanket",
    "B0BCP1RG4B": "Vitruvi Stone Diffuser",
    "B098N6Z3YR": "Dyson Pure Cool Air Purifier TP07",
    "B07Z8CNCLN": "Philips Hue Go Portable Table Lamp",
    "B0D5K3747D": "Umbra Bellwood Plant Stand",
    "B0BCQSYPZB": "Google Nest WiFi Pro 3-Pack",
    "B0BW2LVJ4P": "Sonos Era 100 Smart Speaker",
    "B0GJTXVN9Z": "Apple AirTag 4-Pack",
    "B00MXCRAX8": "Lutron Caseta Smart Dimmer Starter Kit",
    "B0D5BBYRJM": "Nest Learning Thermostat 4th Gen",
    "B0CNS894RH": "Theragun Relief Massage Gun",
    "B0CSRF4MV3": "Oura Ring Gen3",
    "B07JFQS56V": "P.F. Candle Co. Sandalwood Rose Incense",
    "B07L6KVGXV": "Google Nest Hub Max",
    "B0CGGYYK2D": "Sonos Move 2",
    "B09BSHFLD9": "Philips Hue Smart Bulb Starter Kit",
    "B0FBHDQ94L": "Amazon Echo Studio",
    "B091G64GVK": "Eero Pro 6E Mesh WiFi System",
    "B0CFM7YT8S": "Apple TV 4K 3rd Gen",
    "B086QKXW1M": "Ring Video Doorbell Pro 2",
    "B082VXRND2": "August WiFi Smart Lock 4th Gen",
    "B099WMQ5R6": "Dyson Purifier Hot+Cool Formaldehyde",
    "B07H163S6J": "Logitech Circle View Security Camera",
    "B09GPYL7BJ": "Sonos Beam Gen 2 Soundbar",
    "B09XXS48P8": "Ecobee Smart Thermostat Premium",
    "B0BRNST1JB": "Samsung SmartThings Station",
    "B0C415HQPX": "iRobot Roomba Combo j9+",
    "B08MB1JGLW": "Belkin BoostCharge Pro 3-in-1",
    "B00XV1RCRY": "Google Nest Protect Battery",
    "B098JGPWRN": "Logitech MX Keys Mini",
    "B0DL6L6HPG": "Apple Magic Trackpad Black",
    "B0DK59YKRS": "BenQ ScreenBar Halo",
    "B0BZJLJZRM": "Eve Motion Sensor",
    "B08R6FFJ9F": "Netatmo Smart Video Doorbell",
    "B00VA5HG0Q": "Le Creuset Signature Enameled Dutch Oven",
    "B00007J5U7": "Zojirushi Neuro Fuzzy Rice Cooker",
    "B007ZIGPKY": "Staub Cast Iron 10-inch Fry Pan",
    "B01AXM4WV2": "Cuisinart 14-Cup Food Processor",
    "B00CH9QWOU": "Breville Barista Express Espresso Machine",
    "B005H8KD3E": "All-Clad D3 Stainless Steel 10-Piece Set",
    "B00005OL44": "Global Classic Chef Knife 8-Inch",
    "B01NBKTPTS": "Instant Pot Duo Plus 6-Quart",
    "B079D9B82W": "OXO Good Grips Stainless Steel Food Scale",
    "B00151WA06": "Microplane Premium Zester Grater",
    "B08NFB2LVC": "Wusthof Classic Ikon 7-Piece Block Set",
    "B01N7GO468": "Nespresso VertuoPlus Coffee Maker",
    "B0BF7NKK81": "Fellow Stagg EKG Electric Kettle",
    "B0000YWF5E": "Chemex Classic 6-Cup Coffeemaker",
    "B002S01CKW": "Hario V60 Ceramic Coffee Dripper",
    "B00OXGXW8O": "Breville Smart Grinder Pro",
    "B0047BIWSK": "AeroPress Original Coffee Maker",
    "B08VFCD1Y2": "YETI Rambler 26oz Straw Cup",
    "B07NQSJRBZ": "Ember Travel Mug 2",
    "B0742XCG2M": "Stasher Reusable Silicone Bag",
}

# Load existing results
results = {}
if os.path.exists(OUTPUT_PATH):
    with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
        results = json.load(f)
    print(f"Loaded {len(results)} existing image results")

# Determine which ASINs still need processing
pending = {k: v for k, v in VERIFIED_ASINS.items() if k not in results or not results.get(k)}
print(f"Pending: {len(pending)} ASINs to scrape")
print(f"Already have: {len(VERIFIED_ASINS) - len(pending)}")

def clean_image_url(url: str) -> str:
    """Remove size modifiers from Amazon image URL to get the base image."""
    if not url:
        return ""
    # Remove common size modifiers while keeping the extension
    # Examples: ._AC_SX679_.jpg -> .jpg, ._SL1500_.jpg -> .jpg
    url = re.sub(r'\._AC_[A-Z]{2}\d+_[A-Z]\.', '.', url)  # ._AC_SX679_. -> .
    url = re.sub(r'\._SL\d+_\.', '.', url)  # ._SL1500_. -> .
    url = re.sub(r'\._SX\d+_\.', '.', url)  # ._SX679_. -> .
    url = re.sub(r'\._SY\d+_\.', '.', url)  # ._SY355_. -> .
    url = re.sub(r'\._UX\d+_\.', '.', url)  # ._UX250_. -> .
    url = re.sub(r'\._UY\d+_\.', '.', url)  # ._UY250_. -> .
    url = re.sub(r'\._CR\d+,\d+,\d+,\d+_\.', '.', url)  # ._CR0,0,300,300_. -> .
    # Handle double extensions like ._AC_.jpg -> .jpg
    url = re.sub(r'\._[A-Z]+_\.', '.', url)
    # Remove any trailing size modifiers before extension
    url = re.sub(r'\._([A-Z]+)?_?\.(jpg|png|webp)$', r'.\2', url)
    return url

def extract_image_url(page) -> str:
    """Extract the main product image URL from an Amazon product page."""
    try:
        # Wait for the page to load
        page.wait_for_load_state("networkidle", timeout=15000)
    except:
        pass
    
    # Try multiple selectors to find the main product image
    selectors = [
        '#landingImage',
        '#imgTagWrapperId img',
        '.a-dynamic-image',
        '#main-image',
        'img[data-old-hires]',
        '.imgTagWrapper img',
        '#imageBlock img.a-dynamic-image',
        '#main-img-container img',
    ]
    
    for selector in selectors:
        try:
            img = page.query_selector(selector)
            if img:
                # Try various attributes
                for attr in ['src', 'data-old-hires', 'data-a-dynamic-image', 'data-src']:
                    src = img.get_attribute(attr)
                    if src and 'media-amazon.com/images/I/' in src:
                        return src
        except:
            continue
    
    # Fallback: search page content for image URLs
    html = page.content()
    patterns = [
        r'id="landingImage".*?src="(https://m\.media-amazon\.com/images/I/[^"]+)"',
        r'"mainUrl":"(https://m\.media-amazon\.com/images/I/[^"]+)"',
        r'"hiRes":"(https://m\.media-amazon\.com/images/I/[^"]+)"',
        r'data-old-hires="(https://m\.media-amazon\.com/images/I/[^"]+)"',
        r'class="a-dynamic-image.*?src="(https://m\.media-amazon\.com/images/I/[^"]+)"',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            url = match.group(1)
            # Unescape HTML entities
            url = url.replace('&amp;', '&')
            return url
    
    return ""

def scrape_asins():
    """Main scraping function using Playwright."""
    total_pending = len(pending)
    if total_pending == 0:
        print("All ASINs already processed!")
        return
    
    pending_items = list(pending.items())
    
    with sync_playwright() as p:
        # Launch browser with stealth settings
        browser = p.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
            ]
        )
        
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080},
            locale='en-US',
            extra_http_headers={
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            }
        )
        
        # Remove webdriver detection
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        """)
        
        page = context.new_page()
        
        success_count = 0
        fail_count = 0
        start_time = time.time()
        
        for i, (asin, name) in enumerate(pending_items):
            url = f"https://www.amazon.com/dp/{asin}"
            print(f"[{i+1}/{total_pending}] {asin} - {name[:50]}... ", end="", flush=True)
            
            try:
                # Navigate to the product page
                resp = page.goto(url, wait_until='domcontentloaded', timeout=20000)
                
                if resp and resp.status == 200:
                    # Small delay to let images load
                    page.wait_for_timeout(2000)
                    
                    # Extract the image URL
                    img_url = extract_image_url(page)
                    
                    if img_url:
                        # Clean the URL (remove size modifiers)
                        clean_url = clean_image_url(img_url)
                        results[asin] = clean_url
                        print(f"OK: {clean_url}")
                        success_count += 1
                    else:
                        # Try one more time with longer wait
                        page.wait_for_timeout(3000)
                        img_url = extract_image_url(page)
                        if img_url:
                            clean_url = clean_image_url(img_url)
                            results[asin] = clean_url
                            print(f"OK: {clean_url}")
                            success_count += 1
                        else:
                            results[asin] = ""
                            print(f"FAIL: No image found")
                            fail_count += 1
                else:
                    status = resp.status if resp else "no response"
                    results[asin] = ""
                    print(f"FAIL: HTTP {status}")
                    fail_count += 1
                    
            except Exception as e:
                results[asin] = ""
                print(f"FAIL: {str(e)[:80]}")
                fail_count += 1
                # Navigate to blank page to reset state
                try:
                    page.goto("about:blank", timeout=5000)
                except:
                    pass
            
            # Save progress after each ASIN
            with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2)
            
            # Be polite to Amazon - random delay between requests
            delay = 3 + (i % 3)  # 3-5 seconds between requests
            time.sleep(delay)
            
            # Calculate and show progress
            elapsed = time.time() - start_time
            rate = (i + 1) / elapsed if elapsed > 0 else 0
            eta = (total_pending - i - 1) / rate if rate > 0 else 0
            print(f"     Progress: {i+1}/{total_pending} | Rate: {rate:.1f} ASINs/min | ETA: {eta:.0f}s")
        
        browser.close()
    
    # Final summary
    found = sum(1 for v in results.values() if v)
    failed = sum(1 for v in results.values() if not v)
    print(f"\n=== RESULTS ===")
    print(f"Total images found: {found}/{len(results)}")
    print(f"Failed: {failed}")
    print(f"Saved to: {OUTPUT_PATH}")
    return results

def get_image_for_asin(asin: str) -> str:
    """Get the saved image URL for an ASIN, or return empty string."""
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data.get(asin, "")
    return ""

if __name__ == "__main__":
    scrape_asins()
