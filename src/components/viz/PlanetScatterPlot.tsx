import React from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, CartesianGrid } from "recharts";

interface BatchRow {
  id: number;
  orbital_period: number;
  planet_radius: number;
  transit_depth: number;
  transit_duration: number;
  planet_mass: number;
  stellar_temperature: number;
  stellar_radius: number;
  system_distance: number;
}

interface BatchResult {
  id: number;
  planet_type: string;
  confidence: number;
}

interface Props {
  rows: BatchRow[];
  results: BatchResult[];
}

const COLORS: Record<string, string> = {
  'Earth-like': '#22c55e',
  'Super-Earth': '#3b82f6',
  'Gas Giant': '#f59e0b',
  'Hot Jupiter': '#ef4444',
  'Neptune-like': '#8b5cf6',
  'Rocky': '#84cc16'
};

const PlanetScatterPlot: React.FC<Props> = ({ rows, results }) => {
  const combined = results.map((r, idx) => ({
    orbitalPeriod: rows[idx]?.orbital_period,
    radius: rows[idx]?.planet_radius,
    prediction: r.planet_type,
    confidence: r.confidence,
  })).filter(d => d.orbitalPeriod && d.radius);

  const types = Array.from(new Set(results.map(r => r.planet_type)));

  return (
    <div className="space-y-2">
      <h4 className="text-lg font-medium">Planet Distribution: Size vs Orbit</h4>
      <p className="text-xs text-muted-foreground">Log-scale scatter of orbital period vs radius, colored by type</p>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="orbitalPeriod" name="Orbital Period" unit=" d" scale="log" domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
            <YAxis type="number" dataKey="radius" name="Planet Radius" unit=" R⊕" scale="log" tick={{ fontSize: 12 }} />
            <ZAxis range={[50, 400]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {types.map((type) => (
              <Scatter key={type} name={type} data={combined.filter(d => d.prediction === type)} fill={COLORS[type] || '#64748b'} opacity={0.7} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlanetScatterPlot;