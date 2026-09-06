import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export type TraceStep = {
  id: string;
  label: string;
  status: 'complete' | 'skipped' | 'pending' | 'running';
  durationMs?: number;
};

export type TraceData = {
  steps: TraceStep[];
  totalDurationMs?: number;
  isCached?: boolean;
};

interface PipelineTraceProps {
  trace: TraceData | null;
  isLoading?: boolean;
}

export default function PipelineTrace({ trace, isLoading }: PipelineTraceProps) {
  const [activeStep, setActiveStep] = useState(0);

  // If we have trace data (it's finished), show all steps
  // If isLoading, show mock progress
  useEffect(() => {
    if (isLoading) {
      setActiveStep(1);
      const timer1 = setTimeout(() => setActiveStep(2), 600);
      const timer2 = setTimeout(() => setActiveStep(3), 1200);
      const timer3 = setTimeout(() => setActiveStep(4), 1800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setActiveStep(5);
    }
  }, [isLoading]);

  const StepRow = ({ 
    step,
    isCurrent,
    isPast,
    isFuture
  }: { 
    step: TraceStep;
    isCurrent: boolean;
    isPast: boolean;
    isFuture: boolean;
  }) => {
    const hasRealStatus = step.status === 'complete' || step.status === 'running' || step.status === 'skipped';
    const isCompleted = step.status === 'complete' || (!hasRealStatus && !isLoading && isPast);
    const isRunning = step.status === 'running' || (!hasRealStatus && !!isLoading && isCurrent);
    const isSkipped = step.status === 'skipped';
    
    return (
      <div className={`flex items-center justify-between text-xs font-mono transition-opacity duration-300 ${isFuture && !trace ? 'opacity-30' : 'opacity-100'} ${isSkipped ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            {isSkipped ? (
              <span className="text-text-muted text-[10px]">-</span>
            ) : isCompleted ? (
              <CheckCircle2 size={14} className="text-success" />
            ) : isRunning ? (
              <Loader2 size={14} className="text-accent animate-spin" />
            ) : (
              <span className="text-text-muted text-[10px]">○</span>
            )}
          </div>
          <span className={isRunning ? 'text-accent' : 'text-text-muted'}>
            {step.label}
          </span>
          {isSkipped && <span className="text-text-muted italic text-[10px] ml-1">(skipped)</span>}
        </div>
        {step.durationMs !== undefined && (
          <span className="text-text-muted">[{step.durationMs}ms]</span>
        )}
      </div>
    );
  };

  // Default mock steps for when loading
  const stepsToRender: TraceStep[] = trace?.steps || [
    { id: 'embed', label: 'Semantic Embedding', status: 'pending' },
    { id: 'cache', label: 'Semantic Cache (Redis)', status: 'pending' },
    { id: 'db', label: 'Vector Search (Pinecone)', status: 'pending' },
    { id: 'llm', label: 'Generation (Gemini)', status: 'pending' }
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="text-text-muted mb-1 border-b border-border border-dashed pb-1 text-xs flex justify-between">
        <span>── PIPELINE ──────────────────</span>
        {trace?.totalDurationMs && <span>{trace.totalDurationMs}ms</span>}
      </div>
      
      <div className="flex flex-col gap-1 pl-1">
        {stepsToRender.map((step, idx) => (
          <StepRow 
            key={step.id}
            step={step}
            isPast={activeStep > idx + 1}
            isCurrent={!!isLoading && activeStep === idx + 1}
            isFuture={!!isLoading && activeStep < idx + 1}
          />
        ))}
      </div>
    </div>
  );
}
