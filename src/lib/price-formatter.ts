
export const priceFormatter = (price: string | number, currency?: string | undefined, code?: string | undefined) => {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("TG", {
    style: 'currency',
    currency: "XOF",
  }).format(numericPrice);
};

/**
 * Get the currency symbol from a currency code
 * @param currency - ISO 4217 currency code (e.g., "EUR", "USD", "XOF")
 * @param locale - Locale code (e.g., "fr-FR", "en-US")
 * @returns Currency symbol (e.g., "€", "$", "CFA")
 */
export const getCurrencySymbol = (currency: string, locale: string = 'fr-FR'): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find(part => part.type === 'currency')?.value || currency;
  } catch {
    return currency;
  }
};