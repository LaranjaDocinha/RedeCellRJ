import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Search as SearchIcon, ClearAll as ClearAllIcon, Group as GroupIcon, Label as LabelIcon, Send as SendIcon, ArrowForward as ArrowForwardIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  Active,
  Over
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox, InputAdornment, Menu, IconButton, Badge } from '@mui/material';


// Interfaces
interface Lead {
  id: string; // Changed to string for dnd-kit compatibility
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  assignedTo?: number;
  score: number; // New field for lead scoring
  createdAt: string;
  updatedAt: string;
}

interface User { // Assuming a simple User type for assignee dropdown
  id: number;
  name: string;
}

interface LeadColumnProps {
  id: string; // Column ID for DndContext
  title: string;
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onSelectLead: (leadId: string, isSelected: boolean) => void;
  selectedLeads: string[];
}

const LeadColumn: React.FC<LeadColumnProps> = ({
  id,
  title,
  leads,
  onEdit,
  onSelectLead,
  selectedLeads
}) => {
  const { setNodeRef } = useSortable({ id }); // Make the column droppable

  return (
    <Paper elevation={3} sx={{ p: 2, height: '70vh', overflowY: 'auto' }} ref={setNodeRef}>
      <Typography variant="h6" gutterBottom>
        {title} ({leads.length})
      </Typography>
      <Box mt={2}>
        <AnimatePresence>
          <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
            {leads.map((lead) => (
              <SortableLeadItem
                key={lead.id}
                lead={lead}
                onEdit={onEdit}
                onSelectLead={onSelectLead}
                isSelected={selectedLeads.includes(lead.id)}
              />
            ))}
          </SortableContext>
        </AnimatePresence>
      </Box>
    </Paper>
  );
};

interface SortableLeadItemProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onSelectLead: (leadId: string, isSelected: boolean) => void;
  isSelected: boolean;
}

const SortableLeadItem: React.FC<SortableLeadItemProps> = ({ lead, onEdit, onSelectLead, isSelected }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.8 : 1
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, '&:hover': { bgcolor: 'action.hover' } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Checkbox 
            checked={isSelected}
            onChange={(e) => onSelectLead(lead.id, e.target.checked)}
            onClick={(e) => e.stopPropagation()} // Prevent card click event
          />
          <Box flexGrow={1} onClick={() => onEdit(lead)} sx={{ cursor: 'pointer' }}>
            <Typography variant="subtitle2">{lead.name}</Typography>
            <Typography variant="body2" color="textSecondary" noWrap>
              {lead.email}
            </Typography>
          </Box>
          <Chip label={`Score: ${lead.score}`} size="small" color="primary" sx={{ height: 20 }} />
        </Box>
      </Paper>
    </motion.div>
  );
};

const LeadsPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const navigate = useNavigate(); // Initialize useNavigate

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [duplicateLeads, setDuplicateLeads] = useState<Lead[][]>([]); // Array of arrays, each inner array is a group of duplicates
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  // Simulate fetching duplicate leads
  useEffect(() => {
    // In a real scenario, this would be an API call
    const simulatedDuplicates: Lead[][] = [
      [
        { id: '101', name: 'João Silva', email: 'joao.silva@example.com', phone: '11987654321', source: 'Web', status: 'new', score: 50, createdAt: '...', updatedAt: '...' },
        { id: '102', name: 'J. Silva', email: 'joao.silva@example.com', phone: '11987654321', source: 'Email', status: 'contacted', score: 60, createdAt: '...', updatedAt: '...' },
      ],
      [
        { id: '103', name: 'Maria Souza', email: 'maria.souza@example.com', phone: '21912345678', source: 'Referral', status: 'qualified', score: 75, createdAt: '...', updatedAt: '...' },
        { id: '104', name: 'M. Souza', email: 'maria.souza@example.com', phone: '21912345678', source: 'Web', status: 'new', score: 40, createdAt: '...', updatedAt: '...' },
      ],
    ];
    setDuplicateLeads(simulatedDuplicates);
  }, []); // Run once on mount to simulate fetching duplicates

  const handleSelectLead = (leadId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeads((prev) => [...prev, leadId]);
    } else {
      setSelectedLeads((prev) => prev.filter((id) => id !== leadId));
    }
  };

  const handleClearSelection = () => {
    setSelectedLeads([]);
  };

  const handleBulkAssign = () => {
    showNotification(`Atribuir ${selectedLeads.length} leads selecionados.`, 'info');
    // Implement bulk assign logic here
    handleClearSelection();
  };

  const handleBulkTag = () => {
    showNotification(`Adicionar tag a ${selectedLeads.length} leads selecionados.`, 'info');
    // Implement bulk tag logic here
    handleClearSelection();
  };

  const handleBulkMoveStage = () => {
    showNotification(`Mover ${selectedLeads.length} leads selecionados.`, 'info');
    // Implement bulk move stage logic here
    handleClearSelection();
  };

  const handleOpenBulkActionsMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseBulkActionsMenu = () => {
    setAnchorEl(null);
  };

  const {
    data: leads,
    isLoading,
    error,
  } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await axios.get('/api/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
  });

  const { data: usersData } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.map((u: any) => ({ id: u.id, name: u.name || u.email }));
    },
    enabled: !!token,
  });

  const createLeadMutation = useMutation({
    mutationFn: (newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) =>
      axios.post('/api/leads', newLead, { headers: { Authorization: `Bearer ${token}` } }),
    onSuccess: () => {
      showNotification('Lead criado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsModalOpen(false);
      setEditingLead(null);
    },
    onError: (err: any) => {
      showNotification(`Erro ao criar lead: ${err.response?.data?.message || err.message}`, 'error');
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: (updatedLead: Partial<Lead> & { id: number }) =>
      axios.put(`/api/leads/${updatedLead.id}`, updatedLead, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      showNotification('Lead atualizado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsModalOpen(false);
      setEditingLead(null);
    },
    onError: (err: any) => {
      showNotification(`Erro ao atualizar lead: ${err.response?.data?.message || err.message}`, 'error');
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const leadData: any = {};
    formData.forEach((value, key) => (leadData[key] = value));

    if (editingLead) {
      updateLeadMutation.mutate({ id: editingLead.id, ...leadData });
    } else {
      createLeadMutation.mutate(leadData);
    }
  };

  const handleCreateNew = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    navigate(`/leads/${lead.id}`); // Navigate to LeadProfilePage
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Erro ao carregar leads.</Typography>;

  const leadColumns = {
    new: 'Novo',
    contacted: 'Contactado',
    qualified: 'Qualificado',
    converted: 'Convertido',
    unqualified: 'Desqualificado',
  };

  const filteredLeads = (leads || []).filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const leadsByStatus = filteredLeads.reduce(
    (acc, lead) => {
      // Ensure lead.id is a string as required by dnd-kit
      acc[lead.status].push({ ...lead, id: String(lead.id) });
      return acc;
    },
    {
      new: [],
      contacted: [],
      qualified: [],
      converted: [],
      unqualified: [],
    } as Record<Lead['status'], Lead[]>,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (id: string) => {
    if (id in leadColumns) {
      return id as Lead['status'];
    }
    return (Object.keys(leadsByStatus) as Array<Lead['status']>).find((key) =>
      leadsByStatus[key].some((item) => item.id === id)
    );
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeColumnId = findColumn(active.id);
    const overColumnId = findColumn(over.id);

    // If dragging a lead within the same column or to another column
    if (activeColumnId && overColumnId) {
      const activeContainer = leadsByStatus[activeColumnId];
      const overContainer = leadsByStatus[overColumnId];

      const activeLead = activeContainer.find(lead => lead.id === active.id);
      if (!activeLead) return;

      const newStatus = overColumnId;

      if (activeLead.status !== newStatus) {
        // Optimistic update
        queryClient.setQueryData<Lead[]>(['leads'], (oldLeads) => {
          if (!oldLeads) return [];
          return oldLeads.map((lead) =>
            lead.id === activeLead.id ? { ...lead, status: newStatus } : lead
          );
        });

        // Call API to update lead status
        try {
          await updateLeadMutation.mutateAsync({ id: parseInt(activeLead.id), status: newStatus });
        } catch (err) {
          // Revert optimistic update on error
          showNotification('Falha ao mover lead. Tentando reverter...', 'error');
          queryClient.invalidateQueries({ queryKey: ['leads'] }); // Refetch data
        }
      }
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestão de Leads (CRM)</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {duplicateLeads.length > 0 && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={
                <Badge badgeContent={duplicateLeads.length} color="error">
                  <ContentCopyIcon />
                </Badge>
              }
              onClick={() => setIsDuplicateModalOpen(true)}
            >
              Resolver Duplicatas
            </Button>
          )}
          <TextField
            label="Buscar Leads"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
            Novo Lead
          </Button>
        </Box>
      </Box>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <Grid container spacing={3}>
          {Object.keys(leadColumns).map((columnId) => (
            <Grid item xs={12} md={2.4} key={columnId}>
              <LeadColumn
                id={columnId}
                title={leadColumns[columnId as Lead['status']]}
                leads={leadsByStatus[columnId as Lead['status']]}
                onEdit={handleEditLead}
                onSelectLead={handleSelectLead}
                selectedLeads={selectedLeads}
              />
            </Grid>
          ))}
        </Grid>
      </DndContext>

      {selectedLeads.length > 0 && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 2,
            borderRadius: '16px',
            boxShadow: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            zIndex: 1000,
          }}
          component={motion.div}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {selectedLeads.length} leads selecionados
          </Typography>
          <Button
            variant="text"
            color="inherit"
            startIcon={<ClearAllIcon />}
            onClick={handleClearSelection}
          >
            Limpar Seleção
          </Button>
          <Button
            variant="text"
            color="inherit"
            startIcon={<GroupIcon />}
            onClick={handleOpenBulkActionsMenu}
          >
            Ações em Massa
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseBulkActionsMenu}
            MenuListProps={{
              'aria-labelledby': 'bulk-actions-button',
            }}
          >
            <MenuItem onClick={handleBulkAssign}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> Atribuir Responsável
            </MenuItem>
            <MenuItem onClick={handleBulkTag}>
              <ListItemIcon><LabelIcon fontSize="small" /></ListItemIcon> Adicionar Tag
            </MenuItem>
            <MenuItem onClick={handleBulkMoveStage}>
              <ListItemIcon><ArrowForwardIcon fontSize="small" /></ListItemIcon> Mover para Etapa
            </MenuItem>
            <MenuItem onClick={() => showNotification('Enviar Email em Massa (em breve)', 'info')}>
              <ListItemIcon><SendIcon fontSize="small" /></ListItemIcon> Enviar Email
            </MenuItem>
          </Menu>
        </Paper>
      )}

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>{editingLead ? 'Editar Lead' : 'Criar Novo Lead'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="dense"
              name="name"
              label="Nome do Lead"
              type="text"
              fullWidth
              defaultValue={editingLead?.name || ''}
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              defaultValue={editingLead?.email || ''}
              required
            />
            <TextField
              margin="dense"
              name="phone"
              label="Telefone"
              type="tel"
              fullWidth
              defaultValue={editingLead?.phone || ''}
            />
            <TextField
              margin="dense"
              name="source"
              label="Fonte"
              type="text"
              fullWidth
              defaultValue={editingLead?.source || ''}
              required
            />
            <TextField
              margin="dense"
              name="status"
              label="Status"
              select
              fullWidth
              defaultValue={editingLead?.status || 'new'}
              required
            >
              <MenuItem value="new">Novo</MenuItem>
              <MenuItem value="contacted">Contactado</MenuItem>
              <MenuItem value="qualified">Qualificado</MenuItem>
              <MenuItem value="unqualified">Desqualificado</MenuItem>
              <MenuItem value="converted">Convertido</MenuItem>
            </TextField>
            <TextField
              margin="dense"
              name="score"
              label="Pontuação do Lead"
              type="number"
              fullWidth
              defaultValue={editingLead?.score || 0}
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              margin="dense"
              name="assignedTo"
              label="Responsável"
              select
              fullWidth
              defaultValue={editingLead?.assignedTo || ''}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {usersData?.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            <DialogActions>
              <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={createLeadMutation.isPending || updateLeadMutation.isPending}>
                {editingLead ? 'Salvar' : 'Criar'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LeadsPage;
