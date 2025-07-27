import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Form,
  Label,
  Input,
  Button,
  FormFeedback,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

// Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { useAuthStore } from "../../store/authStore"; // Importar o store de autenticação

import "./UserProfile.scss";

const UserProfile = () => {
  document.title = "Perfil do Usuário | PDV Web";

  const { user, updateUserProfile } = useAuthStore(); // Obter usuário e função de atualização do store
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || "/redecellrj.png");

  // Mock de dados do usuário para demonstração
  const mockUser = {
    name: user?.name || "Nome do Usuário",
    email: user?.email || "usuario@example.com",
    phone: user?.phone || "(XX) XXXXX-XXXX",
    address: user?.address || "Rua Exemplo, 123",
    city: user?.city || "Cidade Exemplo",
    state: user?.state || "Estado Exemplo",
    zip: user?.zip || "XXXXX-XXX",
    bio: user?.bio || "Olá! Sou um usuário do PDV Web.",
    profileImage: user?.profileImage || "/redecellrj.png",
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: mockUser.name,
      email: mockUser.email,
      phone: mockUser.phone,
      address: mockUser.address,
      city: mockUser.city,
      state: mockUser.state,
      zip: mockUser.zip,
      bio: mockUser.bio,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("O nome é obrigatório"),
      email: Yup.string().email("E-mail inválido").required("O e-mail é obrigatório"),
      phone: Yup.string().matches(/^\(\d{2}\) \d{5}-\d{4}$/, "Formato de telefone inválido (Ex: (XX) XXXXX-XXXX)").nullable(),
      address: Yup.string().nullable(),
      city: Yup.string().nullable(),
      state: Yup.string().nullable(),
      zip: Yup.string().matches(/^\d{5}-\d{3}$/, "Formato de CEP inválido (Ex: XXXXX-XXX)").nullable(),
      bio: Yup.string().max(200, "A biografia deve ter no máximo 200 caracteres").nullable(),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Simular uma chamada de API
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const updatedUserData = { ...user, ...values, profileImage };
        updateUserProfile(updatedUserData); // Atualiza o store com os novos dados
        toast.success("Perfil atualizado com sucesso!");
      } catch (error) {
        toast.error("Erro ao atualizar o perfil.");
        console.error("Erro ao atualizar perfil:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Usuários" breadcrumbItem="Perfil do Usuário" />

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <div className="d-flex flex-column align-items-center text-center mb-4">
                    <div className="profile-image-upload-container">
                      <img
                        src={profileImage}
                        alt="Foto de Perfil"
                        className="rounded-circle avatar-lg profile-image-preview"
                      />
                      <Label htmlFor="profile-image-upload" className="profile-image-upload-icon">
                        <i className="bx bx-camera"></i>
                      </Label>
                      <Input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="d-none"
                      />
                    </div>
                    <h4 className="mt-3">{mockUser.name}</h4>
                    <p className="text-muted">{mockUser.email}</p>
                  </div>

                  <Form onSubmit={validation.handleSubmit}>
                    <Row>
                      <Col md="6" className="mb-3">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Digite seu nome"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.name || ""}
                          invalid={!!(validation.touched.name && validation.errors.name)}
                        />
                        {validation.touched.name && validation.errors.name && (
                          <FormFeedback>{validation.errors.name}</FormFeedback>
                        )}
                      </Col>
                      <Col md="6" className="mb-3">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Digite seu e-mail"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.email || ""}
                          invalid={!!(validation.touched.email && validation.errors.email)}
                          disabled // E-mail geralmente não é editável diretamente
                        />
                        {validation.touched.email && validation.errors.email && (
                          <FormFeedback>{validation.errors.email}</FormFeedback>
                        )}
                      </Col>
                    </Row>

                    <Row>
                      <Col md="6" className="mb-3">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="text"
                          placeholder="(XX) XXXXX-XXXX"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.phone || ""}
                          invalid={!!(validation.touched.phone && validation.errors.phone)}
                        />
                        {validation.touched.phone && validation.errors.phone && (
                          <FormFeedback>{validation.errors.phone}</FormFeedback>
                        )}
                      </Col>
                      <Col md="6" className="mb-3">
                        <Label htmlFor="address">Endereço</Label>
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          placeholder="Digite seu endereço"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.address || ""}
                          invalid={!!(validation.touched.address && validation.errors.address)}
                        />
                        {validation.touched.address && validation.errors.address && (
                          <FormFeedback>{validation.errors.address}</FormFeedback>
                        )}
                      </Col>
                    </Row>

                    <Row>
                      <Col md="4" className="mb-3">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          placeholder="Digite sua cidade"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.city || ""}
                          invalid={!!(validation.touched.city && validation.errors.city)}
                        />
                        {validation.touched.city && validation.errors.city && (
                          <FormFeedback>{validation.errors.city}</FormFeedback>
                        )}
                      </Col>
                      <Col md="4" className="mb-3">
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          name="state"
                          type="text"
                          placeholder="Digite seu estado"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.state || ""}
                          invalid={!!(validation.touched.state && validation.errors.state)}
                        />
                        {validation.touched.state && validation.errors.state && (
                          <FormFeedback>{validation.errors.state}</FormFeedback>
                        )}
                      </Col>
                      <Col md="4" className="mb-3">
                        <Label htmlFor="zip">CEP</Label>
                        <Input
                          id="zip"
                          name="zip"
                          type="text"
                          placeholder="XXXXX-XXX"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.zip || ""}
                          invalid={!!(validation.touched.zip && validation.errors.zip)}
                        />
                        {validation.touched.zip && validation.errors.zip && (
                          <FormFeedback>{validation.errors.zip}</FormFeedback>
                        )}
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <Label htmlFor="bio">Biografia</Label>
                      <Input
                        id="bio"
                        name="bio"
                        type="textarea"
                        rows="3"
                        placeholder="Fale um pouco sobre você..."
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.bio || ""}
                        invalid={!!(validation.touched.bio && validation.errors.bio)}
                      />
                      {validation.touched.bio && validation.errors.bio && (
                        <FormFeedback>{validation.errors.bio}</FormFeedback>
                      )}
                    </div>

                    <div className="text-end">
                      <Button color="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="d-flex align-items-center justify-content-center"
                          >
                            <LoadingSpinner size={20} color="#fff" />
                            <span className="ms-2">Salvando...</span>
                          </motion.div>
                        ) : (
                          "Salvar Alterações"
                        )}
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UserProfile;
