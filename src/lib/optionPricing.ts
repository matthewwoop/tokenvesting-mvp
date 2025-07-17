/**
 * optionPricing.ts
 *
 * Contains option-pricing formulas used for DLOM calculations.
 * Currently implements the Black–Scholes ATM European put premium.
 */

/**
 * Standard normal cumulative distribution function (CDF).
 * Uses the Abramowitz and Stegun approximation for browser reliability.
 * 
 * @param {number} x - The value to evaluate the CDF at.
 * @returns {number} The probability that a standard normal random variable is ≤ x.
 */
function normCdf(x: number): number {

  // Transform for polynomial approximation of tail probability
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  // Standard normal PDF at x
  const d = 0.3989423 * Math.exp(-x * x / 2);

  let probability = d * t * (
    0.3193815 +
    t * (
      -0.3565638 +
      t * (
        1.781478 +
        t * (
          -1.821256 +
          t * 1.330274
        )
      )
    )
  );

  if (x > 0) {
    probability = 1 - probability;
  }

  return probability;
}

/**
 * Computes the Black–Scholes price of an at-the-money (ATM) European put option.
 *
 * @param {number} S     - Current spot price of the underlying.
 * @param {number} K     - Strike price (for ATM, K should equal S).
 * @param {number} r     - Annual risk-free interest rate (decimal, e.g. 0.03 for 3%).
 * @param {number} sigma - Annual volatility (decimal, e.g. 0.75 for 75%).
 * @param {number} T     - Time to expiry in years (e.g. 0.5 for 6 months).
 * @returns {number} The option premium in the same units as S.
 */
export function blackScholesPut(S: number, K: number, r: number, sigma: number,T: number): number {
  
  if (T <= 0) {
    return Math.max(K - S, 0);
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const Nd1 = normCdf(-d1);
  const Nd2 = normCdf(-d2);

  return K * Math.exp(-r * T) * Nd2 - S * Nd1;
}