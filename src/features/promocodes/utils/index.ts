export function getPromoPrice(price: number, promoValue: number) {
  promoValue = Math.max(promoValue, 0);
  promoValue = Math.min(promoValue, 100);

  return (price * (100 - promoValue)) / 100;
}
