// Currency formatting utilities for Nigerian Naira (NGN)

/**
 * Format currency amount with proper thousand separators and NGN symbol
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  options: {
    compact?: boolean;
    showSymbol?: boolean;
    minimumFractionDigits?: number;
  } = {}
): string {
  const {
    compact = false,
    showSymbol = true,
    minimumFractionDigits = 0,
  } = options;

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return showSymbol ? '₦0' : '0';
  }

  const formatter = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  });

  const formattedAmount = formatter.format(numAmount);
  
  return showSymbol ? `₦${formattedAmount}` : formattedAmount;
}

/**
 * Format currency for display in cards and components
 * @param amount - The amount to format
 * @returns Formatted currency string with ₦ symbol
 */
export function formatDisplayCurrency(amount: number | string): string {
  return formatCurrency(amount, { showSymbol: true, compact: false });
}

/**
 * Format currency in compact form (e.g., ₦1.2M, ₦500K)
 * @param amount - The amount to format
 * @returns Compact formatted currency string
 */
export function formatCompactCurrency(amount: number | string): string {
  return formatCurrency(amount, { showSymbol: true, compact: true });
}

/**
 * Format currency without symbol (just the number with separators)
 * @param amount - The amount to format
 * @returns Formatted number string without currency symbol
 */
export function formatNumber(amount: number | string): string {
  return formatCurrency(amount, { showSymbol: false, compact: false });
}

/**
 * Format currency for input fields (without symbol, with separators)
 * @param amount - The amount to format
 * @returns Formatted number string for input fields
 */
export function formatInputCurrency(amount: number | string): string {
  return formatNumber(amount);
}

/**
 * Parse currency string back to number
 * @param currencyString - The currency string to parse
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbol and commas, then parse
  const cleanString = currencyString.replace(/[₦,\s]/g, '');
  return parseFloat(cleanString) || 0;
}
