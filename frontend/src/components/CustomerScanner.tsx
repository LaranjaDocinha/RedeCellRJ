import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';

const CustomerScanner: React.FC = () => {
  const [ocrText, setOcrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setIsProcessing(true);
      const worker = await createWorker('por'); // Portuguese language
      const ret = await worker.recognize(event.target.files[0]);
      setOcrText(ret.data.text);
      await worker.terminate();
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h3>Cadastro Rápido de Cliente</h3>
      <p>Envie uma foto do documento para preenchimento automático.</p>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {isProcessing && <p>Processando imagem...</p>}
      {ocrText && (
        <pre>
          <h4>Texto Extraído:</h4>
          {ocrText}
          {/* Logic to parse this text and fill a form would go here */}
        </pre>
      )}
    </div>
  );
};

export default CustomerScanner;
