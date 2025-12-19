export const posTourSteps = [
  {
    target: 'body', // Target the body for the welcome message
    content: 'Bem-vindo ao Ponto de Venda! Vamos fazer um tour rápido pelas principais funcionalidades.',
    disableBeacon: true, // Don't show the beacon for the welcome step
  },
  {
    target: '#pos-product-search',
    content: 'Aqui você pode buscar produtos por nome, código ou escanear o código de barras. Pressione F1 para focar aqui a qualquer momento.',
    placement: 'bottom',
  },
  {
    target: '#pos-product-grid',
    content: 'Os resultados da sua busca aparecerão aqui. Clique em um produto para adicioná-lo ao carrinho.',
    placement: 'right',
  },
  {
    target: '#pos-cart-section',
    content: 'Este é o seu carrinho. Os itens adicionados aparecerão aqui. Você pode alterar a quantidade ou remover itens.',
    placement: 'left',
  },
  {
    target: '#pos-checkout-area',
    content: 'Quando estiver pronto, selecione o método de pagamento e clique em "Finalizar Compra". Você também pode usar o atalho F2.',
    placement: 'top',
  },
];