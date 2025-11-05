"use client";
import resume from "@/data/resume.json";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { useSpeechRecognition } from "@/utils/useSpeechRecognition";
import useAvatarStore from "@/utils/avatarStore";
import { motion } from "framer-motion";

const Avatar = dynamic(() => import("@/components/Avatar"), { ssr: false });

// Dynamically import Chat component to prevent hydration issues
const Chat = dynamic(() => import("@/components/Chat"), { ssr: false });

export default function Home() {
  const {
    submitVerbalQuery,
    loading,
    isSpeaking,
    stopSpeaking,
    isProcessingVerbalQuery,
  } = useAvatarStore();
  const {
    isListening,
    transcript,
    startListening,
    stopListening: stopVocalListening,
  } = useSpeechRecognition();

  // Effect to automatically submit the query when a transcript is finalized
  useEffect(() => {
    if (transcript) {
      submitVerbalQuery(transcript);
    }
  }, [transcript, submitVerbalQuery]);

  const getButtonState = () => {
    if (isListening) {
      return {
        text: "Listening...",
        disabled: false,
        onClick: stopVocalListening,
        className: "bg-red-600 hover:bg-red-700 animate-pulse",
      };
    }
    if (loading || isProcessingVerbalQuery) {
      return {
        text: loading ? "Thinking..." : "Processing...",
        disabled: true,
        onClick: () => {},
        className: "bg-gray-500 cursor-not-allowed",
      };
    }
    if (isSpeaking) {
      return {
        text: "Stop Replying",
        disabled: false,
        onClick: stopSpeaking,
        className: "bg-amber-600 hover:bg-amber-700",
      };
    }
    return {
      text: "Ask a Question Verbally",
      disabled: false,
      onClick: startListening,
      className:
        "bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/50",
    };
  };

  const buttonState = getButtonState();

  return (
    <main className="min-h-screen relative font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl relative">
        {/* Top row: Profile Card and Avatar side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8 h-auto lg:h-[420px]"
          >
            <div className="flex items-center justify-between relative gap-6">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold bg-clip-text text-transparent bg-linear-to-r from-green-300 to-sky-300">
                  {resume.name}
                </h1>
                <div className="mt-6 space-y-4 text-sm sm:text-base">
                  <div className="flex items-center gap-3 text-slate-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-400"
                    >
                      <rect width="20" height="14" x="2" y="6" rx="2" />
                      <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                    <span className="text-base lg:text-lg font-medium text-slate-200">
                      {resume.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-400"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <a
                      href={`mailto:${resume.email}`}
                      className="hover:text-green-300 transition-colors"
                    >
                      {resume.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-400"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <a
                      href={`tel:${resume.phone}`}
                      className="hover:text-green-300 transition-colors"
                    >
                      {resume.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-400"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    <a
                      href={resume.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-300 transition-colors"
                    >
                      GitHub
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-400"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    <a
                      href={resume.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-300 transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-400"
                    >
                      <path d="M12 17V3" />
                      <path d="m6 11 6 6 6-6" />
                      <path d="M19 21H5" />
                    </svg>
                    <a
                      href="https://drive.google.com/uc?export=download&id=1M0Y-eyeYvKvrVaSpTPGB-spOXPc6No86"
                      download
                      className="hover:text-green-300 transition-colors"
                    >
                      Download Resume
                    </a>
                  </div>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="hidden sm:block relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden shadow-xl border-2 border-white/20 ring-4 ring-green-500/30">
                <Image
                  src="/profile.jpg"
                  alt="Lalu Kumar"
                  fill
                  style={{ objectFit: "cover" }}
                  className="hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
          </motion.div>

          {/* Avatar and Speech Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl flex flex-col h-[300px] sm:h-[350px] lg:h-[420px] animate-[float_4s_ease-in-out_infinite]"
          >
            <div className="flex-1">
              <Canvas camera={{ position: [0, 0.3, 1.6], fov: 25 }}>
                <ambientLight intensity={2} />
                <directionalLight position={[0, 2, 5]} intensity={2.5} />
                <Avatar />
              </Canvas>
            </div>
            <div className="p-4">
              <button
                onClick={buttonState.onClick}
                disabled={buttonState.disabled}
                className={`w-full px-4 sm:px-6 py-3 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-all duration-200 ${buttonState.className}`}
              >
                {buttonState.text}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Chat Component - Full width below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl min-h-[600px]"
        >
          <div className="h-full p-6">
            <Chat />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
