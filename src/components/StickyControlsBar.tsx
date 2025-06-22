import React from 'react';

interface StickyControlsBarProps {
  isRunning: boolean;
  canStep: boolean;
  canGoBack: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onBack: () => void;
  onReset: () => void;
}

const StickyControlsBar: React.FC<StickyControlsBarProps> = ({
  isRunning, canStep, canGoBack, onPlay, onPause, onStep, onBack, onReset
}) => (
  <div className="flex items-center justify-center space-x-2 py-2">
    <button onClick={onBack} disabled={!canGoBack} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">⏪</button>
    <button onClick={onStep} disabled={!canStep} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">⏩</button>
    {isRunning ? (
      <button onClick={onPause} className="px-3 py-1 rounded bg-yellow-300 hover:bg-yellow-400">⏸️</button>
    ) : (
      <button onClick={onPlay} disabled={!canStep} className="px-3 py-1 rounded bg-green-400 hover:bg-green-500 disabled:opacity-50">▶️</button>
    )}
    <button onClick={onReset} className="px-3 py-1 rounded bg-blue-200 hover:bg-blue-300">🔄</button>
  </div>
);

export default StickyControlsBar; 