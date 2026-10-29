import { Contour } from "@/components/ui/Contour";
import { Reveal } from "@/components/ui/Reveal";

/** "Contour Reveal": topographic rings that draw themselves as the section scrolls into view. */
export function ContourBg({ seed = 3, rings = 12, className = "", cx, cy }: { seed?: number; rings?: number; className?: string; cx?: number; cy?: number }) {
  return (
    <Reveal className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} threshold={0.02}>
      <Contour seed={seed} rings={rings} cx={cx} cy={cy} className="absolute inset-0 h-full w-full" />
    </Reveal>
  );
}
