import React, { useEffect, useState } from "react";
import { getComponent } from "@/lib/components-mapping";

interface ToolCall {
  name: string;
  arguments: any;
}

interface WhiteboardProps {
  toolCall: ToolCall;
}

interface ContentItem {
  id: string;
  type: "title" | "subtitle" | "bullet" | "paragraph" | "highlight" | "section";
  title?: string;
  content: string;
  timestamp: number;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ toolCall }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [displayComponent, setDisplayComponent] = useState<React.ReactNode | null>(null);
  const [currentSection, setCurrentSection] = useState<string>("");

  // Handle tool calls
  useEffect(() => {
    if (!toolCall) return;

    const { name, arguments: toolArgs } = toolCall;
    let args: any = {};
    
    try {
      args = JSON.parse(toolArgs);
    } catch (error) {
      console.error("Failed to parse toolCall arguments:", error);
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
      const { chart, title, text, data } = JSON.parse(toolCall.arguments);
      const component = getComponent({ chart, title, text, data });
      setDisplayComponent(component || null);
    } catch (error) {
      console.error("Failed to parse chart data:", error);
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

  return (
    <div className="size-full bg-white relative overflow-hidden">
      {/* Main whiteboard area */}
      <div className="h-full overflow-y-auto p-8">
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
      
      {/* Chart overlay */}
      {displayComponent && (
        <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 max-w-md">
          {displayComponent}
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 left-4 bg-gray-100/90 backdrop-blur-sm p-3 rounded-lg text-xs text-gray-600">
        <div className="font-medium mb-1">快捷键：</div>
        <div>Ctrl+K: 清空白板</div>
        <div>Esc: 关闭图表</div>
      </div>
    </div>
  );
};

export default Whiteboard; 