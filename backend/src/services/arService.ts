

export const getCompatibleProducts = async (deviceId: number) => {
  console.log(`Simulating fetching compatible products for device ${deviceId}`);
  // In a real scenario, this would query products compatible with the device for AR preview.
  return {
    success: true,
    products: [
      {
        id: 1,
        name: 'Capa Transparente',
        imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Capa1',
      },
      {
        id: 2,
        name: 'Capa Preta Fosca',
        imageUrl: 'https://via.placeholder.com/150/000000/FFFFFF?text=Capa2',
      },
    ],
    message: `Compatible products for device ${deviceId} (simulated).`,
  };
};

export const logARInteraction = async (customerId: number, productId: number) => {
  console.log(
    `Simulating logging AR interaction for customer ${customerId} with product ${productId}`,
  );
  // In a real scenario, this would log the customer's interaction with the AR feature.
  return {
    success: true,
    message: `AR interaction logged for customer ${customerId} with product ${productId} (simulated).`,
  };
};
