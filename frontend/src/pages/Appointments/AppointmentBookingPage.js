import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed

import 'flatpickr/dist/themes/material_blue.css'; // Example theme
import './AppointmentBookingPage.scss'; // Page-specific styling

// Validation Schema
const appointmentSchema = z.object({
  customer_id: z.string({ required_error: 'O cliente é obrigatório.' }).min(1, 'O cliente é obrigatório.'),
  service_type: z.string({ required_error: 'O tipo de serviço é obrigatório.' }).min(1, 'O tipo de serviço é obrigatório.'),
  appointment_date: z.date({ required_error: 'A data é obrigatória.' }).nullable(),
  appointment_time: z.string({ required_error: 'A hora é obrigatória.' }).min(1, 'A hora é obrigatória.'),
  notes: z.string().nullable(),
});

const AppointmentBookingPage = () => {
  const { handleSubmit, control, register, reset, formState: { errors } } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customer_id: '',
      service_type: '',
      appointment_date: null,
      appointment_time: '',
      notes: '',
    },
  });

  const { request: bookAppointment, isLoading, error } = useApi('post');
  const { data: customersData, isLoading: loadingCustomers, error: customersError } = useApi('get');

  const customerOptions = customersData?.customers?.map(c => ({ value: c.id, label: c.name })) || [];
  const serviceTypeOptions = [
    { value: 'Reparo de Celular', label: 'Reparo de Celular' },
    { value: 'Manutenção de Notebook', label: 'Manutenção de Notebook' },
    { value: 'Troca de Bateria', label: 'Troca de Bateria' },
    { value: 'Orçamento', label: 'Orçamento' },
    { value: 'Outro', label: 'Outro' },
  ];

  const onSubmit = async (data) => {
    try {
      await bookAppointment('/api/appointments', data);
      toast.success('Agendamento realizado com sucesso!');
      reset(); // Reset form after successful submission
    } catch (err) {
      toast.error(err.message || 'Erro ao agendar compromisso.');
    }
  };

  return (
    <motion.div
      className="appointment-booking-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Agendamento de Compromissos</h1>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle tag="h5" className="mb-4">Novo Agendamento</CardTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="customer_id">Cliente</Label>
                        <Controller
                          name="customer_id"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={customerOptions}
                              isLoading={loadingCustomers}
                              isClearable
                              placeholder="Selecione um cliente..."
                              onChange={(val) => field.onChange(val ? val.value : '')}
                              value={customerOptions.find(option => option.value === field.value)}
                            />
                          )}
                        />
                        {errors.customer_id && <Alert color="danger" className="mt-2">{errors.customer_id.message}</Alert>}
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="service_type">Tipo de Serviço</Label>
                        <Controller
                          name="service_type"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={serviceTypeOptions}
                              isClearable={false}
                              placeholder="Selecione o tipo de serviço..."
                              onChange={(val) => field.onChange(val.value)}
                              value={serviceTypeOptions.find(option => option.value === field.value)}
                            />
                          )}
                        />
                        {errors.service_type && <Alert color="danger" className="mt-2">{errors.service_type.message}</Alert>}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="appointment_date">Data do Agendamento</Label>
                        <Controller
                          name="appointment_date"
                          control={control}
                          render={({ field }) => (
                            <Flatpickr
                              className="form-control d-block"
                              options={{ dateFormat: 'Y-m-d' }}
                              value={field.value}
                              onChange={([date]) => field.onChange(date)}
                            />
                          )}
                        />
                        {errors.appointment_date && <Alert color="danger" className="mt-2">{errors.appointment_date.message}</Alert>}
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="appointment_time">Hora do Agendamento</Label>
                        <Controller
                          name="appointment_time"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="time"
                              id="appointment_time"
                              {...field}
                            />
                          )}
                        />
                        {errors.appointment_time && <Alert color="danger" className="mt-2">{errors.appointment_time.message}</Alert>}
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <Label for="notes">Observações (Opcional)</Label>
                    <Input
                      type="textarea"
                      id="notes"
                      rows="3"
                      {...register('notes')}
                    />
                  </FormGroup>

                  {error && <Alert color="danger" className="mt-3">{error.message}</Alert>}

                  <Button type="submit" color="primary" className="w-100" disabled={isLoading}>
                    {isLoading ? <Spinner size="sm" /> : 'Agendar Compromisso'}
                  </Button>
                </form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default AppointmentBookingPage;
