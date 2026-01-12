import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ChatbotAvatar = ({ emotion, isSpeaking }) => {
  const sphereRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const mouthRef = useRef();
  
  // Emotion-based eye and mouth states
  const emotionStates = useMemo(() => ({
    neutral: { eyeScale: 1, mouthCurve: 0, eyeGlow: 0.8, color: '#00d4ff' },
    happy: { eyeScale: 1.2, mouthCurve: 0.3, eyeGlow: 1.2, color: '#00ffaa' },
    excited: { eyeScale: 1.3, mouthCurve: 0.4, eyeGlow: 1.5, color: '#ffaa00' },
    sad: { eyeScale: 0.8, mouthCurve: -0.2, eyeGlow: 0.5, color: '#4466ff' },
    thinking: { eyeScale: 0.9, mouthCurve: 0.1, eyeGlow: 0.7, color: '#aa00ff' },
    concerned: { eyeScale: 0.85, mouthCurve: -0.1, eyeGlow: 0.6, color: '#ff6600' }
  }), []);

  const currentState = emotionStates[emotion] || emotionStates.neutral;

  // Animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Gentle floating animation
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(time * 0.5) * 0.1;
      sphereRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
    }
    
    // Blinking animation
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkCycle = Math.sin(time * 0.5) * 0.5 + 0.5;
      const shouldBlink = blinkCycle < 0.1;
      const blinkScale = shouldBlink ? 0.1 : currentState.eyeScale;
      
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(
        leftEyeRef.current.scale.y,
        blinkScale,
        0.3
      );
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(
        rightEyeRef.current.scale.y,
        blinkScale,
        0.3
      );
    }
    
    // Speaking animation
    if (mouthRef.current && isSpeaking) {
      const speakCycle = Math.sin(time * 8) * 0.5 + 0.5;
      mouthRef.current.scale.x = 1 + speakCycle * 0.3;
    }
  });

  // Create mouth curve geometry
  const mouthGeometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0,
      0.3, 0.15,
      0, Math.PI,
      false,
      0
    );
    const points = curve.getPoints(50);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <group>
      {/* Main sphere body */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Left eye */}
      <mesh ref={leftEyeRef} position={[-0.4, 0.2, 1.4]}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color={currentState.color} />
        <pointLight
          color={currentState.color}
          intensity={currentState.eyeGlow}
          distance={3}
        />
      </mesh>
      
      {/* Right eye */}
      <mesh ref={rightEyeRef} position={[0.4, 0.2, 1.4]}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color={currentState.color} />
        <pointLight
          color={currentState.color}
          intensity={currentState.eyeGlow}
          distance={3}
        />
      </mesh>
      
      {/* Mouth */}
      <line
        ref={mouthRef}
        position={[0, currentState.mouthCurve - 0.3, 1.4]}
        geometry={mouthGeometry}
      >
        <lineBasicMaterial color={currentState.color} linewidth={2} />
      </line>
      
      {/* Ambient glow around face */}
      <pointLight
        position={[0, 0, 2]}
        color={currentState.color}
        intensity={0.5}
        distance={4}
      />
    </group>
  );
};

export default ChatbotAvatar;
