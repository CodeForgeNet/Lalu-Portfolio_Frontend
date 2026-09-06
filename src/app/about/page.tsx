"use client";

import resume from "@/data/resume.json";
import { motion } from "framer-motion";
import { Terminal, Database, Code2, Cpu, Wrench } from "lucide-react";

export default function AboutPage() {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "languages": return <Code2 size={16} className="text-accent" />;
      case "frameworks": return <Terminal size={16} className="text-accent" />;
      case "ai_ml": return <Cpu size={16} className="text-accent" />;
      case "databases": return <Database size={16} className="text-accent" />;
      case "devops_tools": return <Wrench size={16} className="text-accent" />;
      default: return <Terminal size={16} className="text-accent" />;
    }
  };

  const formatCategoryName = (name: string) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <main className="min-h-screen relative bg-bg font-sans pb-24">
      <div className="max-w-[800px] mx-auto px-6 md:px-12 py-12 md:py-24 flex flex-col gap-24">
        
        {/* Header Section */}
        <section className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <h1 className="text-4xl md:text-5xl font-medium text-text">Background</h1>
            <p className="text-lg text-text-muted leading-relaxed">
              {resume.summary}
            </p>
          </motion.div>
        </section>

        {/* Experience Timeline */}
        <section className="flex flex-col gap-12">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Terminal className="text-accent" size={20} />
            <h2 className="text-2xl font-medium text-text">Experience</h2>
          </div>

          <div className="flex flex-col gap-12">
            {resume.experience.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-8 md:pl-0"
              >
                {/* Timeline connector for mobile (hidden on md) */}
                <div className="absolute left-[11px] top-2 bottom-[-48px] w-px bg-border md:hidden" />
                <div className="absolute left-1 top-2 w-5 h-5 rounded-full bg-bg border-2 border-accent md:hidden z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                  {/* Left Column: Date & Meta */}
                  <div className="md:col-span-3 flex flex-col gap-1 md:text-right md:pt-1">
                    <div className="font-mono text-sm text-text">{exp.duration}</div>
                    <div className="text-xs text-text-muted">{exp.location}</div>
                  </div>

                  {/* Right Column: Content */}
                  <div className="md:col-span-9 flex flex-col gap-4 relative">
                    {/* Timeline dot for desktop */}
                    <div className="hidden md:flex absolute -left-[22px] top-2 w-3 h-3 rounded-full bg-accent/20 border border-accent items-center justify-center">
                       <div className="w-1 h-1 rounded-full bg-accent" />
                    </div>
                    {/* Timeline connector for desktop */}
                    <div className="hidden md:block absolute -left-4 top-6 bottom-[-64px] w-px bg-border" />

                    <div className="flex flex-col">
                      <h3 className="text-xl font-medium text-text">{exp.title}</h3>
                      <div className="text-accent">{exp.organization}</div>
                    </div>

                    <ul className="flex flex-col gap-3">
                      {exp.details.map((detail, i) => (
                        <li key={i} className="text-text-muted text-sm leading-relaxed flex items-start gap-3">
                          <span className="text-accent/50 mt-1.5 text-[10px]">▶</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Technical Stack */}
        <section className="flex flex-col gap-12">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Code2 className="text-accent" size={20} />
            <h2 className="text-2xl font-medium text-text">Technical Stack</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(resume.technical_skills).map(([category, skills], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-2 text-text font-medium border-b border-border/50 pb-2">
                  {getCategoryIcon(category)}
                  {formatCategoryName(category)}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(skills as string[]).map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-mono text-text-muted bg-surface-2 px-2 py-1 rounded border border-border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Education & Certs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Education */}
          <div className="flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-medium text-text">Education</h2>
            </div>
            
            <div className="flex flex-col gap-6">
              {resume.education.map((edu, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <h3 className="font-medium text-text">{edu.institution}</h3>
                  <div className="text-sm text-text-muted">{edu.degree}</div>
                  <div className="text-xs font-mono text-text-muted/60 mt-1">{edu.duration}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-medium text-text">Certifications</h2>
            </div>
            
            <div className="flex flex-col gap-6">
              {resume.certifications.map((cert, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <h3 className="font-medium text-text">{cert.title}</h3>
                  <div className="text-sm text-accent">{cert.organization}</div>
                  {cert.certificate_url && (
                    <a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-text-muted hover:text-accent transition-colors mt-1 inline-flex items-center gap-1"
                    >
                      View Credential ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
