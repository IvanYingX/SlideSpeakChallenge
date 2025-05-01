
interface RetryButtonProps {
  handleRetry: () => void;
}

const RetryButton: React.FC<RetryButtonProps> = ({ handleRetry }) => {
  return (
    <div className="mt-2 mb-2 text-center">
      <button
        onClick={handleRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Retry
      </button>
    </div>
  );
};

export default RetryButton;
