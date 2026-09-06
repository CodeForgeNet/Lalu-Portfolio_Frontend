"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import resume from "@/data/resume.json";
import { Terminal } from "lucide-react";

// Dynamically import Chat component to prevent hydration issues
const Chat = dynamic(() => import("@/components/Chat"), { ssr: false });

export default function LabPage() {
  const publishedTools = resume.projects.filter(p => p.category === "open-source-tool");
  
  // Find VaniOps which is in progress
  const activeExperiment = resume.projects.find(p => p.id === "vaniops");

  return (
    <main className="min-h-screen relative bg-bg font-sans">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-24">
        
        <div className="flex flex-col gap-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-medium text-text">The Lab</h1>
          <p className="text-text-muted max-w-2xl text-lg">
            Live RAG pipeline demo, open experiments, and published tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Neural Query Area (Larger) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-2xl font-medium text-text flex items-center gap-2">
                <Terminal className="text-accent" /> Live RAG Pipeline
              </h2>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Chat />
            </motion.div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 flex flex-col gap-12">
            
            {/* Open Experiments */}
            <section className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-medium text-text">Open Experiments</h3>
              </div>
              
              {activeExperiment && (
                <div className="bg-surface-2 border border-border p-4 rounded-lg flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-warning/10 text-warning text-[10px] font-mono px-2 py-1 rounded-bl border-l border-b border-warning/20">
                    IN PROGRESS
                  </div>
                  <h4 className="font-medium text-text group-hover:text-accent transition-colors">
                    {activeExperiment.title}
                  </h4>
                  <p className="text-sm text-text-muted">
                    {activeExperiment.summary}
                  </p>
                  <div className="mt-2 text-xs font-mono text-text-muted flex flex-wrap gap-x-2 gap-y-1">
                    {activeExperiment.technologies.slice(0, 4).map(tech => (
                      <span key={tech} className="text-accent/80">· {tech}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Published Tools */}
            <section className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-medium text-text">Published Tools</h3>
              </div>
              
              <div className="flex flex-col gap-3 font-mono text-sm">
                {publishedTools.map(tool => (
                  <div key={tool.id} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 p-3 bg-surface border border-border rounded hover:border-accent/30 transition-colors group">
                    <span className="text-text group-hover:text-accent transition-colors">{tool.title.toUpperCase()}</span>
                    <span className="text-xs text-text-muted truncate">{tool.summary}</span>
                    <span className="text-xs text-accent mt-1 sm:mt-0">{tool.key_metric?.split(' ')[0] || ''}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>

        </div>
      </div>
    </main>
  );
}
