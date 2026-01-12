import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ChatbotAvatar = ({ emotion, isSpeaking }) => {
  const groupRef = useRef();
  const bodyRef = useRef();
  const screenRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const mouthRef = useRef();

  const emotionStyles = {
    neutral: { eyeScale: 1, eyeGlow: 0.8, mouthCurve: 0.1, glowColor: '#00d4ff' },
    happy: { eyeScale: 1.1, eyeGlow: 1.2, mouthCurve: 0.4, glowColor: '#00ff88' },
    excited: { eyeScale: 1.2, eyeGlow: 1.5, mouthCurve: 0.5, glowColor: '#ffaa00' },
    sad: { eyeScale: 0.8, eyeGlow: 0.4, mouthCurve: -0.2, glowColor: '#6666ff' },
    thinking: { eyeScale: 0.9, eyeGlow: 0.9, mouthCurve: 0.2, glowColor: '#aa66ff' }
  };

  const style = emotionStyles[emotion] || emotionStyles.neutral;

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Gentle floating
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
      groupRef.current.position.y = Math.sin(time * 1.2) * 0.02;
    }

    // Body pulse
    if (bodyRef.current) {
      bodyRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.01);
    }

    // Screen glow pulse
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = 0.3 + Math.sin(time * 1.5) * 0.1;
    }

    // Eyes - blink + emotion
    if (leftEyeRef.current && rightEyeRef.current) {
      const blink = Math.sin(time * 4) > 0.95 ? 0.1 : style.eyeScale;
      leftEyeRef.current.scale.set(1, blink, 1);
      rightEyeRef.current.scale.set(1, blink, 1);
      
      // Eye glow sync
      leftEyeRef.current.material.emissiveIntensity = style.eyeGlow;
      rightEyeRef.current.material.emissiveIntensity = style.eyeGlow;
    }

    // Mouth animation
    if (mouthRef.current && isSpeaking) {
      mouthRef.current.scale.y = 0.8 + Math.sin(time * 8) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.2}>
      {/* Main body - shiny chrome sphere */}
      <mesh ref={bodyRef}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshStandardMaterial
          color="#2a2a3a"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Screen - glowing black panel */}
      <mesh ref={screenRef} position={[0, 0.1, 1.45]}>
        <cylinderGeometry args={[0.95, 0.95, 0.12, 32]} />
        <meshStandardMaterial
          color="#0a0a1a"
          emissive="#1a1a2e"
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.1}
        />
      </mesh>

      {/* Left Eye */}
      <mesh ref={leftEyeRef} position={[-0.35, 0.25, 1.52]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial
          color={style.glowColor}
          emissive={style.glowColor}
          emissiveIntensity={style.eyeGlow}
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>

      {/* Right Eye */}
      <mesh ref={rightEyeRef} position={[0.35, 0.25, 1.52]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial
          color={style.glowColor}
          emissive={style.glowColor}
          emissiveIntensity={style.eyeGlow}
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>

      {/* Cute Mouth - curved line */}
      <mesh ref={mouthRef} position={[0, -0.15, 1.52]}>
        <ringGeometry args={[0.25, 0.28, 16]} />
        <meshBasicMaterial
          color={style.glowColor}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Side accent lights */}
      <mesh position={[-0.7, 0, 1.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.7, 0, 1.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
      </mesh>

      {/* Bottom glow ring */}
      <mesh position={[0, -1.2, 0]}>
        <ringGeometry args={[1.5, 1.6, 32]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Environment lighting */}
      <pointLight position={[0, 0, 3]} color="#00d4ff" intensity={0.8} distance={5} />
      <ambientLight intensity={0.4} />
    </group>
  );
};

export default ChatbotAvatar;
