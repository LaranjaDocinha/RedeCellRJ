import { Request, Response } from 'express';

export const labelController = {
  async generateZpl(req: Request, res: Response) {
    try {
      const { type, items } = req.body; // items: [{ name, price, barcode, sku }]

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items array is required' });
      }

      let zplCommands = '';

      if (type === 'product') {
        // Tamanho padrão etiqueta gôndola 30x20mm (aprox 240x160 dots em 203dpi)
        // Ajustar conforme impressora

        for (const item of items) {
          // ^XA: Start
          // ^PW400: Label width
          // ^LL200: Label length
          // ^FO: Field Origin
          // ^A0: Font (0 = Scalable)
          // ^BC: Code 128 Barcode
          // ^FD: Field Data
          // ^FS: Field Separator
          // ^XZ: End

          zplCommands += `
^XA
^PW400
^LL240
^FO20,20^A0N,30,30^FD${item.name.substring(0, 20)}^FS
^FO20,60^BCN,60,Y,N,N^FD${item.barcode || item.sku}^FS
^FO20,160^A0N,40,40^FDR$ ${item.price.toFixed(2)}^FS
^XZ
`;
        }
      } else if (type === 'service_order') {
        // Etiqueta de OS
        // ... implementação futura
      } else {
        return res.status(400).json({ message: 'Invalid label type' });
      }

      res.setHeader('Content-Type', 'text/plain');
      res.send(zplCommands);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
