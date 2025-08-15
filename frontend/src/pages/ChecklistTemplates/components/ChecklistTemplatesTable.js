import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Button,
  Spinner,
  Alert,
  Pagination,
  PaginationItem,
  PaginationLink,
  Badge
} from 'reactstrap';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';

const ChecklistTemplatesTable = ({ templates, isLoading, error, onEdit, onDeleteSuccess, pagination, onPageChange }) => {
  const { request: deleteTemplate } = useApi('delete');

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo de checklist? Todos os itens associados serão removidos.')) {
      try {
        await deleteTemplate(`/api/checklists/templates/${id}`);
        toast.success('Modelo de checklist excluído com sucesso!');
        onDeleteSuccess();
      } catch (err) {
        toast.error(err.message || 'Falha ao excluir o modelo de checklist.');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center p-5"><Spinner color="primary">Carregando...</Spinner></div>;
  }

  if (error) {
    return <Alert color="danger">Erro ao carregar modelos de checklist: {error.message}</Alert>;
  }

  if (!templates || templates.length === 0) {
    return <Alert color="info">Nenhum modelo de checklist encontrado.</Alert>;
  }

  return (
    <>
      <div className="table-responsive">
        <Table className="table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Itens</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.id}>
                <td>{template.name}</td>
                <td>{template.description || 'N/A'}</td>
                <td><Badge color="secondary" pill>{template.category || 'Geral'}</Badge></td>
                <td>{template.items?.length || 0}</td>
                <td className="text-end">
                  <Button color="primary" size="sm" className="me-2" onClick={() => onEdit(template)}>
                    <i className="bx bx-pencil"></i>
                  </Button>
                  <Button color="danger" size="sm" onClick={() => handleDelete(template.id)}>
                    <i className="bx bx-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination && pagination.pages > 1 && (
        <Pagination className="justify-content-end mt-3">
          {[...Array(pagination.pages).keys()].map(page => (
            <PaginationItem key={page + 1} active={page + 1 === pagination.page}>
              <PaginationLink onClick={() => onPageChange(page + 1)}>
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
        </Pagination>
      )}
    </>
  );
};

ChecklistTemplatesTable.propTypes = {
  templates: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func.isRequired,
};

export default ChecklistTemplatesTable;
