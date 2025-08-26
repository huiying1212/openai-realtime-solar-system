import React, { useState } from "react";
import { Mic, MicOff, Wifi, WifiOff, RotateCcw, Send } from "lucide-react";

interface ControlsProps {
  isConnected: boolean;
  isListening: boolean;
  connectionState?: string;
  isReconnecting?: boolean;
  handleConnectClick: () => void;
  handleMicToggleClick: () => void;
  handleSendText: (text: string) => void;
}

const Controls: React.FC<ControlsProps> = ({
  isConnected,
  isListening,
  connectionState,
  isReconnecting,
  handleConnectClick,
  handleMicToggleClick,
  handleSendText,
}) => {
  const [textInput, setTextInput] = useState("");

  const handleSendClick = () => {
    if (textInput.trim() && isConnected) {
      handleSendText(textInput.trim());
      setTextInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };
  const getConnectionIcon = () => {
    if (isReconnecting) {
      return <RotateCcw className="h-6 w-6 text-yellow-500 animate-spin" />;
    }
    if (isConnected) {
      return <Wifi className="h-6 w-6 text-green-500" />;
    }
    return <WifiOff className="h-6 w-6 text-red-500" />;
  };

  const getConnectionTitle = () => {
    if (isReconnecting) return "Reconnecting...";
    if (isConnected) return `Connected (${connectionState})`;
    return "Disconnected - Click to connect";
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col items-end z-10 space-y-2">
      <div className="flex items-center">
        <div
          className="flex bg-slate-800 p-2.5 items-center rounded-full mr-2 cursor-pointer hover:bg-slate-700 transition-colors"
          onClick={handleConnectClick}
          title={getConnectionTitle()}
        >
          {getConnectionIcon()}
        </div>
        <div
          className={`flex bg-slate-800 p-2.5 items-center rounded-full transition-colors ${
            isConnected ? "cursor-pointer hover:bg-slate-700" : "cursor-not-allowed opacity-50"
          }`}
          onClick={isConnected ? handleMicToggleClick : undefined}
          title={isConnected ? (isListening ? "Click to stop microphone" : "Click to start microphone") : "Connect first to use microphone"}
        >
          {isListening ? (
            <Mic className="h-6 w-6 text-green-500" />
          ) : (
            <MicOff className="h-6 w-6 text-red-500" />
          )}
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={!isConnected}
          className={`bg-slate-800 text-white px-3 py-2 rounded-l-lg border-none outline-none transition-colors ${
            isConnected ? "focus:bg-slate-700" : "opacity-50 cursor-not-allowed"
          }`}
          style={{ width: "200px" }}
        />
        <button
          onClick={handleSendClick}
          disabled={!isConnected || !textInput.trim()}
          className={`bg-slate-800 p-2.5 rounded-r-lg transition-colors ${
            isConnected && textInput.trim() 
              ? "cursor-pointer hover:bg-slate-700 text-green-500" 
              : "cursor-not-allowed opacity-50 text-gray-400"
          }`}
          title={isConnected ? "Send message" : "Connect first to send messages"}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Controls;
