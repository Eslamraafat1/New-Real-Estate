/** Standard fixed-rate amortisation. Pure functions — see tests in IMPLEMENTATION_STATUS.md. */
export interface MortgageInput {
  price: number;
  down: number;
  /** Annual percentage rate, e.g. 6 for 6%. */
  ratePct: number;
  years: number;
  /** Extra monthly costs (insurance, service charges…). */
  extras?: number;
}

export interface MortgageResult {
  loan: number;
  months: number;
  monthlyLoan: number;
  monthlyTotal: number;
  totalPaid: number;
  totalInterest: number;
}

export function monthlyPayment(loan: number, ratePct: number, years: number): number {
  const n = Math.round(years * 12);
  if (loan <= 0 || n <= 0) return 0;
  const r = ratePct / 100 / 12;
  if (r === 0) return loan / n;
  const f = Math.pow(1 + r, n);
  return (loan * r * f) / (f - 1);
}

export function computeMortgage(i: MortgageInput): MortgageResult {
  const loan = Math.max(0, i.price - i.down);
  const months = Math.max(0, Math.round(i.years * 12));
  const monthlyLoan = monthlyPayment(loan, i.ratePct, i.years);
  const totalPaid = monthlyLoan * months;
  return {
    loan,
    months,
    monthlyLoan,
    monthlyTotal: monthlyLoan + (i.extras ?? 0),
    totalPaid,
    totalInterest: Math.max(0, totalPaid - loan),
  };
}
