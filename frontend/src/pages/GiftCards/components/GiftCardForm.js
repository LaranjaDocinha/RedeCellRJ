import React, { useState } from 'react';

const GiftCardForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    initial_value: '',
    expiry_date: '',
    customer_id: '',
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
    console.log('Gift Card Data Submitted:', formData);
    // Here, you would typically send this data to your backend API
    onClose(); // Close the form after submission (for now)
  };

  return (
    <div className="gift-card-form">
      <h2>Emitir Vale-Presente</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="initial_value">Valor Inicial:</label>
          <input
            type="number"
            id="initial_value"
            name="initial_value"
            value={formData.initial_value}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="expiry_date">Data de Expiração:</label>
          <input
            type="date"
            id="expiry_date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="customer_id">ID do Cliente (Opcional):</label>
          <input
            type="number"
            id="customer_id"
            name="customer_id"
            value={formData.customer.id}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Emitir</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
};

export default GiftCardForm;