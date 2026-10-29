/** Fine topographic lines, deterministic and server-renderable. Each path is draw-able via pathLength=1. */
const LINES = Array.from({ length: 24 }, (_, i) => {
  const y0 = 24 + i * 25;
  let d = "";
  for (let x = -40; x <= 1040; x += 20) {
    const hill = Math.exp(-((x - 680) ** 2) / (2 * 190 ** 2)) * (60 - i * 1.6);
    const y = y0 + Math.sin(x * 0.0065 + i * 0.32) * 20 + Math.sin(x * 0.015 - i * 0.21) * 8 - hill;
    d += `${d ? "L" : "M"}${x} ${y.toFixed(1)}`;
  }
  return d;
});

export function HeroContours({ hidden = false, className = "" }: { hidden?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice" aria-hidden className={`contour pointer-events-none ${className}`}>
      {LINES.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          className="hc"
          style={{ strokeDasharray: 1, strokeDashoffset: hidden ? 1 : 0, opacity: i % 4 === 0 ? 0.75 : 0.38 }}
        />
      ))}
    </svg>
  );
}
