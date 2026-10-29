import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";

/** Directional icons that mirror automatically in RTL. */
export const Arrow = ({ className = "" }: { className?: string }) => <ArrowRight aria-hidden className={`rtl:-scale-x-100 ${className}`} size={16} />;
export const ArrowOut = ({ className = "" }: { className?: string }) => <ArrowUpRight aria-hidden className={`rtl:-scale-x-100 ${className}`} size={16} />;
export const Chevron = ({ className = "" }: { className?: string }) => <ChevronRight aria-hidden className={`rtl:-scale-x-100 ${className}`} size={16} />;
