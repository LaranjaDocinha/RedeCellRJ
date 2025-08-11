import React, { useState, useEffect } from 'react';
import CashFlowProjectionForm from './components/CashFlowProjectionForm';
import useApi from '../../hooks/useApi';
import { get, post, put, del } from '../../helpers/api_helper';
import toast from 'react-hot-toast';

const CashFlowProjectionsPage = () => {
  const [projections, setProjections] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProjection, setSelectedProjection] = useState(null);

  const { request: fetchProjectionsApi, loading: isLoading } = useApi(get);
  const { request: saveProjectionApi, loading: isSaving } = useApi(post);
  const { request: updateProjectionApi, loading: isUpdating } = useApi(put);
  const { request: deleteProjectionApi, loading: isDeleting } = useApi(del);

  useEffect(() => {
    fetchProjections();
  }, []);

  const fetchProjections = async () => {
    try {
      const response = await fetchProjectionsApi('/api/cash-flow/projections');
      setProjections(response.projections || []);
    } catch (error) {
      toast.error('Erro ao carregar projeções.');
      console.error('Erro ao carregar projeções:', error);
    }
  };

  const handleOpenForm = (projection = null) => {
    setSelectedProjection(projection);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProjection(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedProjection) {
        await updateProjectionApi(`/api/cash-flow/projections/${selectedProjection.id}`, formData);
        toast.success('Projeção atualizada com sucesso!');
      } else {
        await saveProjectionApi('/api/cash-flow/projections', formData);
        toast.success('Projeção criada com sucesso!');
      }
      fetchProjections();
    } catch (error) {
      toast.error('Erro ao salvar projeção.');
      console.error('Erro ao salvar projeção:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta projeção?')) {
      try {
        await deleteProjectionApi(`/api/cash-flow/projections/${id}`);
        toast.success('Projeção excluída com sucesso!');
        fetchProjections();
      } catch (error) {
        toast.error('Erro ao excluir projeção.');
        console.error('Erro ao excluir projeção:', error);
      }
    }
  };

  return (
    <div>
      <h1>Gestão de Projeções de Fluxo de Caixa</h1>
      <p>Aqui você poderá gerenciar suas projeções de fluxo de caixa.</p>

      <button onClick={() => handleOpenForm()}>Criar Nova Projeção</button>

      {isFormOpen && (
        <CashFlowProjectionForm
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          initialData={selectedProjection}
        />
      )}

      <h2>Projeções Existentes</h2>
      {isLoading ? (
        <p>Carregando projeções...</p>
      ) : projections.length === 0 ? (
        <p>Nenhuma projeção encontrada.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Entrada Projetada</th>
              <th>Saída Projetada</th>
              <th>Observações</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((proj) => (
              <tr key={proj.id}>
                <td>{proj.projection_date}</td>
                <td>{proj.projected_inflow}</td>
                <td>{proj.projected_outflow}</td>
                <td>{proj.notes}</td>
                <td>
                  <button onClick={() => handleOpenForm(proj)}>Editar</button>
                  <button onClick={() => handleDelete(proj.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CashFlowProjectionsPage;