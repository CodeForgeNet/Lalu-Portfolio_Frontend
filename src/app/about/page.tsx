import resume from "@/data/resume.json";
import Link from "next/link"; // Added Link import
import { Briefcase, GraduationCap, Code, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-green-400 to-blue-500">
            About Me
          </h1>
          <p className="mt-4 text-lg text-slate-400">{resume.tagline}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 rounded-2xl shadow-lg p-8 backdrop-blur-sm mb-12">
            <h2 className="text-3xl font-semibold mb-6 flex items-center">
              <Briefcase className="mr-3 text-green-400" />
              Summary
            </h2>
            <p className="text-slate-300 leading-relaxed">{resume.summary}</p>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 flex items-center">
              <GraduationCap className="mr-3 text-green-400" />
              Education
            </h2>
            <div className="space-y-6">
              {resume.education.map((edu, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-2xl shadow-lg p-6 backdrop-blur-sm transform hover:scale-105 transition-transform duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-green-300">
                        {edu.institution}
                      </h3>
                      <p className="text-slate-300">{edu.degree}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400">{edu.duration}</p>
                      <p className="text-slate-500">{edu.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <Briefcase className="mr-3 text-green-400" />
                Experience
              </h2>
              <div className="relative border-l-2 border-green-400/30">
                {resume.experience.map((exp, index) => (
                  <div key={index} className="mb-10 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-green-400/20 rounded-full -left-3 ring-4 ring-green-400/10">
                      <Briefcase className="w-3 h-3 text-green-300" />
                    </span>
                    <div className="bg-white/5 p-6 rounded-lg shadow-lg">
                      <h3 className="text-xl font-bold text-green-300">
                        {exp.title}
                      </h3>
                      <p className="text-slate-300 font-semibold">
                        {exp.organization}
                      </p>
                      <p className="text-sm text-slate-400 mb-3">
                        {exp.duration} | {exp.location}
                      </p>
                      <ul className="list-disc list-inside text-slate-400 space-y-1">
                        {exp.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <Award className="mr-3 text-green-400" />
                Certifications
              </h2>
              <div className="space-y-6">
                {resume.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="bg-white/5 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
                  >
                    <h3 className="text-xl font-bold text-green-300">
                      {cert.title}
                    </h3>
                    <p className="text-slate-300 font-semibold">
                      {cert.organization}
                    </p>
                    <div className="flex flex-wrap gap-2 my-3">
                      {cert.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
                    >
                      View Certificate
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-semibold mb-6 flex items-center">
              <Code className="mr-3 text-green-400" />
              Technical Skills
            </h2>
            <div className="bg-white/5 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
              <div className="flex flex-wrap gap-4">
                {Object.entries(resume.technical_skills).map(
                  ([category, skills]) => (
                    <div key={category} className="flex-1 min-w-[200px]">
                      <h4 className="text-xl font-semibold capitalize text-green-300 mb-3">
                        {category.replace("_", " ")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(skills as string[]).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
