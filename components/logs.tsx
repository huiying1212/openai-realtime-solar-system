import React, { useState } from "react";
import { CodeXml, SidebarClose } from "lucide-react";

interface LogsProps {
  messages: any[];
}

const Logs: React.FC<LogsProps> = ({ messages }) => {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const toggleConsole = () => {
    setIsConsoleOpen(!isConsoleOpen);
  };

  return (
    <div className="absolute top-4 left-4">
      <div
        onClick={toggleConsole}
        className="cursor-pointer bg-white shadow-lg border border-gray-200 text-gray-700 rounded-full p-2.5 flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <CodeXml size={24} />
      </div>
      <div
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-2xl font-mono text-gray-800 transform ${
          isConsoleOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
        style={{ width: "350px" }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-800">系统日志</h2>
            <SidebarClose 
              onClick={toggleConsole} 
              className="cursor-pointer text-gray-500 hover:text-gray-700"
            />
          </div>
          <div className="h-[90vh] overflow-x-scroll overflow-y-scroll">
            <pre className="mt-4 text-xs text-gray-600">
              {messages.map((message, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded border">
                  <pre>{JSON.stringify(message, null, 2)}</pre>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
