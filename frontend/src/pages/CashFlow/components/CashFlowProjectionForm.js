import React, { useState } from 'react';

const CashFlowProjectionForm = ({ onClose, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    projection_date: initialData.projection_date || '',
    projected_inflow: initialData.projected_inflow || '',
    projected_outflow: initialData.projected_outflow || '',
    notes: initialData.notes || '',
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
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="cash-flow-projection-form">
      <h2>{initialData.id ? 'Editar Projeção' : 'Criar Nova Projeção'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="projection_date">Data da Projeção:</label>
          <input
            type="date"
            id="projection_date"
            name="projection_date"
            value={formData.projection_date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="projected_inflow">Entrada Projetada:</label>
          <input
            type="number"
            id="projected_inflow"
            name="projected_inflow"
            value={formData.projected_inflow}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="projected_outflow">Saída Projetada:</label>
          <input
            type="number"
            id="projected_outflow"
            name="projected_outflow"
            value={formData.projected_outflow}
            onChange={handleChange}
            required
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
        <button type="submit">Salvar</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
};

export default CashFlowProjectionForm;