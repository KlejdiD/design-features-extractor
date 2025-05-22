"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!url) {
      setError("Please enter a website URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      setError("Please enter a valid URL (including http:// or https://)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to analyze website");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error analyzing website:", err);
      setError(err.message || "Failed to analyze website. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      analyze();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header / Title Section */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-lg px-8 py-6 rounded-b-3xl">
        {/* Website Title */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          🔎 Design Inspector
        </h1>

        {/* Input and Button */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <input
            className="flex-1 border-0 text-gray-800 bg-gray-50/50 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:bg-white/70 transition-all duration-300"
            placeholder="Enter website URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={analyze}
            className={`mt-3 sm:mt-0 px-8 py-4 rounded-2xl shadow-lg font-medium transition-all duration-300 transform hover:scale-105 ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
            }`}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm text-red-700 p-4 rounded-2xl mb-6 border border-red-100/50 shadow-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Page Title and Colors */}
        {data && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">
              🏷️ {data.title || "Untitled Page"}
            </h2>
            <div className="flex space-x-3">
              {data.colors.slice(0, 5).map((color, idx) => (
                <div
                  key={idx}
                  style={{ background: color.value }}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-lg transform hover:scale-110 transition-transform duration-200"
                  title={color.value}
                />
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      {!data && !loading && !error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-12 max-w-md bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl">
            <div className="text-7xl mb-6">🔍</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-4">
              Enter a URL to get started
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Design Inspector will analyze the website and extract its colors,
              fonts, and technologies.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg font-medium">
              Analyzing {url}...
            </p>
            <p className="text-gray-500 text-sm mt-3">
              This may take up to 15 seconds
            </p>
          </div>
        </div>
      )}

      {/* Main Grid (only show when data is available) */}
      {data && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden gap-6 p-6">
          {/* Analysis Panel */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 overflow-y-auto">
            <div className="space-y-10">
              {/* Colors */}
              <section>
                <h2 className="font-bold text-2xl mb-6 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent flex items-center">
                  <span className="mr-3">🎨</span> Colors
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.colors.length > 0 ? (
                    data.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div
                          style={{ background: color.value }}
                          className="w-10 h-10 rounded-2xl border-2 border-white shadow-lg"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-800">
                            {color.value}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Used {color.count} times
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2">
                      No colors detected
                    </p>
                  )}
                </div>
              </section>

              {/* Fonts */}
              <section>
                <h2 className="font-bold text-2xl mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent flex items-center">
                  <span className="mr-3">🔤</span> Fonts
                </h2>
                {data.fonts.length > 0 ? (
                  <ul className="space-y-6">
                    {data.fonts.map((font, idx) => (
                      <li
                        key={idx}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <div className="text-gray-600 text-sm font-medium mb-2">
                          {font}
                        </div>
                        <div
                          style={{ fontFamily: font }}
                          className="text-xl text-gray-800"
                        >
                          The quick brown fox jumps over the lazy dog
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No fonts detected</p>
                )}
              </section>

              {/* Technologies */}
              <section>
                <h2 className="font-bold text-2xl mb-6 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent flex items-center">
                  <span className="mr-3">🛠️</span> Technologies
                </h2>
                {data.technologies?.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {data.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100/50 rounded-full px-6 py-3 text-sm font-medium shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No technologies detected</p>
                )}
              </section>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden relative">
            {url && (
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gray-50/50 flex items-center justify-center">
                  <p className="text-gray-500 text-sm p-6 text-center bg-white/80 rounded-2xl backdrop-blur-sm">
                    Preview may not display properly due to cross-origin
                    restrictions.
                  </p>
                </div>
                <iframe
                  src={url}
                  className="w-full h-full relative z-10 rounded-3xl"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
