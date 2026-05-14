'use client';

import React, { useState, useEffect } from 'react';

const SCRIPTS = [
  {
    number: 1,
    title: 'Opening',
    content:
      'Hi [name], I noticed [specific company insight] and thought it made sense to call. Do you have 30 seconds?',
  },
  {
    number: 2,
    title: 'Value prop',
    content:
      "We help companies like yours close deals faster through prospect research and personalized scripts. Most reps using us see a 3x reply rate lift.",
  },
  {
    number: 3,
    title: 'Close',
    content:
      "Worth a quick 15-minute call next week? I can show you exactly how it works.",
  },
];

export default function ColdCallScriptsPreview() {
  const [displayedScripts, setDisplayedScripts] = useState<
    { number: number; title: string; content: string; displayedText: string }[]
  >([]);
  const [copied, setCopied] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((c) => c + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplayedScripts([]);
    setCopied(false);

    SCRIPTS.forEach((script, scriptIndex) => {
      const startDelay = scriptIndex * 2200;
      const typeTimer = setTimeout(() => {
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex <= script.content.length) {
            setDisplayedScripts((prev) => {
              const updated = [...prev];
              const existing = updated.find((s) => s.number === script.number);
              if (existing) {
                existing.displayedText = script.content.slice(0, charIndex);
              } else {
                updated.push({
                  ...script,
                  displayedText: script.content.slice(0, charIndex),
                });
              }
              return updated;
            });
            charIndex++;
          } else {
            clearInterval(typeInterval);
          }
        }, 15);
        return () => clearInterval(typeInterval);
      }, startDelay);

      return () => clearTimeout(typeTimer);
    });

    const copyTimer = setTimeout(() => {
      setCopied(true);
      const resetTimer = setTimeout(() => {
        setCopied(false);
      }, 1000);
      return () => clearTimeout(resetTimer);
    }, 7000);

    return () => clearTimeout(copyTimer);
  }, [cycle]);

  const handleCopy = () => {
    const fullText = SCRIPTS.map(
      (s) => `${s.number}. ${s.title}\n${s.content}`
    ).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Scripts */}
      <div className="space-y-4">
        {SCRIPTS.map((script) => {
          const displayed = displayedScripts.find((s) => s.number === script.number);
          return (
            <div
              key={script.number}
              className="border border-[#25252f] rounded p-4 bg-[#0b0b0f]"
              style={{
                opacity: displayed ? 1 : 0,
                transition: 'opacity 0.3s ease-out',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="text-lg font-bold w-6 h-6 rounded flex items-center justify-center text-[#0b0b0f]"
                  style={{ backgroundColor: '#f0a020' }}
                >
                  {script.number}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#edeef2] mb-1">{script.title}</h4>
                  <p className="text-sm text-[#888898] leading-relaxed">
                    {displayed?.displayedText}
                    {(displayed?.displayedText ?? '').length < script.content.length && (
                      <span className="animate-pulse">|</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Copy Button */}
      <div>
        <button
          onClick={handleCopy}
          className="w-full px-4 py-3 rounded-lg font-semibold transition-all"
          style={{
            backgroundColor: copied ? '#4ade80' : '#f0a020',
            color: copied ? '#0b0b0f' : '#0b0b0f',
          }}
        >
          {copied ? '✓ Copied!' : 'Copy all scripts'}
        </button>
      </div>

      <style jsx>{`
        button {
          transition: all 240ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
