'use client';

import React, { useState, useEffect } from 'react';

interface Card {
  id: number;
  name: string;
  company: string;
}

const COLUMNS = ['New', 'Called', 'Interested', 'Closed'];
const COLUMN_COLORS = [
  '#55556a', // New - gray
  '#60a5fa', // Called - blue
  '#facc15', // Interested - amber
  '#4ade80', // Closed - green
];

const ALL_CARDS: Card[] = [
  { id: 1, name: 'John Smith', company: 'ABC Corp' },
  { id: 2, name: 'Sarah Johnson', company: 'Tech Solutions' },
  { id: 3, name: 'Mike Chen', company: 'Growth Co' },
  { id: 4, name: 'Round Rock Plumb.', company: 'Round Rock Services' },
  { id: 5, name: 'Emma Wilson', company: 'Design Studio' },
];

export default function PipelineKanbanPreview() {
  const [movingCardColumn, setMovingCardColumn] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((c) => c + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMovingCardColumn(0);
    const timer = setTimeout(() => {
      let col = 0;
      const moveInterval = setInterval(() => {
        if (col < COLUMNS.length - 1) {
          col++;
          setMovingCardColumn(col);
        } else {
          clearInterval(moveInterval);
        }
      }, 550);
      return () => clearInterval(moveInterval);
    }, 100);

    return () => clearTimeout(timer);
  }, [cycle]);

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-4 gap-4 min-w-full">
        {COLUMNS.map((column, colIndex) => (
          <div key={column} className="min-w-[200px]">
            <div className="mb-3">
              <h3 className="font-semibold text-sm text-[#888898]">{column}</h3>
              <div
                className="h-1 w-12 rounded mt-2"
                style={{ backgroundColor: COLUMN_COLORS[colIndex] }}
              />
            </div>

            <div className="space-y-3">
              {/* Static cards for this column */}
              {ALL_CARDS.slice(0, 2).map((card) => (
                <div
                  key={`${colIndex}-${card.id}`}
                  className="border border-[#25252f] rounded p-3 bg-[#0b0b0f] text-sm"
                >
                  <div className="font-medium text-[#edeef2]">{card.name}</div>
                  <div className="text-xs text-[#888898] mt-1">{card.company}</div>
                </div>
              ))}

              {/* Moving card (Round Rock Plumb.) */}
              {movingCardColumn === colIndex && (
                <div
                  className="border-2 rounded p-3 text-sm animate-fadeIn"
                  style={{
                    borderColor: COLUMN_COLORS[colIndex],
                    backgroundColor: '#0b0b0f',
                    boxShadow: `0 0 20px ${COLUMN_COLORS[colIndex]}33`,
                    animation: 'fadeIn 0.4s ease-out',
                  }}
                >
                  <div className="font-semibold text-[#edeef2]">Round Rock Plumb.</div>
                  <div className="text-xs mt-1" style={{ color: COLUMN_COLORS[colIndex] }}>
                    Round Rock Services
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
