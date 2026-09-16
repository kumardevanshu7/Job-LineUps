/**
 * Indian Currency & Salary Formatting Utilities
 */

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface SalaryBreakdown {
  annualAmount: number;
  monthlyAmount: number;
  annualFormatted: string;
  monthlyFormatted: string;
  monthlyShort: string;
}

/**
 * Parses user input for CTC (e.g. "2,00,000", "700000", "7L", "7.5 LPA", "₹6,00,000")
 * and computes the annual and monthly breakdown.
 */
export function calculateSalaryBreakdown(
  ctcInput: string | number | null | undefined
): SalaryBreakdown | null {
  if (ctcInput === null || ctcInput === undefined) return null;
  const str = String(ctcInput).trim().toLowerCase();
  if (!str) return null;

  // Ignore default placeholder text
  if (
    str.includes("not disclosed") ||
    str.includes("as per company") ||
    str.includes("negotiable") ||
    str.includes("na") ||
    str === "—"
  ) {
    return null;
  }

  // Check if Lakhs shorthand: e.g. "7.5 lpa", "7.5l", "6 lakh", "6.5lakhs"
  const lakhMatch = str.match(/([\d.]+)\s*(?:lpa|lakh|lakhs|l)\b/i);
  let annualVal = 0;

  if (lakhMatch) {
    annualVal = parseFloat(lakhMatch[1]) * 100000;
  } else {
    // Strip everything except digits and decimal point
    const digitsOnly = str.replace(/[^\d.]/g, "");
    if (!digitsOnly) return null;
    annualVal = parseFloat(digitsOnly);

    // If user wrote e.g. "7" or "6.5" or "12" (meaning LPA)
    if (annualVal > 0 && annualVal < 70) {
      annualVal = annualVal * 100000;
    }
  }

  if (isNaN(annualVal) || annualVal <= 0) return null;

  const monthlyVal = Math.round(annualVal / 12);
  const monthlyFormatted = `₹${formatIndianCurrency(monthlyVal)} / month`;
  const annualFormatted = `₹${formatIndianCurrency(Math.round(annualVal))} / year`;
  const monthlyShort =
    monthlyVal >= 100000
      ? `₹${(monthlyVal / 100000).toFixed(2)}L/mo`
      : `₹${(monthlyVal / 1000).toFixed(1)}k/mo`;

  return {
    annualAmount: Math.round(annualVal),
    monthlyAmount: monthlyVal,
    annualFormatted,
    monthlyFormatted,
    monthlyShort,
  };
}
