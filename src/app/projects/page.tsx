"use client";

import resume from "@/data/resume.json";
import Link from "next/link";
import { ArrowUpRight, Github, LayoutGrid, Terminal } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Category = "all" | "ai-system" | "open-source-tool" | "full-stack" | "earlier-work";

export default function ProjectsPage() {
  const [filter, setFilter] = useState<Category>("all");

  const filteredProjects = resume.projects.filter(
    (p) => filter === "all" || p.category === filter
  );

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "ai-system": return "AI System";
      case "open-source-tool": return "Open Source Tool";
      case "full-stack": return "Full Stack";
      case "earlier-work": return "Earlier Work";
      default: return cat;
    }
  };

  return (
    <main className="min-h-screen relative bg-bg font-sans">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-24">
        
        <div className="flex flex-col gap-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-medium text-text">Selected Work</h1>
          <p className="text-text-muted max-w-2xl text-lg">
            Production AI pipelines, agentic workflows, and full-stack applications.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-12">
          {[
            { id: "all", label: "All" },
            { id: "ai-system", label: "AI Systems" },
            { id: "open-source-tool", label: "Open Source Tools" },
            { id: "full-stack", label: "Full Stack" },
            { id: "earlier-work", label: "Earlier Work" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as Category)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors border ${
                filter === tab.id
                  ? "bg-accent/10 border-accent text-accent"
                  : "bg-surface border-border text-text-muted hover:text-text hover:border-text-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => {
              const isLarge = project.category === "ai-system" || project.category === "open-source-tool";

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-surface border border-border rounded-lg overflow-hidden flex flex-col group hover:border-accent/30 transition-colors ${
                    isLarge ? "p-6 md:p-8" : "p-5 md:p-6 md:flex-row md:items-center gap-6"
                  }`}
                >
                  <div className={`flex flex-col gap-4 ${isLarge ? "" : "flex-1"}`}>
                    
                    {/* Header: Title & Meta */}
                    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        {isLarge ? <Terminal className="text-accent" size={20} /> : <LayoutGrid className="text-text-muted" size={20} />}
                        <h3 className={`font-medium text-text group-hover:text-accent transition-colors ${isLarge ? "text-2xl" : "text-xl"}`}>
                          {project.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded border border-accent/20 uppercase">
                          {getCategoryLabel(project.category)}
                        </span>
                        <span className="text-xs font-mono text-text-muted bg-surface-2 px-2 py-1 rounded">
                          {project.year}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
                      <div className="flex flex-col gap-4">
                        <p className="text-text-muted leading-relaxed">
                          {project.summary}
                        </p>
                        
                        {project.key_metric && (
                          <div className={`font-mono text-accent ${isLarge ? "text-xl" : "text-lg"}`}>
                            {project.key_metric}
                          </div>
                        )}
                      </div>

                      {/* Architecture Diagram (Large cards only) */}
                      {isLarge && project.architecture && project.architecture.length > 0 && (
                        <div className="bg-surface-2 border border-border rounded p-4 flex flex-col gap-3 font-mono text-xs">
                          <div className="text-text-muted mb-1">ARCHITECTURE</div>
                          <div className="flex flex-col gap-2">
                            {project.architecture.map((step, idx) => (
                              <div key={idx} className="flex flex-col items-center">
                                <div className="w-full bg-surface border border-border px-3 py-2 rounded text-center text-text shadow-sm">
                                  {step}
                                </div>
                                {idx < project.architecture.length - 1 && (
                                  <div className="text-accent py-1">↓</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer: Tech & Links */}
                    <div className={`mt-auto pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isLarge ? "" : "md:border-t-0 md:pt-0"}`}>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs text-text-muted bg-surface-2 px-2 py-1 rounded border border-border"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {project.links.live && (
                          <a
                            href={project.links.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-text hover:text-accent transition-colors flex items-center gap-1"
                          >
                            Live <ArrowUpRight size={14} />
                          </a>
                        )}
                        {project.links.github && (
                          <a
                            href={project.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-text hover:text-accent transition-colors flex items-center gap-1"
                          >
                            <Github size={14} /> Code
                          </a>
                        )}
                        {/* Fallbacks for older structure */}
                        {project.links.frontend && !project.links.github && (
                          <a
                            href={project.links.frontend}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-text hover:text-accent transition-colors flex items-center gap-1"
                          >
                            <Github size={14} /> FE
                          </a>
                        )}
                        {project.links.backend && !project.links.github && (
                          <a
                            href={project.links.backend}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-text hover:text-accent transition-colors flex items-center gap-1"
                          >
                            <Github size={14} /> BE
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-text-muted font-mono">
              No projects found in this category.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
