
"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { Canvas, useFrame } from "@react-three/fiber";

import {
  ContactShadows,
  Environment,
  useGLTF,
} from "@react-three/drei";

import * as THREE from "three";

import {
  clawPrizes,
  plushInstances,
  getPrizeById,
} from "@/data/clawPrizes";

export type GamePhase =
  | "idle"
  | "dropping"
  | "grabbing"
  | "lifting"
  | "returning"
  | "releasing";

export type ClawSceneProps = {
  clawX: number;
  phase: GamePhase;
  phaseStartedAt: number;
  removedIds: string[];
  heldInstanceId: string | null;
  onPhaseComplete: () => void;
};

const CABINET =
  "/models/claw-machine/claw_machine_cabinet.glb";

const CLAW =
  "/models/claw-machine/mechanical_claw.glb";

const TOP_Y = 4.05;
const BOTTOM_Y = 2.52;
const RETURN_X = -1.15;

const DURATIONS: Record<GamePhase, number> = {
  idle: 0,
  dropping: 1.15,
  grabbing: 0.55,
  lifting: 1.15,
  returning: 1.1,
  releasing: 0.55,
};

function easing(value: number) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

type ModelProps = {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  height?: number;
  width?: number;
  depth?: number;
  centerY?: boolean;
};

function Model({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  height,
  width,
  depth,
  centerY = false,
}: ModelProps) {
  const gltf = useGLTF(url);

  const object = useMemo(() => {
    const clone = gltf.scene.clone(true);

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    clone.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    const scaleOptions: number[] = [];

    if (height) {
      scaleOptions.push(
        height / Math.max(size.y, 0.001)
      );
    }

    if (width) {
      scaleOptions.push(
        width / Math.max(size.x, 0.001)
      );
    }

    if (depth) {
      scaleOptions.push(
        depth / Math.max(size.z, 0.001)
      );
    }

    const factor = scaleOptions.length
      ? Math.min(...scaleOptions)
      : 1;

    const root = new THREE.Group();

    clone.position.set(
      -center.x,
      centerY ? -center.y : -bounds.min.y,
      -center.z
    );

    root.add(clone);
    root.scale.setScalar(factor);

    return root;
  }, [
    gltf.scene,
    height,
    width,
    depth,
    centerY,
  ]);

  return (
    <group
      position={position}
      rotation={rotation}
    >
      <primitive object={object} />
    </group>
  );
}

/* =========================================
   PLUSH TOYS — 35 BONEKA
========================================= */

function PlushPile({
  removedIds,
  heldInstanceId,
}: {
  removedIds: string[];
  heldInstanceId: string | null;
}) {
  const removed = useMemo(
    () => new Set(removedIds),
    [removedIds]
  );

  return (
    <group>
      {plushInstances
        .filter(
          (item) =>
            !removed.has(item.id) &&
            item.id !== heldInstanceId
        )
        .map((item) => {
          const prize = getPrizeById(
            item.prizeId
          );

          if (!prize) return null;

          return (
            <Model
              key={item.id}
              url={prize.model}
              position={[
                item.x,
                item.y,
                item.z,
              ]}
              rotation={[
                item.tilt * 0.4,
                item.rotation,
                item.tilt,
              ]}
              height={item.size}
              width={0.53}
              depth={0.5}
            />
          );
        })}
    </group>
  );
}

/* =========================================
   PREMIUM CABINET
========================================= */

