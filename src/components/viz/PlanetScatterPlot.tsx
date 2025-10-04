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

// Colors for backend labels
const CLASS_COLORS: Record<string, string> = {
  'CONFIRMED': '#22c55e',
  'CANDIDATE': '#f59e0b',
  'FALSE POSITIVE': '#ef4444',
};

// Fallback colors for custom planet-type labels (if present)
const TYPE_COLORS: Record<string, string> = {
  'Earth-like': '#22c55e',
  'Super-Earth': '#3b82f6',
  'Gas Giant': '#f59e0b',
  'Hot Jupiter': '#ef4444',
  'Neptune-like': '#8b5cf6',
  'Rocky': '#84cc16'
};

const PlanetScatterPlot: React.FC<Props> = ({ rows, results }) => {
  const combined = results.map((r, idx) => {
    const row: any = rows[idx] || {};
    const orbitalPeriod = row.orbital_period ?? row.pl_orbper ?? row.orbper ?? undefined;
    const radius = row.planet_radius ?? row.pl_rade ?? row.prad ?? undefined;
    const name = row.pl_name || row.planet_name || `Planet ${idx + 1}`;
    return {
      orbitalPeriod: typeof orbitalPeriod === 'number' ? orbitalPeriod : parseFloat(orbitalPeriod),
      radius: typeof radius === 'number' ? radius : parseFloat(radius),
      name,
      prediction: r.planet_type,
      confidence: r.confidence,
    };
  }).filter(d => Number.isFinite(d.orbitalPeriod) && Number.isFinite(d.radius) && d.orbitalPeriod > 0 && d.radius > 0);

  const types = Array.from(new Set(results.map(r => r.planet_type)));

  return (
    <div className="space-y-2">
      <h4 className="text-lg font-medium">Planet Distribution: Size vs Orbit</h4>
      <p className="text-xs text-muted-foreground">Log-scale scatter of orbital period vs radius, colored by type</p>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="orbitalPeriod" name="Orbital Period" unit=" d" scale="log" domain={[0.1, "auto"]} tick={{ fontSize: 12 }} label={{ value: 'Orbital Period (days)', position: 'insideBottom', offset: -5 }} />
            <YAxis type="number" dataKey="radius" name="Planet Radius" unit=" R⊕" scale="log" domain={[0.1, 'auto']} tick={{ fontSize: 12 }} label={{ value: 'Planet Radius (R⊕)', angle: -90, position: 'insideLeft' }} />
            <ZAxis range={[50, 400]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: any, _name: any, payload: any) => {
              const p = payload?.payload;
              if (!p) return value;
              return [value, _name];
            }} content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const d: any = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded p-2 text-xs">
                    <div className="font-medium">{d.name}</div>
                    <div>Period: {d.orbitalPeriod?.toFixed(2)} d</div>
                    <div>Radius: {d.radius?.toFixed(2)} R⊕</div>
                    <div>Class: {d.prediction}</div>
                    <div>Confidence: {d.confidence?.toFixed(1)}%</div>
                  </div>
                );
              }
              return null;
            }} />
            <Legend />
            {types.map((type) => (
              <Scatter key={type} name={type} data={combined.filter(d => d.prediction === type)} fill={CLASS_COLORS[type] || TYPE_COLORS[type] || '#64748b'} opacity={0.8} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlanetScatterPlot;