import Loading from '../components/Loading';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled'; // Reutilizando componentes estilizados
import { Button } from '../components/Button';
import { StyledEmptyState } from '../components/AuditLogList.styled'; // Reutilizando StyledEmptyState
import { FaStore } from 'react-icons/fa'; // Ícone para estado vazio

interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editingBranch, setEditingBranch] = useState<Branch | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/branches', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBranches(data);
    } catch (error: any) {
      console.error("Error fetching branches:", error);
      addNotification(`Failed to fetch branches: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async (branchData: Omit<Branch, 'id'>) => {
    try {
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(branchData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchBranches();
      addNotification('Branch created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating branch:", error);
      addNotification(`Failed to create branch: ${error.message}`, 'error');
    }
  };

  const handleUpdateBranch = async (id: number, branchData: Omit<Branch, 'id'>) => {
    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(branchData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingBranch(undefined);
      setShowForm(false);
      fetchBranches();
      addNotification('Branch updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating branch:", error);
      addNotification(`Failed to update branch: ${error.message}`, 'error');
    }
  };

  const handleDeleteBranch = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchBranches();
      addNotification('Branch deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      addNotification(`Failed to delete branch: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const branchToEdit = branches.find((b) => b.id === id);
    if (branchToEdit) {
      setEditingBranch(branchToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingBranch(undefined);
    setShowForm(false);
  };

  return (
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledPageTitle
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Branch Management
      </StyledPageTitle>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setShowForm(true)}
              variant="contained"
              color="primary"
              label="Add New Branch"
            />
          </div>

          {showForm && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h2>
              <BranchForm
                initialData={editingBranch}
                onSubmit={(data) => {
                  if (editingBranch) {
                    handleUpdateBranch(editingBranch.id, data);
                  } else {
                    handleCreateBranch(data);
                  }
                }}
                onCancel={handleCancelForm}
              />
            </div>
          )}

          {branches.length === 0 && !showForm ? (
            <StyledEmptyState
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FaStore />
              <p>No branches found. Click "Add New Branch" to get started!</p>
            </StyledEmptyState>
          ) : (
            <BranchList
              branches={branches}
              onEdit={handleEditClick}
              onDelete={handleDeleteBranch}
            />
          )}
        </>
      )}
    </StyledPageContainer>
  );
};

export default BranchesPage;