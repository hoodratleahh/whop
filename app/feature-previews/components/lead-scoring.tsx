'use client';

import React, { useState, useEffect } from 'react';

const STATS = [
  { label: 'Fit Score', final: 82, color: '#22c55e' },
  { label: 'Issues Found', final: 3, color: '#f59e0b' },
  { label: 'Est. Value', final: 45000, color: '#f0a020', format: '$' },
];

const ISSUES = [
  { name: 'No website', severity: 'critical' },
  { name: 'Slow site', severity: 'warning' },
  { name: 'LinkedIn only', severity: 'warning' },
  { name: 'Small team', severity: 'info' },
  { name: '2yr in business', severity: 'info' },
  { name: 'Seasonal peak', severity: 'info' },
];

function easeOutQuart(t: number) {
  const f = t - 1;
  return 1 - f * f * f * f;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return { bg: '#ef444415', border: '#ef444460', text: '#ef4444' };
    case 'warning':
      return { bg: '#f59e0b15', border: '#f59e0b60', text: '#f59e0b' };
    case 'info':
    default:
      return { bg: '#60a5fa15', border: '#60a5fa60', text: '#60a5fa' };
  }
};

export default function LeadScoringPreview() {
  const [displayedStats, setDisplayedStats] = useState([0, 0, 0]);
  const [progressWidth, setProgressWidth] = useState(0);
  const [visibleIssues, setVisibleIssues] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCycle((c) => c + 1), 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplayedStats([0, 0, 0]);
    setProgressWidth(0);
    setVisibleIssues(0);

    // Count up stats
    const startTime = Date.now();
    const duration = 1800;

    const countInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);

      setDisplayedStats([
        Math.floor(STATS[0].final * eased),
        Math.floor(STATS[1].final * eased),
        Math.floor(STATS[2].final * eased),
      ]);
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
      }, 140);
      return () => clearInterval(issueInterval);
    }, 2200);

    return () => {
      clearInterval(countInterval);
      clearTimeout(issueTimer);
    };
  }, [cycle]);

  const formatValue = (idx: number, val: number) => {
    if (STATS[idx].format === '$') {
      return `$${(val / 1000).toFixed(1)}k`;
    }
    return val.toString();
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map((stat, idx) => (
          <div
            key={stat.label}
            className="border rounded-lg p-4 transition-all duration-300"
            style={{
              borderColor: displayedStats[idx] > 0 ? `${stat.color}40` : '#25252f',
              background: displayedStats[idx] > 0 ? `${stat.color}08` : '#0b0b0f',
            }}
          >
            <div className="text-[#888898] text-xs mb-1">{stat.label}</div>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {formatValue(idx, displayedStats[idx])}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar with Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#888898]">Quality assessment</span>
          <span className="font-semibold" style={{ color: '#22c55e' }}>
            {displayedStats[0]}% qualified
          </span>
        </div>
        <div className="h-2 bg-[#25252f] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-30"
            style={{
              width: `${progressWidth}%`,
              background: 'linear-gradient(90deg, #60a5fa, #f0a020, #22c55e)',
            }}
          />
        </div>
      </div>

      {/* Issues Grid */}
      <div>
        <h4 className="text-xs text-[#888898] mb-3 font-semibold uppercase tracking-wider">
          Issues & notes
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {ISSUES.slice(0, visibleIssues).map((issue, idx) => {
            const colors = getSeverityColor(issue.severity);
            return (
              <div
                key={issue.name}
                className="rounded px-3 py-2 text-xs font-medium border transition-all duration-300"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  opacity: visibleIssues > idx ? 1 : 0,
                  transform: visibleIssues > idx ? 'scale(1)' : 'scale(0.9)',
                }}
              >
                {issue.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
