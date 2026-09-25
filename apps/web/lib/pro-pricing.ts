/**
 * SevenUI Pro's price, the one place the site states it. Checkout charges what the pro deployment's
 * payment provider is set to, so a price change is made there and here together.
 */
export const PRO_PRICE = { launch: 99, regular: 249, currency: "USD" } as const;

/** "$99" — the launch price as the site prints it. */
export const PRO_LAUNCH = `$${PRO_PRICE.launch}`;

/** "$249" — the regular price as the site prints it. */
export const PRO_REGULAR = `$${PRO_PRICE.regular}`;
