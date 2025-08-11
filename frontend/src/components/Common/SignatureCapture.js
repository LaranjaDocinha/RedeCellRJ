import React, { useRef, useEffect, useState } from 'react';

const SignatureCapture = ({ onSave, initialSignature = null }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If there's an initial signature (e.g., from a loaded document), draw it
    if (initialSignature) {
      const img = new Image();
      img.src = initialSignature;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [initialSignature]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    saveSignature();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setUploadedImage(null);
    onSave(null); // Clear saved signature
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    onSave(dataURL);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        onSave(reader.result); // Save the uploaded image as data URL
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="signature-capture-container">
      <h3>Assinatura Digital</h3>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        style={{ border: '1px solid #000', backgroundColor: '#f0f0f0' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      ></canvas>
      <div className="signature-controls">
        <button type="button" onClick={clearCanvas}>Limpar</button>
        <input type="file" accept="image/*" onChange={handleFileUpload} />
      </div>
      {uploadedImage && (
        <div className="mt-3">
          <h4>Pré-visualização da Imagem Carregada:</h4>
          <img src={uploadedImage} alt="Uploaded Signature" style={{ maxWidth: '100%', maxHeight: '200px' }} />
        </div>
      )}
    </div>
  );
};

export default SignatureCapture;