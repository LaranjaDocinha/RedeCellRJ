export const generateProductLabelZPL = (productName: string, price: number, sku: string) => {
  // ZPL Simples para etiqueta 50x30mm
  // ^XA = Início, ^FO = Posição, ^ADN = Fonte, ^BC = Código de Barras 128
  return `
^XA
^FO20,20^ADN,18,10^FD${productName.substring(0, 25)}^FS
^FO20,50^ADN,18,10^FD${productName.substring(25, 50)}^FS
^FO20,90^A0N,40,40^FDR$ ${price.toFixed(2)}^FS
^FO20,140^BCN,60,Y,N,N^FD${sku}^FS
^XZ
  `.trim();
};

export const generateOSLabelZPL = (osId: number, customerName: string, device: string) => {
  return `
^XA
^FO10,10^GB380,280,4^FS
^FO30,30^ADN,36,20^FDOS #${osId}^FS
^FO30,80^ADN,18,10^FD${customerName.substring(0, 20)}^FS
^FO30,120^ADN,18,10^FD${device}^FS
^FO30,160^BQN,2,5^FDQA,OS${osId}^FS
^FO150,180^ADN,18,10^FDEntrada: ${new Date().toLocaleDateString('pt-BR')}^FS
^XZ
  `.trim();
};
