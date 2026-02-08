interface DeviceCondition {
  screenCracked: boolean; // -20%
  batteryService: boolean; // -10%
  faceIdBroken: boolean; // -15%
  housingScratched: boolean; // -5%
}

export const calculateBuybackPrice = (basePrice: number, condition: DeviceCondition) => {
  let penalty = 0;

  if (condition.screenCracked) penalty += 0.2;
  if (condition.batteryService) penalty += 0.1;
  if (condition.faceIdBroken) penalty += 0.15;
  if (condition.housingScratched) penalty += 0.05;

  // Corrigir precisão de ponto flutuante
  penalty = Math.round(penalty * 100) / 100;

  // Teto máximo de penalidade: 70% (senão vira sucata)
  penalty = Math.min(penalty, 0.7);

  const finalPrice = basePrice * (1 - penalty);

  return {
    basePrice,
    finalPrice: Math.floor(finalPrice), // Arredondar
    conditionRating: penalty < 0.1 ? 'Excelente' : penalty < 0.3 ? 'Bom' : 'Justo',
    deductions: penalty * 100,
  };
};
