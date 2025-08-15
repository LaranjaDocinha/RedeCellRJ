import React, { useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Alert, Spinner, Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';

import './NpsSurvey.scss';

const NpsSurveyPage = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { request: submitNps, isLoading, error } = useApi('post');

  const onSubmit = async (data) => {
    try {
      await submitNps('/api/nps-surveys', data);
      setIsSubmitted(true);
      toast.success('Obrigado por sua avaliação!');
    } catch (err) {
      toast.error(err.message || 'Erro ao enviar sua avaliação.');
    }
  };

  const renderScoreButtons = () => {
    const buttons = [];
    for (let i = 0; i <= 10; i++) {
      buttons.push(
        <motion.button
          key={i}
          type="button"
          className={`nps-score-button ${errors.score && 'is-invalid'}`}
          onClick={() => setValue('score', i, { shouldValidate: true })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {i}
        </motion.button>
      );
    }
    return buttons;
  };

  if (isSubmitted) {
    return (
      <motion.div
        className="nps-survey-container submitted"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="nps-survey-card text-center">
          <CardBody>
            <CardTitle tag="h2" className="mb-4">Obrigado por sua avaliação!</CardTitle>
            <p>Sua opinião é muito importante para nós.</p>
            <Button color="primary" onClick={() => navigate('/')}>Voltar para o Início</Button>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="nps-survey-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="nps-survey-card">
        <CardBody>
          <CardTitle tag="h2" className="mb-4 text-center">Qual a probabilidade de você nos recomendar a um amigo ou colega?</CardTitle>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup className="nps-score-buttons-group mb-4">
              <Label className="form-label">De 0 (Nada provável) a 10 (Muito provável)</Label>
              <div className="d-flex justify-content-between flex-wrap">
                {renderScoreButtons()}
              </div>
              {errors.score && <Alert color="danger" className="mt-2">{errors.score.message}</Alert>}
            </FormGroup>

            <FormGroup className="mb-4">
              <Label for="feedback">Você gostaria de adicionar algum comentário? (Opcional)</Label>
              <Input
                type="textarea"
                id="feedback"
                rows="4"
                {...register('feedback')}
              />
            </FormGroup>

            {error && <Alert color="danger" className="mt-3">{error.message}</Alert>}

            <Button type="submit" color="primary" className="w-100" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Enviar Avaliação'}
            </Button>
          </Form>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default NpsSurveyPage;
