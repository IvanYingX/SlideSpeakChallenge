import React from 'react';
import ResetButton from './ResetButton';
import RetryButton from './RetryButton';
interface ProgressBarProps {
  progress: number; // 0 to 1
  status: string;
  isConnected: boolean;
  message: string | null;
  handleReset: () => void;
  handleRetry: () => void;
  handleReconnect: () => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  isConnected,
  message,
  handleReset,
  handleRetry,
  handleReconnect,
}) => {
  const normalizedProgress = Math.min(Math.max(progress || 0, 0), 1);
  const percent = Math.round(normalizedProgress * 100);

  // Map status to display text and styles
  const statusConfig = {
    processing: {
      label: 'Processing Document',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    analyzing: {
      label: 'Analyzing Content',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700',
    },
    complete: {
      label: 'Analysis Complete',
      color: 'bg-green-500',
      textColor: 'text-green-700',
    },
    error: {
      label: 'Processing Error',
      color: 'bg-red-500',
      textColor: 'text-red-700',
    },
  };

  // Default to processing if status is not recognized
  const currentStatus =
    statusConfig[status as keyof typeof statusConfig] ||
    statusConfig.processing;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Connection status indicator */}
      <div className="flex items-center mb-2">
        <div
          className={`w-2 h-2 rounded-full mr-2 ${
            isConnected 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-gray-500">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Status label */}
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-medium ${currentStatus.textColor}`}>
          {currentStatus.label}
        </span>
        <span className="text-sm font-medium text-gray-700">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      {!isConnected && status !== 'complete' && status !== 'error' && (
        <div className="text-center mb-3">
          <button
            onClick={handleReconnect}
            className="text-sm text-blue-600 hover:underline"
          >
            Reconnect to live updates
          </button>
        </div>
      )}
        <div
          className={`h-2.5 rounded-full ${currentStatus.color} transition-all duration-300 ease-in-out`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Status message */}
      {status === 'processing' && (
        <div className="text-center text-xs text-gray-500">
          <p>Extracting text from your document...</p>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="text-center text-xs text-gray-500">
          <p>AI is analyzing your content for key insights...</p>
        </div>
      )}

      {status === 'complete' && (
        <div className="text-center text-xs text-gray-600">
          <p>Your document has been fully analyzed!</p>
        </div>
      )}

      {status === 'error' && (
        <>
          <div className="text-center text-xs text-red-500">
            <p>{message ?? "There was an error processing your document. Please try again."}</p>
          </div>
          <RetryButton handleRetry={handleRetry} />
          <div className="text-center text-xs text-gray-500">
            or
          </div>
          <ResetButton handleReset={handleReset} />
        </>
      )}
    </div>
  );
};

export default ProgressBar;
