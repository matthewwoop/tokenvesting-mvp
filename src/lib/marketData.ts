/**
 * marketData.ts
 *
 * MVP stub for token market data feeds.
 * Contains $SOL hard-coded spot prices and annualized volatilities for now.
 *
 * TODO:
 *  - Replace getSpotPriceUSD and getAnnualizedVolatility stubs with API calls.
 */

/**
 * Returns the current spot price (in USD) for a given token symbol.
 *
 * @param {string} symbol - The token symbol (e.g., "SOL").
 * @returns {number} The spot price in USD.
 * @throws {Error} If no stubbed price exists for the given symbol.
 */
export function getSpotPriceUSD(symbol: string): number {
  switch (symbol.toUpperCase()) {
    case "SOL":
      return 150;
    default:
      throw new Error(`No spot price stub for symbol "${symbol}"`);
  }
}

/**
 * Returns the annualized implied volatility (decimal) for a given token symbol.
 *
 * @param {string} symbol - The token symbol (e.g., "SOL").
 * @returns {number} The annualized volatility (e.g., 0.75 for 75%).
 * @throws {Error} If no stubbed volatility exists for the given symbol.
 */
export function getAnnualizedVolatility(symbol: string): number {
  switch (symbol.toUpperCase()) {
    case "SOL":
      return 0.87;
    default:
      throw new Error(`No volatility stub for symbol "${symbol}"`);
  }
}