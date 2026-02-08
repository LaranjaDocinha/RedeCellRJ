/**
 * Regras de Negócio Puras (Pure Domain Logic)
 * Estas funções NÃO devem ter efeitos colaterais ou depender de banco de dados/APIs.
 */

export const FinanceLogic = {
  /**
   * Calcula o valor da comissão baseado no tipo de serviço e metas.
   */
  calculateCommission(saleAmount: number, percentage: number, bonus: number = 0): number {
    if (saleAmount < 0 || percentage < 0) return 0;
    return saleAmount * (percentage / 100) + bonus;
  },

  /**
   * Calcula o valor do desconto respeitando o limite máximo permitido.
   */
  applyDiscount(
    originalPrice: number,
    discountValue: number,
    isPercentage: boolean,
    maxDiscountPercent: number = 50,
  ): number {
    const discountAmount = isPercentage ? originalPrice * (discountValue / 100) : discountValue;
    const maxAllowed = originalPrice * (maxDiscountPercent / 100);

    const finalDiscount = Math.min(discountAmount, maxAllowed);
    return Math.max(0, originalPrice - finalDiscount);
  },

  /**
   * Determina a margem de lucro real.
   */
  calculateMargin(price: number, cost: number): number {
    if (price <= 0) return 0;
    return ((price - cost) / price) * 100;
  },
};
