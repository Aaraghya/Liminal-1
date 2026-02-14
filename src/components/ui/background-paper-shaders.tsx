import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.y += sin(pos.x * 10.0 + time) * 0.1 * intensity;
    pos.x += cos(pos.y * 8.0 + time * 1.5) * 0.05 * intensity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    float noise = sin(uv.x * 20.0 + time) * cos(uv.y * 15.0 + time * 0.8);
    noise += sin(uv.x * 35.0 - time * 2.0) * cos(uv.y * 25.0 + time * 1.2) * 0.5;
    vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
    color = mix(color, vec3(1.0), pow(abs(noise), 2.0) * intensity);
    float glow = 1.0 - length(uv - 0.5) * 2.0;
    glow = pow(glow, 2.0);
    gl_FragColor = vec4(color * glow, glow * 0.3);
  }
`;

export function ShaderPlane({
  position,
  color1 = "#6b4fa0",
  color2 = "#9b87c2",
}: {
  position: [number, number, number];
  color1?: string;
  color2?: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: 1.0 },
        color1: { value: new THREE.Color(color1) },
        color2: { value: new THREE.Color(color2) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [color1, color2]);

  useFrame((state) => {
    material.uniforms.time.value = state.clock.elapsedTime * 0.4;
    material.uniforms.intensity.value = 0.6 + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
  });

  return (
    <mesh ref={mesh} position={position} material={material}>
      <planeGeometry args={[4, 4, 32, 32]} />
    </mesh>
  );
}

export function EnergyRing({
  radius = 1,
  position = [0, 0, 0] as [number, number, number],
  color = "#8b6fc0",
}: {
  radius?: number;
  position?: [number, number, number];
  color?: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
  }, [color]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.elapsedTime * 0.3;
      material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <mesh ref={mesh} position={position} material={material}>
      <ringGeometry args={[radius * 0.8, radius, 64]} />
    </mesh>
  );
}
