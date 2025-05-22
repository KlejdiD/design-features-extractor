# 🔎 Design Inspector

A beautiful web application that analyzes websites and extracts their colors, fonts, and technologies using Puppeteer. Built with Next.js and featuring a smooth, modern interface.

![Design Inspector Screenshot](screenshot.png)

## ✨ Features

- **Color Extraction**: Automatically detects and displays the most used colors on any website
- **Font Analysis**: Identifies fonts used on the website with live previews
- **Technology Detection**: Recognizes frameworks, libraries, and platforms used
- **Live Preview**: Shows the website alongside the analysis
- **Modern UI**: Smooth, rounded design with gradients and animations

## 🚀 Quick Start

### Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Google Chrome** browser installed on your system
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/design-inspector.git
   cd design-inspector
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

That's it! 🎉

## 📋 Available Commands

```bash
# Start development server (recommended)
npm run dev

# Build the project
npm run build

# Start production server (after building)
npm run start

# Run linting
npm run lint
```

## 🖥️ System Requirements

### Windows

- Windows 10 or later
- Google Chrome installed
- Node.js 18+

### macOS

- macOS 10.14 or later
- Google Chrome installed
- Node.js 18+

### Linux

- Ubuntu 18.04+ (or equivalent)
- Google Chrome or Chromium installed
- Node.js 18+

## 🛠️ How It Works

1. **Enter a URL** in the input field
2. **Click Analyze** or press Enter
3. **Wait for analysis** (usually 5-15 seconds)
4. **View results** including colors, fonts, and technologies

The app uses Puppeteer to launch a headless Chrome browser, navigate to your specified website, and extract design information by analyzing the DOM and computed styles.

## 🎨 What Gets Analyzed

- **Colors**: Background colors, text colors, and their usage frequency
- **Fonts**: Font families used throughout the site
- **Technologies**: Frameworks like React, Vue, WordPress, Shopify, etc.
- **Live Preview**: Embedded iframe of the website

## 🚫 Limitations

- Some websites block iframe embedding (preview won't work)
- CORS restrictions may prevent loading certain resources
- Analysis time depends on website complexity
- **Local use only** - not designed for deployment

## 🔧 Troubleshooting

### Common Issues

**"Failed to launch browser"**

- Make sure Google Chrome is installed
- On Linux, you might need: `sudo apt-get install google-chrome-stable`

**"Module not found"**

- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

**"Navigation failed"**

- Check if the URL is correct and includes `http://` or `https://`
- Some websites block automated access

**Build errors**

- Try `npm run dev` instead of `npm run build`
- Make sure all dependencies are installed

### Getting Help

If you encounter issues:

1. Check that Chrome is installed and accessible
2. Ensure all dependencies are installed with `npm install`
3. Try running `npm run dev` instead of `npm start`
4. Check the console for detailed error messages

## 🤝 Contributing

This is an open-source project! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Use Cases

Perfect for:

- **Designers** analyzing competitor websites
- **Developers** researching design patterns
- **Students** learning about web technologies
- **Anyone** curious about how websites are built

## ⚡ Performance Tips

- **Close other browser instances** for better performance
- **Use specific URLs** rather than redirecting homepages
- **Analyze simpler sites first** to test functionality
- **Be patient** - complex sites take longer to analyze

---

**Enjoy exploring the web with Design Inspector!** 🔍✨
