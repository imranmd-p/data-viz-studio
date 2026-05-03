import { useState } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

export default function App() {
  const [input, setInput] = useState("");
  const [numbers, setNumbers] = useState([]);
  const [chartType, setChartType] = useState("bar");

  // AI
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  // Files
  const [files, setFiles] = useState([]);

  // 🔹 Manual input
  const handleLoad = () => {
    const parsed = input
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((n, i) => ({
        name: `Item ${i + 1}`,
        value: Number(n),
      }))
      .filter((n) => !isNaN(n.value));

    setNumbers(parsed);
  };

  // 🔹 CSV Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFiles((prev) => [...prev, file]);

    const text = await file.text();

    const rows = text.split("\n").map((r) => r.split(","));

    const parsed = rows
      .slice(1)
      .map((row, i) => ({
        name: row[0] || `Item ${i + 1}`,
        value: Number(row[1]),
      }))
      .filter((r) => !isNaN(r.value));

    setNumbers(parsed);
  };

  // 🔥 UPDATED AI (Vercel backend)
  const handleAI = async () => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Analyze this data: ${JSON.stringify(numbers)}. Question: ${aiPrompt}`,
        }),
      });

      const result = await res.json();

      const output = result?.choices?.[0]?.message?.content || "No response";

      setAiResponse(output);
    } catch (err) {
      console.error(err);
      setAiResponse("AI error");
    }
  };

  const chartData = {
    labels: numbers.map((n) => n.name),
    datasets: [
      {
        label: "Values",
        data: numbers.map((n) => n.value),
        backgroundColor: [
          "#3b82f6",
          "#22c55e",
          "#f59e0b",
          "#ef4444",
          "#a855f7",
        ],
      },
    ],
  };

  return (
    <div className="flex h-screen bg-[#1e293b] text-gray-100">
      {/* LEFT ICON BAR */}
      <div className="w-14 bg-[#020617] flex flex-col items-center py-4 gap-6">
        <div className="text-lg font-bold">D</div>
        <div>📊</div>
        <div>📁</div>
      </div>

      {/* DATA PANEL */}
      <div className="w-72 bg-[#0f172a] border-r border-gray-700 p-4 flex flex-col">
        <h2 className="font-semibold mb-1">Data Fields</h2>
        <p className="text-xs text-gray-400 mb-3">Add data to begin</p>

        {/* INPUT */}
        <textarea
          className="bg-[#020617] border border-gray-700 rounded p-2 text-sm mb-2"
          placeholder="10 20 30"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={handleLoad}
          className="bg-blue-600 py-2 rounded hover:bg-blue-700"
        >
          Load Data
        </button>

        {/* FILE UPLOAD */}
        <div className="mt-4">
          <input type="file" accept=".csv" onChange={handleFileUpload} />

          <div className="mt-2 text-xs space-y-1">
            {files.map((f, i) => (
              <div key={i}>📄 {f.name}</div>
            ))}
          </div>
        </div>

        {/* FIELDS */}
        {numbers.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Fields</p>
            <div className="bg-[#1e293b] p-2 rounded text-sm">Values</div>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="bg-[#0f172a] border-b border-gray-700 px-6 py-3 flex justify-between">
          <h1 className="font-semibold">Untitled Visualization</h1>

          <div className="flex gap-2 text-sm">
            <button className="px-3 py-1 border border-gray-600 rounded">
              Clear
            </button>
            <button className="px-3 py-1 bg-blue-600 rounded">Save</button>
          </div>
        </div>

        {/* CONFIG */}
        <div className="p-4 bg-[#0f172a] border-b border-gray-700 space-y-3">
          {/* FILTER */}
          <div className="border-dashed border border-gray-600 p-3 rounded text-sm text-gray-400">
            Drop fields here (Filters)
          </div>

          {/* 🤖 AI */}
          <div className="flex gap-2">
            <input
              className="flex-1 bg-[#020617] border border-gray-700 rounded px-2 py-1 text-sm"
              placeholder="Ask AI about data..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button
              onClick={handleAI}
              className="bg-purple-600 px-3 py-1 rounded"
            >
              Ask
            </button>
          </div>

          {aiResponse && (
            <div className="text-sm text-purple-300 whitespace-pre-wrap">
              {aiResponse}
            </div>
          )}

          {/* CHART TYPES */}
          <div className="flex gap-2">
            {["bar", "line", "pie", "doughnut", "table"].map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-3 py-1 rounded text-sm ${
                  chartType === t
                    ? "bg-blue-600"
                    : "bg-[#1e293b] hover:bg-[#334155]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* CHART */}
        <div className="flex-1 flex items-center justify-center bg-[#1e293b]">
          {numbers.length > 0 ? (
            <div className="bg-[#0f172a] p-6 rounded shadow w-[600px]">
              {chartType === "bar" && <Bar data={chartData} />}
              {chartType === "line" && <Line data={chartData} />}
              {chartType === "pie" && <Pie data={chartData} />}
              {chartType === "doughnut" && <Doughnut data={chartData} />}

              {chartType === "table" && (
                <table className="w-full mt-4 text-sm">
                  <tbody>
                    {numbers.map((n, i) => (
                      <tr key={i}>
                        <td className="p-2 border border-gray-700">{n.name}</td>
                        <td className="p-2 border border-gray-700">
                          {n.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No data loaded</p>
          )}
        </div>

        {/* TABLE */}
        {numbers.length > 0 && (
          <div className="bg-[#0f172a] border-t border-gray-700 p-4 text-sm">
            <h3 className="font-semibold mb-2">Chart Data</h3>
            {numbers.map((n, i) => (
              <div key={i}>
                {n.name}: {n.value}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
