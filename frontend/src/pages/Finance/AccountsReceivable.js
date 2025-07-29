import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

import useApi from '../../hooks/useApi';
import * as api from '../../helpers/api_helper';
import AdvancedTable from '../../components/Common/AdvancedTable';
import Button from '../../components/Common/Button';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import EmptyState from '../../components/Common/EmptyState';

const AccountsReceivable = () => {
  const { data: receivables, loading, error, request: fetchReceivables } = useApi(api.get);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReceivable, setCurrentReceivable] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [receivableToDelete, setReceivableToDelete] = useState(null);

  useEffect(() => {
    fetchReceivables('/api/finance/receivables');
  }, [fetchReceivables]);

  const handleAddEdit = (receivable = null) => {
    setCurrentReceivable(receivable);
    setIsModalOpen(true);
  };

  const handleDelete = (receivable) => {
    setReceivableToDelete(receivable);
    setIsConfirmationModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await fetchReceivables(`/api/finance/receivables/${receivableToDelete.id}`, 'DELETE');
      fetchReceivables('/api/finance/receivables'); // Re-fetch data
    } catch (err) {
      console.error(err);
    } finally {
      setIsConfirmationModalOpen(false);
      setReceivableToDelete(null);
    }
  };

  const columns = [
    { header: 'Descrição', accessorKey: 'description' },
    {
      header: 'Valor',
      accessorKey: 'amount',
      cell: (info) => `R$ ${parseFloat(info.getValue()).toFixed(2)}`,
    },
    {
      header: 'Vencimento',
      accessorKey: 'dueDate',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    },
    { header: 'Status', accessorKey: 'status' },
    {
      header: 'Ações',
      cell: (info) => (
        <div className='flex space-x-2'>
          <Button size='sm' variant='secondary' onClick={() => handleAddEdit(info.row.original)}>
            Editar
          </Button>
          <Button size='sm' variant='danger' onClick={() => handleDelete(info.row.original)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div>Carregando Contas a Receber...</div>;
  if (error) return <div>Erro ao carregar contas a receber: {error.message}</div>;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className='p-6'
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className='text-2xl font-bold mb-4'>Contas a Receber</h1>
      <Button className='mb-4' variant='primary' onClick={() => handleAddEdit()}>
        Adicionar Conta a Receber
      </Button>

      {receivables && receivables.length === 0 ? (
        <EmptyState message='Nenhuma conta a receber encontrada.' />
      ) : (
        <AdvancedTable
          columns={columns}
          data={receivables || []}
          persistenceKey='accountsReceivableTable'
        />
      )}

      {isModalOpen && (
        <ReceivableModal
          receivable={currentReceivable}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            fetchReceivables('/api/finance/receivables');
            setIsModalOpen(false);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        message={`Tem certeza que deseja excluir a conta a receber "${receivableToDelete?.description}"?`}
        title='Confirmar Exclusão'
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
};

const ReceivableModal = ({ receivable, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    receivable || { description: '', amount: '', dueDate: '', status: 'pending' },
  );
  const api = useApi();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (receivable) {
        await api.request(`/api/finance/receivables/${receivable.id}`, 'PUT', formData);
      } else {
        await api.request('/api/finance/receivables', 'POST', formData);
      }
      onSave();
    } catch (err) {
      console.error('Error saving receivable:', err);
      alert('Erro ao salvar conta a receber.');
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50'>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md'
        initial={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className='text-xl font-bold mb-4'>
          {receivable ? 'Editar' : 'Adicionar'} Conta a Receber
        </h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='description'>
              Descrição
            </label>
            <input
              required
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='description'
              name='description'
              type='text'
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='amount'>
              Valor
            </label>
            <input
              required
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='amount'
              name='amount'
              step='0.01'
              type='number'
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='dueDate'>
              Data de Vencimento
            </label>
            <input
              required
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='dueDate'
              name='dueDate'
              type='date'
              value={formData.dueDate.split('T')[0]}
              onChange={handleChange}
            />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='status'>
              Status
            </label>
            <select
              required
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='status'
              name='status'
              value={formData.status}
              onChange={handleChange}
            >
              <option value='pending'>Pendente</option>
              <option value='received'>Recebido</option>
              <option value='overdue'>Atrasado</option>
            </select>
          </div>
          <div className='flex justify-end space-x-4'>
            <Button type='button' variant='secondary' onClick={onClose}>
              Cancelar
            </Button>
            <Button type='submit' variant='primary'>
              Salvar
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

ReceivableModal.propTypes = {
  receivable: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AccountsReceivable;
