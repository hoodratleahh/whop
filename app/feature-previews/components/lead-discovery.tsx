'use client';

import React, { useState, useEffect } from 'react';

const LEADS = [
  { id: 1, name: 'ABC Plumbing', location: 'Austin, TX', score: 92, badge: 'PRIORITY' },
  { id: 2, name: 'Quick Drain', location: 'Austin, TX', score: 78, badge: 'QUALIFIED' },
  { id: 3, name: 'Expert Repairs', location: 'Austin, TX', score: 65, badge: 'WARM' },
  { id: 4, name: 'Modern Plumb Co', location: 'Austin, TX', score: 88, badge: 'HOT' },
];

const getScoreColor = (score: number) => {
  if (score >= 85) return { bg: '#22c55e15', border: '#22c55e60', text: '#22c55e' };
  if (score >= 70) return { bg: '#f59e0b15', border: '#f59e0b60', text: '#f59e0b' };
  return { bg: '#ef444415', border: '#ef444460', text: '#ef4444' };
};

export default function LeadDiscoveryPreview() {
  const [visibleLeads, setVisibleLeads] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCycle((c) => c + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setVisibleLeads(0);
    const timer = setTimeout(() => {
      LEADS.forEach((_, i) => {
        setTimeout(() => setVisibleLeads((v) => v + 1), i * 200);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [cycle]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#f0a020]/5 to-transparent rounded-lg pointer-events-none" />
        <div className="border border-[#25252f] rounded-lg px-4 py-3 bg-[#0b0b0f] flex items-center gap-3">
          <span className="text-[#888898]">🔍</span>
          <input
            type="text"
            placeholder="Plumbers · Austin, TX"
            className="flex-1 bg-transparent text-[#edeef2] placeholder-[#888898] focus:outline-none text-sm"
            readOnly
          />
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-3">
        {LEADS.map((lead, idx) => {
          const colors = getScoreColor(lead.score);
          const isVisible = idx < visibleLeads;
          return (
            <div
              key={lead.id}
              className="border rounded-lg overflow-hidden transition-all duration-500"
              style={{
                borderColor: isVisible ? colors.border : '#25252f',
                background: isVisible ? colors.bg : '#0b0b0f',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-[#edeef2]">{lead.name}</h4>
                    <p className="text-xs text-[#888898]">{lead.location}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-lg font-bold"
                      style={{ color: colors.text }}
                    >
                      {lead.score}%
                    </div>
                  </div>
                </div>
                <div
                  className="inline-block text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${colors.text}25`,
                    color: colors.text,
                  }}
                >
                  {lead.badge}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Bar */}
      <div className="mt-4 pt-4 border-t border-[#25252f]">
        <div className="flex items-center justify-around text-center">
          <div>
            <div className="text-[#f0a020] font-bold text-lg">4,324</div>
            <div className="text-[#888898] text-xs">Leads found</div>
          </div>
          <div className="w-px h-8 bg-[#25252f]" />
          <div>
            <div className="text-[#22c55e] font-bold text-lg">68%</div>
            <div className="text-[#888898] text-xs">Have websites</div>
          </div>
          <div className="w-px h-8 bg-[#25252f]" />
          <div>
            <div className="text-[#f59e0b] font-bold text-lg">892</div>
            <div className="text-[#888898] text-xs">High quality</div>
          </div>
        </div>
      </div>
    </div>
  );
}
