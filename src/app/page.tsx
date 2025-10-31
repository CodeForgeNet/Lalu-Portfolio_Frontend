import Chat from "@/components/Chat";
import resume from "@/data/resume.json";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-blue-800">
                {resume.name}
              </h1>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-lg font-medium">{resume.role}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a
                    href={`mailto:${resume.email}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {resume.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Add a modern decorative element */}
            <div className="hidden sm:block">
              <div className="w-16 h-16 rounded-full bg-linear-to-r from-blue-400 to-blue-600 opacity-80 blur-xl"></div>
              <div className="w-16 h-16 rounded-full bg-linear-to-r from-blue-600 to-blue-400 opacity-50 blur-xl -mt-8 ml-8"></div>
            </div>
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed text-lg">
            {resume.summary}
          </p>
        </div>

        {/* Chat Component */}
        <div className="mt-8">
          <Chat />
        </div>
      </div>
    </main>
  );
}
