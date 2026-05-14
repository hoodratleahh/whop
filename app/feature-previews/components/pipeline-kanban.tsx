'use client';

import React, { useState, useEffect } from 'react';

const COLUMNS = ['New', 'Called', 'Interested', 'Follow-up', 'Closed'];
const COLUMN_ACCENTS = ['#888898', '#60a5fa', '#f59e0b', '#f0a020', '#22c55e'];

const STATIC_CARDS = [
  { name: 'John Smith', company: 'ABC Corp' },
  { name: 'Sarah Johnson', company: 'Tech Solutions' },
];

const MOVING_CARD = { name: 'Round Rock Plumb.', company: 'Round Rock Services' };

export default function PipelineKanbanPreview() {
  const [movingCardPos, setMovingCardPos] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCycle((c) => c + 1), 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMovingCardPos(0);
    const timer = setTimeout(() => {
      let pos = 0;
      const moveInterval = setInterval(() => {
        if (pos < COLUMNS.length - 1) {
          pos++;
          setMovingCardPos(pos);
        } else {
          clearInterval(moveInterval);
        }
      }, 1000);
      return () => clearInterval(moveInterval);
    }, 500);
    return () => clearTimeout(timer);
  }, [cycle]);

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="grid gap-4 min-w-max" style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, 160px)` }}>
        {COLUMNS.map((column, colIndex) => (
          <div key={column} className="flex flex-col">
            {/* Column header */}
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-[#888898] uppercase tracking-wider">{column}</h3>
              <div
                className="h-1 w-8 rounded mt-2 transition-all duration-300"
                style={{
                  backgroundColor: movingCardPos === colIndex ? COLUMN_ACCENTS[colIndex] : '#25252f',
                  opacity: movingCardPos === colIndex ? 1 : 0.4,
                }}
              />
            </div>

            {/* Cards */}
            <div className="space-y-2 flex-1">
              {/* Static cards */}
              {STATIC_CARDS.map((card, cardIdx) => (
                <div
                  key={cardIdx}
                  className="border border-[#25252f] rounded-lg p-2.5 bg-[#0b0b0f] text-xs hover:border-[#f0a020]/30 transition-colors duration-200"
                >
                  <div className="font-medium text-[#edeef2]">{card.name}</div>
                  <div className="text-[#888898] mt-1 text-xs">{card.company}</div>
                </div>
              ))}

              {/* Moving card */}
              {movingCardPos === colIndex && (
                <div
                  className="rounded-lg p-2.5 text-xs transition-all duration-500"
                  style={{
                    border: `2px solid ${COLUMN_ACCENTS[colIndex]}`,
                    background: `${COLUMN_ACCENTS[colIndex]}08`,
                    boxShadow: `0 8px 24px ${COLUMN_ACCENTS[colIndex]}20`,
                  }}
                >
                  <div className="font-semibold text-[#edeef2]">{MOVING_CARD.name}</div>
                  <div style={{ color: COLUMN_ACCENTS[colIndex] }} className="mt-1 text-xs font-medium">
                    {MOVING_CARD.company}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
