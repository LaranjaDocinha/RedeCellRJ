import React from 'react';
import { FormGroup, Label, Input, Row, Col } from 'reactstrap';

const ChartSettingsSection = ({ settings, handleInputChange }) => {
  return (
    <>
      <h4 className='h4 mb-4'>Configurações de Gráficos</h4>

      <h5 className='mb-3'>Eixos</h5>
      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='chart_xaxis_title'>Título do Eixo X</Label>
            <Input
              id='chart_xaxis_title'
              name='chart_xaxis_title'
              type='text'
              value={settings.chart_xaxis_title || ''}
              onChange={handleInputChange}
              placeholder='Ex: Meses, Categorias'
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='chart_yaxis_title'>Título do Eixo Y</Label>
            <Input
              id='chart_yaxis_title'
              name='chart_yaxis_title'
              type='text'
              value={settings.chart_yaxis_title || ''}
              onChange={handleInputChange}
              placeholder='Ex: Vendas, Quantidade'
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='chart_show_xaxis_labels'
                checked={settings.chart_show_xaxis_labels !== undefined ? settings.chart_show_xaxis_labels : true}
                onChange={(e) => handleInputChange({ target: { name: 'chart_show_xaxis_labels', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Exibir Rótulos do Eixo X
            </Label>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='chart_show_yaxis_labels'
                checked={settings.chart_show_yaxis_labels !== undefined ? settings.chart_show_yaxis_labels : true}
                onChange={(e) => handleInputChange({ target: { name: 'chart_show_yaxis_labels', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Exibir Rótulos do Eixo Y
            </Label>
          </FormGroup>
        </Col>
      </Row>

      <h5 className='mt-4 mb-3'>Legenda</h5>
      <Row>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='chart_show_legend'
                checked={settings.chart_show_legend !== undefined ? settings.chart_show_legend : true}
                onChange={(e) => handleInputChange({ target: { name: 'chart_show_legend', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Exibir Legenda
            </Label>
          </FormGroup>
        </Col>
      </Row>

      <h5 className='mt-4 mb-3'>Animações</h5>
      <Row>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='chart_enable_animations'
                checked={settings.chart_enable_animations !== undefined ? settings.chart_enable_animations : true}
                onChange={(e) => handleInputChange({ target: { name: 'chart_enable_animations', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Habilitar Animações do Gráfico
            </Label>
          </FormGroup>
        </Col>
      </Row>

      <h5 className='mt-4 mb-3'>Exportação</h5>
      <Row>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='chart_enable_export'
                checked={settings.chart_enable_export !== undefined ? settings.chart_enable_export : true}
                onChange={(e) => handleInputChange({ target: { name: 'chart_enable_export', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Habilitar Exportação do Gráfico (PNG, SVG, CSV)
            </Label>
          </FormGroup>
        </Col>
      </Row>

      <h5 className='mt-4 mb-3'>Fonte</h5>
      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='chart_font_family'>Família da Fonte</Label>
            <Input
              id='chart_font_family'
              name='chart_font_family'
              type='text'
              value={settings.chart_font_family || ''}
              onChange={handleInputChange}
              placeholder='Ex: Arial, Helvetica, sans-serif'
            />
          </FormGroup>
        </Col>
      </Row>

      <h5 className='mt-4 mb-3'>Interatividade</h5>
      <Row>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='chart_enable_zoom_pan'
                checked={settings.chart_enable_zoom_pan !== undefined ? settings.chart_enable_zoom_pan : true}
                onChange={(e) => handleInputChange({ target: { name: 'chart_enable_zoom_pan', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Habilitar Zoom e Pan
            </Label>
          </FormGroup>
        </Col>
      </Row>

      <h5 className='mt-4 mb-3'>Tooltip</h5>
      <Row>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='chart_show_tooltip'
                checked={settings.chart_show_tooltip !== undefined ? settings.chart_show_tooltip : true}
                onChange={(e) => handleInputChange({ target: { name: 'chart_show_tooltip', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Exibir Tooltip
            </Label>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='chart_tooltip_theme'>Tema do Tooltip</Label>
            <Input
              id='chart_tooltip_theme'
              name='chart_tooltip_theme'
              type='select'
              value={settings.chart_tooltip_theme || 'dark'}
              onChange={handleInputChange}
            >
              <option value='dark'>Escuro</option>
              <option value='light'>Claro</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>
    </>
  );
};

export default ChartSettingsSection;
