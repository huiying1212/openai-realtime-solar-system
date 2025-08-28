"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
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
import "highlight.js/styles/github.css";

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
  type: "text" | "chart" | "diagram" | "list" | "images";
  chart?: {
    chartType: "bar" | "pie" | "line";
    data: { label: string; value: number }[];
  };
  items?: string[];
  images?: {
    url: string;
    description: string;
    chapter: string;
  }[];
  timestamp: number;
 // Add timestamp to track when slide was created
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
          images: args.images,
          timestamp: Date.now(),
        };
        
        // Add new slide to history
        setSlides(prevSlides => [...prevSlides, newContent]);
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

  // Auto-navigate to the latest slide when new content is added
  useEffect(() => {
    if (slides.length > 0) {
      setCurrentSlideIndex(slides.length - 1);
    }
  }, [slides.length]);

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
    const isHidden = slides.length === 0;

    return (
      <div className={`flex items-center justify-center space-x-2 bg-white rounded-lg shadow-md p-3 border mb-4 ${isHidden ? 'invisible' : ''}`}>
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

  // Enhanced highlighting function for better automatic highlighting
  const enhanceTextWithHighlights = (text: string) => {
    if (!text) return text;
    
    // If there's a specific highlighted text, use that
    if (highlightedText) {
      const parts = text.split(new RegExp(`(${highlightedText})`, 'gi'));
      return parts.map((part, index) => 
        part.toLowerCase() === highlightedText.toLowerCase() ? 
          <mark key={index} className="bg-yellow-300 px-1 rounded">{part}</mark> : 
          part
      );
    }

    return text;
  };

  // Detect if content is markdown
  const isMarkdownContent = (text: string) => {
    const markdownPatterns = [
      /#{1,6}\s+/,           // Headers
      /\*\*.*\*\*/,          // Bold
      /\*.*\*/,              // Italic
      /```[\s\S]*?```/,      // Code blocks
      /`[^`]+`/,             // Inline code
      /\[.*\]\(.*\)/,        // Links
      /^\s*[-*+]\s+/m,       // Unordered lists
      /^\s*\d+\.\s+/m,       // Ordered lists
      /^\s*>\s+/m,           // Blockquotes
      /\|.*\|/,              // Tables
    ];
    
    return markdownPatterns.some(pattern => pattern.test(text));
  };

  const renderImages = (images: any[]) => {
    if (!images || images.length === 0) return null;
    
    return (
      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.description}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><div class="text-center"><div class="text-2xl mb-2">🖼️</div><div class="text-sm">图片加载失败</div></div></div>';
                    }
                  }}
                />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-800 mb-1 line-clamp-2">
                  {image.description}
                </div>
                <div className="text-gray-500 text-xs">
                  来源：{image.chapter}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!content) {
      return (
        <div className="size-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <div className="text-xl">白板准备就绪</div>
            <div className="text-sm mt-2">等待内容显示...</div>
          </div>
        </div>
      );
    }

    if (content.type === "images") {
      return (
        <div className="size-full p-6 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{content.title}</h2>
            {content.content && (
              <div className="mt-3 text-gray-600 leading-relaxed">
                {content.content}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.images?.map((image, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.description}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><div class="text-center"><div class="text-2xl mb-2">🖼️</div><div class="text-sm">图片加载失败</div></div></div>';
                      }
                    }}
                  />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-800 mb-1 line-clamp-2">
                    {image.description}
                  </div>
                  <div className="text-gray-500 text-xs">
                    来源：{image.chapter}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (content.type === "chart") {
      return (
        <div className="size-full p-6 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{content.title}</h2>
            {content.content && (
              <div className="mt-3 text-gray-600 leading-relaxed">
                {content.content}
              </div>
            )}
          </div>
          <div className="mb-6">
            {renderChart(content.chart)}
          </div>
          {renderImages(content.images || [])}
        </div>
      );
    }

    if (content.type === "list") {
      return (
        <div className="size-full p-8 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">{content.title}</h2>
            {content.content && (
              <div className="mt-3 text-gray-600 leading-relaxed">
                {content.content}
              </div>
            )}
          </div>
          <div className="space-y-4 mb-6">
            {content.items?.map((item, index) => {
              const isHighlighted = highlightedText && item.toLowerCase().includes(highlightedText.toLowerCase());
              return (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    isHighlighted ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="text-lg leading-relaxed text-gray-700 flex-1">
                    {enhanceTextWithHighlights(item)}
                  </div>
                </div>
              );
            })}
          </div>
          {renderImages(content.images || [])}
        </div>
      );
    }

    return (
      <div className="size-full p-8 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{content.title}</h2>
        </div>
        <div className="text-lg leading-relaxed text-gray-700 mb-6">
          {isMarkdownContent(content.content) ? (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                // Custom components for better styling
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-4 border-b border-gray-300 pb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-gray-800 mt-5 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 italic text-gray-700 mb-4" {...props} />
                ),
                code: ({node, ...props}) => {
                  const { children, className } = props;
                  const isInline = !className || !className.includes('language-');
                  return isInline ? (
                    <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                  ) : (
                    <code className="block bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto" {...props} />
                  );
                },
                pre: ({node, ...props}) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
                ),
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border-collapse border border-gray-300" {...props} />
                  </div>
                ),
                th: ({node, ...props}) => (
                  <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold" {...props} />
                ),
                td: ({node, ...props}) => (
                  <td className="border border-gray-300 px-4 py-2" {...props} />
                ),
                a: ({node, ...props}) => (
                  <a className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                }}
              >
                {content.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {enhanceTextWithHighlights(content.content)}
            </div>
          )}
        </div>
        {renderImages(content.images || [])}
      </div>
    );
  };

  return (
    <div className="size-full bg-gray-50 flex flex-col items-center justify-center p-8">
      {renderNavigationControls()}
      <div className="w-[800px] h-[450px] bg-white border-2 border-gray-200 rounded-lg shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default Whiteboard; 