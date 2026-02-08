import React, { useState } from 'react';
import styled from 'styled-components';
import KioskLayout from '../../components/KioskLayout';
import { Search, ShoppingCart, QrCodeScanner, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import SignaturePad from '../../components/ui/SignaturePad';

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 900px;
  margin-top: 50px;
`;

const BigButton = styled.button`
  background: white;
  border: none;
  border-radius: 20px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ButtonTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
`;

const ButtonDesc = styled.p`
  color: #666;
  text-align: center;
  margin: 0;
`;

// Simple numeric keypad simulation
const KeypadContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 20px;
    max-width: 300px;
`;

const KeyButton = styled.button`
    padding: 15px;
    font-size: 1.2rem;
    border-radius: 10px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    &:active { background: #eee; }
`;

const KioskHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'home' | 'track'>('home');
  const [osNumber, setOsNumber] = useState('');
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  const handleKeyPress = (key: string) => {
    if (key === 'C') setOsNumber('');
    else if (key === '<') setOsNumber(prev => prev.slice(0, -1));
    else setOsNumber(prev => prev + key);
  };

  const handleTrack = () => {
    if (osNumber) {
        setIsSignModalOpen(true);
    }
  };

  const handleSaveSignature = (dataUrl: string) => {
    console.log('Signature Captured:', dataUrl);
    alert('Assinatura salva com sucesso! Pedido finalizado.');
    setIsSignModalOpen(false);
    setMode('home');
    setOsNumber('');
  };

  return (
    <KioskLayout>
      {mode === 'home' && (
        <>
            <h1 style={{color: '#444'}}>O que você deseja fazer hoje?</h1>
            <ButtonGrid>
            <BigButton onClick={() => setMode('track')}>
                <Search style={{ fontSize: 80, color: '#3498db' }} />
                <ButtonTitle>Consultar Status OS</ButtonTitle>
                <ButtonDesc>Veja se seu aparelho já está pronto para retirada</ButtonDesc>
            </BigButton>

            <BigButton onClick={() => alert('Vitrine em Breve')}>
                <ShoppingCart style={{ fontSize: 80, color: '#e74c3c' }} />
                <ButtonTitle>Comprar Acessórios</ButtonTitle>
                <ButtonDesc>Películas, capas e carregadores com retirada imediata</ButtonDesc>
            </BigButton>

            <BigButton onClick={() => alert('Check-in em Breve')}>
                <QrCodeScanner style={{ fontSize: 80, color: '#2ecc71' }} />
                <ButtonTitle>Auto Check-in</ButtonTitle>
                <ButtonDesc>Agilize seu atendimento na recepção</ButtonDesc>
            </BigButton>
            </ButtonGrid>
        </>
      )}

      {mode === 'track' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Digite o Número da OS</h2>
            <div style={{ 
                background: 'white', padding: '15px', width: '300px', 
                textAlign: 'center', fontSize: '2rem', borderRadius: '10px', 
                border: '2px solid #3498db', marginBottom: '20px', minHeight: '60px'
            }}>
                {osNumber}
            </div>

            <KeypadContainer>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <KeyButton key={n} onClick={() => handleKeyPress(String(n))}>{n}</KeyButton>
                ))}
                <KeyButton onClick={() => handleKeyPress('C')} style={{color: 'red'}}>C</KeyButton>
                <KeyButton onClick={() => handleKeyPress('0')}>0</KeyButton>
                <KeyButton onClick={() => handleKeyPress('<')}>⌫</KeyButton>
            </KeypadContainer>

            <div style={{display: 'flex', gap: '20px', marginTop: '30px'}}>
                <button 
                    style={{padding: '15px 30px', borderRadius: '10px', border: 'none', background: '#95a5a6', color: 'white', fontSize: '1.2rem'}}
                    onClick={() => setMode('home')}
                >
                    Voltar
                </button>
                <button 
                    style={{padding: '15px 30px', borderRadius: '10px', border: 'none', background: '#3498db', color: 'white', fontSize: '1.2rem'}}
                    onClick={handleTrack}
                >
                    Consultar
                </button>
            </div>
        </div>
      )}

      <Dialog open={isSignModalOpen} onClose={() => setIsSignModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Termo de Retirada / Ciência
            <IconButton onClick={() => setIsSignModalOpen(false)}><Edit /></IconButton>
        </DialogTitle>
        <DialogContent>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                Ao assinar abaixo, você confirma o recebimento do seu dispositivo em perfeito estado e de acordo com o serviço solicitado.
            </p>
            <SignaturePad onSave={handleSaveSignature} />
        </DialogContent>
      </Dialog>
    </KioskLayout>
  );
};

export default KioskHomePage;
