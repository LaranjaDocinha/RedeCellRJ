import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Button from '../components/Button';
import { AppError } from '../../../backend/src/utils/errors';
import { removeBackground } from '../utils/imageUtils';
import { AutoFixHigh } from '@mui/icons-material';
import { CircularProgress, Box } from '@mui/material';

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  text-align: center;

  &:hover {
    background-color: #0056b3;
  }
`;

const PreviewImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  margin-top: 10px;
  border: 1px solid #ddd;
`;

const PhotoTypeSelect = styled.select`
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 1em;
  width: 100%;
  max-width: 200px;
  margin-top: 10px;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.9em;
`;

const SuccessMessage = styled.p`
  color: #28a745;
  font-size: 0.9em;
`;

interface PhotoUploadComponentProps {
  serviceOrderId: number;
  onUploadSuccess: (photoUrl: string, type: 'entry' | 'exit' | 'internal') => void;
  onUploadError?: (error: string) => void;
  isLoading?: boolean;
}

const PhotoUploadComponent: React.FC<PhotoUploadComponentProps> = ({
  serviceOrderId,
  onUploadSuccess,
  onUploadError,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [photoType, setPhotoType] = useState<'entry' | 'exit' | 'internal'>('internal');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('A imagem deve ter no máximo 5MB.');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemoveBg = async () => {
    if (!selectedFile) return;
    setIsRemovingBg(true);
    try {
        const resultUrl = await removeBackground(selectedFile);
        setPreviewUrl(resultUrl);
    } catch (e) {
        setError('Falha ao remover fundo.');
    } finally {
        setIsRemovingBg(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecione uma imagem para upload.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('type', photoType); // Adicionar o tipo da foto

    setError(null);

    try {
      // Simular chamada de API
      // Em um ambiente real, você faria um axios.post para /api/tech/orders/:id/photos
      // ou para o endpoint de upload genérico e depois chamaria o techAppService para associar.
      // Por simplicidade no storybook, vamos simular o upload para /uploads
      console.log('Simulating upload for serviceOrderId:', serviceOrderId, 'type:', photoType, 'file:', selectedFile.name);

      // Aqui, você chamaria sua API de upload. Exemplo com fetch:
      // const response = await fetch(`/api/tech/orders/${serviceOrderId}/photos`, {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new AppError(data.message || 'Falha no upload', response.status);
      // }
      // onUploadSuccess(data.url, photoType);

      // Mock de sucesso
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockUrl = `https://placehold.co/150?text=OS-${serviceOrderId}-${photoType}`;
      onUploadSuccess(mockUrl, photoType);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da imagem.');
      onUploadError && onUploadError(err.message || 'Erro desconhecido');
    }
  };

  return (
    <UploadContainer>
      <h3>Upload de Fotos</h3>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <PhotoTypeSelect value={photoType} onChange={(e) => setPhotoType(e.target.value as 'entry' | 'exit' | 'internal')} disabled={isLoading}>
            <option value="internal">Interna (Reparo)</option>
            <option value="entry">Entrada (Antes)</option>
            <option value="exit">Saída (Depois)</option>
          </PhotoTypeSelect>

          {previewUrl && (
              <Button 
                variant="outlined" 
                onClick={handleRemoveBg} 
                disabled={isRemovingBg}
                sx={{ mt: 1, borderRadius: '10px' }}
              >
                {isRemovingBg ? <CircularProgress size={20} /> : <><AutoFixHigh sx={{ mr: 1, verticalAlign: 'middle' }} /> Limpar Fundo (IA)</>}
              </Button>
          )}
      </Box>

      <FileInputLabel htmlFor={`file-upload-${serviceOrderId}`}>
        {selectedFile ? selectedFile.name : 'Selecionar Imagem'}
      </FileInputLabel>
      <FileInput
        id={`file-upload-${serviceOrderId}`}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        disabled={isLoading}
      />
      {previewUrl && <PreviewImage src={previewUrl} alt="Pré-visualização" />}
      <Button onClick={handleUpload} disabled={isLoading || !selectedFile}>
        {isLoading ? 'Enviando...' : 'Fazer Upload'}
      </Button>
    </UploadContainer>
  );
};

export default PhotoUploadComponent;
