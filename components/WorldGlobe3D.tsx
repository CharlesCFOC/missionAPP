"use client";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three";
import { Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type WorldGlobe3DProps = {
  className?: string;
  heightClassName?: string;
  showControls?: boolean;
  controlsClassName?: string;
};

export default function WorldGlobe3D({
  className = "",
  heightClassName = "h-[600px]",
  showControls = true,
  controlsClassName = "",
}: WorldGlobe3DProps) {
  const missions = [
    { id: 1, name: "🇨🇦 Toronto", lat: 43.65107, lng: -79.347015, type: "project" },
    { id: 2, name: "🇿🇲 Zambie", lat: -13.1339, lng: 27.8493, type: "project" },
    { id: 3, name: "🇬🇭 Ghana", lat: 7.9465, lng: -1.0232, type: "project" },
    { id: 4, name: "🇨🇩 RDC", lat: -4.4419, lng: 15.2663, type: "trip" },
    { id: 5, name: "🇰🇪 Kenya", lat: -1.2864, lng: 36.8172, type: "project" },
    { id: 6, name: "🇳🇬 Nigeria", lat: 9.082, lng: 8.6753, type: "project" },
    { id: 7, name: "🇸🇳 Sénégal", lat: 14.7167, lng: -17.4677, type: "trip" },
    { id: 8, name: "🇿🇦 Afrique du Sud", lat: -25.7479, lng: 28.2293, type: "trip" },
    { id: 9, name: "🇲🇬 Madagascar", lat: -18.8792, lng: 47.5079, type: "trip" },
    { id: 10, name: "🇨🇲 Cameroun", lat: 3.848, lng: 11.5021, type: "trip" },
    { id: 11, name: "🇺🇬 Ouganda", lat: 0.3476, lng: 32.5825, type: "trip" },
    { id: 12, name: "🇷🇴 Roumanie", lat: 44.4268, lng: 26.1025, type: "trip" },
    { id: 13, name: "🇽🇰 Kosovo", lat: 42.6629, lng: 21.1655, type: "trip" },
    { id: 14, name: "🇲🇽 Mexique", lat: 19.4326, lng: -99.1332, type: "trip" },
    { id: 15, name: "🇭🇹 Haïti", lat: 18.5944, lng: -72.3074, type: "project" },
    { id: 16, name: "🇩🇴 République dominicaine", lat: 18.4861, lng: -69.9312, type: "trip" },
    { id: 17, name: "🇨🇺 Cuba", lat: 21.5218, lng: -77.7812, type: "trip" },
    { id: 18, name: "🇨🇴 Colombie", lat: 4.711, lng: -74.0721, type: "trip" },
    { id: 19, name: "🇵🇪 Pérou", lat: -12.0464, lng: -77.0428, type: "trip" },
    { id: 20, name: "🇧🇴 Bolivie", lat: -16.5, lng: -68.1193, type: "trip" },
    { id: 21, name: "🇧🇷 Brésil", lat: -15.7939, lng: -47.8828, type: "project" },
    { id: 22, name: "🇦🇷 Argentine", lat: -34.6037, lng: -58.3816, type: "trip" },
    { id: 23, name: "🇬🇹 Guatemala", lat: 14.6349, lng: -90.5069, type: "trip" },
    { id: 24, name: "🇭🇳 Honduras", lat: 14.0723, lng: -87.1921, type: "trip" },
    { id: 25, name: "🇮🇳 Inde", lat: 28.6139, lng: 77.209, type: "project" },
    { id: 26, name: "🇵🇰 Pakistan", lat: 33.6844, lng: 73.0479, type: "trip" },
    { id: 27, name: "🇵🇭 Philippines", lat: 14.5995, lng: 120.9842, type: "project" },
    { id: 28, name: "🇮🇩 Indonésie", lat: -6.2088, lng: 106.8456, type: "trip" },
    { id: 29, name: "🇯🇵 Japon", lat: 35.6762, lng: 139.6503, type: "trip" },
    { id: 30, name: "🇮🇱 Israël", lat: 31.7683, lng: 35.2137, type: "trip" },
    { id: 31, name: "🇱🇧 Liban", lat: 33.8547, lng: 35.8623, type: "trip" },
    { id: 32, name: "🇫🇷 France", lat: 48.8566, lng: 2.3522, type: "project" },
  ];

  const [filter, setFilter] = useState("all");

  const router = useRouter();
  const [targetPosition, setTargetPosition] = useState<[number, number, number] | null>(null);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);

  const handleMarkerClick = (mission: any) => {
    const radius = 1.8;
    const phi = (90 - mission.lat) * (Math.PI / 180);
    const theta = (mission.lng + 180) * (Math.PI / 180);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = -radius * Math.sin(phi) * Math.sin(theta);

    setTargetPosition([x, y, z]);
    setSelectedMission(mission.id);

    setTimeout(() => {
      router.push(`/projectDetails/1`);
    }, 1500);
  };

  function PulsingMarker({ position, color, name, onClick }: { position: [number, number, number]; color: string; name: string; onClick?: () => void }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(({ clock }) => {
      if (meshRef.current) {
        const scale = 1 + 0.25 * Math.sin(clock.elapsedTime * 3);
        meshRef.current.scale.set(scale, scale, scale);
        meshRef.current.rotation.y += 0.01;
      }
    });

    return (
      <group position={position}>
        {/* Aura circulaire */}
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial emissive={color} color={color} emissiveIntensity={2} />
        </mesh>
        {/* Cercle d'aura autour */}
        <mesh>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} />
        </mesh>
        {/* Nom du pays au survol */}
        {hovered && (
          <group position={[0, 0.05, 0]}>
            <Html center>
              <div
                style={{
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </div>
            </Html>
          </group>
        )}
      </group>
    );
  }

  function normalizeLng(lng: number) {
    let n = ((lng + 180) % 360 + 360) % 360 - 180;
    return n;
  }

  function GlobeScene() {
    const globeRef = useRef<THREE.Mesh>(null);
    const markersGroupRef = useRef<THREE.Group>(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [texture, bump] = useLoader(TextureLoader, [
      "/textures/earth-surface.jpg",
      "/textures/earth-bump.jpg",
    ]);

    useFrame(({ camera }) => {
      if (targetPosition) {
        camera.position.lerp(new THREE.Vector3(...targetPosition), 0.05);
        camera.lookAt(0, 0, 0);
      }
      if (!isUserInteracting && globeRef.current && markersGroupRef.current) {
        globeRef.current.rotation.y += 0.0015;
        markersGroupRef.current.rotation.y += 0.0015;
      }
    });

    return (
      <>
        {/* Éclairage amélioré */}
        <ambientLight intensity={6.5} />
        <directionalLight position={[5, 3, 5]} intensity={3.4} />
        <directionalLight position={[-3, 2, -2]} intensity={2.7} color="#ffd6a5" />

        {/* Terre */}
        <mesh
          rotation={[0, Math.PI, 0]}
          ref={globeRef}
          onPointerOver={() => setIsUserInteracting(true)}
          onPointerOut={() => setIsUserInteracting(false)}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            bumpMap={bump}
            bumpScale={0.03}
            metalness={0.1}
            roughness={0.6}
          />
        </mesh>

        {/* Nuages légers */}
        {/*
        <mesh rotation={[0, Math.PI, 0]} scale={[1.005, 1.005, 1.005]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial
            map={clouds}
            transparent={true}
            opacity={0.25}
            depthWrite={false}
          />
        </mesh>
        */}

        {/* Étoiles */}
        <Stars radius={300} depth={20} count={2000} factor={12} fade speed={2} />

        {/* Contrôles utilisateur */}
        <OrbitControls
          enableZoom={true}
          zoomSpeed={0.6}
          rotateSpeed={0.4}
          onStart={() => setIsUserInteracting(true)}
          onEnd={() => setIsUserInteracting(false)}
        />

        <group ref={markersGroupRef}>
          {visibleMissions.map((m) => {
            const radius = 1;
            const phi = (90 - m.lat) * (Math.PI / 180);
            const theta = (m.lng + 180) * (Math.PI / 180);
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = -radius * Math.sin(phi) * Math.sin(theta);
            let color = "#ffffff";
            if (m.type === "project") {
              color = "#4fa5ff";
            } else if (m.type === "trip") {
              color = "#b30059";
            }
            return (
              <PulsingMarker
                key={m.id}
                position={[x, y, z]}
                color={color}
                name={m.name}
                onClick={() => handleMarkerClick(m)}
              />
            );
          })}
        </group>
      </>
    );
  }

  const visibleMissions =
    filter === "all" ? missions : missions.filter((m) => m.type === filter);

  const containerClassName = [
    "w-full flex flex-col justify-center items-center",
    heightClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const controlsClasses = ["flex justify-center gap-4 mb-6", controlsClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassName}>
      {showControls && (
        <div className={controlsClasses}>
          {["all", "project", "trip"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                filter === f ? "bg-[#4fa5ff] text-white" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {f === "all" ? "All" : f === "project" ? "Humanitarian Projects" : "Mission Trips"}
            </button>
          ))}
        </div>
      )}
      <div className="w-full flex-1">
        <Canvas
          className="w-full h-full bg-transparent"
          camera={{ position: [0, 0, 2] }}
          gl={{ alpha: true, antialias: true }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Suspense
            fallback={
              <Html center>
                <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/70">
                  Loading
                </div>
              </Html>
            }
          >
            <GlobeScene />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
