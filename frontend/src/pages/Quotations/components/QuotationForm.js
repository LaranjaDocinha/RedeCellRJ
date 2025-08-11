import React, { useState } from 'react';
import SignatureCapture from '../../../components/Common/SignatureCapture'; // Import SignatureCapture

const QuotationForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    valid_until_date: '',
    notes: '',
    items: [], // Array to hold quotation items
    signature: null, // New state for signature data URL
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [name]: value,
    };
    setFormData((prevData) => ({
      ...prevData,
      items: newItems,
    }));
  };

  const handleAddItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      items: [...prevData.items, { description: '', quantity: '', unit_price: '' }],
    }));
  };

  const handleSignatureSave = (signatureDataUrl) => {
    setFormData((prevData) => ({
      ...prevData,
      signature: signatureDataUrl,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Quotation Data Submitted:', formData);
    // Here, you would typically send this data to your backend API
    onClose(); // Close the form after submission (for now)
  };

  return (
    <div className="quotation-form">
      <h2>Criar Orçamento</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="customer_id">ID do Cliente:</label>
          <input
            type="number"
            id="customer_id"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="valid_until_date">Válido Até:</label>
          <input
            type="date"
            id="valid_until_date"
            name="valid_until_date"
            value={formData.valid_until_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="notes">Observações:</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        <h3>Itens do Orçamento</h3>
        {formData.items.map((item, index) => (
          <div key={index} className="quotation-item">
            <input
              type="text"
              name="description"
              placeholder="Descrição do Item"
              value={item.description}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantidade"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <input
              type="number"
              name="unit_price"
              placeholder="Preço Unitário"
              value={item.unit_price}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={handleAddItem}>Adicionar Item</button>

        <div className="signature-section mt-4">
          <h3>Assinatura do Cliente</h3>
          <SignatureCapture onSave={handleSignatureSave} initialSignature={formData.signature} />
        </div>

        <button type="submit">Salvar Orçamento</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
};

export default QuotationForm;