import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendOfflineRequest } from '../../utils/offlineApi'; // Importar sendOfflineRequest

enum POSStep { SELECT_PRODUCTS, TRADE_IN, PAYMENT, CONFIRMATION };

interface CartItem {
  id: number;
  name: string;
  price: number;
  bundleId?: string;
}

const POS: React.FC = () => {
  const [step, setStep] = useState<POSStep>(POSStep.SELECT_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, name: 'iPhone 14', price: 5000 },
    { id: 2, name: 'Capa Silicone', price: 150 },
    { id: 3, name: 'Película de Vidro', price: 50 },
  ]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleCreateBundle = () => {
    const bundleId = uuidv4();
    setCart(cart.map(item => 
      selectedItems.includes(item.id) ? { ...item, bundleId: bundleId } : item
    ));
    setSelectedItems([]);
  };

  // Nova função para finalizar a venda
  const handleFinalizeSale = async () => {
    const saleData = {
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price, 0),
      // Adicionar outros dados da venda aqui, como cliente, método de pagamento, etc.
      // Por enquanto, vamos usar dados mockados ou incompletos para testar a funcionalidade offline.
    };

    try {
      const response = await sendOfflineRequest(
        '/api/sales', // Endpoint da API de vendas
        'POST',
        saleData,
        'offlineSales' // Nome da store no IndexedDB
      );
      console.log('Venda processada:', response);
      setStep(POSStep.CONFIRMATION);
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      // Tratar o erro, talvez mostrar uma mensagem ao usuário
    }
  };

  const renderStep = () => {
    switch (step) {
      case POSStep.SELECT_PRODUCTS:
        return (
          <div>
            <h3>Passo 1: Selecionar Produtos</h3>
            {/* Product selection UI here */}
            <button onClick={() => setStep(POSStep.TRADE_IN)}>Adicionar Trade-In</button>
            <button onClick={() => setStep(POSStep.PAYMENT)}>Ir para Pagamento</button>
          </div>
        );
      case POSStep.TRADE_IN:
        return (
          <div>
            <h3>Passo 2: Avaliação de Trade-In</h3>
            <input placeholder="Modelo do Aparelho Usado" />
            <fieldset>
              <legend>Checklist de Avaliação</legend>
              <div><input type="checkbox" id="liga_tradein" /><label htmlFor="liga_tradein">Liga</label></div>
              <div><input type="checkbox" id="tela_tradein" /><label htmlFor="tela_tradein">Tela sem trincos</label></div>
            </fieldset>
            <input type="number" placeholder="Valor da Avaliação" />
            <button onClick={() => setStep(POSStep.PAYMENT)}>Confirmar Trade-In e ir para Pagamento</button>
          </div>
        );
      case POSStep.PAYMENT:
        return (
          <div>
            <h3>Passo 3: Pagamento</h3>
            {/* Payment UI here */}
            <button>Cartão de Crédito</button>
            <button>Dinheiro</button>
            <button>Financiamento Parceiro</button>
            <br/>
            <button onClick={handleFinalizeSale}>Finalizar Venda</button> {/* Chamar handleFinalizeSale */}
          </div>
        );
      case POSStep.CONFIRMATION:
        return (
          <div>
            <h3>Venda Concluída!</h3>
            <button onClick={() => setStep(POSStep.SELECT_PRODUCTS)}>Nova Venda</button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div>
      <h2>Ponto de Venda</h2>
      {renderStep()}
    </div>
  );
};

export default POS;
