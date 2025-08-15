import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '../../store/authStore';
import { publicGet, post } from '../../helpers/api_helper';
import { useTheme } from '../../context/ThemeContext';
import FormField from '../../components/Common/FormField';
import PasswordField from '../../components/Common/PasswordField';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import RippleEffect from '../../components/Common/RippleEffect';
import ThemeToggle from '../../components/Layout/ThemeToggle';

const quotes = [
  'Simplifique sua gestão, impulsione suas vendas.',
  'Controle total na palma da sua mão.',
  'Seu negócio, suas regras, nosso sistema.',
  'Inovação e eficiência para o seu dia a dia.',
];

const loginSchema = z.object({
  email: z.string({ required_error: 'Por favor, digite seu e-mail' }).email('Formato de e-mail inválido'),
  password: z.string({ required_error: 'Por favor, digite sua senha' }).min(1, 'Por favor, digite sua senha'),
});

const Login = () => {
  document.title = 'Login | PDV Web';

  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  const { theme } = useTheme();
  const [shakeForm, setShakeForm] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
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
    const fetchLoginSettings = async () => {
      const defaultSettings = {
        background_type: 'gradient',
        gradient_color_1: '#2a2a72',
        gradient_color_2: '#009ffd',
        gradient_color_3: '#2a2a72',
        gradient_color_4: '#009ffd',
        gradient_speed: 15,
        gradient_direction: 45,
      };

      try {
        setLoadingSettings(true);
        const response = await publicGet('/api/settings/login-screen');
        const settings = response;

        if (!settings) {
          console.error('API response data is undefined or null. Using default settings.');
          setLoginScreenSettings(defaultSettings);
          return; // Exit early if no settings
        }

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
            authPage.style.backgroundImage = 'none';
            authPage.style.backgroundColor = 'transparent';
            authPage.style.animation = 'none';
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações da tela de login:', error);
        const defaultSettings = {
          background_type: 'gradient',
          gradient_color_1: '#2a2a72',
          gradient_color_2: '#009ffd',
          gradient_color_3: '#2a2a72',
          gradient_color_4: '#009ffd',
          gradient_speed: 15,
          gradient_direction: 45,
        };
        setLoginScreenSettings(defaultSettings);
        const authPage = document.querySelector('.auth-page');
        if (authPage) {
          authPage.style.backgroundImage = `linear-gradient(${defaultSettings.gradient_direction}deg, ${defaultSettings.gradient_color_1} 0%, ${defaultSettings.gradient_color_2} 25%, ${defaultSettings.gradient_color_3} 50%, ${defaultSettings.gradient_color_4} 75%, ${defaultSettings.gradient_color_1} 100%)`;
          authPage.style.backgroundSize = '400% 400%';
          authPage.style.animation = 'gradient-animation 15s ease infinite, background-entry-animation 1s ease-out forwards';
        }
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchLoginSettings();
  }, []);

  useEffect(() => {
    const particlesContainer = document.querySelector('.particles-container');
    if (!particlesContainer) return;

    const numberOfParticles = 50;
    for (let i = 0; i < numberOfParticles; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      const size = Math.random() * 10 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 15}s`;
      particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
      particlesContainer.appendChild(particle);
    }
  }, []);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      try {
        loginSchema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.formErrors.fieldErrors;
        }
        return {};
      }
    },
    onSubmit: async (values, { setSubmitting }) => {
      setLoginError(null);
      try {
        const response = await post('/api/users/login', {
          email: values.email,
          password: values.password,
        });

        if (response.token) {
          toast.success('Login bem-sucedido!');
          loginAction(response);
          navigate('/bi-dashboard');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Ocorreu um erro inesperado.';
        setLoginError(errorMessage);
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 500);
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="auth-page">
      <div className="particles-container"></div>
      {loginScreenSettings?.background_type === 'video' && (
        <video autoPlay loop muted className="background-video">
          <source src={loginScreenSettings.background_video_url} type="video/mp4" />
          Seu navegador não suporta vídeos em HTML5.
        </video>
      )}
      <div className="auth-wrapper">
        <div className="auth-content">
          <motion.div
            className={`auth-card ${shakeForm ? 'shake' : ''}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="card-body">
              <div className="text-center mb-4">
                <motion.img
                  src={logoSrc}
                  alt="Logo"
                  className="logo-img"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuoteIndex}
                  className="text-muted text-center mb-4 quote-carousel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {quotes[currentQuoteIndex]}
                </motion.p>
              </AnimatePresence>
              <form onSubmit={validation.handleSubmit}>
                <FormField
                  name="email"
                  label="E-mail"
                  type="email"
                  placeholder="Digite seu e-mail"
                  formik={validation}
                />
                <PasswordField
                  name="password"
                  label="Senha"
                  placeholder="Digite sua senha"
                  formik={validation}
                />
                <div className="form-group mt-4">
                  <RippleEffect>
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={validation.isSubmitting}
                    >
                      {validation.isSubmitting ? <LoadingSpinner /> : 'Entrar'}
                    </button>
                  </RippleEffect>
                </div>
              </form>
              <AnimatePresence>
                {loginError && (
                  <motion.div
                    className="alert alert-danger mt-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {loginError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
        <div className="auth-footer">
          <p className="text-muted">
            © {new Date().getFullYear()} PDV Web. Todos os direitos reservados.
          </p>
        </div>
        <div className="theme-toggle-container">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Login;
