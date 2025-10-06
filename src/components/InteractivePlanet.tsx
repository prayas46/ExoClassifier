import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Planet({ radius = 1, color = '#9B87F5', showRing = false }: { radius?: number; color?: string; showRing?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.1;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * 0.12;
      cloudsRef.current.rotation.x = Math.sin(time * 0.05) * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = time * 0.05;
    }
  });

  // Create procedural planet-like texture with noise
  const surfaceTexture = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base color from prop
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, color);
    grad.addColorStop(0.5, '#1a1a2e');
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Add noise/variation
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 3;
      ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
      ctx.fillRect(x, y, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  })();

  return (
    <group>
      {/* Main Planet Surface */}
      <Sphere ref={meshRef} args={[radius, 64, 64]} castShadow receiveShadow>
        <meshStandardMaterial
          map={surfaceTexture || undefined}
          color={color}
          roughness={0.8}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </Sphere>

      {/* Cloud Layer for depth */}
      <Sphere ref={cloudsRef} args={[radius * 1.01, 64, 64]}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={1}
          metalness={0}
        />
      </Sphere>

      {/* Atmospheric Glow - multilayer for depth */}
      <Sphere args={[radius * 1.12, 64, 64]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>

      <Sphere ref={glowRef} args={[radius * 1.18, 64, 64]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Ring System (optional) */}
      {showRing && (
        <group>
          <mesh rotation={[Math.PI / 2.5, 0, 0]} castShadow receiveShadow>
            <torusGeometry args={[radius * 1.8, 0.08, 16, 100]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.7}
              roughness={0.4}
              metalness={0.6}
              emissive={color}
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Ring shadow/depth */}
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <torusGeometry args={[radius * 1.9, 0.04, 16, 100]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

const InteractivePlanet = React.memo(function InteractivePlanet({
  planetType = 'default',
  className = '',
  radius,
  ring,
  hue,
  rotateSpeed,
}: {
  planetType?: string;
  className?: string;
  radius?: number;
  ring?: boolean;
  hue?: number; // 0..360
  rotateSpeed?: number; // 0.1..2
}) {
  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    setMounted(true);
    setWebgl(isWebGLAvailable());
  }, []);

  const planetColors: Record<string, { planet: string; ambient: string }> = {
    'Earth-like': { planet: '#22c55e', ambient: '#86efac' },
    'Super-Earth': { planet: '#3b82f6', ambient: '#93c5fd' },
    'Gas Giant': { planet: '#f59e0b', ambient: '#fcd34d' },
    'Hot Jupiter': { planet: '#ef4444', ambient: '#fca5a5' },
    'Neptune-like': { planet: '#8b5cf6', ambient: '#c4b5fd' },
    Rocky: { planet: '#84cc16', ambient: '#bef264' },
    default: { planet: '#9B87F5', ambient: '#c4b5fd' },
  };

  // If hue provided, use it to derive color; otherwise map by planetType
  const colors = hue !== undefined
    ? { planet: `hsl(${Math.max(0, Math.min(360, hue))} 52% 62%)`, ambient: `hsl(${Math.max(0, Math.min(360, hue))} 72% 76%)` }
    : (planetColors[planetType] || planetColors.default);

  if (!mounted) {
    return <div className={`w-full h-full ${className} rounded-2xl bg-gradient-to-br from-slate-900 to-purple-900`} />;
  }

  if (!webgl) {
    return (
      <div className={`w-full h-full ${className} rounded-2xl bg-gradient-to-br from-slate-900 to-purple-900 grid place-items-center text-white/70`}>
        WebGL not supported on this device.
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#000000']} />
          {/* Better lighting setup for planet detail */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 3, 5]} intensity={1.2} color={colors.ambient} castShadow />
          <pointLight position={[-5, 0, -5]} intensity={0.5} color={colors.planet} />
          <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={0.5} castShadow />

          <Planet radius={radius ?? 1.5} color={colors.planet} showRing={ring ?? ['Gas Giant','Hot Jupiter','Neptune-like'].includes(planetType)} />
          <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={0.8} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={rotateSpeed ?? 0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />

          {/* Simplified lighting for performance */}
          <ContactShadows position={[0, -1.6, 0]} opacity={0.3} scale={10} blur={1} far={2} />
        </Suspense>
      </Canvas>
    </div>
  );
});

export default InteractivePlanet;
