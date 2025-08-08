import React from "react";
import { Mic, MicOff, Wifi, WifiOff, RotateCcw } from "lucide-react";

interface ControlsProps {
  isConnected: boolean;
  isListening: boolean;
  connectionState?: string;
  isReconnecting?: boolean;
  handleConnectClick: () => void;
  handleMicToggleClick: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isConnected,
  isListening,
  connectionState,
  isReconnecting,
  handleConnectClick,
  handleMicToggleClick,
}) => {
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
    <div className="absolute top-4 right-4 flex items-center z-10">
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
  );
};

export default Controls;
