'use client';

import React, { useState, useEffect } from 'react';

const STATS = [
  { label: 'Fit Score', final: 92, unit: '' },
  { label: 'Issues Found', final: 3, unit: '' },
  { label: 'Est. Deal Value', final: 45000, unit: '$' },
];

const ISSUES = [
  { text: 'No website', type: 'critical', color: '#f87171' },
  { text: 'Slow site', type: 'warning', color: '#facc15' },
  { text: 'FB only', type: 'warning', color: '#facc15' },
  { text: 'Small team', type: 'info', color: '#60a5fa' },
  { text: 'Limited budget', type: 'info', color: '#60a5fa' },
  { text: 'Seasonal business', type: 'info', color: '#60a5fa' },
];

function easeOutQuart(t: number): number {
  const f = t - 1;
  return 1 - f * f * f * f;
}

export default function LeadScoringPreview() {
  const [displayedStats, setDisplayedStats] = useState([0, 0, 0]);
  const [progressWidth, setProgressWidth] = useState(0);
  const [visibleIssues, setVisibleIssues] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((c) => c + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplayedStats([0, 0, 0]);
    setProgressWidth(0);
    setVisibleIssues(0);

    // Count up stats
    const startTime = Date.now();
    const duration = 1500;

    const countInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);

      const newStats = STATS.map((stat) => Math.floor(stat.final * eased));
      setDisplayedStats(newStats);
      setProgressWidth(eased * 100);

      if (progress >= 1) {
        clearInterval(countInterval);
      }
    }, 30);

    // Stagger issues
    const issueTimer = setTimeout(() => {
      let issueCount = 0;
      const issueInterval = setInterval(() => {
        if (issueCount < ISSUES.length) {
          setVisibleIssues(issueCount + 1);
          issueCount++;
        } else {
          clearInterval(issueInterval);
        }
      }, 120);
      return () => clearInterval(issueInterval);
    }, 2000);

    return () => {
      clearInterval(countInterval);
      clearTimeout(issueTimer);
    };
  }, [cycle]);

  const formatValue = (stat: typeof STATS[0], value: number) => {
    if (stat.unit === '$') {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map((stat, index) => (
          <div key={stat.label} className="border border-[#25252f] rounded p-4 bg-[#0b0b0f]">
            <div className="text-xs text-[#888898] mb-2">{stat.label}</div>
            <div className="text-3xl font-bold text-[#f0a020]">
              {formatValue(stat, displayedStats[index])}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#888898]">Overall fit</span>
          <span className="text-[#f0a020] font-semibold">{Math.round(progressWidth)}%</span>
        </div>
        <div className="h-3 bg-[#25252f] rounded overflow-hidden">
          <div
            className="h-full rounded transition-all"
            style={{
              width: `${progressWidth}%`,
              background: 'linear-gradient(90deg, #60a5fa 0%, #f0a020 100%)',
              transition: 'width 30ms linear',
            }}
          />
        </div>
      </div>

      {/* Issue Tags */}
      <div>
        <h4 className="text-xs text-[#888898] mb-3 font-semibold">Issues detected</h4>
        <div className="flex flex-wrap gap-2">
          {ISSUES.slice(0, visibleIssues).map((issue, index) => (
            <div
              key={issue.text}
              className="px-3 py-1 rounded text-xs font-medium animate-popIn"
              style={{
                backgroundColor: `${issue.color}15`,
                color: issue.color,
                border: `1px solid ${issue.color}40`,
                animation: `popIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms both`,
              }}
            >
              {issue.text}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
