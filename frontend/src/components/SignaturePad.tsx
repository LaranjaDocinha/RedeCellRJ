import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad: React.FC = () => {
  const sigPad = useRef<SignatureCanvas>(null);

  const clear = () => sigPad.current?.clear();
  const save = () => {
    const signature = sigPad.current?.toDataURL();
    // Logic to save the signature image (base64) to the backend
    console.log(signature);
  };

  return (
    <div>
      <SignatureCanvas 
        ref={sigPad} 
        penColor='black'
        canvasProps={{ width: 500, height: 200, style: { border: '1px solid #000' } }}
      />
      <div>
        <button onClick={clear}>Limpar</button>
        <button onClick={save}>Salvar Assinatura</button>
      </div>
    </div>
  );
};

export default SignaturePad;
