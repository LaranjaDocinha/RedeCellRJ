import React, { useState, useEffect } from 'react';
import { Alert, Button, Input, Form, FormGroup, ListGroup, ListGroupItem, Label } from 'reactstrap';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import Select from 'react-select';
import { Paperclip, X } from 'react-feather';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import useNotification from '../../hooks/useNotification';
import useApi from '../../hooks/useApi';
import { get, post, put, del } from '../../helpers/api_helper';
import LoadingSpinner from '../Common/LoadingSpinner';

import Checklist from './Checklist';

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
  h6 {
    color: var(--color-primary);
    margin-bottom: 0.75rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.5rem;
  }
  p {
    margin-bottom: 0.5rem;
    color: var(--color-text);
    strong {
      color: var(--color-heading);
    }
  }
`;

const AttachmentList = styled(ListGroup)`
  margin-top: 1rem;
`;

const AttachmentItem = styled(ListGroupItem)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;

  a {
    color: var(--color-primary);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ActivityLogItem = styled.div`
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: #555;
  span {
    font-weight: 600;
    color: #333;
  }
`;

const CommentItem = styled.div`
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  .comment-author {
    font-weight: bold;
    color: var(--color-primary);
  }
  .comment-date {
    font-size: 0.75rem;
    color: #888;
    margin-left: 0.5rem;
  }
  .comment-text {
    margin-top: 0.5rem;
    color: #333;
  }
