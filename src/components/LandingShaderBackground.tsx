import { Canvas } from "@react-three/fiber";
import { ShaderPlane, EnergyRing } from "@/components/ui/background-paper-shaders";

const LandingShaderBackground = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.3 }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ShaderPlane position={[0, 0, 0]} color1="#6b4fa0" color2="#9b87c2" />
        <EnergyRing radius={1.8} position={[0, 0, 0.1]} color="#8b6fc0" />
        <EnergyRing radius={2.4} position={[0, 0, 0.05]} color="#7c5db3" />
      </Canvas>
    </div>
  );
};

export default LandingShaderBackground;
