"use client";

import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ToolCall {
  name: string;
  arguments: any;
}

interface WhiteboardProps {
  toolCall: ToolCall | null;
}

interface WhiteboardContent {
  title: string;
  content: string;
  type: "text" | "chart" | "diagram" | "list";
  chart?: {
    chartType: "bar" | "pie" | "line";
    data: Array<{ label: string; value: number }>;
  };
  items?: string[];
  highlightedText?: string;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ toolCall }) => {
  const [content, setContent] = useState<WhiteboardContent | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>("");

  useEffect(() => {
    if (!toolCall) return;

    console.log("Whiteboard received toolCall:", toolCall);

    const { name, arguments: toolArgs } = toolCall;
    let args: any = {};
    
    try {
      args = JSON.parse(toolArgs);
      console.log("Parsed arguments:", args);
    } catch (error) {
      console.error("Failed to parse toolCall arguments:", error);
      return;
    }

    switch (name) {
      case "display_content":
        console.log("Displaying content on whiteboard:", args);
        setContent({
          title: args.title || "",
          content: args.content || "",
          type: args.type || "text",
          chart: args.chart,
          items: args.items,
        });
        break;

      case "clear_whiteboard":
        console.log("Clearing whiteboard");
        setContent(null);
        setHighlightedText("");
        break;

      case "highlight_text":
        console.log("Highlighting text:", args.text);
        setHighlightedText(args.text || "");
        break;

      default:
        console.log("Unknown tool call:", name);
        break;
    }
  }, [toolCall]);

  const renderChart = (chartData: any) => {
    if (!chartData || !chartData.data) return null;

    const data = {
      labels: chartData.data.map((item: any) => item.label),
      datasets: [
        {
          data: chartData.data.map((item: any) => item.value),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
          borderColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            color: "#333",
          },
        },
        title: {
          display: false,
        },
      },
      scales: chartData.chartType !== "pie" ? {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#333",
          },
        },
        x: {
          ticks: {
            color: "#333",
          },
        },
      } : {},
    };

    switch (chartData.chartType) {
      case "bar":
        return <Bar data={data} options={options} />;
      case "pie":
        return <Pie data={data} options={options} />;
      case "line":
        return <Line data={data} options={options} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (!content) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xl">
          <div className="mb-4">智能白板 - 等待内容展示</div>
          <button 
            onClick={() => {
              setContent({
                title: "测试内容",
                content: "这是一个测试内容，用于验证白板功能是否正常工作。",
                type: "text"
              });
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            测试白板功能
          </button>
        </div>
      );
    }

    const highlightContent = (text: string) => {
      if (!highlightedText) return text;
      
      const parts = text.split(new RegExp(`(${highlightedText})`, 'gi'));
      return parts.map((part, index) => 
        part.toLowerCase() === highlightedText.toLowerCase() ? 
          <mark key={index} className="bg-yellow-300 px-1 rounded">{part}</mark> : 
          part
      );
    };

    return (
      <div className="p-6 h-full overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-blue-500 pb-2">
          {highlightContent(content.title)}
        </h1>

        {content.type === "chart" && content.chart && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border max-w-2xl">
            {renderChart(content.chart)}
          </div>
        )}

        {content.type === "list" && content.items && (
          <div className="mb-6">
            <ul className="list-disc list-inside space-y-2 text-lg">
              {content.items.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {highlightContent(item)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
          {highlightContent(content.content)}
        </div>
      </div>
    );
  };

  return (
    <div className="size-full bg-white border-2 border-gray-200 rounded-lg shadow-lg">
      {renderContent()}
    </div>
  );
};

export default Whiteboard; 