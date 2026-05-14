'use client';

import React, { useState, useEffect } from 'react';
import LeadDiscoveryPreview from './components/lead-discovery';
import PipelineKanbanPreview from './components/pipeline-kanban';
import ColdCallScriptsPreview from './components/cold-call-scripts';
import LeadScoringPreview from './components/lead-scoring';

export default function FeaturePreviewsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-[#edeef2]">
      {/* Header */}
      <div className="border-b border-[#25252f] px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Feature Previews</h1>
          <p className="text-[#888898]">
            See Recon AI's most powerful features in action
          </p>
        </div>
      </div>

      {/* Previews Grid */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lead Discovery */}
          <div className="border border-[#25252f] rounded-lg p-8 bg-[#17171e]">
            <h2 className="text-2xl font-bold mb-6">Lead Discovery</h2>
            <LeadDiscoveryPreview />
            <p className="text-sm text-[#888898] mt-6">
              Search bar types dynamically. Live count pulses. Cards stagger in with color-coded scores and issue tags. Loops every 6 seconds.
            </p>
          </div>

          {/* Pipeline Kanban */}
          <div className="border border-[#25252f] rounded-lg p-8 bg-[#17171e]">
            <h2 className="text-2xl font-bold mb-6">Pipeline Kanban</h2>
            <PipelineKanbanPreview />
            <p className="text-sm text-[#888898] mt-6">
              One highlighted card moves across 4 columns with fade transition and column-color glow. Continuous loop every 2.2 seconds.
            </p>
          </div>

          {/* Cold Call Scripts */}
          <div className="border border-[#25252f] rounded-lg p-8 bg-[#17171e]">
            <h2 className="text-2xl font-bold mb-6">Cold Call Scripts</h2>
            <ColdCallScriptsPreview />
            <p className="text-sm text-[#888898] mt-6">
              3 numbered steps type sequentially at 15ms/char. Copy button transitions to checkmark after final step. Resets and loops.
            </p>
          </div>

          {/* Lead Scoring */}
          <div className="border border-[#25252f] rounded-lg p-8 bg-[#17171e]">
            <h2 className="text-2xl font-bold mb-6">Lead Scoring</h2>
            <LeadScoringPreview />
            <p className="text-sm text-[#888898] mt-6">
              Stat cards count up simultaneously. Progress bar fills. 6 issue tags pop in with stagger. Loops every 7 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-[#25252f] px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to close more deals?</h2>
          <p className="text-[#888898] mb-8">
            Join 500+ sales professionals using Recon AI to win more business.
          </p>
          <a
            href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#f0a020] text-[#0b0b0f] rounded-lg font-semibold hover:shadow-button-hover transition-all"
          >
            Unlock Recon AI →
          </a>
        </div>
      </div>
    </div>
  );
}
