import resume from "@/data/resume.json";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-green-400 to-blue-500">
            My Projects
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            A collection of my work, from web apps to AI projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resume.projects.map((project, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out flex flex-col"
            >
              <div className="p-6 grow">
                <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-3">
                  {project.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-400 mb-4 grow">{project.summary}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="bg-green-500/10 text-green-300 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 p-4 mt-auto">
                <div className="flex items-center justify-end gap-4">
                  {project.links.live && (
                    <Link
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm sm:text-base text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink size={18} className="mr-1" />
                      Live
                    </Link>
                  )}
                  {project.links.frontend && (
                    <Link
                      href={project.links.frontend}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm sm:text-base text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      <Github size={18} className="mr-1" />
                      Frontend
                    </Link>
                  )}
                  {project.links.backend && (
                    <Link
                      href={project.links.backend}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm sm:text-base text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      <Github size={18} className="mr-1" />
                      Backend
                    </Link>
                  )}
                  {project.links.code && (
                    <Link
                      href={project.links.code}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm sm:text-base text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      <Github size={18} className="mr-1" />
                      Code
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
