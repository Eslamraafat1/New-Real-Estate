/** Schematic, hand-drawn-style elevation of a stepped, cantilevered building. Decorative, not a drawing of a real listing. */
const PATHS = [
  "M16 364H584",
  "M64 364V256H300V364",
  "M64 256H300",
  "M116 256V196H430V256",
  "M116 196H430",
  "M196 196V124H348V196",
  "M178 124H366",
  "M430 256V364",
  "M96 364V292M128 364V292M160 364V292M192 364V292M224 364V292M256 364V292",
  "M150 196V256M200 196V256M250 196V256M300 196V256M350 196V256M400 196V256",
  "M226 124V196M258 124V196M290 124V196M322 124V196",
];

export function BuildingElevation({ className = "", preserveAspectRatio = "xMidYMid meet", hidden = false }: { className?: string; preserveAspectRatio?: string; hidden?: boolean }) {
  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio={preserveAspectRatio} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" className={className}>
      {PATHS.map((d, i) => (
        <path key={i} d={d} pathLength={1} vectorEffect="non-scaling-stroke" className="bp" style={{ strokeDasharray: 1, strokeDashoffset: hidden ? 1 : 0, opacity: i > 7 ? 0.55 : 1 }} />
      ))}
    </svg>
  );
}
