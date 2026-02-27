import { chromium } from "playwright";
import { resolve } from "node:path";

const WIDTH = 1200;
const HEIGHT = 630;

const html = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: Georgia, 'Times New Roman', serif;
    color: white;
  }
  .icon {
    margin-bottom: 32px;
  }
  .icon svg {
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
  }
  h1 {
    font-size: 72px;
    font-weight: 400;
    letter-spacing: -1px;
    margin-bottom: 16px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  p {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 28px;
    font-weight: 300;
    opacity: 0.9;
  }
</style>
</head>
<body>
  <div class="icon">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="120" height="120">
      <rect x="2" y="8" width="28" height="16" rx="3" fill="white"/>
      <circle cx="2" cy="16" r="3" fill="#3b82f6"/>
      <circle cx="30" cy="16" r="3" fill="#3b82f6"/>
      <rect x="10" y="13" width="12" height="2" rx="1" fill="#3b82f6" opacity="0.9"/>
      <rect x="12" y="17" width="8" height="1.5" rx="0.75" fill="#3b82f6" opacity="0.6"/>
    </svg>
  </div>
  <h1>Petit Coupon</h1>
  <p>Printable love coupons, made simple</p>
</body>
</html>`;

async function generate(): Promise<void> {
	const browser = await chromium.launch();
	const page = await browser.newPage({
		viewport: { width: WIDTH, height: HEIGHT },
	});

	await page.setContent(html, { waitUntil: "load" });

	const outputPath = resolve(import.meta.dirname, "../public/og-image.png");
	await page.screenshot({ path: outputPath, type: "png" });

	await browser.close();
	console.log(`Generated ${outputPath}`);
}

generate();
