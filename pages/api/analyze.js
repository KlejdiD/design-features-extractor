import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// Configure the API route
export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

// Helper function to determine if we're in a development environment
const isDev = process.env.NODE_ENV === "development";

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    console.log("Starting browser launch process...");

    let browser;

    // Different browser launch configurations for development vs production
    if (isDev) {
      // For local development, try to use puppeteer directly
      // You'll need to install puppeteer as a dev dependency: npm install -D puppeteer
      try {
        console.log(
          "Development environment detected, trying to use local Chrome..."
        );
        const puppeteerDev = require("puppeteer");
        browser = await puppeteerDev.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      } catch (devError) {
        console.error("Failed to launch local Chrome:", devError);
        console.log("Trying fallback method...");

        // Fallback method: Use puppeteer-core with system Chrome
        browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          // On Windows, Chrome is usually in one of these locations
          executablePath:
            process.platform === "win32"
              ? process.env.CHROME_PATH ||
                "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" ||
                "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
              : process.env.CHROME_PATH || "/usr/bin/google-chrome",
        });
      }
    } else {
      // For production, use @sparticuz/chromium
      console.log(
        "Production environment detected, using @sparticuz/chromium..."
      );
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
        ignoreHTTPSErrors: true,
      });
    }

    console.log("Browser launched successfully!");
    const page = await browser.newPage();

    // Set a user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );

    console.log(`Navigating to ${url}...`);
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
    } catch (navigationError) {
      console.error("Navigation failed:", navigationError);
      await browser.close();
      return res.status(400).json({
        error: "Failed to load the website",
        details: navigationError.message,
      });
    }

    console.log("Page loaded, extracting data...");
    const data = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("*"));
      const colorMap = {};
      const fonts = new Set();

      // Process elements for colors and fonts
      for (const el of elements) {
        const style = getComputedStyle(el);
        const color = style.color;
        const bg = style.backgroundColor;
        const font = style.fontFamily;

        if (color && !color.includes("rgba(0, 0, 0, 0)")) {
          colorMap[color] = (colorMap[color] || 0) + 1;
        }
        if (bg && !bg.includes("rgba(0, 0, 0, 0)")) {
          colorMap[bg] = (colorMap[bg] || 0) + 1;
        }
        if (font) {
          fonts.add(font);
        }
      }

      // Convert colors to sorted array
      const colors = Object.entries(colorMap)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .filter((color) => color.count > 3);

      // Detect technologies
      const resources = Array.from(
        document.querySelectorAll("script[src], link[rel='stylesheet']")
      ).map((el) => el.src || el.href);

      const technologies = [];

      // Framework detection
      if (resources.some((r) => r && r.includes("wp-content")))
        technologies.push("WordPress");
      if (resources.some((r) => r && r.includes("shopify")))
        technologies.push("Shopify");
      if (resources.some((r) => r && r.includes("react")))
        technologies.push("React");
      if (resources.some((r) => r && r.includes("vue")))
        technologies.push("Vue.js");
      if (resources.some((r) => r && r.includes("bootstrap")))
        technologies.push("Bootstrap");
      if (resources.some((r) => r && r.includes("tailwind")))
        technologies.push("Tailwind CSS");
      if (resources.some((r) => r && r.includes("squarespace")))
        technologies.push("Squarespace");
      if (resources.some((r) => r && r.includes("wix")))
        technologies.push("Wix");
      if (resources.some((r) => r && r.includes("jquery")))
        technologies.push("jQuery");

      // Check meta tags
      if (
        document.querySelector("meta[name='generator'][content*='WordPress']")
      )
        technologies.push("WordPress");
      if (document.querySelector("meta[name='generator'][content*='Wix']"))
        technologies.push("Wix");

      // Check global variables
      if (window.React) technologies.push("React");
      if (window.Vue) technologies.push("Vue.js");
      if (window.angular || window.ng) technologies.push("Angular");
      if (window.jQuery || window.$) technologies.push("jQuery");

      // Remove duplicates
      const uniqueTechnologies = [...new Set(technologies)];

      return {
        title: document.title,
        colors,
        fonts: Array.from(fonts).slice(0, 10),
        technologies: uniqueTechnologies,
      };
    });

    console.log("Data extracted, closing browser...");
    await browser.close();

    console.log("Sending response...");
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error analyzing website:", error);

    return res.status(500).json({
      error: "Failed to analyze website",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
