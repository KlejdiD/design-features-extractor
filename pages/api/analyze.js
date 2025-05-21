import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    const data = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("*"));
      const colorMap = {};
      const fonts = new Set();

      for (const el of elements) {
        const style = getComputedStyle(el);
        const color = style.color;
        const bg = style.backgroundColor;
        const font = style.fontFamily;

        if (color) colorMap[color] = (colorMap[color] || 0) + 1;
        if (bg) colorMap[bg] = (colorMap[bg] || 0) + 1;
        if (font) fonts.add(font);
      }

      const colors = Object.entries(colorMap)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);

      const resources = Array.from(
        document.querySelectorAll("script[src], link[rel='stylesheet']")
      ).map((el) => el.src || el.href);

      const technologies = [];
      if (resources.some((r) => r.includes("wp-content")))
        technologies.push("WordPress");
      if (resources.some((r) => r.includes("shopify")))
        technologies.push("Shopify");
      if (resources.some((r) => r.includes("react")))
        technologies.push("React");
      if (resources.some((r) => r.includes("vue"))) technologies.push("Vue.js");
      if (resources.some((r) => r.includes("bootstrap")))
        technologies.push("Bootstrap");
      if (resources.some((r) => r.includes("squarespace")))
        technologies.push("Squarespace");

      return {
        title: document.title,
        colors,
        fonts: Array.from(fonts),
        technologies,
      };
    });

    await browser.close();
    res.status(200).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error", details: e.message });
  }
}
