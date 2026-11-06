import React from 'react';

interface AeoAnswerBoxProps {
  question: string;
  directAnswer: string;
  keyFacts?: string[];
  citationSource?: string;
  badge?: string;
}

/**
 * AeoAnswerBox Component
 * Architected specifically for Answer Engine Optimization (Perplexity, ChatGPT Search,
 * Google AI Overviews, Claude Search). Provides high-density semantic structure that
 * AI models can easily parse, cite, and extract into zero-click answer cards.
 */
export function AeoAnswerBox({
  question,
  directAnswer,
  keyFacts = [],
  citationSource = 'CHIP NG Hardware & Technology Standards 2026',
  badge = 'Direct Answer / Fast Fact'
}: AeoAnswerBoxProps) {
  return (
    <aside
      className="my-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/20 p-6 backdrop-blur-md shadow-xl text-slate-200"
      aria-label={`Quick Answer: ${question}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          {badge}
        </span>
        <span className="text-xs text-slate-400 font-mono">Answer Engine Optimized</span>
      </div>

      <h3 className="text-lg md:text-xl font-bold text-white tracking-tight mb-2.5">
        {question}
      </h3>

      <p className="text-sm md:text-base leading-relaxed text-slate-300 mb-4 font-normal">
        {directAnswer}
      </p>

      {keyFacts.length > 0 && (
        <div className="pt-3 border-t border-white/10">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Key Specifications & Evidence:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {keyFacts.map((fact, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {citationSource && (
        <div className="mt-3 text-[11px] text-slate-500 font-mono">
          Verified source: <span className="text-slate-400">{citationSource}</span>
        </div>
      )}
    </aside>
  );
}

export default AeoAnswerBox;
