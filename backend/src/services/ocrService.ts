import { createWorker } from 'tesseract.js';

export const ocrService = {
  /**
   * Processa uma imagem com OCR e extrai o texto.
   * @param imagePath Caminho para a imagem a ser processada.
   * @returns Texto extraído da imagem.
   */
  async recognizeText(imagePath: string): Promise<string> {
    const worker = await createWorker('eng'); // 'eng' para inglês, pode ser 'por' para português
    try {
      const {
        data: { text },
      } = await worker.recognize(imagePath);
      return text;
    } finally {
      await worker.terminate();
    }
  },

  /**
   * Extrai dados de um documento (simulado).
   * Em um cenário real, esta função usaria regex ou IA para parsear o texto do OCR
   * e extrair campos específicos como nome, CPF, endereço, etc.
   * Por enquanto, é uma simulação básica.
   * @param ocrText Texto extraído pelo OCR.
   * @returns Objeto com dados extraídos.
   */
  async extractDocumentData(ocrText: string): Promise<any> {
    const extractedData: any = {};

    // Exemplo básico de extração (precisaria ser muito mais robusto)
    const nameMatch = ocrText.match(/Nome:\s*(.*)/i);
    if (nameMatch && nameMatch[1]) {
      extractedData.name = nameMatch[1].trim();
    }

    const cpfMatch = ocrText.match(/CPF:\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i);
    if (cpfMatch && cpfMatch[1]) {
      extractedData.cpf = cpfMatch[1].trim();
    }

    // ... adicionar mais lógica para outros campos (endereço, data de nascimento, etc.)

    return extractedData;
  },
};
