import React from 'react';
import { Card, CardBody, CardTitle, FormGroup, Label, Input, Row, Col, Alert } from 'reactstrap';

import { useTheme } from '../../../context/ThemeContext';
import { availableFonts } from '../../../config/themeConfig';
import ThemeToggle from '../../../components/Layout/ThemeToggle';

const AppearanceSettingsSection = ({ settings, handleInputChange }) => {
  const { setPrimaryColor, setPrimaryFont, setSecondaryFont } = useTheme();

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setPrimaryColor(newColor);
    // Atualiza o estado local das configurações para que o botão de salvar detecte a mudança
    handleInputChange({ target: { name: 'primary_color', value: newColor } });
  };

  const handlePrimaryFontChange = (e) => {
    const fontName = e.target.value;
    const selectedFont = availableFonts.find((font) => font.name === fontName);
    if (selectedFont) {
      setPrimaryFont(selectedFont);
      handleInputChange({ target: { name: 'primary_font', value: fontName } });
    }
  };

  const handleSecondaryFontChange = (e) => {
    const fontName = e.target.value;
    const selectedFont = availableFonts.find((font) => font.name === fontName);
    if (selectedFont) {
      setSecondaryFont(selectedFont);
      handleInputChange({ target: { name: 'secondary_font', value: fontName } });
    }
  };

  return (
    <Card>
      <CardBody>
        <CardTitle className='h4 mb-4'>Aparência e Tema</CardTitle>

        <FormGroup className='d-flex align-items-center justify-content-between mb-3'>
          <Label className='mb-0'>Modo Escuro/Claro</Label>
          <ThemeToggle />
        </FormGroup>

        <FormGroup className='mb-3'>
          <Label for='primary_color'>Cor Primária</Label>
          <Input
            className='form-control-color'
            id='primary_color'
            name='primary_color'
            type='color'
            value={settings.primary_color || '#556ee6'} // Valor padrão
            onChange={handleColorChange}
          />
        </FormGroup>

        <FormGroup className='mb-3'>
          <Label for='primary_font'>Fonte Primária</Label>
          <Input
            id='primary_font'
            name='primary_font'
            type='select'
            value={settings.primary_font || 'Inter'} // Valor padrão
            onChange={handlePrimaryFontChange}
          >
            {availableFonts.map((font) => (
              <option key={font.name} value={font.name}>
                {font.name}
              </option>
            ))}
          </Input>
        </FormGroup>

        <FormGroup className='mb-3'>
          <Label for='secondary_font'>Fonte Secundária</Label>
          <Input
            id='secondary_font'
            name='secondary_font'
            type='select'
            value={settings.secondary_font || 'Roboto'} // Valor padrão
            onChange={handleSecondaryFontChange}
          >
            {availableFonts.map((font) => (
              <option key={font.name} value={font.name}>
                {font.name}
              </option>
            ))}
          </Input>
        </FormGroup>

        <FormGroup className='mb-3'>
          <Label for='store_logo_url'>URL do Logo (Claro)</Label>
          <Input
            id='store_logo_url'
            name='store_logo_url'
            placeholder='Ex: /logo-claro.png'
            type='url'
            value={settings.store_logo_url || ''}
            onChange={handleInputChange}
          />
          {settings.store_logo_url && (
            <div className='mt-2'>
              <img
                alt='Logo Claro Preview'
                src={settings.store_logo_url}
                style={{ maxWidth: '150px', height: 'auto' }}
              />
            </div>
          )}
        </FormGroup>

        <FormGroup className='mb-3'>
          <Label for='store_logo_dark_url'>URL do Logo (Escuro)</Label>
          <Input
            id='store_logo_dark_url'
            name='store_logo_dark_url'
            placeholder='Ex: /logo-escuro.png'
            type='url'
            value={settings.store_logo_dark_url || ''}
            onChange={handleInputChange}
          />
          {settings.store_logo_dark_url && (
            <div className='mt-2'>
              <img
                alt='Logo Escuro Preview'
                src={settings.store_logo_dark_url}
                style={{ maxWidth: '150px', height: 'auto' }}
              />
            </div>
          )}
        </FormGroup>

        <FormGroup className='mb-3'>
          <Label for='favicon_url'>URL do Favicon</Label>
          <Input
            id='favicon_url'
            name='favicon_url'
            placeholder='Ex: /favicon.ico'
            type='url'
            value={settings.favicon_url || ''}
            onChange={handleInputChange}
          />
          {settings.favicon_url && (
            <div className='mt-2'>
              <img
                alt='Favicon Preview'
                src={settings.favicon_url}
                style={{ maxWidth: '32px', height: 'auto' }}
              />
            </div>
          )}
        </FormGroup>
      </CardBody>
    </Card>
  );
};

export default AppearanceSettingsSection;
