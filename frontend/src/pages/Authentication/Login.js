import React, { useState } from "react";
import axios from "axios";
import { Row, Col, CardBody, Card, Alert, Container, Form, Input, FormFeedback, Label } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";

import { useAuthStore } from "../../store/authStore"; // 1. Importar o store do Zustand
import logo from "../../assets/images/redecellrj.png";

const Login = () => {
  document.title = "Login | PDV Web";

  const navigate = useNavigate();
  const loginAction = useAuthStore(state => state.login); // 2. Obter a ação de login do store
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: 'admin@pdv.com', // Valor padrão para facilitar o teste
      password: 'admin123', // Valor padrão para facilitar o teste
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Formato de e-mail inválido").required("Por favor, digite seu e-mail"),
      password: Yup.string().required("Por favor, digite sua senha"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        // A rota correta, conforme definido no backend, é /api/users/login
        const response = await axios.post("http://localhost:5000/api/users/login", {
          email: values.email,
          password: values.password,
        });

        if (response.data.token) {
          loginAction(response.data); // 3. Usar a ação do store para salvar o usuário e o token
          navigate("/dashboard");
        } else {
          setError("Resposta inesperada do servidor.");
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Ocorreu um erro inesperado ao tentar fazer login.");
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <div className="bg-primary-subtle">
                  <Row>
                    <Col className="col-12">
                      <div className="text-primary p-4">
                        <h5 className="text-primary text-center">Bem-vindo(a) de volta!</h5>
                        <p className="text-center">Faça login para continuar.</p>
                      </div>
                    </Col>
                  </Row>
                </div>
                <CardBody className="pt-0">
                  <div className="auth-logo">
                    <Link to="/" className="auth-logo-light">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img src={logo} alt="" className="rounded-circle" height="34" />
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="p-2">
                    <Form
                      className="form-horizontal"
                      onSubmit={validation.handleSubmit}
                    >
                      {error && <Alert color="danger">{error}</Alert>}

                      <div className="mb-3">
                        <Label className="form-label">E-mail</Label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="Digite seu e-mail"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.email}
                          invalid={!!(validation.touched.email && validation.errors.email)}
                        />
                        {validation.touched.email && validation.errors.email && (
                          <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                        )}
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">Senha</Label>
                        <div className="input-group auth-pass-inputgroup">
                          <Input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            value={validation.values.password}
                            invalid={!!(validation.touched.password && validation.errors.password)}
                          />
                          <button
                            className="btn btn-light"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i className={showPassword ? "mdi mdi-eye" : "mdi mdi-eye-off"}></i>
                          </button>
                          {validation.touched.password && validation.errors.password && (
                            <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                          )}
                        </div>
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
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <p>© {new Date().getFullYear()} PDV Web</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Login;

