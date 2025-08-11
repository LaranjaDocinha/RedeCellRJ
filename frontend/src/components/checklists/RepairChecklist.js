import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, FormGroup, Label, Input, Card, CardBody, CardHeader, Spinner } from 'reactstrap';

const RepairChecklist = ({ checklist, onSave }) => {
  if (!checklist) return null;

  const initialValues = {
    answers: checklist.items.map(item => ({
      template_item_id: item.id,
      answer_boolean: item.answer?.answer_boolean || false,
      answer_text: item.answer?.answer_text || '',
    }))
  };

  const handleSubmit = (values, { setSubmitting }) => {
    onSave(checklist.id, values.answers);
    setSubmitting(false);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <h6 className="mb-0">{checklist.type === 'pre-repair' ? 'Checklist de Entrada' : 'Checklist de Saída'}</h6>
        <small className="text-muted">Status: {checklist.status}</small>
      </CardHeader>
      <CardBody>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form>
              {checklist.items.map((item, index) => (
                <FormGroup key={item.id} className="p-2 border-bottom">
                  <Label>{item.item_text}</Label>
                  {item.response_type === 'boolean' ? (
                    <div className="d-flex gap-3">
                        <FormGroup check>
                            <Field as={Input} type="radio" name={`answers[${index}].answer_boolean`} value="true" />
                            <Label check> Sim </Label>
                        </FormGroup>
                        <FormGroup check>
                            <Field as={Input} type="radio" name={`answers[${index}].answer_boolean`} value="false" />
                            <Label check> Não </Label>
                        </FormGroup>
                    </div>
                  ) : (
                    <Field
                      as={Input}
                      type="textarea"
                      name={`answers[${index}].answer_text`}
                      placeholder="Descreva..."
                    />
                  )}
                </FormGroup>
              ))}
              <Button color="primary" type="submit" disabled={isSubmitting} className="mt-3">
                {isSubmitting ? <Spinner size="sm" /> : 'Salvar Respostas'}
              </Button>
            </Form>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
};

export default RepairChecklist;
