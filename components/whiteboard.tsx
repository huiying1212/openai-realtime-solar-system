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
  timestamp?: number; // Add timestamp to track when slide was created
}

const Whiteboard: React.FC<WhiteboardProps> = ({ toolCall }) => {
  const [slides, setSlides] = useState<WhiteboardContent[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(-1);
  const [highlightedText, setHighlightedText] = useState<string>("");

  // Get current content based on slide index
  const content = currentSlideIndex >= 0 && currentSlideIndex < slides.length 
    ? slides[currentSlideIndex] 
    : null;

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
        const newContent: WhiteboardContent = {
          title: args.title || "",
          content: args.content || "",
          type: args.type || "text",
          chart: args.chart,
          items: args.items,
          timestamp: Date.now(),
        };
        
        // Add new slide to history and set as current
        setSlides(prevSlides => {
          const newSlides = [...prevSlides, newContent];
          setCurrentSlideIndex(newSlides.length - 1); // Set to the index of the new slide
          return newSlides;
        });
        break;

      case "clear_whiteboard":
        console.log("Clearing whiteboard");
        setSlides([]);
        setCurrentSlideIndex(-1);
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

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (slides.length <= 1) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePreviousSlide();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextSlide();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlideIndex, slides.length]);

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handleSlideSelect = (index: number) => {
    setCurrentSlideIndex(index);
  };

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

  const renderNavigationControls = () => {
    if (slides.length <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 bg-white rounded-lg shadow-md p-3 border mb-4">
        <button
          onClick={handlePreviousSlide}
          disabled={currentSlideIndex <= 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
          title="Previous slide"
        >
          ‹ Previous
        </button>
        
        <select
          value={currentSlideIndex}
          onChange={(e) => handleSlideSelect(Number(e.target.value))}
          className="px-3 py-2 border rounded text-sm min-w-[200px]"
        >
          {slides.map((slide, index) => (
            <option key={index} value={index}>
              {index + 1}. {slide.title.substring(0, 30)}{slide.title.length > 30 ? '...' : ''}
            </option>
          ))}
        </select>
        
        <button
          onClick={handleNextSlide}
          disabled={currentSlideIndex >= slides.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
          title="Next slide"
        >
          Next ›
        </button>
        
        <div className="text-sm text-gray-600 ml-4 font-medium">
          {currentSlideIndex + 1} / {slides.length}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!content) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xl">
          <div className="mb-4">智能白板 - 等待内容展示</div>
          <button 
            onClick={() => {
              const testContent: WhiteboardContent = {
                title: "测试内容",
                content: "这是一个测试内容，用于验证白板功能是否正常工作。",
                type: "text",
                timestamp: Date.now(),
              };
              setSlides([testContent]);
              setCurrentSlideIndex(0);
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
    <div className="size-full bg-gray-50 flex flex-col items-center justify-center p-8">
      {renderNavigationControls()}
      <div className="w-[800px] h-[600px] bg-white border-2 border-gray-200 rounded-lg shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default Whiteboard; 