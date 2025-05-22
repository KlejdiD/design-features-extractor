import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// Simple configuration
export const config = {
  maxDuration: 60,
};

// Helper function - use local puppeteer unless we're on Vercel
const useLocal = !process.env.VERCEL;

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

  let browser = null;

  try {
    console.log("Starting browser launch process...");

    if (useLocal) {
      console.log("Local environment - using local puppeteer");
      try {
        const puppeteerDev = require("puppeteer");
        browser = await puppeteerDev.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      } catch (e) {
        console.log("Fallback to puppeteer-core in dev");
        browser = await puppeteer.launch({
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          executablePath:
            process.platform === "win32"
              ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
              : "/usr/bin/google-chrome",
        });
      }
    } else {
      // Production environment
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

    // Block unnecessary resources to avoid CORS and loading issues
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const resourceType = request.resourceType();
      const requestUrl = request.url();

      // Block resources that commonly cause CORS issues
      if (
        resourceType === "image" ||
        resourceType === "media" ||
        requestUrl.includes("beacon.min.js") ||
        requestUrl.includes("cloudflareinsights") ||
        requestUrl.includes("google-analytics") ||
        requestUrl.includes("gtag") ||
        requestUrl.includes("facebook.net") ||
        requestUrl.includes("doubleclick") ||
        requestUrl.includes(".woff") ||
        requestUrl.includes(".woff2") ||
        requestUrl.includes(".ttf") ||
        requestUrl.includes(".otf")
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

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
        try {
          const style = getComputedStyle(el);
          const color = style.color;
          const bg = style.backgroundColor;
          const font = style.fontFamily;

          if (
            color &&
            !color.includes("rgba(0, 0, 0, 0)") &&
            color !== "rgba(0, 0, 0, 0)"
          ) {
            colorMap[color] = (colorMap[color] || 0) + 1;
          }
          if (
            bg &&
            !bg.includes("rgba(0, 0, 0, 0)") &&
            bg !== "rgba(0, 0, 0, 0)"
          ) {
            colorMap[bg] = (colorMap[bg] || 0) + 1;
          }
          if (font && font !== "serif" && font !== "sans-serif") {
            const cleanFont = font.split(",")[0].replace(/['"]/g, "").trim();
            if (cleanFont.length > 2) {
              fonts.add(cleanFont);
            }
          }
        } catch (e) {
          continue;
        }
      }

      // Convert colors to sorted array
      const colors = Object.entries(colorMap)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .filter((color) => color.count > 3);

      // Detect technologies
      const technologies = [];

      const scripts = Array.from(document.querySelectorAll("script[src]"));
      const links = Array.from(document.querySelectorAll("link[href]"));

      const scriptSrcs = scripts.map((s) => s.src.toLowerCase());
      const linkHrefs = links.map((l) => l.href.toLowerCase());
      const allResources = [...scriptSrcs, ...linkHrefs];

      // Framework detection
      if (
        allResources.some(
          (r) => r.includes("wp-content") || r.includes("wp-includes")
        )
      ) {
        technologies.push("WordPress");
      }
      if (allResources.some((r) => r.includes("shopify"))) {
        technologies.push("Shopify");
      }
      if (allResources.some((r) => r.includes("react"))) {
        technologies.push("React");
      }
      if (allResources.some((r) => r.includes("vue"))) {
        technologies.push("Vue.js");
      }
      if (allResources.some((r) => r.includes("bootstrap"))) {
        technologies.push("Bootstrap");
      }
      if (allResources.some((r) => r.includes("tailwind"))) {
        technologies.push("Tailwind CSS");
      }
      if (allResources.some((r) => r.includes("jquery"))) {
        technologies.push("jQuery");
      }

      // Check meta tags
      const metaTags = Array.from(document.querySelectorAll("meta"));
      metaTags.forEach((meta) => {
        const generator = meta.getAttribute("name");
        const content = meta.getAttribute("content") || "";

        if (
          generator === "generator" &&
          content.toLowerCase().includes("wordpress")
        ) {
          technologies.push("WordPress");
        }
      });

      // Remove duplicates
      const uniqueTechnologies = [...new Set(technologies)];

      return {
        title: document.title || "Untitled",
        colors: colors.slice(0, 15),
        fonts: Array.from(fonts).slice(0, 8),
        technologies: uniqueTechnologies,
      };
    });

    console.log("Data extracted, closing browser...");
    await browser.close();
    browser = null;

    console.log("Sending response...");
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error analyzing website:", error);

    return res.status(500).json({
      error: "Failed to analyze website",
      details: error.message,
    });
  } finally {
    if (browser !== null) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }
}
