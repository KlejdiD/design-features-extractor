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
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header / Title Section */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
        {/* Website Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🔎 Design Inspector
        </h1>

        {/* Input and Button */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <input
            className="flex-1 border text-gray-800 border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter website URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={analyze}
            className={`mt-2 sm:mt-0 px-4 py-2 rounded shadow ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 border border-red-100">
            ⚠️ {error}
          </div>
        )}

        {/* Page Title and Colors */}
        {data && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
              🏷️ {data.title || "Untitled Page"}
            </h2>
            <div className="flex space-x-2">
              {data.colors.slice(0, 5).map((color, idx) => (
                <div
                  key={idx}
                  style={{ background: color.value }}
                  className="w-6 h-6 rounded-full border shadow"
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
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Enter a URL to get started
            </h2>
            <p className="text-gray-600">
              Design Inspector will analyze the website and extract its colors,
              fonts, and technologies.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing {url}...</p>
            <p className="text-gray-500 text-sm mt-2">
              This may take up to 15 seconds
            </p>
          </div>
        </div>
      )}

      {/* Main Grid (only show when data is available) */}
      {data && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
          {/* Analysis Panel */}
          <div className="p-6 overflow-y-auto">
            <div className="space-y-8">
              {/* Colors */}
              <section>
                <h2 className="font-bold text-xl mb-3 text-gray-700 flex items-center">
                  <span className="mr-2">🎨</span> Colors
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.colors.length > 0 ? (
                    data.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded shadow-sm hover:shadow transition-shadow"
                      >
                        <div
                          style={{ background: color.value }}
                          className="w-8 h-8 rounded border"
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
                <h2 className="font-bold text-xl mb-3 text-gray-700 flex items-center">
                  <span className="mr-2">🔤</span> Fonts
                </h2>
                {data.fonts.length > 0 ? (
                  <ul className="space-y-4">
                    {data.fonts.map((font, idx) => (
                      <li
                        key={idx}
                        className="bg-white border border-gray-200 rounded p-3 shadow-sm hover:shadow transition-shadow"
                      >
                        <div className="text-gray-600 text-sm font-medium">
                          {font}
                        </div>
                        <div
                          style={{ fontFamily: font }}
                          className="text-lg mt-1 text-gray-800"
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
                <h2 className="font-bold text-xl mb-3 text-gray-700 flex items-center">
                  <span className="mr-2">🛠️</span> Technologies
                </h2>
                {data.technologies?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-sm font-medium"
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
          <div className="border-t md:border-t-0 md:border-l border-gray-300 h-96 md:h-full relative">
            {url && (
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                  <p className="text-gray-500 text-sm p-4 text-center">
                    Preview may not display properly due to cross-origin
                    restrictions.
                  </p>
                </div>
                <iframe
                  src={url}
                  className="w-full h-full relative z-10"
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
