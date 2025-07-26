import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Label, Input, Form, Alert } from 'reactstrap';
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../../config';

const RepairForm = () => {
    document.title = "Nova O.S. | Skote PDV";

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        customer_id: '',
        device_type: '',
        brand: '',
        model: '',
        imei_serial: '',
        problem_description: '',
        service_cost: 0,
        priority: 'Normal',
        tags: '',
    });
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get(`${config.api.API_URL}/customers`);
                setCustomers(response.data.customers);
                setLoadingCustomers(false);
            } catch (err) {
                setError("Erro ao carregar clientes.");
                setLoadingCustomers(false);
                console.error("Erro ao carregar clientes:", err);
            }
        };
        fetchCustomers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await axios.post(`${config.api.API_URL}/repairs`, formData);
            setSuccess("Ordem de Serviço criada com sucesso!");
            // Limpar formulário ou redirecionar
            setFormData({
                customer_id: '',
                device_type: '',
                brand: '',
                model: '',
                imei_serial: '',
                problem_description: '',
                service_cost: 0,
                priority: 'Normal',
                tags: '',
            });
            navigate('/repairs'); // Redireciona para a lista de O.S.
        } catch (err) {
            setError(err.response?.data?.message || "Erro ao criar Ordem de Serviço.");
            console.error("Erro ao criar O.S.:", err);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Ordens de Serviço" breadcrumbItem="Nova O.S." />

                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <h4 className="card-title mb-4">Criar Nova Ordem de Serviço</h4>
                                    {error && <Alert color="danger">{error}</Alert>}
                                    {success && <Alert color="success">{success}</Alert>}
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Label htmlFor="customer_id">Cliente</Label>
                                                {loadingCustomers ? (
                                                    <Input type="select" id="customer_id" name="customer_id" value="" disabled>
                                                        <option>Carregando clientes...</option>
                                                    </Input>
                                                ) : (
                                                    <Input type="select" id="customer_id" name="customer_id" value={formData.customer_id} onChange={handleChange} required>
                                                        <option value="">Selecione um cliente</option>
                                                        {customers.map(customer => (
                                                            <option key={customer.id} value={customer.id}>
                                                                {customer.name}
                                                            </option>
                                                        ))}
                                                    </Input>
                                                )}
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Label htmlFor="device_type">Tipo de Aparelho</Label>
                                                <Input type="text" id="device_type" name="device_type" value={formData.device_type} onChange={handleChange} placeholder="Ex: Celular, Notebook, Tablet" required />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Label htmlFor="brand">Marca</Label>
                                                <Input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="Ex: Samsung, Apple" />
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Label htmlFor="model">Modelo</Label>
                                                <Input type="text" id="model" name="model" value={formData.model} onChange={handleChange} placeholder="Ex: Galaxy S21, iPhone 13" />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Label htmlFor="imei_serial">IMEI/Nº de Série</Label>
                                                <Input type="text" id="imei_serial" name="imei_serial" value={formData.imei_serial} onChange={handleChange} placeholder="Opcional" />
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Label htmlFor="service_cost">Valor do Serviço para o Cliente (R$)</Label>
                                                <Input type="number" id="service_cost" name="service_cost" value={formData.service_cost} onChange={handleChange} placeholder="0.00" step="0.01" />
                                            </Col>
                                        </Row>
                                        <div className="mb-3">
                                            <Label htmlFor="problem_description">Descrição do Problema</Label>
                                            <Input type="textarea" id="problem_description" name="problem_description" value={formData.problem_description} onChange={handleChange} placeholder="Descreva o problema do aparelho..." rows="4" required />
                                        </div>
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Label htmlFor="priority">Prioridade</Label>
                                                <Input type="select" id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                                                    <option value="Baixa">Baixa</option>
                                                    <option value="Normal">Normal</option>
                                                    <option value="Alta">Alta</option>
                                                    <option value="Urgente">Urgente</option>
                                                </Input>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Label htmlFor="tags">Tags (separadas por v��rgula)</Label>
                                                <Input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="Ex: tela quebrada, bateria" />
                                            </Col>
                                        </Row>
                                        <Button color="primary" type="submit" className="mt-3">Criar O.S.</Button>
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

export default RepairForm;