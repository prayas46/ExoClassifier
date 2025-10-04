import React, { useMemo } from "react";
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Scatter, ReferenceLine } from "recharts";

interface BatchRow {
  orbital_period: number;
  transit_depth: number; // ppm
  transit_duration: number; // hours
}

interface Props {
  example?: BatchRow;
}

const PhaseFoldedTransit: React.FC<Props> = ({ example }) => {
  const data = useMemo(() => {
    if (!example) return [] as { phase: number; flux: number }[];
    const depth = (example.transit_depth || 0) / 1e6;
    const durationFrac = (example.transit_duration || 0) / 24 / Math.max(example.orbital_period, 0.1);
    const points: { phase: number; flux: number }[] = [];
    for (let phase = -0.1; phase <= 0.1; phase += 0.001) {
      let flux = 1.0;
      if (Math.abs(phase) < durationFrac / 2 && durationFrac > 0) flux = 1.0 - depth;
      for (let i = 0; i < 4; i++) {
        points.push({ phase, flux: flux + (Math.random() - 0.5) * 0.0002 });
      }
    }
    return points;
  }, [example]);

  if (!example) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-lg font-medium">Phase-Folded Transit</h4>
      <p className="text-xs text-muted-foreground">Multiple observations folded to the same orbital phase</p>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="phase" label={{ value: 'Orbital Phase', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 12 }} />
            <YAxis domain={[0.9995, 1.0005]} label={{ value: 'Normalized Flux', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
            <Tooltip />
            <ReferenceLine x={0} stroke="red" strokeDasharray="3 3" />
            <Scatter data={data} fill="#667eea" opacity={0.3} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PhaseFoldedTransit;