function Cabinet() {
  return (
    <group>
      <Model
        url={CABINET}
        height={5.25}
        width={3.7}
        depth={2.5}
      />

      {/* Interior pink light */}
      <pointLight
        position={[-1.3, 4.2, 0.65]}
        color="#ffd7e7"
        intensity={3}
        distance={4.5}
      />

      {/* Interior warm light */}
      <pointLight
        position={[1.3, 4.2, 0.65]}
        color="#fff1d6"
        intensity={3}
        distance={4.5}
      />

      {/* Decorative golden trim */}
      <mesh position={[0, 4.52, 1.27]}>
        <boxGeometry
          args={[3.4, 0.045, 0.05]}
        />

        <meshStandardMaterial
          color="#e4bb88"
          metalness={0.75}
          roughness={0.2}
        />
      </mesh>

      {/* Decorative warm bulbs */}
      {Array.from(
        { length: 13 },
        (_, index) => (
          <mesh
            key={index}
            position={[
              -1.48 + index * 0.247,
              4.57,
              1.32,
            ]}
          >
            <sphereGeometry
              args={[0.043, 12, 12]}
            />

            <meshStandardMaterial
              color="#fff3d7"
              emissive="#ffd69e"
              emissiveIntensity={2.5}
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* =========================================
   ANIMATED CLAW
========================================= */

function AnimatedClaw({
  clawX,
  phase,
  phaseStartedAt,
  heldInstanceId,
  onPhaseComplete,
}: {
  clawX: number;
  phase: GamePhase;
  phaseStartedAt: number;
  heldInstanceId: string | null;
  onPhaseComplete: () => void;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const cableRef = useRef<THREE.Mesh>(null);

  const completedRef = useRef(false);
  const returnStartX = useRef(clawX);

  useEffect(() => {
    completedRef.current = false;

    if (phase === "returning") {
      returnStartX.current =
        rootRef.current?.position.x ?? clawX;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, phaseStartedAt]);

  useFrame((_, delta) => {
    if (
      !rootRef.current ||
      !headRef.current ||
      !cableRef.current
    ) {
      return;
    }

    const duration = DURATIONS[phase];

    const elapsed = Math.max(
      0,
      (
        performance.now() -
        phaseStartedAt
      ) / 1000
    );

    const progress =
      duration > 0
        ? Math.min(
            elapsed / duration,
            1
          )
        : 0;

    const t = easing(progress);

    let y = TOP_Y;

    if (phase === "dropping") {
      y = THREE.MathUtils.lerp(
        TOP_Y,
        BOTTOM_Y,
        t
      );
    }

    if (phase === "grabbing") {
      y = BOTTOM_Y;
    }

    if (phase === "lifting") {
      y = THREE.MathUtils.lerp(
        BOTTOM_Y,
        TOP_Y,
        t
      );
    }

    let x = clawX;

    if (phase === "returning") {
      x = THREE.MathUtils.lerp(
        returnStartX.current,
        RETURN_X,
        t
      );
    }

    if (phase === "releasing") {
      x = RETURN_X;
    }

    rootRef.current.position.x =
      THREE.MathUtils.damp(
        rootRef.current.position.x,
        x,
        12,
        delta
      );

    headRef.current.position.y = y;

    const cableLength = Math.max(
      0.05,
      4.48 - y
    );

    cableRef.current.scale.y =
      cableLength;

    cableRef.current.position.y =
      y + cableLength / 2;

    if (
      duration > 0 &&
      progress >= 1 &&
      !completedRef.current
    ) {
      completedRef.current = true;
      onPhaseComplete();
    }
  });

  const heldInstance =
    plushInstances.find(
      (item) =>
        item.id === heldInstanceId
    );

  const heldPrize = heldInstance
    ? getPrizeById(
        heldInstance.prizeId
      )
    : null;

  return (
    <group
      ref={rootRef}
      position={[clawX, 0, 0.45]}
    >
      {/* Chrome upper trolley */}
      <mesh
        position={[0, 4.48, 0]}
        castShadow
      >
        <boxGeometry
          args={[0.45, 0.17, 0.43]}
        />

        <meshStandardMaterial
          color="#bdb4bd"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Retractable cable */}
      <mesh ref={cableRef}>
        <cylinderGeometry
          args={[
            0.024,
            0.024,
            1,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#85828a"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Mechanical claw */}
      <group
        ref={headRef}
        position={[
          0,
          TOP_Y,
          0,
        ]}
      >
        <Model
          url={CLAW}
          height={0.78}
          width={0.8}
          depth={0.8}
          centerY
        />

        {/* Plush being carried */}
        {heldPrize && (
          <Model
            url={heldPrize.model}
            position={[
              0,
              -0.65,
              0,
            ]}
            height={0.48}
            width={0.45}
            centerY
          />
        )}
      </group>
    </group>
  );
}

/* =========================================
   SCENE LIGHTING
========================================= */

function Scene(
  props: ClawSceneProps
) {
  return (
    <>
      <ambientLight
        intensity={0.75}
      />

      <hemisphereLight
        args={[
          "#fff4f8",
          "#aa7994",
          0.9,
        ]}
      />

      <directionalLight
        position={[-4, 8, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[
          1024,
          1024,
        ]}
      />

      <pointLight
        position={[0, 5, 3]}
        color="#ffe1ef"
        intensity={4}
        distance={9}
      />

      <Environment
        preset="apartment"
      />

      <group
        position={[
          0,
          -0.28,
          0,
        ]}
      >
        <Cabinet />

        <PlushPile
          removedIds={
            props.removedIds
          }
          heldInstanceId={
            props.heldInstanceId
          }
        />

        <AnimatedClaw
          clawX={props.clawX}
          phase={props.phase}
          phaseStartedAt={
            props.phaseStartedAt
          }
          heldInstanceId={
            props.heldInstanceId
          }
          onPhaseComplete={
            props.onPhaseComplete
          }
        />
      </group>

      <ContactShadows
        position={[
          0,
          -0.4,
          0,
        ]}
        opacity={0.42}
        scale={8}
        blur={2.6}
        far={5}
      />
    </>
  );
}

/* =========================================
   MAIN CANVAS — CAMERA
========================================= */

export default function ClawScene(
  props: ClawSceneProps
) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{
        position: [
          5.2,
          4.4,
          8.1,
        ],
        fov: 33,
        near: 0.1,
        far: 100,
      }}
      gl={{
        alpha: true,
        antialias: true,
      }}
      onCreated={({
        camera,
      }) => {
        camera.lookAt(
          0,
          2.45,
          0
        );
      }}
      style={{
        background:
          "transparent",
      }}
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}

/* =========================================
   PRELOAD MODELS
========================================= */

useGLTF.preload(CABINET);
useGLTF.preload(CLAW);

clawPrizes.forEach(
  (prize) => {
    useGLTF.preload(
      prize.model
    );
  }
);
