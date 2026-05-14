'use client';

import React, { useState, useEffect } from 'react';

const SCRIPTS = [
  {
    step: 1,
    label: 'Opening',
    content: 'Hi [name], I noticed [your company] is in [industry]. Made sense to reach out. Got 30 seconds?',
  },
  {
    step: 2,
    label: 'Problem',
    content: 'Most companies like yours spend weeks on research. We help teams find qualified leads in minutes.',
  },
  {
    step: 3,
    label: 'Proof',
    content: 'Our customers see 3x more replies. Here's how it works — [brief demo]. Worth 15 minutes next week?',
  },
];

export default function ColdCallScriptsPreview() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCycle((c) => c + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setVisibleSteps([]);
    setShowCopyFeedback(false);

    SCRIPTS.forEach((_, idx) => {
      setTimeout(() => setVisibleSteps((v) => [...v, idx]), idx * 1600);
    });

    setTimeout(() => setShowCopyFeedback(true), 5500);
    setTimeout(() => setShowCopyFeedback(false), 6500);
  }, [cycle]);

  return (
    <div className="space-y-5">
      {/* Script Steps */}
      <div className="space-y-3">
        {SCRIPTS.map((script, idx) => {
          const isVisible = visibleSteps.includes(idx);
          return (
            <div
              key={script.step}
              className="rounded-lg overflow-hidden transition-all duration-500"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(-12px)',
              }}
            >
              <div className="flex gap-3 p-4 bg-[#0b0b0f] border border-[#25252f] hover:border-[#f0a020]/40 transition-colors">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full text-[#0b0b0f] font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: '#f0a020' }}
                >
                  {script.step}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#edeef2] font-semibold text-sm mb-1">{script.label}</h4>
                  <p className="text-[#888898] text-xs leading-relaxed">{script.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Copy Button */}
      <button
        className="w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300"
        style={{
          backgroundColor: showCopyFeedback ? '#22c55e' : '#f0a020',
          color: '#0b0b0f',
          transform: showCopyFeedback ? 'scale(0.98)' : 'scale(1)',
        }}
      >
        {showCopyFeedback ? '✓ Copied to clipboard' : 'Copy scripts'}
      </button>

      {/* Info text */}
      <p className="text-[#888898] text-xs text-center">
        Personalized scripts for every lead. Just fill in the [bracketed] details.
      </p>
    </div>
  );
}
