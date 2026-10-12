import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Camera, Eye, Zap, Power, RotateCcw } from 'lucide-react';

// ==========================================
// 1. CLICKABLE WALL SWITCHBOARD
// ==========================================
// Canvas-based Switch Icon Decal (Zero external font dependencies, 100% crash-proof)
function SwitchIconDecal({ iconText, isOn }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);
    ctx.font = '34px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconText, 32, 34);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [iconText, isOn]);

  return (
    <mesh position={[0, 0.42, 0.03]}>
      <planeGeometry args={[0.22, 0.22]} />
      <meshBasicMaterial map={texture} transparent opacity={isOn ? 0.95 : 0.6} />
    </mesh>
  );
}

function SwitchRocker({ name, isOn, onClick, position, label, iconText }) {
  const rockerRef = useRef();

  useFrame(() => {
    if (rockerRef.current) {
      // Smooth flip angle: tilted down (-0.18 rad) when OFF, tilted up (+0.18 rad) when ON
      const targetAngle = isOn ? 0.22 : -0.22;
      rockerRef.current.rotation.x += (targetAngle - rockerRef.current.rotation.x) * 0.25;
    }
  });

  return (
    <group position={position}>
      {/* Icon above switch */}
      <SwitchIconDecal iconText={iconText} isOn={isOn} />

      {/* Switch Bezel Base */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.32, 0.58, 0.04]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Rocker Toggle (Clickable) */}
      <group
        ref={rockerRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(name);
        }}
        position={[0, 0, 0.035]}
      >
        <mesh>
          <boxGeometry args={[0.26, 0.48, 0.05]} />
          <meshStandardMaterial
            color={isOn ? '#FFFFFF' : '#F1F5F9'}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>

        {/* Small Active Indicator Dot on rocker */}
        <mesh position={[0, 0.16, 0.026]}>
          <circleGeometry args={[0.028, 16]} />
          <meshBasicMaterial color={isOn ? '#22D3EE' : '#94A3B8'} />
        </mesh>
      </group>
    </group>
  );
}

