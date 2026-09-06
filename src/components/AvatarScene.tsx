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
    <div className="relative w-[120px] h-[120px] rounded bg-surface-2 border border-border overflow-hidden">
      {isSpeaking && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse-slow z-10" title="Speaking..." />
      )}

      <Canvas camera={{ position: [0, 1.2, 2.5], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <Avatar />
          <Environment preset="city" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2 - 0.2}
            maxPolarAngle={Math.PI / 2 + 0.2}
            minAzimuthAngle={-0.2}
            maxAzimuthAngle={0.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
