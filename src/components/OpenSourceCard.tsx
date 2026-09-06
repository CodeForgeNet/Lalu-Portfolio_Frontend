import React from 'react';
import { GitPullRequest, Star, ArrowUpRight } from 'lucide-react';

interface OpenSourceCardProps {
  project: string;
  stars: string;
  prNumber: string;
  prUrl: string;
  description: string;
  impact: string;
}

export default function OpenSourceCard({
  project,
  stars,
  prNumber,
  prUrl,
  description,
  impact
}: OpenSourceCardProps) {
  return (
    <div className="bg-surface-2 border border-border rounded-lg p-5 flex flex-col gap-4 hover:border-accent/30 transition-colors group h-full relative overflow-hidden">
      {/* Premium animated top border line */}
      <div className="absolute top-0 left-0 h-[2px] w-0 bg-gradient-to-r from-accent via-purple-500 to-accent group-hover:w-full transition-all duration-500 ease-out"></div>
      
      <div className="flex justify-between items-start mt-1">
        <div>
          <h3 className="text-lg font-semibold text-text group-hover:text-accent transition-colors">{project}</h3>
          <div className="font-mono text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
            <GitPullRequest size={12} className="text-accent opacity-70" />
            {prNumber}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded border border-border text-xs text-warning">
          <Star size={12} className="fill-warning/20" />
          {stars}
        </div>
      </div>
      
      <div className="text-sm text-text-muted leading-relaxed">
        {description}
      </div>
      
      <div className="mt-auto pt-4 border-t border-border flex justify-between items-start gap-4">
        <div className="text-xs text-accent font-medium flex-1 leading-relaxed">
          Impact: {impact}
        </div>
        <a 
          href={prUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-mono text-text-muted flex items-center gap-1 hover:text-accent transition-colors shrink-0 whitespace-nowrap mt-0.5"
        >
          View PR <ArrowUpRight size={12} />
        </a>
      </div>
    </div>
  );
}
