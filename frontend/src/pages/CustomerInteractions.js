import { z } from 'zod';

const interactionSchema = z.object({
  customer_id: z.number({ required_error: 'O cliente é obrigatório.' }),
  interaction_type: z.string({ required_error: 'O tipo de interação é obrigatório.' }).min(1, 'O tipo de interação é obrigatório.'),
  interaction_date: z.string({ required_error: 'A data da interação é obrigatória.' }), // Keeping as string for now, as it's an input type="date"
  notes: z.string({ required_error: 'As notas da interação são obrigatórias.' }).min(1, 'As notas da interação são obrigatórias.'),
});

const CustomerInteractions = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [interactions, setInteractions] = useState([]);

  const { data: customersData, isLoading: loadingCustomers, error: customersError } = useApi('/api/customers');
  const { request: createInteraction, isLoading: creatingInteraction } = useApi('post');
  const { request: fetchInteractionsRequest, data: interactionsData, isLoading: loadingInteractions, error: interactionsError } = useApi('get'); // New useApi call

  const customerOptions = customersData?.customers?.map(c => ({ value: c.id, label: c.name })) || [];

  const interactionTypeOptions = [
    { value: 'Chamada', label: 'Chamada' },
    { value: 'Email', label: 'Email' },
    { value: 'Visita', label: 'Visita' },
    { value: 'Nota', label: 'Nota' },
    { value: 'Outro', label: 'Outro' },
  ];

  const fetchInteractions = useCallback(async () => {
    if (!selectedCustomer) {
      setInteractions([]);
      return;
    }
    try {
      const response = await fetchInteractionsRequest('/api/customer-interactions', { params: { customer_id: selectedCustomer.value } }); // Use the request function
      setInteractions(response?.interactions || []);
    } catch (err) {
      toast.error('Erro ao carregar interações.');
    }
  }, [selectedCustomer, fetchInteractionsRequest]); // Add fetchInteractionsRequest to dependencies

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const handleCreateInteraction = async (values, { setSubmitting, resetForm }) => {
    try {
      await createInteraction('/api/customer-interactions', values);
      toast.success('Interação criada com sucesso!');
      resetForm();
      fetchInteractions();
    } catch (error) {
      toast.error(error.message || 'Falha ao criar interação.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  const validate = (values) => {
    try {
      interactionSchema.parse(values);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.formErrors.fieldErrors;
      }
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title="CRM" breadcrumbItem="Interações com Clientes" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle className="h4 mb-4">Selecionar Cliente</CardTitle>
                <FormGroup>
                  <Label for="customerSelect">Cliente</Label>
                  <Select
                    name="customerSelect"
                    id="customerSelect"
                    options={customerOptions}
                    isClearable
                    placeholder="Selecione um cliente para ver/adicionar interações..."
                    onChange={(option) => setSelectedCustomer(option)}
                    isLoading={loadingCustomers}
                  />
                  {customersError && <Alert color="danger" className="mt-2">Erro ao carregar clientes.</Alert>}
                </FormGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {selectedCustomer && (
          <Row className="mt-4">
            <Col lg={12}>
              <Card>
                <CardHeader className="bg-transparent border-bottom">
                  <CardTitle className="h4">Interações com {selectedCustomer.label}</CardTitle>
                </CardHeader>
                <CardBody>
                  {loadingInteractions ? (
                    <div className="text-center"><Spinner /> Carregando interações...</div>
                  ) : interactionsError ? (
                    <Alert color="danger">Erro ao carregar interações: {interactionsError.message}</Alert>
                  ) : interactions.length === 0 ? (
                    <Alert color="info">Nenhuma interação encontrada para este cliente.</Alert>
                  ) : (
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      <Table className="table-hover table-sm">
                        <thead>
                          <tr>
                            <th>Tipo</th>
                            <th>Data</th>
                            <th>Notas</th>
                            <th>Registrado Por</th>
                          </tr>
                        </thead>
                        <tbody>
                          {interactions.map(interaction => (
                            <tr key={interaction.id}>
                              <td><Badge color="primary" pill>{interaction.interaction_type}</Badge></td>
                              <td>{formatDate(interaction.interaction_date)}</td>
                              <td>{interaction.notes}</td>
                              <td>{interaction.user_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}

                  <h5 className="mt-4">Registrar Nova Interação</h5>
                  <Formik
                    initialValues={{
                      customer_id: selectedCustomer.value,
                      interaction_type: '',
                      interaction_date: new Date().toISOString().split('T')[0],
                      notes: '',
                    }}
                    validate={validate}
                    onSubmit={handleCreateInteraction}
                    enableReinitialize
                  >
                    {({ isSubmitting, errors, setFieldValue, values }) => (
                      <Form>
                        <Row>
                          <Col md={4}>
                            <FormGroup>
                              <Label for="interaction_type">Tipo de Interação</Label>
                              <Select
                                name="interaction_type"
                                id="interaction_type"
                                options={interactionTypeOptions}
                                isClearable={false}
                                onChange={(option) => setFieldValue('interaction_type', option.value)}
                                value={interactionTypeOptions.find(option => option.value === values.interaction_type)}
                              />
                              <ErrorMessage name="interaction_type" component="div" className="text-danger" />
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
                              <Label for="interaction_date">Data da Interação</Label>
                              <Field as={Input} type="date" name="interaction_date" id="interaction_date" />
                              <ErrorMessage name="interaction_date" component="div" className="text-danger" />
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
                              <Label for="notes">Notas</Label>
                              <Field as={Input} type="textarea" name="notes" id="notes" rows="3" />
                              <ErrorMessage name="notes" component="div" className="text-danger" />
                            </FormGroup>
                          </Col>
                        </Row>
                        {errors.submit && <Alert color="danger">{errors.submit}</Alert>}
                        <Button type="submit" color="primary" disabled={isSubmitting || !selectedCustomer}>
                          {isSubmitting ? <Spinner size="sm" /> : 'Registrar Interação'}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default CustomerInteractions;
