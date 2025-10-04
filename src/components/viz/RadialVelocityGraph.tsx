import React, { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

interface Props {
  orbitalPeriod: number; // days
  planetMass: number; // Earth masses
}

const RadialVelocityGraph: React.FC<Props> = ({ orbitalPeriod, planetMass }) => {
  const data = useMemo(() => {
    const period = Math.max(orbitalPeriod, 0.1);
    const amp = Math.sqrt(Math.max(planetMass, 0)) * 10; // m/s (toy model)
    const points: { time: number; velocity: number }[] = [];
    for (let t = 0; t < period * 2; t += period / 60) {
      const phase = (t % period) / period * 2 * Math.PI;
      const v = amp * Math.sin(phase) + (Math.random() - 0.5) * 1.5;
      points.push({ time: t, velocity: v });
    }
    return points;
  }, [orbitalPeriod, planetMass]);

  return (
    <div className="space-y-2">
      <h4 className="text-lg font-medium">Radial Velocity Curve</h4>
      <p className="text-xs text-muted-foreground">Stellar wobble due to planet gravity</p>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" label={{ value: "Time (days)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 12 }} />
            <YAxis label={{ value: "Radial Velocity (m/s)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 12 }} />
            <Tooltip />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="velocity" stroke="#ff6b6b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RadialVelocityGraph;