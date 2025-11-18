"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import axios from "axios";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Custom type for our audio analyzer data
type AudioAnalyzerData = Uint8Array & { buffer: ArrayBuffer };

// Helper function to create properly typed Uint8Array
function createAudioArray(length: number): AudioAnalyzerData {
  const buffer = new ArrayBuffer(length);
  return new Uint8Array(buffer) as AudioAnalyzerData;
}

// Import the avatar store
import useAvatarStore from "@/utils/avatarStore";

// You'll need to have your 3D model file in the public folder
const MODEL_PATH = "/models/avatar.glb";

export default function Avatar() {
  const group = useRef<THREE.Group>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<AudioAnalyzerData>(createAudioArray(0));

  const [mouthOpen, setMouthOpen] = useState(0);

  // Load the 3D model
  const { scene, animations, nodes } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, group);

  const currentAudioDataUri = useAvatarStore(
    (state) => state.currentAudioDataUri
  );
  const setSpeechHandler = useAvatarStore((state) => state.setSpeechHandler);
  const isSpeaking = useAvatarStore((state) => state.isSpeaking);
  const setIsSpeaking = useAvatarStore((state) => state.setIsSpeaking);

  // Function to generate speech using the backend TTS API
  const generateSpeech = async (text: string): Promise<string> => {
    try {
      const response = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080"
        }/api/tts`,
        {
          text,
          // VoiceRSS parameters can be customized here or left to backend defaults
        },
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY,
          },
        }
      );

      if (response.data && response.data.audioData) {
        return response.data.audioData;
      } else {
        throw new Error("No audio data returned from TTS service");
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      throw error;
    }
  };

  // Set up audio analysis for lip syncing
  const setupAudio = useCallback(
    (audioDataUri: string) => {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = audioDataUri;
      audioRef.current.oncanplaythrough = () => {
        if (!audioRef.current) {
          return;
        }
        // Create audio context and analyzer if needed
        if (!analyserRef.current) {
          const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContextClass();
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;

          const bufferLength = analyser.frequencyBinCount;
          const buffer = new ArrayBuffer(bufferLength);
          const dataArray = new Uint8Array(buffer);
          dataArrayRef.current = dataArray as AudioAnalyzerData;
          const source = audioContext.createMediaElementSource(
            audioRef.current
          );
          source.connect(analyser);
          analyser.connect(audioContext.destination);

          analyserRef.current = analyser;
          dataArrayRef.current = dataArray;
        }

        // Start playback and set speaking state
        audioRef.current.play();
        setIsSpeaking(true);
        useAvatarStore.setState({ isProcessingVerbalQuery: false }); // Set to false here

        // When audio finishes, reset speaking state
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          setMouthOpen(0);
        };
      };
    },
    [setIsSpeaking]
  );

  useEffect(() => {
    if (currentAudioDataUri) {
      setupAudio(currentAudioDataUri);
    } else {
      // If the URI is cleared, stop the audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }
  }, [currentAudioDataUri, setupAudio]);

  // Register the speech handler with the store
  useEffect(() => {
    setSpeechHandler(generateSpeech);

    // Play idle animation
    if (actions && actions.idle) {
      actions.idle.reset().fadeIn(0.5).play();
    }

    return () => {
      setSpeechHandler(null);
    };
  }, [actions, setSpeechHandler]);

  // Animation frame loop for lip sync
  useFrame(() => {
    if (isSpeaking && analyserRef.current && dataArrayRef.current) {
      // Get audio data for this frame
      const audioData = new Uint8Array(dataArrayRef.current.buffer);
      analyserRef.current.getByteFrequencyData(audioData);
      dataArrayRef.current.set(audioData);

      // Calculate audio level for mouth opening
      const averageFrequency =
        Array.from(dataArrayRef.current)
          .slice(0, 20) // Focus on lower frequencies for speech
          .reduce((sum, value) => sum + value, 0) / 20;

      // Normalize value between 0 and 1 with some scaling
      const normalizedValue = Math.min(1, averageFrequency / 128) * 1.2;

      // Update mouth open value with some smoothing
      setMouthOpen((prev) => prev * 0.5 + normalizedValue * 0.5);
    } else if (!isSpeaking && mouthOpen > 0.01) {
      // Gradually close mouth when not speaking
      setMouthOpen((prev) => prev * 0.8);
    }

    // Apply mouth open value to morph targets if they exist
    const face = nodes.Wolf3D_Head as THREE.SkinnedMesh;
    if (face && face.morphTargetInfluences && face.morphTargetDictionary) {
      const mouthIndex = face.morphTargetDictionary.mouthOpen || 0;
      face.morphTargetInfluences[mouthIndex] = mouthOpen;
    }
  });

  return (
    <group ref={group}>
      <primitive
        object={scene}
        position={[0, -1.2, 0]}
        rotation={[0, 0, 0]}
        scale={2}
      />
    </group>
  );
}


  