import { useEffect, useRef } from "react";

interface ECGWaveformProps {
  data?: number[];
  color: "cyan" | "green" | "yellow" | "red";
  label: string;
  value?: string | number;
  height?: number;
}

export function ECGWaveform({ data, color, label, value, height = 160 }: ECGWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colorMap = {
    cyan: "rgb(0, 255, 255)",
    green: "rgb(0, 255, 0)",
    yellow: "rgb(255, 255, 0)",
    red: "rgb(255, 0, 0)",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (data && data.length > 0) {
        ctx.strokeStyle = colorMap[color];
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const step = width / data.length;
        data.forEach((point, index) => {
          const x = index * step;
          const y = height / 2 - (point * height) / 2;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }
    };

    draw();
  }, [data, color]);

  return (
    <div className="relative bg-monitor-bg rounded-md border border-monitor-grid overflow-hidden">
      <div className="absolute top-2 left-3 z-10">
        <span className={`text-xs font-semibold uppercase tracking-wider text-vital-${color}`}>
          {label}
        </span>
      </div>
      {value && (
        <div className="absolute top-2 right-3 z-10">
          <span className={`text-2xl font-bold font-mono text-vital-${color}`}>
            {value}
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}
