import React, { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

interface Props {
  orbitalPeriod: number; // days
  transitDepth: number; // ppm
  transitDuration: number; // hours
}

const LightCurveGraph: React.FC<Props> = ({ orbitalPeriod, transitDepth, transitDuration }) => {
  const data = useMemo(() => {
    const points: { time: number; flux: number; baseline: number }[] = [];
    const period = Math.max(orbitalPeriod, 0.1);
    const depth = (transitDepth || 0) / 1e6; // ppm -> fraction
    const durationDays = (transitDuration || 0) / 24; // hours -> days

    for (let time = 0; time < period; time += period / 300) {
      let flux = 1.0;
      const phaseTime = time % period;
      if (phaseTime < durationDays && durationDays > 0) {
        flux = 1.0 - depth;
      }
      // add small noise
      flux += (Math.random() - 0.5) * 0.00008;
      points.push({ time, flux, baseline: 1.0 });
    }
    return points;
  }, [orbitalPeriod, transitDepth, transitDuration]);

  return (
    <div className="space-y-2">
      <h4 className="text-lg font-medium">Transit Light Curve</h4>
      <p className="text-xs text-muted-foreground">Star brightness vs time; dip indicates planet transit</p>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} label={{ value: "Time (days)", position: "insideBottom", offset: -5 }} />
            <YAxis domain={[0.999, 1.001]} tick={{ fontSize: 12 }} label={{ value: "Normalized Flux", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(v: number) => v.toFixed(6)} labelFormatter={(l: number) => `Day ${l.toFixed(2)}`} />
            <ReferenceLine y={1.0} stroke="#666" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="flux" stroke="#667eea" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div><span className="text-muted-foreground">Depth:</span> <strong>{transitDepth?.toFixed?.(0) ?? transitDepth} ppm</strong></div>
        <div><span className="text-muted-foreground">Duration:</span> <strong>{transitDuration?.toFixed?.(1) ?? transitDuration} h</strong></div>
        <div><span className="text-muted-foreground">Period:</span> <strong>{orbitalPeriod?.toFixed?.(2) ?? orbitalPeriod} d</strong></div>
      </div>
    </div>
  );
};

export default LightCurveGraph;