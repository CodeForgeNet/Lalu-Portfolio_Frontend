"use client";
import resume from "@/data/resume.json";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import OpenSourceCard from "@/components/OpenSourceCard";
import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";

// Dynamically import Chat component to prevent hydration issues
const Chat = dynamic(() => import("@/components/Chat"), { ssr: false });

export default function Home() {
  // Filter for featured AI projects
  const featuredProjects = resume.projects
    .filter(p => p.category === "ai-system" || p.category === "open-source-tool")
    .slice(0, 3);

  return (
    <main className="min-h-screen relative bg-bg">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-24 flex flex-col gap-24">
        
        {/* Section A: Hero */}
        <section className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6 max-w-3xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-accent border border-accent/20 bg-accent/5 px-2 py-1 rounded">
                OPEN TO WORK
              </span>
              <span className="text-xs font-mono text-text-muted">
                {resume.location} {resume.open_to_relocation && "· Open to Relocation"}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-medium text-text leading-tight tracking-tight">
              AI Systems &<br />
              <span className="text-text-muted">Full Stack Engineer</span>
            </h1>

            <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl">
              Architecting autonomous agents, scalable RAG architectures, and production-grade AI infrastructure.<span className="animate-blink inline-block w-2 h-5 bg-accent ml-1 align-middle"></span>
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-mono text-text-muted mt-2">
              {resume.open_source?.[0] && (
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span> {resume.open_source[0].project} ({resume.open_source[0].stars}★)
                </div>
              )}
              {resume.projects.filter(p => p.id === "tuneprompt" || p.id === "genesis-forge").map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-success">✓</span> {p.title.split(' ')[0]} ({p.key_metric?.replace(' npm ', ' ') || ''})
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4">
              <Link href="/projects" className="bg-text text-bg px-6 py-3 rounded text-sm font-medium hover:bg-text/90 transition-colors flex items-center gap-2">
                View Work <ArrowRight size={16} />
              </Link>
              <a href="/docs/Lalu_FullStack-AI-Resume.pdf" target="_blank" rel="noopener noreferrer" className="text-text hover:text-accent transition-colors text-sm font-medium flex items-center gap-2">
                Read CV <ArrowRight size={16} className="-rotate-45" />
              </a>
            </div>
          </motion.div>
        </section>

        {/* Section B: Neural Query Terminal */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Chat />
          </motion.div>
        </section>

        {/* Section C: Open Source Impact */}
        <section className="flex flex-col gap-8">
          <div className="flex items-end justify-between border-b border-border pb-4">
            <h2 className="text-2xl font-medium text-text">Open Source Impact</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resume.open_source?.map((oss: any, i: number) => (
              <motion.div
                key={oss.pr_number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="h-full"
              >
                <OpenSourceCard
                  project={oss.project}
                  stars={oss.stars}
                  prNumber={oss.pr_number}
                  prUrl={oss.pr_url}
                  description={oss.description}
                  impact={oss.impact}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section D: Featured Work */}
        <section className="flex flex-col gap-8">
          <div className="flex items-end justify-between border-b border-border pb-4">
            <h2 className="text-2xl font-medium text-text flex items-center gap-3">
              <Code2 className="text-accent" /> Featured Systems
            </h2>
            <Link href="/projects" className="text-sm text-text-muted hover:text-accent transition-colors hidden md:flex items-center gap-1">
              See All Work <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4 group hover:border-accent/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-text group-hover:text-accent transition-colors">{project.title}</h3>
                  <span className="text-xs font-mono text-text-muted bg-surface-2 px-2 py-1 rounded">{project.year}</span>
                </div>
                
                <p className="text-sm text-text-muted">{project.summary}</p>
                
                <div className="mt-auto pt-4 flex flex-col gap-4">
                  <div className="text-lg font-mono text-text">{project.key_metric}</div>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 3).map((tech: string) => (
                      <span key={tech} className="text-xs text-text-muted bg-surface-2 px-2 py-1 rounded border border-border">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <Link href="/projects" className="text-sm text-text-muted hover:text-accent transition-colors md:hidden flex items-center gap-1 mt-2">
            See All Work <ArrowRight size={14} />
          </Link>
        </section>

      </div>
    </main>
  );
}
