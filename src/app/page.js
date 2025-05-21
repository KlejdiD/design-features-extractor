"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    const res = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header / Title Section */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
        {/* Your Website Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🔎 Design Inspector
        </h1>

        {/* Input and Button */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <input
            className="flex-1 border text-blue-400 border-gray-300 rounded px-3 py-2 shadow-sm"
            placeholder="Enter website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={analyze}
            className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Optional: Page Title and Colors */}
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

      {/* Main Grid */}
      <div className="grid grid-cols-2 flex-1 overflow-hidden">
        {/* Analysis Panel */}
        <div className="p-6 overflow-y-auto">
          {data && (
            <div className="space-y-8">
              {/* Colors */}
              <section>
                <h2 className="font-bold text-xl mb-3 text-gray-700">
                  🎨 Colors
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {data.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded shadow-sm"
                    >
                      <div
                        style={{ background: color.value }}
                        className="w-6 h-6 rounded border"
                      />
                      <span className="text-sm text-gray-800">
                        {color.value} ({color.count})
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Fonts */}
              <section>
                <h2 className="font-bold text-xl mb-3 text-gray-700">
                  🔤 Fonts
                </h2>
                <ul className="space-y-4">
                  {data.fonts.map((font, idx) => (
                    <li
                      key={idx}
                      className="bg-white border border-gray-200 rounded p-3 shadow-sm"
                    >
                      <div className="text-gray-600 text-sm">{font}</div>
                      <div
                        style={{ fontFamily: font }}
                        className="text-base mt-1 text-gray-800"
                      >
                        Hello World
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Technologies */}
              {data.technologies?.length > 0 && (
                <section>
                  <h2 className="font-bold text-xl mb-3 text-gray-700">
                    🛠️ Technologies
                  </h2>
                  <ul className="space-y-2">
                    {data.technologies.map((tech, idx) => (
                      <li
                        key={idx}
                        className="bg-white border border-gray-200 rounded px-3 py-2 shadow-sm text-sm text-gray-800"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="border-l border-gray-300 h-full">
          {url && (
            <iframe
              src={url}
              className="w-full h-full"
              sandbox="allow-same-origin allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
}
