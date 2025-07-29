export const validateRepairForm = (formData) => {
  const errors = {};

  if (!formData.customer_id || isNaN(formData.customer_id) || parseInt(formData.customer_id) <= 0) {
    errors.customer_id = 'ID do Cliente é obrigatório e deve ser um número positivo.';
  }
  if (!formData.device_type) {
    errors.device_type = 'Tipo de Dispositivo é obrigatório.';
  }
  if (!formData.problem_description) {
    errors.problem_description = 'Descrição do Problema é obrigatória.';
  }
  if (isNaN(formData.service_cost) || parseFloat(formData.service_cost) < 0) {
    errors.service_cost = 'Custo do Serviço é obrigatório e deve ser um número não negativo.';
  }
  if (isNaN(formData.parts_cost) || parseFloat(formData.parts_cost) < 0) {
    errors.parts_cost = 'Custo das Peças é obrigatório e deve ser um número não negativo.';
  }
  if (!formData.status) {
    errors.status = 'Status é obrigatório.';
  }
  return errors;
};
