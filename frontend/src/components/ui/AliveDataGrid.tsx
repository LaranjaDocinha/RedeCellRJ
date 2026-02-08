import React from 'react';
import { 
  DataGrid, 
  DataGridProps, 
  GridToolbar, 
  GridRowParams, 
  ptBR 
} from '@mui/x-data-grid';
import { 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  useTheme, 
  Paper 
} from '@mui/material';
import { FiEdit, FiTrash, FiCopy, FiEye } from 'react-icons/fi';

export interface AliveDataGridAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (rowId: any, rowData?: any) => void;
  danger?: boolean;
}

interface AliveDataGridProps extends DataGridProps {
  customActions?: AliveDataGridAction[];
}

export const AliveDataGrid: React.FC<AliveDataGridProps> = ({ customActions, ...props }) => {
  const theme = useTheme();
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    rowId: any;
    row: any;
  } | null>(null);

  const handleRowContextMenu = (params: GridRowParams, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            rowId: params.id,
            row: params.row
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const defaultActions: AliveDataGridAction[] = [
    { 
      label: 'Copiar ID', 
      icon: <FiCopy />, 
      onClick: (id) => navigator.clipboard.writeText(String(id)) 
    }
  ];

  const actions = customActions || defaultActions;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        height: '100%', 
        width: '100%', 
        borderRadius: 3, 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <DataGrid
        {...props}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
            toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
            },
        }}
        onRowContextMenu={handleRowContextMenu}
        sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : '#2c2c2c',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.05em'
            },
            '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.action.hover,
                cursor: 'context-menu',
            },
            ...props.sx
        }}
        initialState={{
            ...props.initialState,
            pagination: { 
                paginationModel: { pageSize: 10, ...props.initialState?.pagination?.paginationModel } 
            }
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
            sx: { width: 200, borderRadius: 2 }
        }}
      >
        {actions.map((action, index) => (
            <MenuItem 
                key={index} 
                onClick={() => { action.onClick(contextMenu?.rowId, contextMenu?.row); handleClose(); }}
                sx={{ color: action.danger ? 'error.main' : 'inherit' }}
            >
                {action.icon && <ListItemIcon sx={{ color: action.danger ? 'error.main' : 'inherit' }}>{action.icon}</ListItemIcon>}
                <ListItemText>{action.label}</ListItemText>
            </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};
