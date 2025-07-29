import React, { useState, useContext, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ListGroup,
  ListGroupItem,
  Form,
  FormGroup,
  Spinner,
} from 'reactstrap';
import PropTypes from 'prop-types';

import { ProductContext } from '../../../context/ProductContext';
import ConfirmationModal from '../../../components/Common/ConfirmationModal';
import './CategoryManagerModal.scss';

const CategoryManagerModal = ({ isOpen, toggle }) => {
  const { categories, categoryActions } = useContext(ProductContext);
  const { addCategory, updateCategory, deleteCategory } = categoryActions;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(null); // { id, name }
  const [inputValue, setInputValue] = useState('');

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    if (editMode) {
      setInputValue(editMode.name);
    } else {
      setInputValue('');
    }
  }, [editMode]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsSubmitting(true);
    try {
      if (editMode) {
        await updateCategory(editMode.id, inputValue);
      } else {
        await addCategory(inputValue);
      }
      setEditMode(null);
      setInputValue('');
    } catch (error) {
      // Error is already handled by context/API helper
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (category) => {
    setEditMode(category);
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setInputValue('');
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      setDeleteConfirmModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      // Error is handled, just close the confirmation
      setDeleteConfirmModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal centered isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Gerenciar Categorias</ModalHeader>
        <ModalBody>
          <ListGroup flush className='category-list'>
            {categories.map((cat) => (
              <ListGroupItem
                key={cat.id}
                className='d-flex justify-content-between align-items-center'
              >
                <span>{cat.name}</span>
                <div>
                  <Button
                    aria-label={`Editar ${cat.name}`}
                    color='link'
                    size='sm'
                    onClick={() => handleEditClick(cat)}
                  >
                    <i className='bx bx-pencil'></i>
                  </Button>
                  <Button
                    aria-label={`Excluir ${cat.name}`}
                    className='text-danger'
                    color='link'
                    size='sm'
                    onClick={() => handleDeleteClick(cat)}
                  >
                    <i className='bx bx-trash'></i>
                  </Button>
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
          <hr />
          <Form onSubmit={handleFormSubmit}>
            <FormGroup>
              <h5>{editMode ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</h5>
              <Input
                required
                placeholder='Nome da categoria'
                type='text'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </FormGroup>
            <div className='d-flex justify-content-end'>
              {editMode && (
                <Button className='me-2' color='secondary' type='button' onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              )}
              <Button color='primary' disabled={isSubmitting} type='submit'>
                {isSubmitting ? <Spinner size='sm' /> : editMode ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>

      <ConfirmationModal
        isOpen={deleteConfirmModalOpen}
        loading={isSubmitting}
        message={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.name}"?`}
        title='Confirmar Exclusão'
        toggle={() => setDeleteConfirmModalOpen(!deleteConfirmModalOpen)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

CategoryManagerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

export default CategoryManagerModal;
