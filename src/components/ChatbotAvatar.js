import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ChatbotAvatar = ({ emotion = 'neutral', isSpeaking = false }) => {
  const groupRef = useRef();
  const bodyRef = useRef();
  const faceRef = useRef();
  const eyesGroupRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const mouthRef = useRef();

  const emotionStyles = {
    neutral: { eyeScale: 1, eyeGlow: 0.9, mouthCurve: 0.15, glowColor: '#00d4ff' },
    happy: { eyeScale: 1.1, eyeGlow: 1.2, mouthCurve: 0.4, glowColor: '#00ffcc' },
    excited: { eyeScale: 1.2, eyeGlow: 1.5, mouthCurve: 0.5, glowColor: '#ffaa00' },
    sad: { eyeScale: 0.85, eyeGlow: 0.5, mouthCurve: -0.2, glowColor: '#6a7cff' },
    thinking: { eyeScale: 0.95, eyeGlow: 1.0, mouthCurve: 0.2, glowColor: '#bb88ff' }
  };

  const style = emotionStyles[emotion] || emotionStyles.neutral;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    /* Floating + head tilt */
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.04;
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.05;
    }

    /* Breathing body */
    if (bodyRef.current) {
      const s = 1 + Math.sin(t * 2) * 0.015;
      bodyRef.current.scale.set(s, s, s);
    }

    /* Face glow pulse */
    if (faceRef.current) {
      faceRef.current.material.emissiveIntensity =
        0.6 + Math.sin(t * 2) * 0.15;
    }

    /* Eye movement (alive look) */
    if (eyesGroupRef.current) {
      eyesGroupRef.current.position.x = Math.sin(t * 0.8) * 0.03;
      eyesGroupRef.current.position.y = Math.sin(t * 1.1) * 0.02;
    }

    /* Natural blinking */
    const blink = Math.sin(t * 3.5) > 0.96 ? 0.1 : style.eyeScale;

    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = blink;
      rightEyeRef.current.scale.y = blink;

      leftEyeRef.current.material.emissiveIntensity = style.eyeGlow;
      rightEyeRef.current.material.emissiveIntensity = style.eyeGlow;
    }

    /* Mouth animation */
    if (mouthRef.current) {
      mouthRef.current.scale.y = isSpeaking
        ? 0.6 + Math.sin(t * 10) * 0.4
        : 1;
    }
  });

  return (
    <group ref={groupRef} scale={1.2}>
      {/* Main chrome body */}
      <mesh ref={bodyRef}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshStandardMaterial
          color="#1f2230"
          metalness={0.85}
          roughness={0.25}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Glass face bubble */}
      <mesh ref={faceRef} position={[0, 0.15, 1.2]}>
        <sphereGeometry args={[0.95, 64, 64]} />
        <meshPhysicalMaterial
          color="#05060d"
          transmission={0.9}
          thickness={0.6}
          roughness={0.05}
          metalness={0}
          emissive={style.glowColor}
          emissiveIntensity={0.6}
          clearcoat={1}
        />
      </mesh>

      {/* Eyes */}
      <group ref={eyesGroupRef}>
        <mesh ref={leftEyeRef} position={[-0.25, 0.3, 1.9]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color={style.glowColor}
            emissive={style.glowColor}
            emissiveIntensity={style.eyeGlow}
          />
        </mesh>

        <mesh ref={rightEyeRef} position={[0.25, 0.3, 1.9]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color={style.glowColor}
            emissive={style.glowColor}
            emissiveIntensity={style.eyeGlow}
          />
        </mesh>
      </group>

      {/* Smiling mouth */}
      <mesh ref={mouthRef} position={[0, -0.1, 1.9]}>
        <torusGeometry args={[0.22, 0.025, 16, 100, Math.PI]} />
        <meshStandardMaterial
          color={style.glowColor}
          emissive={style.glowColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Side accent lights */}
      <mesh position={[-0.7, 0, 1.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial
          color={style.glowColor}
          emissive={style.glowColor}
          emissiveIntensity={0.6}
        />
      </mesh>

      <mesh position={[0.7, 0, 1.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial
          color={style.glowColor}
          emissive={style.glowColor}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Bottom glow ring */}
      <mesh position={[0, -1.25, 0]}>
        <ringGeometry args={[1.5, 1.65, 32]} />
        <meshBasicMaterial
          color={style.glowColor}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lights */}
      <pointLight position={[0, 0, 3]} color={style.glowColor} intensity={1} />
      <ambientLight intensity={0.45} />
    </group>
  );
};

export default ChatbotAvatar;
