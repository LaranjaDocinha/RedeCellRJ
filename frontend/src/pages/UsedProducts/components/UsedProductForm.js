import React, { useState } from 'react';

const UsedProductForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    category_id: '',
    serial_number: '',
    condition: '',
    acquisition_price: '',
    sale_price: '',
    current_stock: '',
    branch_id: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    // Here, you would typically send this data to your backend API
    onClose(); // Close the form after submission (for now)
  };

  return (
    <div className="used-product-form">
      <h2>Registrar Seminovos</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="product_name">Nome do Produto:</label>
          <input
            type="text"
            id="product_name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Descrição:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>
        <div>
          <label htmlFor="category_id">ID da Categoria:</label>
          <input
            type="number"
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="serial_number">Número de Série:</label>
          <input
            type="text"
            id="serial_number"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="condition">Condição:</label>
          <input
            type="text"
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="acquisition_price">Preço de Aquisição:</label>
          <input
            type="number"
            id="acquisition_price"
            name="acquisition_price"
            value={formData.acquisition_price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="sale_price">Preço de Venda:</label>
          <input
            type="number"
            id="sale_price"
            name="sale_price"
            value={formData.sale_price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="current_stock">Estoque Atual:</label>
          <input
            type="number"
            id="current_stock"
            name="current_stock"
            value={formData.current_stock}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="branch_id">ID da Filial:</label>
          <input
            type="number"
            id="branch_id"
            name="branch_id"
            value={formData.branch_id}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Salvar</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
};

export default UsedProductForm;