import React, { useState, useEffect } from 'react';
import { Row, Col, CardBody, Card, Container, Form, Input, FormFeedback, Label } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion'; // Importar motion

import { useAuthStore } from '../../store/authStore';
import { get, post } from '../../helpers/api_helper'; // 1. Importar o helper da API
import { useTheme } from '../../context/ThemeContext';
import FormField from '../../components/Common/FormField'; // Import FormField
import PasswordField from '../../components/Common/PasswordField'; // Import PasswordField
import LoadingSpinner from '../../components/Common/LoadingSpinner'; // Import LoadingSpinner
import RippleEffect from '../../components/Common/RippleEffect'; // Import RippleEffect
import ThemeToggle from '../../components/Layout/ThemeToggle'; // Import ThemeToggle
import axios from 'axios'; // Import axios

const quotes = [
  'Simplifique sua gestão, impulsione suas vendas.',
  'Controle total na palma da sua mão.',
  'Seu negócio, suas regras, nosso sistema.',
  'Inovação e eficiência para o seu dia a dia.',
];

const Login = () => {
  document.title = 'Login | PDV Web';

  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  const { theme } = useTheme();
  const [shakeForm, setShakeForm] = useState(false);
  const [loginError, setLoginError] = useState(null); // Novo estado para erro de login

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0); // Estado para o carrossel de citações
  const [loginScreenSettings, setLoginScreenSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const logoSrc = theme === 'dark' ? '/Dark-mode-logo.png' : '/redecellrj.png';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000); // Muda a citação a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000); // Muda a citação a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // New useEffect to fetch and apply login screen settings
  useEffect(() => {
    const fetchLoginSettings = async () => {
      try {
        setLoadingSettings(true);
        const response = await get('/api/settings/login-screen');
        const settings = response.data;
        setLoginScreenSettings(settings);

        const authPage = document.querySelector('.auth-page');
        if (authPage) {
          // Apply background based on type
          if (settings.background_type === 'gradient') {
            authPage.style.backgroundImage = `linear-gradient(${settings.gradient_direction}deg, ${settings.gradient_color_1} 0%, ${settings.gradient_color_2} 25%, ${settings.gradient_color_3} 50%, ${settings.gradient_color_4} 75%, ${settings.gradient_color_1} 100%)`;
            authPage.style.backgroundSize = '400% 400%';
            authPage.style.animation = `gradient-animation ${settings.gradient_speed}s ease infinite, background-entry-animation 1s ease-out forwards`;
          } else if (settings.background_type === 'solid') {
            authPage.style.backgroundImage = 'none';
            authPage.style.backgroundColor = settings.background_solid_color;
            authPage.style.animation = 'background-entry-animation 1s ease-out forwards';
          } else if (settings.background_type === 'image') {
            authPage.style.backgroundImage = `url(${settings.background_image_url})`;
            authPage.style.backgroundSize = settings.image_size;
            authPage.style.backgroundRepeat = settings.image_repeat;
            authPage.style.animation = 'background-entry-animation 1s ease-out forwards';
          } else if (settings.background_type === 'video') {
            // For video, we'll render a video element in the JSX, not via CSS background
            authPage.style.backgroundImage = 'none';
            authPage.style.backgroundColor = 'transparent'; // Ensure no background color
            authPage.style.animation = 'none'; // No CSS animation for video background
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações da tela de login:', error);
        // Fallback to default or a simple background if settings fail to load
        const authPage = document.querySelector('.auth-page');
        if (authPage) {
          authPage.style.backgroundImage = 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)'; // A default gradient
          authPage.style.backgroundSize = '400% 400%';
          authPage.style.animation = 'gradient-animation 15s ease infinite, background-entry-animation 1s ease-out forwards';
        }
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchLoginSettings();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const particlesContainer = document.querySelector('.particles-container');
    if (!particlesContainer) return;

    const numberOfParticles = 50;
    for (let i = 0; i < numberOfParticles; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      const size = Math.random() * 10 + 5; // Size between 5px and 15px
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 15}s`; // Delay up to 15s
      particle.style.animationDuration = `${Math.random() * 10 + 10}s`; // Duration between 10s and 20s
      particlesContainer.appendChild(particle);
    }
  }, []);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Formato de e-mail inválido')
        .required('Por favor, digite seu e-mail'),
      password: Yup.string().required('Por favor, digite sua senha'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setLoginError(null); // Limpa erros anteriores
      try {
        const response = await post('/api/users/login', {
          email: values.email,
          password: values.password,
        });

        if (response.token) {
          loginAction(response);
          navigate('/bi-dashboard');
        }
      } catch (error) {
        // Captura a mensagem de erro do backend
        const errorMessage = error.response?.data?.message || 'Ocorreu um erro inesperado.';
        setLoginError(errorMessage);
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 500); // Remover a classe após a animação
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <React.Fragment>
      <div className='auth-page'>
        {loginScreenSettings && loginScreenSettings.background_type === 'video' && (
          <video
            autoPlay
            loop
            muted
            className="background-video"
            src={loginScreenSettings.background_video_url}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: -2, // Below other content
            }}
          >
            Seu navegador não suporta o elemento de vídeo.
          </video>
        )}
        <div className='particles-container'></div>
        <div className='parallax-layer parallax-layer-back'></div>
        <div className='parallax-layer parallax-layer-middle'></div>
        <div className='parallax-layer parallax-layer-front'></div>
        <Container fluid className='p-0'>
          <Row className='g-0 justify-content-center align-items-center'>
            <Col className='flex-grow-0 flex-shrink-0' lg={4} md={6} sm={8} xs={10}>
              <div className='overflow-hidden shadow-lg auth-card'>
                <div className='auth-card-body shadow-md'>
                  <div className='auth-form-content'>
                    <div className='text-center mb-4'>
                      <Link className='d-block auth-logo' to='/'>
                        <motion.img
                          alt=''
                          animate={{ opacity: 1, scale: 1 }}
                          className='auth-logo-dark'
                          height='40'
                          initial={{ opacity: 0, scale: 0.8 }}
                          src={logoSrc}
                          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                        />
                      </Link>
                    </div>

                    <Form
                      className={`form-horizontal ${shakeForm ? 'shake-animation' : ''}`}
                      onSubmit={validation.handleSubmit}
                    >
                      {loginError && (
                        <div aria-live='assertive' className='text-danger text-center mb-3'>
                          {loginError}
                        </div>
                      )}

                      <FormField
                        formik={validation}
                        label='E-mail'
                        name='email'
                        placeholder='Digite seu e-mail'
                        type='email'
                      />

                      <PasswordField
                        formik={validation}
                        label='Senha'
                        name='password'
                        placeholder='Digite sua senha'
                      />

                      <div className='mt-4 d-flex justify-content-center'>
                        <RippleEffect>
                          <button
                            className='btn btn-primary btn-liquid-effect btn-pulse-effect btn-login-custom-width'
                            disabled={validation.isSubmitting}
                            type='submit'
                          >
                            {validation.isSubmitting ? (
                              <motion.div
                                animate={{ opacity: 1 }}
                                className='d-flex align-items-center justify-content-center'
                                exit={{ opacity: 0 }}
                                initial={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <LoadingSpinner color='#fff' size={20} />
                                <span className='ms-2'>Entrando...</span>
                              </motion.div>
                            ) : (
                              <motion.span
                                animate={{ opacity: 1 }}
                                initial={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                Entrar
                              </motion.span>
                            )}
                          </button>
                        </RippleEffect>
                      </div>

                      <div className='mt-4 text-center'>
                        <Link
                          className='text-primary text-decoration-underline-hover animated-link'
                          to='/forgot-password'
                        >
                          <i className='mdi mdi-lock me-1 animated-icon' />
                          Esqueceu sua senha?
                        </Link>
                      </div>
                      <div className='d-flex justify-content-center mt-3'></div>
                    </Form>
                  </div>
                </div>
              </div>

              <div className='mt-4 mt-md-auto text-center'>
                <p className='mb-0'></p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Login;
