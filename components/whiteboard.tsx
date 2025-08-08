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

  const renderContent = () => {
    if (!content) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xl">
          <div className="mb-4">智能白板 - 等待内容展示</div>
          <button 
            onClick={() => {
              const testContent: WhiteboardContent = {
                title: "# 智能白板功能演示",
                content: `## 欢迎使用增强版智能白板！

**重要提示：** 此版本支持 Markdown 格式和自动高亮功能。

### 主要特性

1. **Markdown 支持**
   - 支持标题、列表、代码块
   - 支持 *斜体* 和 **粗体** 文本
   - 支持 \`内联代码\` 和代码块

2. **自动高亮**
   - 重要关键词会自动高亮显示
   - 支持中英文关键词识别

### 代码示例

\`\`\`javascript
function highlightText(text) {
  return text.replace(/important/gi, '<mark>$&</mark>');
}
\`\`\`

### 表格支持

| 功能 | 状态 | 描述 |
|------|------|------|
| Markdown | ✅ | 完全支持 |
| 高亮 | ✅ | 自动识别 |
| 图表 | ✅ | Chart.js |

> **注意：** 这是一个引用块，用于重要信息提示。

**总结：** 新版本白板提供了更好的内容展示效果和更清晰的格式化支持。`,
                type: "text",
                timestamp: Date.now(),
              };
              setSlides([testContent]);
              setCurrentSlideIndex(0);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            测试增强版白板功能
          </button>
        </div>
      );
    }

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

      // Auto-highlight common patterns
      let processedText = text;
      
      // Highlight important keywords and patterns
      const patterns = [
        { regex: /\b(重要|Important|关键|Key|核心|Core|注意|Note|提示|Tip)\b/gi, className: "bg-orange-200 text-orange-800 px-1 rounded font-medium" },
        { regex: /\b(总结|Summary|结论|Conclusion|要点|Main Points)\b/gi, className: "bg-blue-200 text-blue-800 px-1 rounded font-medium" },
        { regex: /\b(步骤|Steps|方法|Method|流程|Process|过程|Procedure)\b/gi, className: "bg-green-200 text-green-800 px-1 rounded font-medium" },
        { regex: /\b(公式|Formula|计算|Calculation|算法|Algorithm)\b/gi, className: "bg-purple-200 text-purple-800 px-1 rounded font-medium" },
        { regex: /\b(问题|Problem|困难|Difficulty|挑战|Challenge|错误|Error)\b/gi, className: "bg-red-200 text-red-800 px-1 rounded font-medium" },
        { regex: /\b(解决方案|Solution|答案|Answer|结果|Result)\b/gi, className: "bg-teal-200 text-teal-800 px-1 rounded font-medium" },
      ];

      // Apply highlights for specific patterns
      const highlightedParts = [];
      let lastIndex = 0;
      
      patterns.forEach(pattern => {
        const matches = [...text.matchAll(pattern.regex)];
        matches.forEach(match => {
          if (match.index !== undefined) {
            // Add text before match
            if (match.index > lastIndex) {
              highlightedParts.push({
                text: text.slice(lastIndex, match.index),
                isHighlight: false,
                className: ""
              });
            }
            
            // Add highlighted match
            highlightedParts.push({
              text: match[0],
              isHighlight: true,
              className: pattern.className
            });
            
            lastIndex = match.index + match[0].length;
          }
        });
      });
      
      // Add remaining text
      if (lastIndex < text.length) {
        highlightedParts.push({
          text: text.slice(lastIndex),
          isHighlight: false,
          className: ""
        });
      }
      
      // If no patterns matched, return original text
      if (highlightedParts.length === 0) {
        return text;
      }
      
      // Merge overlapping or adjacent highlights
      const mergedParts: (string | React.ReactElement)[] = [];
      highlightedParts.sort((a, b) => text.indexOf(a.text) - text.indexOf(b.text));
      
      highlightedParts.forEach((part, index) => {
        if (part.isHighlight) {
          mergedParts.push(
            <span key={`highlight-${index}`} className={part.className}>
              {part.text}
            </span>
          );
        } else {
          mergedParts.push(part.text);
        }
      });
      
      return mergedParts.length > 1 ? mergedParts : text;
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

    return (
      <div className="p-6 h-full overflow-auto">
        {/* Enhanced title rendering with markdown support */}
        <div className="mb-6 border-b-2 border-blue-500 pb-2">
          {isMarkdownContent(content.title) ? (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-800 m-0" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-800 m-0" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-800 m-0" {...props} />,
                }}
              >
                {content.title}
              </ReactMarkdown>
            </div>
          ) : (
            <h1 className="text-3xl font-bold text-gray-800">
              {enhanceTextWithHighlights(content.title)}
            </h1>
          )}
        </div>

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
                  {isMarkdownContent(item) ? (
                    <span className="prose max-w-none inline">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          p: ({node, ...props}) => <span {...props} />,
                        }}
                      >
                        {item}
                      </ReactMarkdown>
                    </span>
                  ) : (
                    enhanceTextWithHighlights(item)
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Enhanced content rendering with markdown support */}
        <div className="text-lg leading-relaxed text-gray-700">
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