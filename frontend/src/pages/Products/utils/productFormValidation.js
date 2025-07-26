export const validateProductForm = (formData) => {
  let errors = {};

  if (!formData.name) {
    errors.name = 'Nome do Produto é obrigatório.';
  }
  if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
    errors.price = 'Preço é obrigatório e deve ser um número positivo.';
  }
  if (!formData.category) {
    errors.category = 'Categoria é obrigatória.';
  }
  if (!formData.description) {
    errors.description = 'Descrição é obrigatória.';
  }
  if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
    errors.stock = 'Estoque é obrigatório e deve ser um número não negativo.';
  }

  return errors;
};
