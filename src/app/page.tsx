import Chat from "@/components/Chat";
import resume from "@/data/resume.json";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9ff] relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-linear-to-tr from-emerald-50/40 via-cyan-50/30 to-slate-50/60 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none"></div>
      <div className="absolute -top-24 right-0 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-100/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-100/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative">
        {/* Profile Card */}
        <div className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-slate-700/50 hover:shadow-2xl hover:border-slate-600/50 transition-all duration-300 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] -z-10"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-cyan-500/5 to-transparent"></div>

          <div className="flex items-center justify-between relative">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-teal-300 to-emerald-300">
                {resume.name}
              </h1>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-teal-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-lg font-medium text-slate-200">
                    {resume.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-teal-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a
                    href={`mailto:${resume.email}`}
                    className="hover:text-teal-300 transition-colors"
                  >
                    {resume.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-teal-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.809 1.305 3.49.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.923.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  <a
                    href={resume.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-300 transition-colors"
                  >
                    GitHub
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-teal-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <a
                    href={resume.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-300 transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-teal-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <a
                    href="https://drive.google.com/uc?export=download&id=1M0Y-eyeYvKvrVaSpTPGB-spOXPc6No86" // Replace with the actual path to your resume
                    download
                    className="hover:text-teal-300 transition-colors"
                  >
                    Download Resume
                  </a>
                </div>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="hidden sm:block relative w-36 h-36 rounded-full overflow-hidden shadow-lg border-2 border-slate-700/50 ring-2 ring-teal-500/20">
              <Image
                src="/profile.jpg" // Placeholder image, replace with actual path
                alt="Lalu Kumar"
                layout="fill"
                objectFit="cover"
              />
            </div>
          </div>
        </div>

        {/* Chat Component */}
        <div className="mt-8">
          <Chat />
        </div>
      </div>
    </main>
  );
}
