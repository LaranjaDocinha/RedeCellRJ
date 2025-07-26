import React, { useState } from "react";
import { Row, Col, CardBody, Card, Container, Form, Input, FormFeedback, Label } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import toast from 'react-hot-toast';

import { useAuthStore } from "../../store/authStore";
import { post } from "../../helpers/api_helper"; // 1. Importar o helper da API
import logo from "../../assets/images/redecellrj.png";

const Login = () => {
  document.title = "Login | PDV Web";

  const navigate = useNavigate();
  const loginAction = useAuthStore(state => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: 'admin@pdv.com',
      password: 'admin123',
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Formato de e-mail inválido").required("Por favor, digite seu e-mail"),
      password: Yup.string().required("Por favor, digite sua senha"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await post("/users/login", {
          email: values.email,
          password: values.password,
        });

        if (response.token) {
          loginAction(response);
          toast.success("Login realizado com sucesso! Redirecionando...");
          navigate("/dashboard");
        }
      } catch (error) {
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
        <Container fluid className="p-0">
          <Row className="g-0">
            {/* Coluna da Esquerda - Branding */}
            <Col lg={8} md={7} className="d-none d-md-block">
              <div className="auth-full-bg pt-lg-5 p-4">
                <div className="w-100">
                  <div className="d-flex h-100 flex-column">
                    <div className="mb-4">
                      <Link to="/" className="d-block auth-logo">
                        <img src={logo} alt="" height="34" className="auth-logo-dark" />
                      </Link>
                    </div>
                    <div className="mt-auto">
                      <div className="mb-3">
                        <i className="bx bxs-quote-alt-left text-primary display-4"></i>
                      </div>
                      <div id="auth-carousel" className="carousel slide" data-bs-ride="carousel">
                        <div className="carousel-inner">
                          <div className="carousel-item active">
                            <h4 className="text-white">"Simplifique sua gestão, impulsione suas vendas."</h4>
                            <p className="mb-0 text-white-50">
                              O PDV Web é a solução completa para o seu negócio.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* Coluna da Direita - Formulário de Login */}
            <Col lg={4} md={5} className="d-flex align-items-center justify-content-center">
              <div className="auth-full-page-content p-4">
                <div className="w-100">
                  <Card className="overflow-hidden">

                      <div className="mt-4">
                        <Form
                          className={`form-horizontal ${shakeForm ? 'shake-animation' : ''}`}
                          onSubmit={validation.handleSubmit}
                        >
                          <div className="form-floating form-floating-custom mb-3">
                            <Input
                              name="email"
                              type="email"
                              placeholder="Digite seu e-mail"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.email}
                              invalid={!!(validation.touched.email && validation.errors.email)}
                              autoFocus
                            />
                            <Label htmlFor="email">E-mail</Label>
                            {validation.touched.email && validation.errors.email && (
                              <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                            )}
                            {validation.touched.email && !validation.errors.email && validation.values.email && (
                              <i className="bx bx-check-circle text-success validation-icon"></i>
                            )}
                          </div>

                          <div className="form-floating form-floating-custom mb-3">
                            <Input
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Digite sua senha"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.password}
                              invalid={!!(validation.touched.password && validation.errors.password)}
                            />
                            <Label htmlFor="password">Senha</Label>
                            <button
                              className="btn btn-light password-addon"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <i className={showPassword ? "mdi mdi-eye" : "mdi mdi-eye-off"}></i>
                            </button>
                            {validation.touched.password && validation.errors.password && (
                              <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                            )}
                            {validation.touched.password && !validation.errors.password && validation.values.password && (
                              <i className="bx bx-check-circle text-success validation-icon"></i>
                            )}
                          </div>

                          <div className="mt-3 d-grid">
                            <button
                              className="btn btn-primary btn-block"
                              type="submit"
                              disabled={validation.isSubmitting}
                            >
                              {validation.isSubmitting ? "Entrando..." : "Entrar"}
                            </button>
                          </div>

                          <div className="mt-4 text-center">
                            <Link to="/forgot-password">
                              <i className="mdi mdi-lock me-1" />
                              Esqueceu sua senha?
                            </Link>
                          </div>
                        </Form>
                      </div>
                    </div>

                    <div className="mt-4 mt-md-auto text-center">
                      <p className="mb-0">
                        © {new Date().getFullYear()} PDV Web. Desenvolvido com{" "}
                        <i className="mdi mdi-heart text-danger"></i> por RedeCellRJ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Login;

