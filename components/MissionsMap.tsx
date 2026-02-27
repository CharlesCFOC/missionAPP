"use client";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const regionColors = {
  Afrique: "#ffd166",
  Amériques: "#06d6a0",
  Europe: "#118ab2",
  Asie: "#ef476f",
};

type RegionKey = keyof typeof regionColors;

const missions: {
  id: number;
  name: string;
  coordinates: [number, number];
  region: RegionKey;
}[] = [
  { id: 1, name: "Guyane", coordinates: [-52.33, 4.94], region: "Amériques" },
  { id: 2, name: "Zambie", coordinates: [27.85, -13.13], region: "Afrique" },
  { id: 3, name: "Haïti", coordinates: [-72.33, 18.97], region: "Amériques" },
];

export default function MissionsMap() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full flex justify-center items-center mt-6 bg-transparent">
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 120 }}
        className="bg-transparent w-full"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: "rgba(255, 255, 255, 0.2)",
                    stroke: "#4fa5ff",
                    strokeWidth: 0.3,
                    outline: "none",
                    backdropFilter: "blur(6px)",
                  },
                  hover: { fill: "#d9ebff", outline: "none" },
                  pressed: { fill: "#d9ebff", outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {missions.map(({ id, name, coordinates, region }) => (
          <Marker
            key={id}
            coordinates={coordinates}
            onMouseEnter={() => setHovered(name)}
            onMouseLeave={() => setHovered(null)}
          >
            <motion.circle
              r={6}
              fill={regionColors[region] || "#8cc4ff"}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              whileHover={{ scale: 1.6 }}
            />
            <motion.circle
              r={12}
              fill="none"
              stroke={regionColors[region] || "#8cc4ff"}
              strokeWidth={0.8}
              opacity={0.5}
              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
            <motion.circle
              r={18}
              fill={regionColors[region] || "#8cc4ff"}
              opacity={0.15}
              animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
            <AnimatePresence>
              {hovered === name && (
                <motion.text
                  key="tooltip"
                  textAnchor="middle"
                  y={-16}
                  className="text-xs fill-white drop-shadow-lg"
                  style={{ fontSize: "10px", pointerEvents: "none", userSelect: "none" }}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: -12 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {name}
                </motion.text>
              )}
            </AnimatePresence>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
