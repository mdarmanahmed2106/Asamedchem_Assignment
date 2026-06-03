import Decimal from "decimal.js";

/**
 * Convert display quantity to base unit quantity.
 * e.g., 2 kg → 2 * 1000 = 2000 grams
 *
 * @param {Decimal} displayQty - Quantity in display units
 * @param {Decimal} conversionFactor - Factor to multiply by (display → base)
 * @returns {Decimal} Quantity in base units
 */
export function toBaseQty(displayQty, conversionFactor) {
  return displayQty.mul(conversionFactor);
}

/**
 * Convert base unit quantity to display quantity.
 * e.g., 2000 grams → 2000 / 1000 = 2 kg
 *
 * @param {Decimal} baseQty - Quantity in base units
 * @param {Decimal} conversionFactor - Factor to divide by (base → display)
 * @returns {Decimal} Quantity in display units
 */
export function toDisplayQty(baseQty, conversionFactor) {
  return baseQty.div(conversionFactor);
}

/**
 * Calculate the line total in INR for an order item.
 * lineTotal = baseQty * pricePerBaseUnit
 *
 * @param {Decimal} baseQty - Quantity in base units
 * @param {Decimal} pricePerBaseUnit - Price in INR per base unit
 * @returns {Decimal} Line total in INR
 */
export function calcLineTotal(baseQty, pricePerBaseUnit) {
  return baseQty.mul(pricePerBaseUnit);
}

/**
 * Calculate the display price per display unit.
 * e.g., if pricePerBaseUnit = 0.5 INR/gram and conversionFactor = 1000 (kg),
 *        then displayPrice = 0.5 * 1000 = 500 INR/kg
 *
 * @param {Decimal} pricePerBaseUnit - Price in INR per base unit
 * @param {Decimal} conversionFactor - Conversion factor for the display unit
 * @returns {Decimal} Price in INR per display unit
 */
export function calcDisplayPrice(pricePerBaseUnit, conversionFactor) {
  return pricePerBaseUnit.mul(conversionFactor);
}
