"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import type { Group } from "three";
import { useApp } from "@/components/providers/AppProvider";

export interface SceneProgress { v: number }

type V3 = [number, number, number];
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

/** A box that grows upward from its base as scroll progress passes `start`. */
function Mass({ pos, size, start, progress, solid, edge }: { pos: V3; size: V3; start: number; progress: RefObject<SceneProgress>; solid: string; edge: string }) {
  const g = useRef<Group>(null);
  useFrame(() => {
    const grp = g.current;
    if (!grp) return;
    const k = clamp((progress.current.v - start) / 0.2);
    const e = 1 - Math.pow(1 - k, 3);
    grp.visible = k > 0;
    grp.scale.y = Math.max(e, 0.0001);
  });
  return (
    <group ref={g} position={pos}>
      <mesh position={[0, size[1] / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={solid} roughness={0.92} metalness={0} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        <Edges threshold={15} color={edge} />
      </mesh>
    </group>
  );
}

/** Camera orbits and descends as the scene progresses; the whole mass turns slowly. */
function Rig({ progress, target }: { progress: RefObject<SceneProgress>; target: V3 }) {
  useFrame((state) => {
    const p = progress.current.v;
    const a = -0.85 + p * 1.7;
    const r = 13 - p * 2.5;
    const h = 7.2 - p * 3.6;
    state.camera.position.set(Math.sin(a) * r, h, Math.cos(a) * r);
    state.camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

/**
 * Procedural stepped / cantilevered building built from boxes with edge lines.
 * `progress.current.v` (0..1) is written by GSAP ScrollTrigger; nothing here touches React state per frame.
 */
export default function HeroScene({ progress, active }: { progress: RefObject<SceneProgress>; active: boolean }) {
  const { theme } = useApp();
  const colors = useMemo(() => {
    const cs = getComputedStyle(document.documentElement);
    const v = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
    return { solid: v("--surface", "#f7f4ec"), edge: v("--ink", "#15130f"), grid: v("--ink-mute", "#7a7467"), accent: v("--copper", "#a55a28") };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <Canvas
      key={theme}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 32, position: [-8, 7, 9], near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <ambientLight intensity={1.15} />
      <directionalLight position={[6, 9, 5]} intensity={1.6} />
      <Rig progress={progress} target={[0, 1.5, 0]} />
      <gridHelper args={[18, 36, colors.grid, colors.grid]} position={[0, 0, 0]} />
      <group position={[0, 0, 0]}>
        <Mass progress={progress} start={0.0} pos={[0, 0, 0]} size={[7, 0.28, 4.2]} solid={colors.solid} edge={colors.edge} />
        <Mass progress={progress} start={0.12} pos={[-1.5, 0.28, 0]} size={[3.6, 1.35, 2.7]} solid={colors.solid} edge={colors.edge} />
        <Mass progress={progress} start={0.3} pos={[0.9, 1.63, 0.15]} size={[5.1, 1.0, 2.3]} solid={colors.solid} edge={colors.edge} />
        <Mass progress={progress} start={0.46} pos={[-0.6, 2.63, -0.1]} size={[2.9, 1.0, 2.0]} solid={colors.solid} edge={colors.edge} />
        <Mass progress={progress} start={0.62} pos={[0.1, 3.63, 0]} size={[4.0, 0.14, 2.6]} solid={colors.accent} edge={colors.edge} />
        {/* slender columns carrying the cantilever */}
        <Mass progress={progress} start={0.34} pos={[3.2, 0.28, 1.0]} size={[0.14, 1.35, 0.14]} solid={colors.solid} edge={colors.edge} />
        <Mass progress={progress} start={0.36} pos={[3.2, 0.28, -0.8]} size={[0.14, 1.35, 0.14]} solid={colors.solid} edge={colors.edge} />
        {/* vertical fins */}
        {[0, 1, 2, 3].map((i) => (
          <Mass key={i} progress={progress} start={0.55 + i * 0.06} pos={[-1.3 + i * 0.9, 2.63, 1.12]} size={[0.06, 1.0, 0.06]} solid={colors.edge} edge={colors.edge} />
        ))}
      </group>
    </Canvas>
  );
}
