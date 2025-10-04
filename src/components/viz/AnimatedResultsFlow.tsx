import React, { useEffect, useState } from "react";

interface BatchResult {
  id: number;
  planet_type: string;
  confidence: number;
}

interface Props {
  results: BatchResult[];
}

const AnimatedResultsFlow: React.FC<Props> = ({ results }) => {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (results?.length) {
      setVisible(0);
      const interval = setInterval(() => {
        setVisible((v) => {
          if (v < results.length) return v + 1;
          clearInterval(interval);
          return v;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [results]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {results.slice(0, visible).map((pred, idx) => (
        <div key={idx} className="flex items-center justify-between p-2 rounded border border-border bg-muted/50">
          <span className="text-xs font-medium">{pred.planet_type}</span>
          <span className="text-xs text-muted-foreground">{pred.confidence.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

export default AnimatedResultsFlow;