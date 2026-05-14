'use client';

import React, { useState, useEffect } from 'react';

interface LeadCard {
  id: number;
  name: string;
  score: number;
  issues: string[];
}

const LEADS: LeadCard[] = [
  {
    id: 1,
    name: 'ABC Plumbing Co',
    score: 92,
    issues: ['NO WEBSITE'],
  },
  {
    id: 2,
    name: 'Quick Drain Services',
    score: 78,
    issues: ['Slow site'],
  },
  {
    id: 3,
    name: 'Expert Pipe Repairs',
    score: 65,
    issues: ['FB only', 'Slow site'],
  },
  {
    id: 4,
    name: 'Modern Plumbing Plus',
    score: 88,
    issues: [],
  },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return '#4ade80'; // green
  if (score >= 70) return '#facc15'; // amber
  return '#f87171'; // red
};

export default function LeadDiscoveryPreview() {
  const [displayedText, setDisplayedText] = useState('');
  const [visibleLeads, setVisibleLeads] = useState<number>(0);
  const [liveCount, setLiveCount] = useState(0);
  const [cycle, setCycle] = useState(0);

  const fullText = 'Plumbers · Austin, TX';

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((c) => c + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setVisibleLeads(0);
    setLiveCount(0);

    const typeTimer = setTimeout(() => {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index <= fullText.length) {
          setDisplayedText(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50);
      return () => clearInterval(typeInterval);
    }, 200);

    const cardTimer = setTimeout(() => {
      let cardCount = 0;
      const cardInterval = setInterval(() => {
        if (cardCount < LEADS.length) {
          setVisibleLeads(cardCount + 1);
          cardCount++;
        } else {
          clearInterval(cardInterval);
        }
      }, 150);
      return () => clearInterval(cardInterval);
    }, 1500);

    const countTimer = setTimeout(() => {
      let count = 0;
      const countInterval = setInterval(() => {
        if (count < 4324) {
          count += Math.floor(4324 / 30);
          setLiveCount(Math.min(count, 4324));
        } else {
          clearInterval(countInterval);
        }
      }, 50);
      return () => clearInterval(countInterval);
    }, 1500);

    return () => {
      clearTimeout(typeTimer);
      clearTimeout(cardTimer);
      clearTimeout(countTimer);
    };
  }, [cycle]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="border border-[#25252f] rounded-lg p-4 bg-[#0b0b0f]">
        <div className="flex items-center gap-3">
          <span className="text-[#888898]">🔍</span>
          <div className="flex-1">
            <div className="text-[#edeef2] font-medium h-6">
              {displayedText}
              <span className="animate-pulse">|</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scanning Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#888898]">Scanning leads</span>
          <span className="text-[#f0a020] font-semibold">{liveCount.toLocaleString()} live</span>
        </div>
        <div className="h-2 bg-[#25252f] rounded overflow-hidden">
          <div
            className="h-full bg-[#f0a020] animate-pulse"
            style={{
              width: '45%',
              animation: 'pulse 1.2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Lead Cards */}
      <div className="space-y-3">
        {LEADS.slice(0, visibleLeads).map((lead, index) => (
          <div
            key={lead.id}
            className="border border-[#25252f] rounded p-4 bg-[#0b0b0f] animate-fadeInUp"
            style={{
              animation: `fadeInUp 0.4s ease-out ${index * 100}ms both`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-[#edeef2]">{lead.name}</h4>
                <div className="flex gap-2 mt-2">
                  {lead.issues.map((issue) => (
                    <span
                      key={issue}
                      className="text-xs px-2 py-1 rounded bg-[#25252f] text-[#888898]"
                    >
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: getScoreColor(lead.score) }}
              >
                {lead.score}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