`;

const RepairDetailsView = ({ repair: initialRepair, onUpdate }) => {
  const [repair, setRepair] = useState(initialRepair);
  const [newItemText, setNewItemText] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [file, setFile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [timeEntries, setTimeEntries] = useState([]);
  const [newTimeEntry, setNewTimeEntry] = useState({
    start_time: '',
    end_time: '',
    notes: '',
  });

  const { request: fetchTagsApi } = useApi('get');
  const { request: updateRepairTagsApi } = useApi('put');
  const { request: createChecklistItemApi } = useApi('post');
  const { request: updateChecklistItemApi } = useApi('put');
  const { request: uploadAttachmentApi } = useApi('post');
  const { request: deleteAttachmentApi } = useApi('delete');
  const { request: fetchActivitiesApi } = useApi('get');
  const { request: fetchCommentsApi } = useApi('get');
  const { request: addCommentApi } = useApi('post');
  const { request: addTimeEntryApi } = useApi('post');
  const { request: fetchTimeEntriesApi } = useApi('get');
  const { request: deleteTimeEntryApi } = useApi('delete');
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    setRepair(initialRepair);
    const currentTags =
      initialRepair.tags?.map((tag) => ({ value: tag.id, label: tag.name, color: tag.color })) ||
      [];
    setSelectedTags(currentTags);
  }, [initialRepair]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetchTagsApi('/api/tags');
        const formattedTags = response.map((tag) => ({
          value: tag.id,
          label: tag.name,
          color: tag.color,
        }));
        setAllTags(formattedTags);
      } catch (err) {
        console.error('Failed to fetch tags', err);
      }
    };
    fetchTags();
  }, [fetchTagsApi]);

  useEffect(() => {
    if (repair?.id) {
      const fetchRepairActivities = async () => {
        try {
          const response = await fetchActivitiesApi(`/api/repairs/${repair.id}/activity`);
          setActivities(response);
        } catch (err) {
          console.error('Failed to fetch repair activities', err);
        }
      };

      const fetchRepairComments = async () => {
        try {
          const response = await fetchCommentsApi(`/api/repairs/${repair.id}/comments`);
          setComments(response);
        } catch (err) {
          console.error('Failed to fetch repair comments', err);
        }
      };

      fetchRepairActivities();
      fetchRepairComments();

      const fetchRepairTimeEntries = async () => {
        try {
          const response = await fetchTimeEntriesApi(`/api/repairs/${repair.id}/time-entries`);
          setTimeEntries(response);
        } catch (err) {
          console.error('Failed to fetch repair time entries', err);
        }
      };
      fetchRepairTimeEntries();
    }
  }, [repair?.id, fetchActivitiesApi, fetchCommentsApi, fetchTimeEntriesApi]);

  const handleTagChange = async (selectedOptions) => {
    setSelectedTags(selectedOptions);
    const tagIds = selectedOptions.map((option) => option.value);
    try {
      await updateRepairTagsApi(`/api/repairs/${repair.id}/tags`, { tags: tagIds });
      toast.success('Tags atualizadas!');
      onUpdate();
    } catch (err) {
      toast.error('Falha ao atualizar tags.');
    }
  };

  const handleToggleChecklistItem = async (itemId) => {
    const item = repair.checklist_items.find((i) => i.id === itemId);
    if (!item) return;
    const updatedItem = { ...item, completed: !item.completed };
    try {
      await updateChecklistItemApi(`/api/repairs/${repair.id}/checklist/${itemId}`, {
        completed: updatedItem.completed,
      });
      const updatedItems = repair.checklist_items.map((i) => (i.id === itemId ? updatedItem : i));
      setRepair({ ...repair, checklist_items: updatedItems });
      toast.success('Item do checklist atualizado!');
      onUpdate();
    } catch (err) {
      toast.error('Falha ao atualizar item do checklist.');
    }
  };

  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    try {
      const response = await createChecklistItemApi(`/api/repairs/${repair.id}/checklist`, {
        text: newItemText,
      });
      const newItem = response.item;
      const updatedItems = [...(repair.checklist_items || []), newItem];
      setRepair({ ...repair, checklist_items: updatedItems });
      setNewItemText('');
      toast.success('Item adicionado ao checklist!');
      onUpdate();
    } catch (err) {
      toast.error('Falha ao adicionar item.');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Selecione um arquivo para enviar.');
      return;
    }
    const formData = new FormData();
    formData.append('attachment', file);
    try {
      const response = await uploadAttachmentApi(
        `/api/repairs/${repair.id}/attachments`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      const newAttachment = response.attachment;
      setRepair({ ...repair, attachments: [...(repair.attachments || []), newAttachment] });
      setFile(null);
      toast.success('Anexo enviado com sucesso!');
      onUpdate();
    } catch (err) {
      toast.error('Falha no upload do anexo.');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Tem certeza que deseja excluir este anexo?')) return;
    try {
      await deleteAttachmentApi(`/api/repairs/${repair.id}/attachments/${attachmentId}`);
      const updatedAttachments = repair.attachments.filter((att) => att.id !== attachmentId);
      setRepair({ ...repair, attachments: updatedAttachments });
      toast.success('Anexo excluído!');
      onUpdate();
    } catch (err) {
      toast.error('Falha ao excluir anexo.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      showError('O comentário não pode estar vazio.');
      return;
    }
    try {
      const response = await addCommentApi(`/api/repairs/${repair.id}/comments`, {
        comment_text: newCommentText,
      });
      setComments((prevComments) => [response, ...prevComments]);
      setNewCommentText('');
      showSuccess('Comentário adicionado!');
    } catch (err) {
      showError('Falha ao adicionar comentário.');
      console.error(err);
    }
  };

  const handleTimeEntryChange = (e) => {
    const { name, value } = e.target;
    setNewTimeEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTimeEntry = async (e) => {
    e.preventDefault();
    if (!newTimeEntry.start_time || !newTimeEntry.end_time) {
      showError('Horário de início e fim são obrigatórios.');
      return;
    }
    try {
      const response = await addTimeEntryApi(
        `/api/repairs/${repair.id}/time-entries`,
        newTimeEntry,
      );
      setTimeEntries((prev) => [response, ...prev]);
      setNewTimeEntry({ start_time: '', end_time: '', notes: '' });
      showSuccess('Entrada de tempo adicionada!');
    } catch (err) {
      showError('Falha ao adicionar entrada de tempo.');
      console.error(err);
    }
  };

  const handleDeleteTimeEntry = async (entryId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta entrada de tempo?')) return;
    try {
      await deleteTimeEntryApi(`/api/repairs/${repair.id}/time-entries/${entryId}`);
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      showSuccess('Entrada de tempo excluída!');
    } catch (err) {
      showError('Falha ao excluir entrada de tempo.');
      console.error(err);
    }
  };

  if (!repair) return <LoadingSpinner />;

  const selectStyles = {
    /* ... (estilos do select) ... */
  };

  return (
    <div>
      {/* Seções de Tags, Cliente, Problema, Checklist, Valores */}

      <DetailSection>
        <h6>Anexos</h6>
        <AttachmentList flush>
          {(repair.attachments || []).map((att) => (
            <AttachmentItem key={att.id}>
              <a href={att.file_url} rel='noopener noreferrer' target='_blank'>
                <Paperclip className='me-2' size={14} />
                {att.file_name}
              </a>
              <Button
                outline
                color='danger'
                size='sm'
                onClick={() => handleDeleteAttachment(att.id)}
              >
                <X size={14} />
              </Button>
            </AttachmentItem>
          ))}
        </AttachmentList>
        <Form className='mt-3' onSubmit={handleFileUpload}>
          <FormGroup>
            <Input bsSize='sm' type='file' onChange={handleFileChange} />
          </FormGroup>
          <Button color='primary' disabled={!file} size='sm' type='submit'>
            Enviar Anexo
          </Button>
        </Form>
      </DetailSection>

      <DetailSection>
        <h6>Atividade Recente</h6>
        {activities.length === 0 ? (
          <p>Nenhuma atividade registrada para este reparo.</p>
        ) : (
          <ListGroup flush>
            {activities.map((activity) => (
              <ListGroupItem key={activity.id}>
                <ActivityLogItem>
                  <span>
                    {format(new Date(activity.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}:
                  </span>{' '}
                  {activity.description}
                </ActivityLogItem>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
      </DetailSection>

      <DetailSection>
        <h6>Comentários</h6>
        <Form className='mb-3' onSubmit={handleAddComment}>
          <FormGroup>
            <Input
              placeholder='Adicionar um comentário...'
              rows='3'
              type='textarea'
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
          </FormGroup>
          <Button color='primary' size='sm' type='submit'>
            Adicionar Comentário
          </Button>
        </Form>
        {comments.length === 0 ? (
          <p>Nenhum comentário para este reparo.</p>
        ) : (
          <div>
            {comments.map((comment) => (
              <CommentItem key={comment.id}>
                <div>
                  <span className='comment-author'>{comment.user_name}</span>
                  <span className='comment-date'>
                    {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
                <p className='comment-text'>{comment.comment_text}</p>
              </CommentItem>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection>
        <h6>Registro de Tempo</h6>
        <Form className='mb-3' onSubmit={handleAddTimeEntry}>
          <FormGroup>
            <Label for='startTime'>Início</Label>
            <Input
              required
              id='startTime'
              name='start_time'
              type='datetime-local'
              value={newTimeEntry.start_time}
              onChange={handleTimeEntryChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='endTime'>Fim</Label>
            <Input
              required
              id='endTime'
              name='end_time'
              type='datetime-local'
              value={newTimeEntry.end_time}
              onChange={handleTimeEntryChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='timeNotes'>Notas</Label>
            <Input
              id='timeNotes'
              name='notes'
              rows='2'
              type='textarea'
              value={newTimeEntry.notes}
              onChange={handleTimeEntryChange}
            />
          </FormGroup>
          <Button color='primary' size='sm' type='submit'>
            Adicionar Tempo
          </Button>
        </Form>
        {timeEntries.length === 0 ? (
          <p>Nenhum registro de tempo para este reparo.</p>
        ) : (
          <ListGroup flush>
            {timeEntries.map((entry) => (
              <ListGroupItem
                key={entry.id}
                className='d-flex justify-content-between align-items-center'
              >
                <div>
                  <strong>{entry.user_name}</strong>:{' '}
                  {format(new Date(entry.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })} -{' '}
                  {format(new Date(entry.end_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })} (
                  {entry.duration_minutes} min)
                  {entry.notes && (
                    <p className='mb-0 text-muted'>
                      <em>{entry.notes}</em>
                    </p>
                  )}
                </div>
                <Button
                  outline
                  color='danger'
                  size='sm'
                  onClick={() => handleDeleteTimeEntry(entry.id)}
                >
                  <X size={14} />
                </Button>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
      </DetailSection>

      <DetailSection>
        <h6>Registro de Tempo</h6>
        <Form className='mb-3' onSubmit={handleAddTimeEntry}>
          <FormGroup>
            <Label for='startTime'>Início</Label>
            <Input
              required
              id='startTime'
              name='start_time'
              type='datetime-local'
              value={newTimeEntry.start_time}
              onChange={handleTimeEntryChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='endTime'>Fim</Label>
            <Input
              required
              id='endTime'
              name='end_time'
              type='datetime-local'
              value={newTimeEntry.end_time}
              onChange={handleTimeEntryChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='timeNotes'>Notas</Label>
            <Input
              id='timeNotes'
              name='notes'
              rows='2'
              type='textarea'
              value={newTimeEntry.notes}
              onChange={handleTimeEntryChange}
            />
          </FormGroup>
          <Button color='primary' size='sm' type='submit'>
            Adicionar Tempo
          </Button>
        </Form>
        {timeEntries.length === 0 ? (
          <p>Nenhum registro de tempo para este reparo.</p>
        ) : (
          <ListGroup flush>
            {timeEntries.map((entry) => (
              <ListGroupItem
                key={entry.id}
                className='d-flex justify-content-between align-items-center'
              >
                <div>
                  <strong>{entry.user_name}</strong>:{' '}
                  {format(new Date(entry.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })} -{' '}
                  {format(new Date(entry.end_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })} (
                  {entry.duration_minutes} min)
                  {entry.notes && (
                    <p className='mb-0 text-muted'>
                      <em>{entry.notes}</em>
                    </p>
                  )}
                </div>
                <Button
                  outline
                  color='danger'
                  size='sm'
                  onClick={() => handleDeleteTimeEntry(entry.id)}
                >
                  <X size={14} />
                </Button>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}
      </DetailSection>

      {/* ... (outras seções) ... */}
    </div>
  );
};

export default RepairDetailsView;
