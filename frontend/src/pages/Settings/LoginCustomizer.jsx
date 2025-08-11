import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Spinner } from 'reactstrap';
import toast from 'react-hot-toast';
import axios from 'axios'; // Assuming axios is used for API calls

import BackgroundTypeSelector from '../../components/Common/BackgroundTypeSelector';
import GradientSettings from '../../components/Common/GradientSettings';
import SolidColorSettings from '../../components/Common/SolidColorSettings';
import ImageSettings from '../../components/Common/ImageSettings';
import VideoSettings from '../../components/Common/VideoSettings';

const LoginCustomizer = () => {
  const [settings, setSettings] = useState({
    background_type: 'gradient',
    background_solid_color: '#FFFFFF',
    background_image_url: '',
    background_video_url: '',
    image_size: 'cover',
    image_repeat: 'no-repeat',
    gradient_color_1: 'rgb(255, 0, 0)',
    gradient_color_2: 'rgb(0, 255, 0)',
    gradient_color_3: 'rgb(0, 0, 255)',
    gradient_color_4: 'rgb(255, 255, 0)',
    gradient_speed: 15,
    gradient_direction: 45,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/settings/login-screen');
        setSettings(response.data);
        toast.success('Configurações carregadas com sucesso!');
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast.error('Erro ao carregar configurações da tela de login.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleTypeChange = (type) => {
    setSettings((prev) => ({ ...prev, background_type: type }));
  };

  const handleGradientColorChange = (key, color) => {
    setSettings((prev) => ({ ...prev, [key]: `rgb(${color.r}, ${color.g}, ${color.b}, ${color.a || 1})` }));
  };

  const handleGradientSpeedChange = (speed) => {
    setSettings((prev) => ({ ...prev, gradient_speed: Number(speed) }));
  };

  const handleGradientDirectionChange = (direction) => {
    setSettings((prev) => ({ ...prev, gradient_direction: Number(direction) }));
  };

  const handleSolidColorChange = (color) => {
    setSettings((prev) => ({ ...prev, background_solid_color: `rgb(${color.r}, ${color.g}, ${color.b}, ${color.a || 1})` }));
  };

  const handleImageUrlChange = (url) => {
    setSettings((prev) => ({ ...prev, background_image_url: url }));
  };

  const handleImageSizeChange = (size) => {
    setSettings((prev) => ({ ...prev, image_size: size }));
  };

  const handleImageRepeatChange = (repeat) => {
    setSettings((prev) => ({ ...prev, image_repeat: repeat }));
  };

  const handleVideoUrlChange = (url) => {
    setSettings((prev) => ({ ...prev, background_video_url: url }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Filter out nulls for fields not applicable to the current background_type
      const payload = { ...settings };
      if (payload.background_type !== 'gradient') {
        payload.gradient_color_1 = null;
        payload.gradient_color_2 = null;
        payload.gradient_color_3 = null;
        payload.gradient_color_4 = null;
        payload.gradient_speed = null;
        payload.gradient_direction = null;
      }
      if (payload.background_type !== 'solid') {
        payload.background_solid_color = null;
      }
      if (payload.background_type !== 'image') {
        payload.background_image_url = null;
        payload.image_size = null;
        payload.image_repeat = null;
      }
      if (payload.background_type !== 'video') {
        payload.background_video_url = null;
      }

      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      await axios.put('/api/settings/login-screen', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações da tela de login.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner color="primary" />
        <p className="mt-2">Carregando configurações...</p>
      </Container>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">Personalizar Tela de Login</h4>
                  <p className="card-title-desc">
                    Configure o plano de fundo da tela de login do seu sistema.
                  </p>

                  <BackgroundTypeSelector
                    selectedType={settings.background_type}
                    onChange={handleTypeChange}
                  />

                  {settings.background_type === 'gradient' && (
                    <GradientSettings
                      gradientColor1={settings.gradient_color_1}
                      gradientColor2={settings.gradient_color_2}
                      gradientColor3={settings.gradient_color_3}
                      gradientColor4={settings.gradient_color_4}
                      gradientSpeed={settings.gradient_speed}
                      gradientDirection={settings.gradient_direction}
                      onColorChange={handleGradientColorChange}
                      onSpeedChange={handleGradientSpeedChange}
                      onDirectionChange={handleGradientDirectionChange}
                    />
                  )}

                  {settings.background_type === 'solid' && (
                    <SolidColorSettings
                      solidColor={settings.background_solid_color}
                      onColorChange={handleSolidColorChange}
                    />
                  )}

                  {settings.background_type === 'image' && (
                    <ImageSettings
                      imageUrl={settings.background_image_url}
                      imageSize={settings.image_size}
                      imageRepeat={settings.image_repeat}
                      onImageUrlChange={handleImageUrlChange}
                      onImageSizeChange={handleImageSizeChange}
                      onImageRepeatChange={handleImageRepeatChange}
                    />
                  )}

                  {settings.background_type === 'video' && (
                    <VideoSettings
                      videoUrl={settings.background_video_url}
                      onVideoUrlChange={handleVideoUrlChange}
                    />
                  )}

                  <div className="mt-4">
                    <Button color="primary" onClick={handleSave} disabled={saving}>
                      {saving ? <Spinner size="sm" className="me-2" /> : null}
                      Salvar Configurações
                    </Button>
                    {/* Add a Reset to Default button if desired */}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default LoginCustomizer;
