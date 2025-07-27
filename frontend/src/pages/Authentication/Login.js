import React, { useState, useEffect } from "react";
import { Row, Col, CardBody, Card, Container, Form, Input, FormFeedback, Label } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import toast from 'react-hot-toast';
import { motion } from 'framer-motion'; // Importar motion

import { useAuthStore } from "../../store/authStore";
import { post } from "../../helpers/api_helper"; // 1. Importar o helper da API
import { useThemeStore } from "../../store/themeStore"; // Importar o themeStore
import FormField from "../../components/Common/FormField"; // Import FormField
import PasswordField from "../../components/Common/PasswordField"; // Import PasswordField
import LoadingSpinner from "../../components/Common/LoadingSpinner"; // Import LoadingSpinner
import RippleEffect from "../../components/Common/RippleEffect"; // Import RippleEffect
import ThemeToggle from "../../components/Layout/ThemeToggle"; // Import ThemeToggle
const quotes = [
  "Simplifique sua gestão, impulsione suas vendas.",
  "Controle total na palma da sua mão.",
  "Seu negócio, suas regras, nosso sistema.",
  "Inovação e eficiência para o seu dia a dia."
];

const Login = () => {
  document.title = "Login | PDV Web";

  const navigate = useNavigate();
  const loginAction = useAuthStore(state => state.login);
  const [shakeForm, setShakeForm] = useState(false);
  const [loginError, setLoginError] = useState(null); // Novo estado para erro de login
  const getCurrentLogo = useThemeStore((state) => state.getCurrentLogo);
  const currentLogo = getCurrentLogo();


  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0); // Estado para o carrossel de citações
  const [gradientColors, setGradientColors] = useState([]); // Novo estado para as cores do gradiente

  // Função para gerar uma cor RGB aleatória
  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000); // Muda a citação a cada 5 segundos

    // Gerar 4 cores aleatórias para o gradiente
    const newColors = Array.from({ length: 4 }, generateRandomColor);
    setGradientColors(newColors);

    // Aplicar as cores como variáveis CSS
    const authPage = document.querySelector('.auth-page');
    if (authPage) {
      newColors.forEach((color, index) => {
        authPage.style.setProperty(`--gradient-color-${index + 1}`, color);
      });
    }

    return () => clearInterval(interval);
  }, []);

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
      email: Yup.string().email("Formato de e-mail inválido").required("Por favor, digite seu e-mail"),
      password: Yup.string().required("Por favor, digite sua senha"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setLoginError(null); // Limpa erros anteriores
      try {
        const response = await post("/api/users/login", {
          email: values.email,
          password: values.password,
        });

        if (response.token) {
          loginAction(response);
          navigate("/dashboard");
        }
      } catch (error) {
        // Captura a mensagem de erro do backend
        const errorMessage = error.response?.data?.message || "Ocorreu um erro inesperado.";
        setLoginError(errorMessage);
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 500); // Remover a classe após a animação
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <React.Fragment>
      <div className="auth-page">
        <div className="particles-container"></div>
        <div className="parallax-layer parallax-layer-back"></div>
        <div className="parallax-layer parallax-layer-middle"></div>
        <div className="parallax-layer parallax-layer-front"></div>
        <Container fluid className="p-0">
          <Row className="g-0 justify-content-center align-items-center">
            <Col lg={4} md={6} sm={8} xs={10} className="flex-grow-0 flex-shrink-0">
              <div className="overflow-hidden shadow-lg auth-card">
                <div className="auth-card-body shadow-md">
                  <div className="auth-form-content">
                    <div className="text-center mb-4">
                      <Link to="/" className="d-block auth-logo">
                        <motion.img 
                          initial={{ opacity: 0, scale: 0.8 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                          src={currentLogo} alt="" height="40" className="auth-logo-dark" 
                        />
                      </Link>
                    </div>
                    
                    

                    <Form
                      className={`form-horizontal ${shakeForm ? 'shake-animation' : ''}`}
                      onSubmit={validation.handleSubmit}
                    >
                      {loginError && <div className="text-danger text-center mb-3" aria-live="assertive">{loginError}</div>}

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

                      <div className="mt-4 d-flex justify-content-center">
                        <RippleEffect>
                          <button
                            className="btn btn-primary btn-liquid-effect btn-pulse-effect btn-login-custom-width"
                            type="submit"
                            disabled={validation.isSubmitting}
                          >
                            {validation.isSubmitting ? (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="d-flex align-items-center justify-content-center"
                              >
                                <LoadingSpinner size={20} color="#fff" />
                                <span className="ms-2">Entrando...</span>
                              </motion.div>
                            ) : (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                Entrar
                              </motion.span>
                            )}
                          </button>
                        </RippleEffect>
                      </div>

                      <div className="mt-4 text-center">
                        <Link to="/forgot-password" className="text-primary text-decoration-underline-hover animated-link">
                          <i className="mdi mdi-lock me-1 animated-icon" />
                          Esqueceu sua senha?
                        </Link>
                      </div>
                      <div className="d-flex justify-content-center mt-3">
                        <ThemeToggle />
                      </div>
                    </Form>
                  </div>
                </div>
              </div>

              <div className="mt-4 mt-md-auto text-center">
                <p className="mb-0">
                  
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Login;
                    
                    

