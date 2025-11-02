// src/components/AvatarScene.tsx
"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Avatar from "./Avatar";
import useAvatarStore from "@/utils/avatarStore";

export default function AvatarScene() {
  const { isSpeaking } = useAvatarStore();

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-900">
      {isSpeaking && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-blue-500 text-white text-xs rounded-full z-10">
          Speaking...
        </div>
      )}

      <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Avatar />
          <Environment preset="city" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2 - 0.5}
            maxPolarAngle={Math.PI / 2 + 0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