function SwitchboardWallMount({ appliances, onToggle }) {
  const getIsOn = (name) => appliances.find((a) => a.name === name)?.state === 'ON';

  return (
    <group position={[-3.85, 0.4, 2.2]} rotation={[0, Math.PI / 2, 0]}>
      {/* Wall Faceplate Outer Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 1.25, 0.04]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.25} metalness={0.05} />
      </mesh>

      {/* Decorative Beveled Border */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[2.28, 1.33, 0.02]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
      </mesh>

      {/* Screw Rivets at Corners */}
      {[-0.95, 0.95].map((x, xi) =>
        [-0.5, 0.5].map((y, yi) => (
          <mesh key={`${xi}-${yi}`} position={[x, y, 0.022]}>
            <circleGeometry args={[0.035, 12]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} />
          </mesh>
        ))
      )}

      {/* 4 Rocker Switches */}
      <SwitchRocker
        name="Fan"
        isOn={getIsOn('Fan')}
        onClick={onToggle}
        position={[-0.68, -0.04, 0]}
        label="Fan"
        iconText="🌀"
      />
      <SwitchRocker
        name="Light"
        isOn={getIsOn('Light')}
        onClick={onToggle}
        position={[-0.23, -0.04, 0]}
        label="Light"
        iconText="💡"
      />
      <SwitchRocker
        name="AC"
        isOn={getIsOn('AC')}
        onClick={onToggle}
        position={[0.23, -0.04, 0]}
        label="AC"
        iconText="❄️"
      />
      <SwitchRocker
        name="Air Fryer"
        isOn={getIsOn('Air Fryer')}
        onClick={onToggle}
        position={[0.68, -0.04, 0]}
        label="Fryer"
        iconText="🍲"
      />
    </group>
  );
}

// ==========================================
// 2. CEILING FAN WITH SMOOTH ROTATION
// ==========================================
function CeilingFan({ isOn, onClick }) {
  const bladesRef = useRef();
  const speedRef = useRef(0);

  useFrame((_, delta) => {
    // Fan physics: accelerate when ON, decelerate when OFF
    const targetSpeed = isOn ? 16 : 0;
    speedRef.current += (targetSpeed - speedRef.current) * (isOn ? 0.05 : 0.025);

    if (bladesRef.current && speedRef.current > 0.01) {
      bladesRef.current.rotation.y += speedRef.current * delta;
    }
  });

  return (
    <group
      position={[-0.3, 2.7, -0.4]}
      onClick={(e) => {
        e.stopPropagation();
        onClick('Fan');
      }}
      className="cursor-pointer"
    >
      {/* Downrod from ceiling */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 16]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Motor Hub Housing */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.24, 0.18, 24]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Rotating Blades Assembly */}
      <group ref={bladesRef} position={[0, -0.02, 0]}>
        {[0, 120, 240].map((angle, idx) => (
          <group key={idx} rotation={[0, (angle * Math.PI) / 180, 0]}>
            {/* Blade Bracket arm */}
            <mesh position={[0.25, 0, 0]}>
              <boxGeometry args={[0.22, 0.02, 0.06]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* Aerodynamic Blade */}
            <mesh position={[0.9, 0, 0]} rotation={[0.08, 0, 0]}>
              <boxGeometry args={[1.1, 0.015, 0.22]} />
              <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// ==========================================
// 3. FLUSH MOUNT CEILING LIGHT & ROOM LIGHTING
// ==========================================
function CeilingLight({ isOn, onClick }) {
  const lightRef = useRef();

  return (
    <group
      position={[1.2, 2.9, -0.3]}
      onClick={(e) => {
        e.stopPropagation();
        onClick('Light');
      }}
      className="cursor-pointer"
    >
      {/* Outer Rim */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.48, 0.5, 0.08, 32]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.2} />
      </mesh>

      {/* Luminous Diffuser Panel */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.02, 32]} />
        <meshBasicMaterial color={isOn ? '#FFFBEB' : '#64748B'} />
      </mesh>

      {/* Main Bedroom Room Illumination */}
      {isOn && (
        <>
          {/* Soft diffuse room light */}
          <pointLight
            ref={lightRef}
            position={[0, -0.2, 0]}
            color="#FFF4D6"
            distance={11}
            decay={1.8}
            intensity={9.5}
          />
          {/* Downward cone spotlight */}
          <spotLight
            position={[0, -0.1, 0]}
            color="#FFF7E0"
            intensity={14}
            distance={10}
            angle={Math.PI / 2.2}
            penumbra={0.85}
          />
          {/* Volumetric ambient glow halo */}
          <mesh position={[0, -0.1, 0]}>
            <sphereGeometry args={[0.7, 24, 24]} />
            <meshBasicMaterial
              color="#FEF08A"
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// Digital LED Canvas Texture for AC unit
function ACDisplayMesh({ isOn, temperature }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = isOn ? '#031326' : '#E2E8F0';
    ctx.fillRect(0, 0, 128, 64);

    if (isOn) {
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${temperature}°C`, 64, 32);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [isOn, temperature]);

  return (
    <group position={[0.55, 0.08, 0.245]}>
      <mesh>
        <planeGeometry args={[0.28, 0.14]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

// ==========================================
// 4. WALL-MOUNTED AIR CONDITIONER (AC)
// ==========================================
function ACUnit({ isOn, temperature = 24, onClick }) {
  const louverRef = useRef();

  useFrame((state) => {
    if (louverRef.current) {
      if (isOn) {
        // Flap smoothly opens and continuously oscillates/moves gently like real AC louvers
        const swing = Math.sin(state.clock.elapsedTime * 2.2) * 0.12;
        const targetRot = 0.42 + swing;
        louverRef.current.rotation.x += (targetRot - louverRef.current.rotation.x) * 0.15;
      } else {
        // Flap closes completely when OFF
        louverRef.current.rotation.x += (0.0 - louverRef.current.rotation.x) * 0.15;
      }
    }
  });

  return (
    <group
      position={[2.6, 2.3, -2.8]}
      onClick={(e) => {
        e.stopPropagation();
        onClick('AC');
      }}
      className="cursor-pointer"
    >
      {/* AC Main Cabinet */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.75, 0.58, 0.42]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Front Curved Bevel */}
      <mesh position={[0, -0.05, 0.22]}>
        <boxGeometry args={[1.72, 0.42, 0.04]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
      </mesh>

      {/* Brand logo decal placeholder */}
      <mesh position={[0, 0.05, 0.245]}>
        <boxGeometry args={[0.2, 0.04, 0.005]} />
        <meshStandardMaterial color="#CBD5E1" />
      </mesh>

      {/* Digital Temperature LED Display (Clean number display, zero ambient glow spill) */}
      <ACDisplayMesh isOn={isOn} temperature={temperature} />

      {/* Motorized Bottom Vent Flap / Louver (Moves when ON) */}
      <group ref={louverRef} position={[0, -0.22, 0.14]}>
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1.65, 0.04, 0.14]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

// ==========================================
// 5. COUNTERTOP AIR FRYER
// ==========================================
function AirFryer({ isOn, onClick }) {
  const heatRef = useRef();

  useFrame((_, delta) => {
    if (heatRef.current && isOn) {
      heatRef.current.intensity = 5.0 + Math.sin(Date.now() * 0.007) * 1.5;
    }
  });

  return (
    <group
      position={[2.7, 0.72, 0.9]}
      onClick={(e) => {
        e.stopPropagation();
        onClick('Air Fryer');
      }}
      className="cursor-pointer"
    >
      {/* Main Oval Black Body */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.68, 32]} />
        <meshStandardMaterial color="#0F172A" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* Top Chrome Ring & Touch Display */}
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.27, 0.28, 0.04, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Front Basket Tray Handle */}
      <mesh position={[0, 0.36, 0.32]}>
        <boxGeometry args={[0.07, 0.22, 0.08]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} />
      </mesh>

      {/* Front Basket Glass Viewing Window */}
      <mesh position={[0, 0.38, 0.305]}>
        <boxGeometry args={[0.34, 0.26, 0.04]} />
        <meshStandardMaterial
          color={isOn ? '#F59E0B' : '#1E293B'}
          emissive={isOn ? '#EA580C' : '#000000'}
          emissiveIntensity={isOn ? 1.6 : 0}
          roughness={0.2}
        />
      </mesh>

      {/* Internal Combustion Glowing Heat when ON */}
      {isOn && (
        <>
          <pointLight
            ref={heatRef}
            position={[0, 0.4, 0.38]}
            color="#F59E0B"
            distance={3.2}
            decay={1.8}
            intensity={5.5}
          />
          <mesh position={[0, 0.4, 0.35]}>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshBasicMaterial
              color="#F97316"
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// ==========================================
// 6. BEDROOM FURNITURE & ARCHITECTURE
// ==========================================
function BedroomDecor({ isLightOn }) {
  return (
    <group>
      {/* Floor - Light Oak Wood Plank finish */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[8.5, 7.5]} />
        <meshStandardMaterial color="#D7C4B7" roughness={0.65} metalness={0.05} />
      </mesh>

      {/* Soft Plush Area Rug beside bed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.4, 0.01, 0.5]}>
        <planeGeometry args={[3.8, 3.6]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.95} />
      </mesh>

      {/* Back Wall with Warm Off-White Paint */}
      <mesh position={[0, 2.0, -3.2]}>
        <planeGeometry args={[8.5, 4.4]} />
        <meshStandardMaterial color="#F3EFEA" roughness={0.8} />
      </mesh>

      {/* Left Wall with Window & Switchboard column */}
      <mesh position={[-4.0, 2.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[7.5, 4.4]} />
        <meshStandardMaterial color="#EAE4DC" roughness={0.8} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[4.0, 2.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[7.5, 4.4]} />
        <meshStandardMaterial color="#EDE7E0" roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 7.5]} />
        <meshStandardMaterial color="#FAFAF9" roughness={0.9} />
      </mesh>

      {/* BEDROOM BED FRAME */}
      <group position={[-0.4, 0, -1.0]}>
        {/* Headboard (Rich Walnut Wood) */}
        <mesh position={[0, 1.0, -1.45]}>
          <boxGeometry args={[2.7, 1.4, 0.12]} />
          <meshStandardMaterial color="#5C3D2E" roughness={0.5} />
        </mesh>
        {/* Wooden Bed Base Frame */}
        <mesh position={[0, 0.24, 0]}>
          <boxGeometry args={[2.5, 0.36, 2.7]} />
          <meshStandardMaterial color="#6A4532" roughness={0.55} />
        </mesh>
        {/* Plush Mattress */}
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[2.35, 0.28, 2.55]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.8} />
        </mesh>
        {/* Beige Linen Duvet Comforter */}
        <mesh position={[0, 0.62, 0.2]}>
          <boxGeometry args={[2.3, 0.12, 2.1]} />
          <meshStandardMaterial color="#E5D9CC" roughness={0.7} />
        </mesh>
        {/* Dark Grey Bed Runner Throw */}
        <mesh position={[0, 0.67, 0.85]}>
          <boxGeometry args={[2.32, 0.04, 0.6]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>
        {/* Sleeping Pillows */}
        {[-0.6, 0.6].map((x, i) => (
          <group key={i} position={[x, 0.72, -0.95]}>
            <mesh rotation={[-0.2, 0, 0]}>
              <boxGeometry args={[0.75, 0.16, 0.45]} />
              <meshStandardMaterial color="#F1F5F9" roughness={0.6} />
            </mesh>
          </group>
        ))}
        {/* Accent Navy Throw Pillow */}
        <mesh position={[0, 0.75, -0.65]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[0.5, 0.18, 0.35]} />
          <meshStandardMaterial color="#1E293B" roughness={0.75} />
        </mesh>
      </group>

      {/* BEDSIDE NIGHTSTAND & WARM TABLE LAMP */}
      <group position={[-2.1, 0, -2.4]}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.75, 0.65, 0.65]} />
          <meshStandardMaterial color="#5C3D2E" roughness={0.5} />
        </mesh>
        {/* Small Table Lamp */}
        <mesh position={[0, 0.76, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.16, 0.22, 0.24, 20]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.4} />
        </mesh>
        {/* Warm nightstand lamp light */}
        <pointLight position={[0, 0.95, 0]} color="#FDE68A" distance={3.8} intensity={isLightOn ? 2.5 : 4.5} />
      </group>

      {/* WOODEN STUDY DESK ON THE RIGHT */}
      <group position={[2.7, 0, 0.5]}>
        {/* Desk Tabletop */}
        <mesh position={[0, 0.68, 0]}>
          <boxGeometry args={[1.35, 0.08, 1.9]} />
          <meshStandardMaterial color="#6A4532" roughness={0.5} />
        </mesh>
        {/* Desk Drawers / Legs */}
        <mesh position={[0.45, 0.32, 0]}>
          <boxGeometry args={[0.38, 0.64, 1.8]} />
          <meshStandardMaterial color="#5C3D2E" roughness={0.55} />
        </mesh>
        <mesh position={[-0.55, 0.32, 0]}>
          <boxGeometry args={[0.06, 0.64, 1.8]} />
          <meshStandardMaterial color="#5C3D2E" roughness={0.55} />
        </mesh>

        {/* Desk Potted Plant */}
        <group position={[0.3, 0.74, -0.65]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.09, 0.07, 0.16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#15803D" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* FRAMED WALL ART ABOVE BED */}
      <group position={[0.2, 2.2, -3.15]}>
        {[-0.55, 0.55].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.8, 1.05, 0.03]} />
              <meshStandardMaterial color="#1E293B" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[0.68, 0.92]} />
              <meshStandardMaterial color={i === 0 ? '#E2E8F0' : '#CBD5E1'} roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// ==========================================
// 7. PHOTO INTERACTIVE HUD MODE
// ==========================================
function PhotoInteractiveHUD({ appliances, onToggle, temperature = 24 }) {
  const getIsOn = (name) => appliances.find((a) => a.name === name)?.state === 'ON';
  const isLightOn = getIsOn('Light');
  const isFanOn = getIsOn('Fan');
  const isACOn = getIsOn('AC');
  const isFryerOn = getIsOn('Air Fryer');

  return (
    <div className="relative w-full h-full min-h-[460px] overflow-hidden rounded-2xl select-none">
      {/* Background Room Photo */}
      <img
        src="/room_photo.jpg"
        alt="Real Bedroom Hardware Setup"
        className={`w-full h-full object-cover transition-all duration-700 ${
          isLightOn ? 'brightness-105' : 'brightness-75 contrast-110'
        }`}
      />

      {/* Room Darkening Vignette when light is off */}
      {!isLightOn && (
        <div className="absolute inset-0 bg-blue-950/30 backdrop-contrast-125 pointer-events-none transition-opacity duration-700" />
      )}

      {/* 1. CLICKABLE SWITCHBOARD OVERLAY ON LEFT WALL */}
      <div
        className="absolute top-[28%] left-[4.8%] w-[18%] aspect-[1.4/1] rounded-lg p-2.5 flex flex-col justify-between border border-white/40 shadow-2xl backdrop-blur-[2px] transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
        }}
      >
        <div className="flex items-center justify-around w-full h-full gap-1.5">
          {/* Fan Switch */}
          <button
            onClick={() => onToggle('Fan')}
            className="flex-1 flex flex-col items-center justify-between h-full py-1 rounded bg-slate-100 hover:bg-white border border-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Toggle Ceiling Fan"
          >
            <span className="text-sm">🌀</span>
            <div
              className={`w-4 h-9 rounded-sm border transition-all flex flex-col justify-between p-0.5 ${
                isFanOn ? 'bg-cyan-500 border-cyan-600' : 'bg-slate-300 border-slate-400'
              }`}
            >
              <div
                className={`w-full h-4 rounded-sm bg-white shadow-sm transition-transform ${
                  isFanOn ? 'translate-y-4' : 'translate-y-0'
                }`}
              />
            </div>
            <span className="text-[9px] font-bold text-slate-700 font-mono">FAN</span>
          </button>

          {/* Light Switch */}
          <button
            onClick={() => onToggle('Light')}
            className="flex-1 flex flex-col items-center justify-between h-full py-1 rounded bg-slate-100 hover:bg-white border border-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Toggle Ceiling Light"
          >
            <span className="text-sm">💡</span>
            <div
              className={`w-4 h-9 rounded-sm border transition-all flex flex-col justify-between p-0.5 ${
                isLightOn ? 'bg-cyan-500 border-cyan-600' : 'bg-slate-300 border-slate-400'
              }`}
            >
              <div
                className={`w-full h-4 rounded-sm bg-white shadow-sm transition-transform ${
                  isLightOn ? 'translate-y-4' : 'translate-y-0'
                }`}
              />
            </div>
            <span className="text-[9px] font-bold text-slate-700 font-mono">LGT</span>
          </button>

          {/* AC Switch */}
          <button
            onClick={() => onToggle('AC')}
            className="flex-1 flex flex-col items-center justify-between h-full py-1 rounded bg-slate-100 hover:bg-white border border-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Toggle Air Conditioner"
          >
            <span className="text-sm">❄️</span>
            <div
              className={`w-4 h-9 rounded-sm border transition-all flex flex-col justify-between p-0.5 ${
                isACOn ? 'bg-cyan-500 border-cyan-600' : 'bg-slate-300 border-slate-400'
              }`}
            >
              <div
                className={`w-full h-4 rounded-sm bg-white shadow-sm transition-transform ${
                  isACOn ? 'translate-y-4' : 'translate-y-0'
                }`}
              />
            </div>
            <span className="text-[9px] font-bold text-slate-700 font-mono">AC</span>
          </button>

          {/* Fryer Switch */}
          <button
            onClick={() => onToggle('Air Fryer')}
            className="flex-1 flex flex-col items-center justify-between h-full py-1 rounded bg-slate-100 hover:bg-white border border-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Toggle Air Fryer"
          >
            <span className="text-sm">🍲</span>
            <div
              className={`w-4 h-9 rounded-sm border transition-all flex flex-col justify-between p-0.5 ${
                isFryerOn ? 'bg-amber-500 border-amber-600' : 'bg-slate-300 border-slate-400'
              }`}
            >
              <div
                className={`w-full h-4 rounded-sm bg-white shadow-sm transition-transform ${
                  isFryerOn ? 'translate-y-4' : 'translate-y-0'
                }`}
              />
            </div>
            <span className="text-[9px] font-bold text-slate-700 font-mono">FRY</span>
          </button>
        </div>
      </div>

      {/* 2. CEILING FAN ROTATION ANIMATION OVERLAY */}
      <div
        onClick={() => onToggle('Fan')}
        className="absolute top-[4%] left-[28%] w-[28%] aspect-square cursor-pointer flex items-center justify-center group"
      >
        <div
          className={`w-full h-full rounded-full transition-transform duration-300 ${
            isFanOn ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '0.45s' }}
        >
          {isFanOn && (
            <div className="w-full h-full rounded-full border-2 border-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.4)]" />
          )}
        </div>
        <span className="absolute px-2 py-0.5 rounded bg-space-950/80 text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
          Click Fan: {isFanOn ? 'RUNNING' : 'STOPPED'}
        </span>
      </div>

      {/* 3. CEILING LIGHT GLOW BLOOM OVERLAY */}
      <div
        onClick={() => onToggle('Light')}
        className="absolute top-[7.5%] left-[64%] w-[12%] aspect-square rounded-full cursor-pointer flex items-center justify-center group"
      >
        {isLightOn && (
          <div className="absolute inset-0 rounded-full bg-amber-200/50 blur-xl animate-pulse scale-150 pointer-events-none" />
        )}
        <span className="absolute px-2 py-0.5 rounded bg-space-950/80 text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Click Light: {isLightOn ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* 4. AC TEMPERATURE DISPLAY OVERLAY */}
      <div
        onClick={() => onToggle('AC')}
        className="absolute top-[14%] right-[4%] w-[24%] h-[12%] rounded cursor-pointer group flex items-center justify-center"
      >
        {isACOn ? (
          <div className="absolute top-[28%] right-[12%] px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-400/40 text-cyan-300 font-mono font-bold text-xs">
            {`${temperature}°C`}
          </div>
        ) : (
          <div className="absolute top-[28%] right-[12%] px-1.5 py-0.5 rounded bg-black/60 text-slate-500 font-mono text-xs">
            --
          </div>
        )}
        <span className="absolute bottom-0 px-2 py-0.5 rounded bg-space-950/80 text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Click AC: {isACOn ? 'COOLING (24°C)' : 'STANDBY'}
        </span>
      </div>

      {/* 5. AIR FRYER GLOW OVERLAY ON DESK */}
      <div
        onClick={() => onToggle('Air Fryer')}
        className="absolute bottom-[23%] right-[7%] w-[12%] h-[18%] rounded-full cursor-pointer group flex items-center justify-center"
      >
        {isFryerOn && (
          <div className="absolute inset-0 rounded-2xl bg-amber-500/40 blur-lg animate-pulse scale-110 pointer-events-none" />
        )}
        <span className="absolute -top-6 px-2 py-0.5 rounded bg-space-950/80 text-[10px] font-mono text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Click Fryer: {isFryerOn ? 'HEATING' : 'OFF'}
        </span>
      </div>
    </div>
  );
}

// ==========================================
// 8. MASTER INTERACTIVE ROOM COMPONENT
// ==========================================
export default function InteractiveFloor3D({ appliances, onToggle, temperature = 24 }) {
  // Modes: 'photo' (Exact Photo with Live Clickable Switchboard) or '3d' (Full 3D Real-time Bedroom)
  const [viewMode, setViewMode] = useState('photo');

  const getIsOn = (name) => appliances.find((a) => a.name === name)?.state === 'ON';
  const isLightOn = getIsOn('Light');

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Controls Bar OUTSIDE of the interactive map area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono text-cyan-300 font-medium">
            Interactive Bedroom — Click switchboard or appliances directly
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-space-850 border border-white/10 shadow-sm shrink-0">
          <button
            onClick={() => setViewMode('photo')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              viewMode === 'photo'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-cyan-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Real Photo HUD</span>
          </button>

          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-cyan-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D Interactive Room</span>
          </button>
        </div>
      </div>

      {/* Clean Unobstructed Interactive Map Viewport (Full Screen Scale) */}
      <div className="relative w-full h-[520px] lg:h-[680px] xl:h-[740px] rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
        {viewMode === 'photo' ? (
          <PhotoInteractiveHUD
            appliances={appliances}
            onToggle={onToggle}
            temperature={temperature}
          />
        ) : (
          <Canvas
            camera={{ position: [0.6, 1.7, 4.4], fov: 46 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            {/* Ambient Base Light */}
            <ambientLight intensity={isLightOn ? 0.8 : 0.22} color={isLightOn ? '#FFF8E7' : '#93C5FD'} />
            <directionalLight position={[-4, 3, 2]} intensity={isLightOn ? 0.7 : 0.3} color="#FFFFFF" />

            {/* Complete Bedroom Environment */}
            <BedroomDecor isLightOn={isLightOn} />

            {/* Clickable Switchboard mounted on left wall */}
            <SwitchboardWallMount appliances={appliances} onToggle={onToggle} />

            {/* Interactive Ceiling Fan */}
            <CeilingFan isOn={getIsOn('Fan')} onClick={onToggle} />

            {/* Interactive Ceiling Light */}
            <CeilingLight isOn={isLightOn} onClick={onToggle} />

            {/* Interactive AC Unit with 24°C Glow */}
            <ACUnit isOn={getIsOn('AC')} temperature={temperature} onClick={onToggle} />

            {/* Interactive Air Fryer on Desk */}
            <AirFryer isOn={getIsOn('Air Fryer')} onClick={onToggle} />

            <OrbitControls
              enableZoom={true}
              maxDistance={7}
              minDistance={2.5}
              maxPolarAngle={Math.PI / 2.05}
              minPolarAngle={Math.PI / 6}
              dampingFactor={0.05}
            />
          </Canvas>
        )}
      </div>
    </div>
  );
}
