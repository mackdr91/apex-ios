/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Shared number and currency formatting helpers for inventory displays.
 */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** Formats a number as USD, e.g. 1250 -> "$1,250". */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}
