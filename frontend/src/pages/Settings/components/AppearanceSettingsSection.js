import React from 'react';
import { FormGroup, Label, Input, Row, Col } from 'reactstrap';

import { useTheme } from '../../../context/ThemeContext';
import { availableFonts } from '../../../config/themeConfig';
import ThemeToggle from '../../../components/Layout/ThemeToggle';

const AppearanceSettingsSection = ({ settings, handleInputChange }) => {
  const { setPrimaryColor, setPrimaryFont, setSecondaryFont } = useTheme();

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setPrimaryColor(newColor);
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
    <>
      <h4 className='h4 mb-4'>Aparência e Tema</h4>

      <Row className='mb-3 align-items-center'>
        <Col md={6}>
          <Label className='mb-0'>Modo Escuro/Claro</Label>
        </Col>
        <Col md={6} className='text-end'>
          <ThemeToggle />
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='chart_theme'>Tema do Gráfico</Label>
            <Input
              id='chart_theme'
              name='chart_theme'
              type='select'
              value={settings.chart_theme || 'light'} // Valor padrão
              onChange={handleInputChange}
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="minimal">Minimalista</option>
            </Input>
          </FormGroup>
        </Col>
        <Col md={6}>
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
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='secondary_color'>Cor Secundária</Label>
            <Input
              className='form-control-color'
              id='secondary_color'
              name='secondary_color'
              type='color'
              value={settings.secondary_color || '#6c757d'} // Valor padrão
              onChange={(e) => handleInputChange({ target: { name: 'secondary_color', value: e.target.value } })}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='text_color'>Cor do Texto</Label>
            <Input
              className='form-control-color'
              id='text_color'
              name='text_color'
              type='color'
              value={settings.text_color || '#343a40'} // Valor padrão
              onChange={(e) => handleInputChange({ target: { name: 'text_color', value: e.target.value } })}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='background_color'>Cor de Fundo</Label>
            <Input
              className='form-control-color'
              id='background_color'
              name='background_color'
              type='color'
              value={settings.background_color || '#f8f9fa'} // Valor padrão
              onChange={(e) => handleInputChange({ target: { name: 'background_color', value: e.target.value } })}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='chart_color_1'>Cor do Gráfico 1</Label>
            <Input
              className='form-control-color'
              id='chart_color_1'
              name='chart_color_1'
              type='color'
              value={settings.chart_color_1 || '#007bff'} // Valor padrão
              onChange={(e) => handleInputChange({ target: { name: 'chart_color_1', value: e.target.value } })}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='chart_color_2'>Cor do Gráfico 2</Label>
            <Input
              className='form-control-color'
              id='chart_color_2'
              name='chart_color_2'
              type='color'
              value={settings.chart_color_2 || '#28a745'} // Valor padrão
              onChange={(e) => handleInputChange({ target: { name: 'chart_color_2', value: e.target.value } })}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='chart_color_3'>Cor do Gráfico 3</Label>
            <Input
              className='form-control-color'
              id='chart_color_3'
              name='chart_color_3'
              type='color'
              value={settings.chart_color_3 || '#ffc107'} // Valor padrão
              onChange={(e) => handleInputChange({ target: { name: 'chart_color_3', value: e.target.value } })}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='daily_revenue_chart_type'>Tipo de Gráfico de Faturamento Diário</Label>
            <Input
              id='daily_revenue_chart_type'
              name='daily_revenue_chart_type'
              type='select'
              value={settings.daily_revenue_chart_type || 'area'} // Valor padrão
              onChange={handleInputChange}
            >
              <option value="area">Área</option>
              <option value="line">Linha</option>
              <option value="bar">Barra</option>
            </Input>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='sales_payment_method_chart_type'>Tipo de Gráfico de Vendas por Pagamento</Label>
            <Input
              id='sales_payment_method_chart_type'
              name='sales_payment_method_chart_type'
              type='select'
              value={settings.sales_payment_method_chart_type || 'donut'} // Valor padrão
              onChange={handleInputChange}
            >
              <option value="donut">Rosca</option>
              <option value="pie">Pizza</option>
              <option value="bar">Barra</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='repair_status_chart_type'>Tipo de Gráfico de Status de Reparo</Label>
            <Input
              id='repair_status_chart_type'
              name='repair_status_chart_type'
              type='select'
              value={settings.repair_status_chart_type || 'donut'} // Valor padrão
              onChange={handleInputChange}
            >
              <option value="donut">Rosca</option>
              <option value="pie">Pizza</option>
              <option value="bar">Barra</option>
            </Input>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='top_products_chart_type'>Tipo de Gráfico de Produtos Mais Vendidos</Label>
            <Input
              id='top_products_chart_type'
              name='top_products_chart_type'
              type='select'
              value={settings.top_products_chart_type || 'bar'} // Valor padrão
              onChange={handleInputChange}
            >
              <option value="bar">Barra</option>
              <option value="column">Coluna</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='show_xaxis_labels'
                checked={settings.show_xaxis_labels}
                onChange={(e) => handleInputChange({ target: { name: 'show_xaxis_labels', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Mostrar Rótulos do Eixo X
            </Label>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='show_yaxis_labels'
                checked={settings.show_yaxis_labels}
                onChange={(e) => handleInputChange({ target: { name: 'show_yaxis_labels', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Mostrar Rótulos do Eixo Y
            </Label>
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='show_chart_legend'
                checked={settings.show_chart_legend}
                onChange={(e) => handleInputChange({ target: { name: 'show_chart_legend', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Mostrar Legenda do Gráfico
            </Label>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='primary_font'>Fonte Primária</Label>
            <Input
              id='primary_font'
              name='primary_font'
              type='select'
              value={settings.primary_font || 'Roboto'} // Valor padrão
              onChange={handlePrimaryFontChange}
            >
              {availableFonts.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.name}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
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
        </Col>
        <Col md={6}>
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
        </Col>
      </Row>

      <Row>
        <Col md={6}>
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
        </Col>
        <Col md={6}>
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
        </Col>
      </Row>
    </>
  );
};

export default AppearanceSettingsSection;
