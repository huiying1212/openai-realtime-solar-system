import React, { useEffect, useState } from "react";
import { getComponent } from "@/lib/components-mapping";

interface ToolCall {
  name: string;
  arguments: any;
}

interface WhiteboardProps {
  toolCall: ToolCall;
  transcriptions: Array<{
    id: string;
    text: string;
    timestamp: number;
    status: 'completed' | 'failed';
  }>;
  currentTranscription: string;
}

interface ContentItem {
  id: string;
  type: "title" | "subtitle" | "bullet" | "paragraph" | "highlight" | "section";
  title?: string;
  content: string;
  timestamp: number;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ 
  toolCall, 
  transcriptions, 
  currentTranscription 
}) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [displayComponent, setDisplayComponent] = useState<React.ReactNode | null>(null);
  const [currentSection, setCurrentSection] = useState<string>("");

  // Handle tool calls
  useEffect(() => {
    if (!toolCall) return;

    console.log("Received toolCall:", toolCall);
    console.log("Arguments type:", typeof toolCall.arguments);
    console.log("Arguments value:", toolCall.arguments);

    const { name, arguments: toolArgs } = toolCall;
    let args: any = {};
    
    try {
      // Check if toolArgs is already an object or a string that needs parsing
      if (typeof toolArgs === 'string') {
        args = JSON.parse(toolArgs);
      } else if (typeof toolArgs === 'object' && toolArgs !== null) {
        args = toolArgs;
      } else {
        console.error("Invalid toolCall arguments format:", toolArgs);
        return;
      }
    } catch (error) {
      console.error("Failed to parse toolCall arguments:", error, "Raw arguments:", toolArgs);
      return;
    }

    switch (name) {
      case "add_content":
        addContent(args);
        break;
      
      case "display_data":
        displayData();
        break;
      
      case "clear_whiteboard":
        clearWhiteboard();
        break;
      
      case "create_section":
        createSection(args.section_title);
        break;
      
      default:
        break;
    }
  }, [toolCall]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Clear whiteboard with Ctrl+K or Cmd+K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        clearWhiteboard();
      }
      // Clear chart overlay with Escape
      if (event.key === 'Escape') {
        setDisplayComponent(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addContent = (args: any) => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      type: args.type,
      title: args.title,
      content: args.content,
      timestamp: Date.now(),
    };
    
    setContentItems(prev => [...prev, newItem]);
  };

  const displayData = () => {
    try {
      let chartData;
      // Check if toolCall.arguments is already an object or a string that needs parsing
      if (typeof toolCall.arguments === 'string') {
        chartData = JSON.parse(toolCall.arguments);
      } else if (typeof toolCall.arguments === 'object' && toolCall.arguments !== null) {
        chartData = toolCall.arguments;
      } else {
        console.error("Invalid chart data format:", toolCall.arguments);
        return;
      }
      
      const { chart, title, text, data } = chartData;
      const component = getComponent({ chart, title, text, data });
      setDisplayComponent(component || null);
    } catch (error) {
      console.error("Failed to parse chart data:", error, "Raw arguments:", toolCall.arguments);
    }
  };

  const clearWhiteboard = () => {
    setContentItems([]);
    setDisplayComponent(null);
    setCurrentSection("");
  };

  const createSection = (sectionTitle: string) => {
    setCurrentSection(sectionTitle);
    const sectionItem: ContentItem = {
      id: Date.now().toString(),
      type: "section",
      content: sectionTitle,
      timestamp: Date.now(),
    };
    setContentItems(prev => [...prev, sectionItem]);
  };

  const renderContentItem = (item: ContentItem) => {
    const baseClasses = "mb-4 transition-all duration-300 ease-in-out";
    
    switch (item.type) {
      case "title":
        return (
          <div key={item.id} className={`${baseClasses} border-b border-gray-300 pb-2`}>
            <h1 className="text-3xl font-bold text-gray-800">{item.content}</h1>
          </div>
        );
      
      case "subtitle":
        return (
          <div key={item.id} className={baseClasses}>
            <h2 className="text-2xl font-semibold text-gray-700">{item.content}</h2>
          </div>
        );
      
      case "bullet":
        return (
          <div key={item.id} className={baseClasses}>
            <div className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">•</span>
              <p className="text-lg text-gray-700">{item.content}</p>
            </div>
          </div>
        );
      
      case "paragraph":
        return (
          <div key={item.id} className={baseClasses}>
            <p className="text-base text-gray-700 leading-relaxed">{item.content}</p>
          </div>
        );
      
      case "highlight":
        return (
          <div key={item.id} className={baseClasses}>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-lg font-medium text-gray-800">{item.content}</p>
            </div>
          </div>
        );
      
      case "section":
        return (
          <div key={item.id} className={`${baseClasses} mt-8 mb-6`}>
            <div className="bg-blue-500 text-white p-4 rounded-lg">
              <h2 className="text-2xl font-bold">{item.content}</h2>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="size-full bg-white relative overflow-hidden flex">
      {/* Main whiteboard area - 左侧 */}
      <div className="flex-1 h-full overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Current section indicator */}
          {currentSection && (
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 mb-6 pb-2">
              <h3 className="text-lg font-medium text-blue-600">{currentSection}</h3>
            </div>
          )}
          
          {/* Content items */}
          <div className="space-y-2">
            {contentItems.map(renderContentItem)}
          </div>
          
          {/* Empty state */}
          {contentItems.length === 0 && (
            <div className="flex items-center justify-center h-96 text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl">开始讲课，内容将实时显示在这里</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Speech Recognition Panel - 右侧 */}
      <div className="w-80 h-full bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
        <div className="sticky top-0 bg-gray-50 pb-3 mb-4 border-b border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🎤 语音识别
          </h3>
        </div>
        
        {/* Current transcription status */}
        {currentTranscription && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">实时识别中</span>
            </div>
            <p className="text-blue-800 text-sm italic">{currentTranscription}</p>
          </div>
        )}
        
        {/* Transcription history */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-600 mb-3">识别历史</h4>
          
          {transcriptions.length === 0 && !currentTranscription && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🔇</div>
              <p className="text-sm">等待语音输入...</p>
            </div>
          )}
          
          {transcriptions.map((transcription) => (
            <div 
              key={transcription.id} 
              className={`p-3 rounded-lg border ${
                transcription.status === 'completed' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-medium ${
                  transcription.status === 'completed' 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {transcription.status === 'completed' ? '✓ 识别成功' : '✗ 识别失败'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(transcription.timestamp)}
                </span>
              </div>
              <p className={`text-sm ${
                transcription.status === 'completed' 
                  ? 'text-gray-800' 
                  : 'text-red-600'
              }`}>
                {transcription.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chart overlay */}
      {displayComponent && (
        <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 max-w-md z-10">
          {displayComponent}
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 left-4 bg-gray-100/90 backdrop-blur-sm p-3 rounded-lg text-xs text-gray-600">
        <div className="font-medium mb-1">快捷键：</div>
        <div>Ctrl+K / Cmd+K: 清空白板</div>
        <div>Esc: 关闭图表</div>
      </div>
    </div>
  );
};

export default Whiteboard; 