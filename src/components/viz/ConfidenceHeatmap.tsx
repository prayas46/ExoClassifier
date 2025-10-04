import React, { useMemo } from "react";

interface BatchResult {
  id: number;
  planet_type: string;
  confidence: number;
}

interface Props {
  results: BatchResult[];
}

const ConfidenceHeatmap: React.FC<Props> = ({ results }) => {
  const rows = useMemo(() => {
    const groups: Record<string, { high: number; medium: number; low: number }> = {};
    results.forEach(r => {
      if (!groups[r.planet_type]) groups[r.planet_type] = { high: 0, medium: 0, low: 0 };
      if (r.confidence >= 90) groups[r.planet_type].high++;
      else if (r.confidence >= 70) groups[r.planet_type].medium++;
      else groups[r.planet_type].low++;
    });
    return Object.entries(groups).map(([type, counts]) => ({ type, ...counts }));
  }, [results]);

  return (
    <div className="space-y-2">
      <h4 className="text-lg font-medium">Prediction Confidence Distribution</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 pr-2">Type</th>
              <th className="py-2 pr-2">High (≥90%)</th>
              <th className="py-2 pr-2">Medium (70–90%)</th>
              <th className="py-2 pr-2">Low (&lt;70%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.type} className="border-t border-border">
                <td className="py-2 pr-2 font-medium">{r.type}</td>
                <td className="py-2 pr-2"><div style={{ backgroundColor: `rgba(34,197,94,${Math.min(1, r.high/10)})` }} className="inline-block min-w-10 text-center px-2 rounded">{r.high}</div></td>
                <td className="py-2 pr-2"><div style={{ backgroundColor: `rgba(234,179,8,${Math.min(1, r.medium/10)})` }} className="inline-block min-w-10 text-center px-2 rounded">{r.medium}</div></td>
                <td className="py-2 pr-2"><div style={{ backgroundColor: `rgba(239,68,68,${Math.min(1, r.low/10)})` }} className="inline-block min-w-10 text-center px-2 rounded">{r.low}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfidenceHeatmap;