export const simulateScaleReading = async (): Promise<number> => {
  // Simula uma leitura de balança (peso em kg)
  const weight = parseFloat((Math.random() * (5 - 0.1) + 0.1).toFixed(2)); // Entre 0.1kg e 5kg
  console.log(`[HardwareService] Scale reading: ${weight} kg`);
  return weight;
};

interface TefTransactionResult {
  success: boolean;
  transactionId?: string;
  authorizationCode?: string;
  nsu?: string;
  message: string;
}

export const processTefPayment = async (amount: number, paymentType: 'credit' | 'debit'): Promise<TefTransactionResult> => {
  // Simula uma transação TEF
  console.log(`[HardwareService] Processing TEF payment: ${paymentType} R$ ${amount.toFixed(2)}`);
  
  // Simular sucesso/falha aleatória
  const success = Math.random() > 0.1; // 90% de sucesso

  if (success) {
    const transactionId = `TEF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const authorizationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const nsu = Math.floor(Math.random() * 1000000000).toString();
    return {
      success: true,
      transactionId,
      authorizationCode,
      nsu,
      message: 'Transação TEF aprovada com sucesso.'
    };
  } else {
    return {
      success: false,
      message: 'Transação TEF negada. Tente novamente.'
    };
  }
};
